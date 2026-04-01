import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { executeStoredProcedure } from '../config/database.js';
import { executeQuery } from '../config/database.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
   logger.info('DEBUG - All Headers:', req.headers); 
    // Get token from header



    
    // const authHeader = req.headers.authorization;
const authHeader = req.headers.authorization || req.headers.Authorization;
   if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
  throw ApiError.unauthorized('No token provided');
}

   const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database via stored procedure
    const result = await executeStoredProcedure('sp_GetUserById', { UserId: decoded.userId });
    const user = result.recordset && result.recordset[0];

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (!user.is_active) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Fetch all roles for the user and attach them
    const rolesRes = await executeQuery('SELECT role FROM user_roles WHERE user_id = @userId', { userId: user.id || user.user_id });
    const roles = (rolesRes.recordset || []).map(r => r.role);

    // Attach user to request. Keep `role` as primary/first role for backwards compatibility.
    req.user = {
      id: user.user_id || user.id,
      profileId: user.id || null,
      email: user.email,
      fullName: user.full_name,
      roles: roles.length ? roles : [user.role || 'user'],
      role: roles.length ? roles[0] : (user.role || 'user'),
      isActive: user.is_active,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'));
    }
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const result = await executeStoredProcedure('sp_GetUserById', { UserId: decoded.userId });
    const user = result.recordset && result.recordset[0];

    if (user && user.is_active) {
      req.user = {
        id: user.user_id || user.id,
        profileId: user.id || null,
        email: user.email,
        fullName: user.full_name,
        role: user.role || 'user',
        isActive: user.is_active,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional auth failed:', error.message);
    next();
  }
};

/**
 * Role-based authorization
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // If user has multiple roles, check if any allowed role is present
    const userRoles = req.user.roles || [req.user.role];
    const has = allowedRoles.some(r => userRoles.includes(r));
    if (!has) {
      logger.warn(`Access denied for user ${req.user.id} with roles ${userRoles.join(',')}`);
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user owns the resource
 */
export const checkOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);

      if (req.user.role === 'admin') {
        return next();
      }

      if (resourceUserId !== req.user.id) {
        return next(ApiError.forbidden('Access denied'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};


/**
 * Page/action based authorization using `role_permissions` table.
 * Example: authorizePage('products','can_create')
 */
export const authorizePage = (page, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(ApiError.unauthorized('Authentication required'));

      // Admin bypass
      const userRoles = req.user.roles || [req.user.role];
      if (userRoles.includes('admin')) return next();

      // Build parameterized IN clause for roles
      const params = { page };
      const rolePlaceholders = userRoles.map((r, i) => {
        const key = `role${i}`;
        params[key] = r;
        return `@${key}`;
      }).join(', ');

      // Map action to column
      const col = action === 'can_view' ? 'can_view'
        : action === 'can_create' ? 'can_create'
        : action === 'can_edit' ? 'can_edit'
        : action === 'can_delete' ? 'can_delete'
        : null;

      if (!col) return next(ApiError.internal('Invalid permission action'));

      const sql = `SELECT TOP 1 1 FROM role_permissions WHERE page = @page AND role IN (${rolePlaceholders}) AND ${col} = 1`;
      const { executeQuery } = await import('../config/database.js');
      const resDb = await executeQuery(sql, params);
      if (resDb.recordset && resDb.recordset.length > 0) return next();

      return next(ApiError.forbidden('Insufficient permissions'));
    } catch (err) {
      next(err);
    }
  };
};


export const generateTokens = (userId, role) => { // Accept role
  const accessToken = jwt.sign(
    { userId, role }, // Include role in payload
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  return { token: accessToken, refreshToken };
};
/**
 * Generate JWT tokens
 */
// export const generateTokens = (userId) => {
//   const accessToken = jwt.sign({ userId }, config.jwt.secret, {
//     expiresIn: config.jwt.expiresIn,
//   });

//   const refreshToken = jwt.sign({ userId, type: 'refresh' }, config.jwt.secret, {
//     expiresIn: config.jwt.refreshExpiresIn,
//   });

//   return { accessToken, refreshToken };
// };

export default {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership,
  generateTokens,
};
