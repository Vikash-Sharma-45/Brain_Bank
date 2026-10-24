import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Require a valid JWT cookie. Attaches req.user (without passwordHash).
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError('Not authenticated — please log in', 401);
  }

  const decoded = jwt.verify(token, env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-passwordHash');

  if (!user) {
    throw new AppError('User belonging to this token no longer exists', 401);
  }

  req.user = user;
  next();
});

/**
 * Restrict access to admin-only routes.
 * Must be used AFTER authenticate.
 */
export const requireAdmin = (req, _res, next) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }
  next();
};
