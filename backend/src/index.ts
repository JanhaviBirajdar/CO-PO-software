// ============================================================
// OBE Attainment Management System — Express Server
// Phase 2: Full Backend with all routes wired
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Routes
import authRoutes       from './routes/auth.routes';
import userRoutes       from './routes/user.routes';
import academicRoutes   from './routes/academic.routes';
import courseRoutes     from './routes/course.routes';
import assessmentRoutes from './routes/assessment.routes';
import attainmentRoutes from './routes/attainment.routes';
import activityRoutes   from './routes/activity.routes';
import reportRoutes     from './routes/report.routes';

// Middleware
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,             // max 200 requests per window
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please wait before trying again.' },
});
app.use('/api/auth/login', authLimiter);

// ─────────────────────────────────────────
// BODY PARSING
// ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────
// CORS
// ─────────────────────────────────────────
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'OK',
    service:   'OBE Attainment Management System API',
    version:   '2.0.0',
    phase:     'Phase 2 — Full Backend',
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api',         academicRoutes);    // /api/departments, /api/programs, etc.
app.use('/api',         courseRoutes);      // /api/courses, /api/cos, /api/pos, /api/psos, /api/mappings
app.use('/api',         assessmentRoutes);  // /api/assessments, /api/marks
app.use('/api',         attainmentRoutes);  // /api/attainment/*
app.use('/api',         activityRoutes);    // /api/cca, /api/eca, /api/surveys
app.use('/api',         reportRoutes);      // /api/reports/*

// ─────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║   OBE Attainment Management System — Phase 2 API     ║
║   Server:  http://localhost:${PORT}                     ║
║   Health:  http://localhost:${PORT}/api/health          ║
║   Env:     ${(process.env.NODE_ENV || 'development').padEnd(40)}║
╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
