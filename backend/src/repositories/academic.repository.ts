// ============================================================
// Academic Setup Repositories
// ============================================================

import { CourseType, AssessmentType } from '@prisma/client';
import { prisma } from '../config/prisma';

// ─── Department ───────────────────────────────────────────────
export const DepartmentRepository = {
  findAll: () => prisma.department.findMany({ orderBy: { name: 'asc' } }),
  findById: (id: number) => prisma.department.findUnique({
    where: { id },
    include: { programs: true, users: { select: { id: true, name: true, role: true } } },
  }),
  create: (data: { code: string; name: string; shortName: string }) =>
    prisma.department.create({ data }),
  update: (id: number, data: any) => prisma.department.update({ where: { id }, data }),
  delete: (id: number) => prisma.department.update({ where: { id }, data: { isActive: false } }),
};

// ─── Program ─────────────────────────────────────────────────
export const ProgramRepository = {
  findAll: (departmentId?: number) => prisma.program.findMany({
    where: { ...(departmentId && { departmentId }), isActive: true },
    include: { department: true },
    orderBy: { name: 'asc' },
  }),
  findById: (id: number) => prisma.program.findUnique({
    where: { id },
    include: {
      department: true,
      pos:  { where: { isActive: true }, orderBy: { number: 'asc' } },
      psos: { where: { isActive: true }, orderBy: { number: 'asc' } },
    },
  }),
  create: (data: any) => prisma.program.create({ data }),
  update: (id: number, data: any) => prisma.program.update({ where: { id }, data }),
  delete: (id: number) => prisma.program.update({ where: { id }, data: { isActive: false } }),
};

// ─── Academic Year ────────────────────────────────────────────
export const AcademicYearRepository = {
  findAll: () => prisma.academicYear.findMany({ where: { isActive: true }, orderBy: { year: 'desc' } }),
  findById: (id: number) => prisma.academicYear.findUnique({ where: { id } }),
  findCurrent: () => prisma.academicYear.findFirst({ where: { isCurrent: true, isActive: true } }),
  create: async (data: any) => {
    // Only one current year at a time
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    return prisma.academicYear.create({ data: { ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate) } });
  },
  update: async (id: number, data: any) => {
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    return prisma.academicYear.update({ where: { id }, data });
  },
  delete: (id: number) => prisma.academicYear.update({ where: { id }, data: { isActive: false } }),
};

// ─── Batch ───────────────────────────────────────────────────
export const BatchRepository = {
  findAll: (programId?: number, departmentId?: number) => prisma.batch.findMany({
    where: {
      isActive: true,
      ...(programId    && { programId }),
      ...(departmentId && { departmentId }),
    },
    include: { program: true, department: true, academicYear: true },
    orderBy: { startYear: 'desc' },
  }),
  findById: (id: number) => prisma.batch.findUnique({
    where: { id },
    include: { program: true, department: true, academicYear: true, semesters: true },
  }),
  create: (data: any) => prisma.batch.create({ data }),
  update: (id: number, data: any) => prisma.batch.update({ where: { id }, data }),
  delete: (id: number) => prisma.batch.update({ where: { id }, data: { isActive: false } }),
};

// ─── Semester ─────────────────────────────────────────────────
export const SemesterRepository = {
  findAll: (batchId: number) => prisma.semester.findMany({
    where: { batchId, isActive: true },
    include: { batch: true },
    orderBy: { number: 'asc' },
  }),
  findById: (id: number) => prisma.semester.findUnique({ where: { id }, include: { batch: true } }),
  create: (data: any) => prisma.semester.create({ data }),
  update: (id: number, data: any) => prisma.semester.update({ where: { id }, data }),
  delete: (id: number) => prisma.semester.update({ where: { id }, data: { isActive: false } }),
};

// ─── Student ──────────────────────────────────────────────────
export const StudentRepository = {
  findAll: (batchId?: number, courseId?: number) => {
    if (courseId) {
      return prisma.studentCourse.findMany({
        where: { courseId, isActive: true },
        include: { student: true },
      }).then(sc => sc.map(s => s.student));
    }
    return prisma.student.findMany({
      where: { ...(batchId && { batchId }), isActive: true },
      include: { batch: { include: { program: true } } },
      orderBy: { rollNumber: 'asc' },
    });
  },
  findById: (id: number) => prisma.student.findUnique({ where: { id }, include: { batch: true } }),
  create: (data: any) => prisma.student.create({ data }),
  update: (id: number, data: any) => prisma.student.update({ where: { id }, data }),
  delete: (id: number) => prisma.student.update({ where: { id }, data: { isActive: false } }),
  enrollInCourse: async (studentId: number, courseId: number) =>
    prisma.studentCourse.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      create: { studentId, courseId },
      update: { isActive: true },
    }),
  unenrollFromCourse: async (studentId: number, courseId: number) =>
    prisma.studentCourse.update({
      where: { studentId_courseId: { studentId, courseId } },
      data: { isActive: false },
    }),
};
