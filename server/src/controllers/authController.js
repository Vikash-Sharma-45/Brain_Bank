import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

/**
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { user, token, cookieOptions } = await authService.register(req.body);

  res.cookie('token', token, cookieOptions);
  res.status(201).json({ success: true, data: { user } });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { user, token, cookieOptions } = await authService.login(req.body);

  res.cookie('token', token, cookieOptions);
  res.json({ success: true, data: { user } });
});

/**
 * POST /api/auth/logout
 */
export const logout = (_req, res) => {
  res.cookie('token', '', authService.logoutCookieOptions());
  res.json({ success: true, message: 'Logged out' });
};

/**
 * GET /api/auth/me
 */
export const getMe = (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};
