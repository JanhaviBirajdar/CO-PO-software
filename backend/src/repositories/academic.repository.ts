// ============================================================
// Academic Setup Repositories
// ============================================================

import { CourseType, AssessmentType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

// ─── Department ───────────────────────────────────────────────
export const DepartmentRepository = {
  findAll: () => prisma.department.findMany({ orderBy: { name: 'asc' } }),
  findById: (id: number) => prisma.department.findUnique({
    where: { id },
    include: { programs: true, users: { select: { id: true, name: true, role: true } } },
  }),
  create: (data: { code: string; name: string; shortName?: string; description?: string }) =>
    prisma.department.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        shortName: (data.shortName || data.code).trim().toUpperCase(),
      },
    }),
  update: (id: number, data: any) => {
    const updateData: any = {};
    if (data.code) updateData.code = data.code.trim().toUpperCase();
    if (data.name) updateData.name = data.name.trim();
    if (data.shortName || data.code) updateData.shortName = (data.shortName || data.code).trim().toUpperCase();
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    return prisma.department.update({ where: { id }, data: updateData });
  },
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
  create: (data: any) =>
    prisma.program.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        shortName: (data.shortName || data.code).trim().toUpperCase(),
        departmentId: Number(data.departmentId),
        duration: Number(data.duration || 4),
        totalSemesters: Number(data.totalSemesters || 8),
      },
    }),
  update: (id: number, data: any) => {
    const updateData: any = {};
    if (data.code) updateData.code = data.code.trim().toUpperCase();
    if (data.name) updateData.name = data.name.trim();
    if (data.shortName) updateData.shortName = data.shortName.trim().toUpperCase();
    if (data.departmentId) updateData.departmentId = Number(data.departmentId);
    if (data.duration) updateData.duration = Number(data.duration);
    if (data.totalSemesters) updateData.totalSemesters = Number(data.totalSemesters);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    return prisma.program.update({ where: { id }, data: updateData });
  },
  delete: (id: number) => prisma.program.update({ where: { id }, data: { isActive: false } }),
};

// ─── Academic Year ────────────────────────────────────────────
export const AcademicYearRepository = {
  findAll: () => prisma.academicYear.findMany({ where: { isActive: true }, orderBy: { year: 'desc' } }),
  findById: (id: number) => prisma.academicYear.findUnique({ where: { id } }),
  findCurrent: () => prisma.academicYear.findFirst({ where: { isCurrent: true, isActive: true } }),
  create: async (data: any) => {
    // Handle legacy 'yearRange' field as alias for 'year'
    const yearValue = data.year || data.yearRange;
    if (!yearValue) throw new Error('year is required for academic year');

    // Derive default dates from year string if not provided (e.g., "2024-25" → Jun 2024 - May 2025)
    let startDate = data.startDate;
    let endDate   = data.endDate;
    if (!startDate || !endDate) {
      const parts = yearValue.split('-');
      const startYear = parseInt(parts[0], 10);
      const endYearShort = parseInt(parts[1], 10);
      const endYear = endYearShort < 100 ? startYear + 1 : endYearShort;
      startDate = startDate || `${startYear}-06-01`;
      endDate   = endDate   || `${endYear}-05-31`;
    }

    // Only one current year at a time
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }

    // Check if an academic year with this year already exists
    const existing = await prisma.academicYear.findUnique({
      where: { year: yearValue.trim() },
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate previously deactivated academic year
        return prisma.academicYear.update({
          where: { id: existing.id },
          data: {
            startDate: new Date(startDate),
            endDate:   new Date(endDate),
            isCurrent: data.isCurrent ?? false,
            isActive:  true,
          },
        });
      }
      throw new AppError(`Academic Year "${yearValue}" already exists.`, 409);
    }

    return prisma.academicYear.create({
      data: {
        year:      yearValue.trim(),
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        isCurrent: data.isCurrent ?? false,
      },
    });
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
  create: (data: any) =>
    prisma.batch.create({
      data: {
        name: data.name.trim(),
        startYear: Number(data.startYear),
        endYear: Number(data.endYear),
        programId: Number(data.programId),
        departmentId: Number(data.departmentId),
        academicYearId: Number(data.academicYearId),
      },
    }),
  update: (id: number, data: any) => {
    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.startYear) updateData.startYear = Number(data.startYear);
    if (data.endYear) updateData.endYear = Number(data.endYear);
    if (data.programId) updateData.programId = Number(data.programId);
    if (data.departmentId) updateData.departmentId = Number(data.departmentId);
    if (data.academicYearId) updateData.academicYearId = Number(data.academicYearId);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    return prisma.batch.update({ where: { id }, data: updateData });
  },
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
  create: (data: any) =>
    prisma.semester.create({
      data: {
        name: data.name.trim(),
        number: Number(data.number),
        batchId: Number(data.batchId),
      },
    }),
  update: (id: number, data: any) => {
    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.number !== undefined) updateData.number = Number(data.number);
    if (data.batchId !== undefined) updateData.batchId = Number(data.batchId);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    return prisma.semester.update({ where: { id }, data: updateData });
  },
  delete: (id: number) => prisma.semester.update({ where: { id }, data: { isActive: false } }),
};

// ─── Student ──────────────────────────────────────────────────
export const StudentRepository = {
  findAll: async (batchId?: number, courseId?: number) => {
    if (courseId) {
      const enrolled = await prisma.studentCourse.findMany({
        where: { courseId, isActive: true },
        include: { student: true },
      });
      if (enrolled.length > 0) {
        return enrolled.map(s => s.student);
      }
      // Fallback: If no explicit studentCourse records yet, get students from course's batch
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { semester: true },
      });
      const cBatchId = course?.semester?.batchId;
      return prisma.student.findMany({
        where: { ...(cBatchId && { batchId: cBatchId }), isActive: true },
        include: { batch: { include: { program: true } } },
        orderBy: { rollNumber: 'asc' },
      });
    }
    return prisma.student.findMany({
      where: { ...(batchId && { batchId }), isActive: true },
      include: { batch: { include: { program: true } } },
      orderBy: { rollNumber: 'asc' },
    });
  },
  findById: (id: number) => prisma.student.findUnique({ where: { id }, include: { batch: true } }),
  create: (data: any) =>
    prisma.student.create({
      data: {
        rollNumber: data.rollNumber.trim(),
        name: data.name.trim(),
        email: data.email ? data.email.trim() : null,
        batchId: Number(data.batchId),
      },
    }),
  update: (id: number, data: any) => {
    const updateData: any = {};
    if (data.rollNumber) updateData.rollNumber = data.rollNumber.trim();
    if (data.name) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email ? data.email.trim() : null;
    if (data.batchId) updateData.batchId = Number(data.batchId);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    return prisma.student.update({ where: { id }, data: updateData });
  },
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
