import rolesService from '../services/rolesService.js';
import { asyncHandler } from '../utils/helpers.js';

export const getPermissions = asyncHandler(async (req, res) => {
  const data = await rolesService.getPermissions();
  res.json({ status: 'success', data });
});

export const upsertPermission = asyncHandler(async (req, res) => {
  const { role, page, can_view, can_create, can_edit, can_delete } = req.body;
  if (!role || !page) return res.status(400).json({ status: 'error', message: 'role and page are required' });
  const data = await rolesService.upsertPermission(role, page, { can_view, can_create, can_edit, can_delete });
  res.json({ status: 'success', data });
});

export const getRoleUsers = asyncHandler(async (req, res) => {
  const data = await rolesService.getRoleUsers();
  res.json({ status: 'success', data });
});

export default { getPermissions, upsertPermission, getRoleUsers };
