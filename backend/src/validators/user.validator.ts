// ============================================================
// Zod Validators — Users
// ============================================================

import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    name:         z.string().min(2, 'Name must be at least 2 characters'),
    email:        z.string().email('Valid email required'),
    password:     z.string().min(8, 'Password must be at least 8 characters'),
    role:         z.nativeEnum(Role),
    departmentId: z.number().int().positive().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name:         z.string().min(2).optional(),
    email:        z.string().email().optional(),
    role:         z.nativeEnum(Role).optional(),
    isActive:     z.boolean().optional(),
    departmentId: z.number().int().positive().nullable().optional(),
  }),
});
