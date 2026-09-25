// ============================================================
// Authentication & RBAC Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface AuthPayload {
  userId: number;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// ─────────────────────────────────────────
// Authenticate JWT
// ─────────────────────────────────────────
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const decoded = jwt.verify(token, secret) as AuthPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or deactivated' });
      return;
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ success: false, message: 'Invalid token' });
    } else {
      next(err);
    }
  }
};

// ─────────────────────────────────────────
// Role-Based Authorization
// ─────────────────────────────────────────
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

// Convenience role-check helpers
export const isSuperAdmin = authorize(Role.SUPER_ADMIN);
export const isAdmin = authorize(Role.SUPER_ADMIN, Role.ADMIN);
export const isHOD = authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.HOD);
export const isFaculty = authorize(Role.SUPER_ADMIN, Role.ADMIN, Role.HOD, Role.FACULTY);
