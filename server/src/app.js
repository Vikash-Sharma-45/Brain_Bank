import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import env from './config/env.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// ── Security headers ─────────────────────────
app.set('trust proxy', 1); // trust first proxy (Render / Vercel)
app.use(helmet());

// ── CORS — restricted to the frontend origin ─
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// ── Body parsing ─────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── Mongo query injection prevention ─────────
app.use(mongoSanitize());

// ── Rate limiting ────────────────────────────
// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// ── Routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);

// Health check (useful for Render auto-deploy)
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'BrainBank API is running' });
});

// ── 404 catch-all ────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Centralised error handler ────────────────
app.use(errorHandler);

export default app;
