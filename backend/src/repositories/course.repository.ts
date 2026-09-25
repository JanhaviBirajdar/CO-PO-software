// ============================================================
// Course & Outcome Repositories
// ============================================================

import { prisma } from '../config/prisma';

// ─── Course ───────────────────────────────────────────────────
export const CourseRepository = {
  findAll: (filters: { programId?: number; semesterId?: number; academicYearId?: number; facultyId?: number }) =>
    prisma.course.findMany({
      where: {
        isActive: true,
        ...(filters.programId      && { programId: filters.programId }),
        ...(filters.semesterId     && { semesterId: filters.semesterId }),
        ...(filters.academicYearId && { academicYearId: filters.academicYearId }),
        ...(filters.facultyId      && {
          courseFaculty: { some: { userId: filters.facultyId, isActive: true } },
        }),
      },
      include: {
        program:      { include: { department: true } },
        semester:     true,
        academicYear: true,
        courseFaculty: {
          where: { isActive: true },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { courseOutcomes: true, assessments: true, studentCourses: true } },
      },
      orderBy: { code: 'asc' },
    }),

  findById: (id: number) => prisma.course.findUnique({
    where: { id },
    include: {
      program:  { include: { department: true } },
      semester: true,
      academicYear: true,
      courseFaculty: {
        where: { isActive: true },
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      courseOutcomes: {
        where: { isActive: true },
        orderBy: { number: 'asc' },
        include: {
          coPomappings:  { include: { programOutcome: true } },
          coPsomappings: { include: { programSpecificOutcome: true } },
        },
      },
      assessments: {
        where: { isActive: true },
        include: { assessmentCOs: { include: { courseOutcome: true } } },
      },
      studentCourses: {
        where: { isActive: true },
        include: { student: true },
      },
    },
  }),

  create: async (data: any) => {
    const { facultyIds, ...courseData } = data;
    return prisma.course.create({
      data: {
        ...courseData,
        courseFaculty: facultyIds
          ? { create: facultyIds.map((uid: number) => ({ userId: uid })) }
          : undefined,
      },
      include: { program: true, semester: true, academicYear: true },
    });
  },

  update: async (id: number, data: any) => {
    const { facultyIds, ...courseData } = data;

    const updated = await prisma.course.update({ where: { id }, data: courseData });

    if (facultyIds !== undefined) {
      await prisma.courseFaculty.updateMany({ where: { courseId: id }, data: { isActive: false } });
      if (facultyIds.length > 0) {
        await prisma.courseFaculty.createMany({
          data: facultyIds.map((uid: number) => ({ courseId: id, userId: uid })),
          skipDuplicates: true,
        });
        await prisma.courseFaculty.updateMany({
          where: { courseId: id, userId: { in: facultyIds } },
          data: { isActive: true },
        });
      }
    }

    return updated;
  },

  delete: (id: number) => prisma.course.update({ where: { id }, data: { isActive: false } }),
};

// ─── Course Outcome ───────────────────────────────────────────
export const CourseOutcomeRepository = {
  findByCourse: (courseId: number) => prisma.courseOutcome.findMany({
    where: { courseId, isActive: true },
    orderBy: { number: 'asc' },
    include: {
      coPomappings:  { include: { programOutcome: true } },
      coPsomappings: { include: { programSpecificOutcome: true } },
      coAttainments: true,
    },
  }),

  findById: (id: number) => prisma.courseOutcome.findUnique({
    where: { id },
    include: {
      course: true,
      coPomappings:  { include: { programOutcome: true } },
      coPsomappings: { include: { programSpecificOutcome: true } },
      coAttainments: true,
    },
  }),

  create:  (data: any) => prisma.courseOutcome.create({ data }),
  update:  (id: number, data: any) => prisma.courseOutcome.update({ where: { id }, data }),
  delete:  (id: number) => prisma.courseOutcome.update({ where: { id }, data: { isActive: false } }),
};

// ─── Program Outcome ──────────────────────────────────────────
export const ProgramOutcomeRepository = {
  findByProgram: (programId: number) => prisma.programOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  }),
  findById: (id: number) => prisma.programOutcome.findUnique({ where: { id } }),
  create:  (data: any) => prisma.programOutcome.create({ data }),
  update:  (id: number, data: any) => prisma.programOutcome.update({ where: { id }, data }),
  delete:  (id: number) => prisma.programOutcome.update({ where: { id }, data: { isActive: false } }),
  upsertMany: async (programId: number, items: any[]) => {
    const results = [];
    for (const item of items) {
      results.push(await prisma.programOutcome.upsert({
        where: { programId_code: { programId, code: item.code } },
        create: { ...item, programId },
        update: item,
      }));
    }
    return results;
  },
};

// ─── Program Specific Outcome ─────────────────────────────────
export const PSORepository = {
  findByProgram: (programId: number) => prisma.programSpecificOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  }),
  findById: (id: number) => prisma.programSpecificOutcome.findUnique({ where: { id } }),
  create:  (data: any) => prisma.programSpecificOutcome.create({ data }),
  update:  (id: number, data: any) => prisma.programSpecificOutcome.update({ where: { id }, data }),
  delete:  (id: number) => prisma.programSpecificOutcome.update({ where: { id }, data: { isActive: false } }),
};

// ─── CO-PO Mapping ────────────────────────────────────────────
export const MappingRepository = {
  getCOPOMatrix: async (courseId: number) => {
    const cos = await prisma.courseOutcome.findMany({
      where: { courseId, isActive: true },
      orderBy: { number: 'asc' },
      include: { coPomappings: { include: { programOutcome: true } } },
    });
    return cos;
  },

  getCOPSOMatrix: async (courseId: number) => {
    const cos = await prisma.courseOutcome.findMany({
      where: { courseId, isActive: true },
      orderBy: { number: 'asc' },
      include: { coPsomappings: { include: { programSpecificOutcome: true } } },
    });
    return cos;
  },

  saveCOPOMappings: async (mappings: { courseOutcomeId: number; programOutcomeId: number; mappingValue: number }[]) => {
    const results = [];
    for (const m of mappings) {
      results.push(await prisma.coPOMapping.upsert({
        where: { courseOutcomeId_programOutcomeId: { courseOutcomeId: m.courseOutcomeId, programOutcomeId: m.programOutcomeId } },
        create: m,
        update: { mappingValue: m.mappingValue },
      }));
    }
    return results;
  },

  saveCOPSOMappings: async (mappings: { courseOutcomeId: number; programSpecificOutcomeId: number; mappingValue: number }[]) => {
    const results = [];
    for (const m of mappings) {
      results.push(await prisma.coPSOMapping.upsert({
        where: { courseOutcomeId_programSpecificOutcomeId: { courseOutcomeId: m.courseOutcomeId, programSpecificOutcomeId: m.programSpecificOutcomeId } },
        create: m,
        update: { mappingValue: m.mappingValue },
      }));
    }
    return results;
  },
};
