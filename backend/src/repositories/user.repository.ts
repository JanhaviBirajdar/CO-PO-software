// ============================================================
// User Repository
// ============================================================

import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { generateDepartmentEmployeeId, generateSecurePassword } from '../utils/credentialGenerator';

const SALT_ROUNDS = 12;

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role?: Role;
  departmentId?: number;
  designation?: string;
  employeeId?: string;
}

export const UserRepository = {

  async findAll(filters: { role?: Role; departmentId?: number; isActive?: boolean } = {}) {
    return prisma.user.findMany({
      where: {
        ...(filters.role        && { role: filters.role }),
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        designation: true,
        role: true,
        isActive: true,
        departmentId: true,
        lastLoginAt: true,
        createdAt: true,
        department: { select: { id: true, name: true, code: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        designation: true,
        role: true,
        isActive: true,
        departmentId: true,
        lastLoginAt: true,
        createdAt: true,
        department: { select: { id: true, name: true, code: true } },
        courseFaculty: {
          include: { course: { select: { id: true, code: true, name: true } } },
        },
      },
    });
  },

  async create(data: CreateUserData) {
    let departmentId = data.departmentId ? Number(data.departmentId) : undefined;
    let deptName = 'Academic Department';
    if (departmentId) {
      const deptExists = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!deptExists) {
        departmentId = undefined;
      } else {
        deptName = deptExists.name;
      }
    }

    // Generate department-wise Employee ID if not supplied
    const employeeId = data.employeeId && data.employeeId.trim().length > 0
      ? data.employeeId.trim()
      : await generateDepartmentEmployeeId(departmentId);

    // Generate secure password if not supplied
    const plainPassword = data.password && data.password.trim().length >= 6
      ? data.password.trim()
      : generateSecurePassword();

    const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashed,
        role: data.role || 'FACULTY',
        departmentId,
        designation: data.designation || 'Faculty Member',
        employeeId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        designation: true,
        role: true,
        isActive: true,
        departmentId: true,
        createdAt: true,
        department: { select: { id: true, name: true, code: true } },
      },
    });

    return {
      user,
      plainPassword,
      employeeId,
      departmentName: deptName,
    };
  },

  async update(id: number, data: Partial<{
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    departmentId: number | null;
    designation: string;
    employeeId: string;
  }>) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        designation: true,
        role: true,
        isActive: true,
        departmentId: true,
        department: { select: { id: true, name: true, code: true } },
      },
    });
  },

  async delete(id: number) {
    return prisma.user.update({ where: { id }, data: { isActive: false } });
  },

  async getFacultyForCourse(courseId: number) {
    return prisma.courseFaculty.findMany({
      where: { courseId, isActive: true },
      include: { user: { select: { id: true, name: true, email: true, employeeId: true, role: true } } },
    });
  },
};
