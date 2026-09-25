// ============================================================
// Auth Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AuthRepository } from '../repositories/auth.repository';
import { logAudit } from '../middleware/audit.middleware';

export const AuthController = {

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await AuthRepository.findByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const valid = await AuthRepository.validatePassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      await AuthRepository.updateLastLogin(user.id);

      const token = AuthRepository.generateAccessToken({
        userId: user.id,
        email:  user.email,
        role:   user.role,
      });

      await logAudit({
        tableName: 'users',
        recordId:  user.id,
        action:    'LOGIN',
        userId:    user.id,
        ipAddress: req.ip,
      });

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id:           user.id,
            name:         user.name,
            email:        user.email,
            role:         user.role,
            departmentId: user.departmentId,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // JWT is stateless; client discards token. Log the action.
      if (req.user) {
        await logAudit({
          tableName: 'users',
          recordId:  req.user.userId,
          action:    'LOGOUT',
          userId:    req.user.userId,
          ipAddress: req.ip,
        });
      }
      return res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/me
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthRepository.findById(req.user!.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/change-password
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthRepository.changePassword(req.user!.userId, currentPassword, newPassword);
      await logAudit({ tableName: 'users', recordId: req.user!.userId, action: 'CHANGE_PASSWORD', userId: req.user!.userId });
      return res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/forgot-password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const token = await AuthRepository.createResetToken(email);
      // In production, send email. For now, return token in dev mode.
      const responseData: any = { success: true, message: 'Password reset instructions sent.' };
      if (process.env.NODE_ENV === 'development') responseData.resetToken = token;
      return res.json(responseData);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/reset-password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await AuthRepository.resetPassword(token, newPassword);
      return res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  },
};
