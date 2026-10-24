import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

/**
 * Create a signed JWT and return it.
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

/**
 * Cookie options — httpOnly, secure in production, SameSite strict.
 */
const cookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * Register a new reader account.
 */
export const register = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password, // pre-save hook hashes it
    role: 'reader',
  });

  const token = signToken(user._id);
  return { user, token, cookieOptions: cookieOptions() };
};

/**
 * Authenticate with email + password.
 */
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id);
  return { user, token, cookieOptions: cookieOptions() };
};

/**
 * Cookie options to clear the token cookie.
 */
export const logoutCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 0,
});
