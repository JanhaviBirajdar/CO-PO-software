// ============================================================
// Zod Validators — Auth
// ============================================================

import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email:    z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword:     z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token:       z.string().min(1, 'Token required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});
