import sql from 'mssql';
import config from './index.js';
import logger from '../utils/logger.js';

// SQL Server configuration
const sqlConfig = {
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  server: config.database.server,
  port: config.database.port,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
 
  },
};
// const sqlConfig = {
//   user: config.database.user,
//   password: config.database.password,
//   database: config.database.name,
//   server: config.database.server,
//   port: config.database.port,
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000,
//   },
//   options: {
//     encrypt: config.database.encrypt,
//     trustServerCertificate: config.database.trustServerCertificate,
//     enableArithAbort: true,
//   },
// };

// Connection pool
let pool = null;

/**
 * Initialize database connection pool
 */
export const initDatabase = async () => {
  try {
    pool = await sql.connect(sqlConfig);
    logger.info('Connected to SQL Server database');
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

/**
 * Get database connection pool
 */
export const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
};

/**
 * Execute a stored procedure
 * @param {string} procedureName - Name of the stored procedure
 * @param {Object} params - Parameters to pass (key-value pairs)
 * @returns {Promise<Object>} - Result containing recordsets
 */
export const executeStoredProcedure = async (procedureName, params = {}) => {
  try {
    const poolConnection = getPool();
    const request = poolConnection.request();

    // Add parameters
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        request.input(key, value);
      }
    }

    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    logger.error(`Stored procedure ${procedureName} failed:`, error);
    throw error;
  }
};

/**
 * Execute a raw SQL query
 * @param {string} query - SQL query string
 * @param {Object} params - Parameters to pass
 * @returns {Promise<Object>} - Query result
 */
export const executeQuery = async (query, params = {}) => {
  try {
    const poolConnection = getPool();
    const request = poolConnection.request();

    // Add parameters
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        request.input(key, value);
      }
    }

    const result = await request.query(query);
    return result;
  } catch (error) {
    logger.error('Query execution failed:', error);
    throw error;
  }
};

/**
 * Execute a transaction with multiple operations
 * @param {Function} operations - Async function containing transaction operations
 * @returns {Promise<any>} - Transaction result
 */
export const executeTransaction = async (operations) => {
  const poolConnection = getPool();
  const transaction = new sql.Transaction(poolConnection);

  try {
    await transaction.begin();
    const result = await operations(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    logger.error('Transaction failed, rolled back:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

/**
 * Check database health
 */
export const checkHealth = async () => {
  try {
    const result = await executeQuery('SELECT 1 AS health');
    return result.recordset[0].health === 1;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    const healthy = await checkHealth();
    return {
      connected: healthy,
      message: healthy ? 'Database connection successful' : 'Database connection failed',
    };
  } catch (error) {
    return { connected: false, message: error.message };
  }
};

// Export sql types for use in services
export { sql };

export default {
  initDatabase,
  getPool,
  executeStoredProcedure,
  executeQuery,
  executeTransaction,
  closeDatabase,
  checkHealth,
  testConnection,
  sql,
};
