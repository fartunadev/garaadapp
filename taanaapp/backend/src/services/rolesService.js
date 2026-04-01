import { executeStoredProcedure, executeQuery } from '../config/database.js';
import ApiError from '../utils/ApiError.js';

class RolesService {
  async getPermissions() {
    const result = await executeStoredProcedure('sp_GetRolePermissions', {});
    return result.recordset || [];
  }

  async upsertPermission(role, page, permissions) {
    const result = await executeStoredProcedure('sp_UpsertRolePermission', {
      Role: role,
      Page: page,
      CanView: permissions.can_view ? 1 : 0,
      CanCreate: permissions.can_create ? 1 : 0,
      CanEdit: permissions.can_edit ? 1 : 0,
      CanDelete: permissions.can_delete ? 1 : 0,
    });
    return result.recordset?.[0] || null;
  }

  async getRoleUsers() {
    const result = await executeQuery(`
      SELECT ur.user_id, ur.role, p.full_name, u.email
      FROM dbo.user_roles ur
      INNER JOIN dbo.users u ON ur.user_id = u.id
      LEFT JOIN dbo.profiles p ON ur.user_id = p.user_id
      ORDER BY ur.role, p.full_name
    `, {});
    return result.recordset || [];
  }
}

export default new RolesService();
