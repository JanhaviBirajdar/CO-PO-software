// ============================================================
// User Repository
// ============================================================

import bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '../config/prisma';

const SALT_ROUNDS = 12;

export const UserRepository = {

  async findAll(filters: { role?: Role; departmentId?: number; isActive?: boolean } = {}) {
    return prisma.user.findMany({
      where: {
        ...(filters.role        && { role: filters.role }),
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      },
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, departmentId: true, lastLoginAt: true, createdAt: true,
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, departmentId: true, lastLoginAt: true, createdAt: true,
        department: { select: { id: true, name: true, code: true } },
        courseFaculty: {
          include: { course: { select: { id: true, code: true, name: true } } },
        },
      },
    });
  },

  async create(data: { name: string; email: string; password: string; role: Role; departmentId?: number }) {
    const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
    return prisma.user.create({
      data: {
        ...data,
        email:    data.email.toLowerCase().trim(),
        password: hashed,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
  },

  async update(id: number, data: Partial<{ name: string; email: string; role: Role; isActive: boolean; departmentId: number | null }>) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true, departmentId: true },
    });
  },

  async delete(id: number) {
    return prisma.user.update({ where: { id }, data: { isActive: false } });
  },

  async getFacultyForCourse(courseId: number) {
    return prisma.courseFaculty.findMany({
      where: { courseId, isActive: true },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
  },
};
