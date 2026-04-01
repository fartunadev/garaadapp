import authService from '../services/authService.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Registration successful',
    data: result,
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);

  res.json({
    status: 'success',
    message: 'Login successful',
    data: result,
  });
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user.id);

  res.json({
    status: 'success',
    ...result,
  });
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.id);

  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.user.id, req.body);

  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    data: result,
  });
});

/**
 * @route   PUT /api/v1/auth/password
 * @desc    Change password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);

  res.json({
    status: 'success',
    ...result,
  });
});

// Admin: list all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await authService.getAllUsers(req.query);
  res.json({ status: 'success', data: result.data, meta: result.meta });
});

// Admin: get user by ID
export const getUserById = asyncHandler(async (req, res) => {
  const result = await authService.getUserById(req.params.id);
  res.json({ status: 'success', data: result });
});

// Admin: update user role
export const updateUserRole = asyncHandler(async (req, res) => {
  const result = await authService.updateUserRole(req.params.id, req.body.role);
  res.json({ status: 'success', ...result });
});

// Admin: toggle user status
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const result = await authService.toggleUserStatus(req.params.id, req.body.is_active);
  res.json({ status: 'success', ...result });
});

// Addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const result = await authService.getAddresses(req.user.id);
  res.json({ status: 'success', data: result });
});

export const addAddress = asyncHandler(async (req, res) => {
  const result = await authService.addAddress(req.user.id, req.body);
  res.status(201).json({ status: 'success', data: result });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const result = await authService.updateAddress(req.params.id, req.user.id, req.body);
  res.json({ status: 'success', data: result });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const result = await authService.deleteAddress(req.params.id, req.user.id);
  res.json({ status: 'success', ...result });
});

export default {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
