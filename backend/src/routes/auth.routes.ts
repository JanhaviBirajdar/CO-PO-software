// ============================================================
// Auth Routes
// ============================================================

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/login',          validate(loginSchema),          AuthController.login);
router.post('/logout',         authenticate,                   AuthController.logout);
router.get('/me',              authenticate,                   AuthController.me);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),  AuthController.resetPassword);

export default router;
