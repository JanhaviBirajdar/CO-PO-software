// ============================================================
// Course & Outcome Repositories
// ============================================================

import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

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
    if (courseData.courseType === 'PRACTICAL') courseData.courseType = 'LAB';
    else if (courseData.courseType === 'INTEGRATED') courseData.courseType = 'THEORY';
    else if (courseData.courseType && !['THEORY', 'LAB', 'PROJECT', 'ELECTIVE', 'AUDIT'].includes(courseData.courseType)) {
      courseData.courseType = 'THEORY';
    }

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
    if (courseData.courseType === 'PRACTICAL') courseData.courseType = 'LAB';
    else if (courseData.courseType === 'INTEGRATED') courseData.courseType = 'THEORY';
    else if (courseData.courseType && !['THEORY', 'LAB', 'PROJECT', 'ELECTIVE', 'AUDIT'].includes(courseData.courseType)) {
      courseData.courseType = 'THEORY';
    }

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

  create:  async (data: any) => {
    const { bloomTaxonomyLevel, targetMarksPercentage, targetStudentPercentage, ...coData } = data;
    let bloomsLevel = coData.bloomsLevel;
    let bloomVerb = coData.bloomVerb;
    if (bloomTaxonomyLevel && !bloomsLevel) {
      const match = String(bloomTaxonomyLevel).match(/L([1-6])/i);
      if (match) bloomsLevel = parseInt(match[1]);
      const verbMatch = String(bloomTaxonomyLevel).split(' ')[0];
      if (verbMatch) bloomVerb = verbMatch;
    }

    const courseId = Number(coData.courseId);
    const code = coData.code ? coData.code.trim().toUpperCase() : `CO${coData.number || 1}`;

    // Check if CO with this code already exists for the course
    const existing = await prisma.courseOutcome.findUnique({
      where: {
        courseId_code: { courseId, code },
      },
    });

    if (existing) {
      if (!existing.isActive) {
        // Reactivate previously soft-deleted CO with updated details
        return prisma.courseOutcome.update({
          where: { id: existing.id },
          data: {
            number: Number(coData.number || existing.number),
            description: coData.description || existing.description,
            bloomsLevel: bloomsLevel ? Number(bloomsLevel) : existing.bloomsLevel,
            bloomVerb: bloomVerb || existing.bloomVerb,
            isActive: true,
          },
        });
      }
      throw new AppError(`Course outcome "${code}" already exists for this course. Please use another code (e.g. CO${(existing.number || 1) + 1}).`, 409);
    }

    return prisma.courseOutcome.create({
      data: {
        code,
        number: Number(coData.number || 1),
        description: coData.description || '',
        bloomsLevel: bloomsLevel ? Number(bloomsLevel) : undefined,
        bloomVerb: bloomVerb || undefined,
        courseId,
      },
    });
  },

  update:  (id: number, data: any) => {
    const { bloomTaxonomyLevel, targetMarksPercentage, targetStudentPercentage, ...coData } = data;
    let bloomsLevel = coData.bloomsLevel;
    let bloomVerb = coData.bloomVerb;
    if (bloomTaxonomyLevel && !bloomsLevel) {
      const match = String(bloomTaxonomyLevel).match(/L([1-6])/i);
      if (match) bloomsLevel = parseInt(match[1]);
      const verbMatch = String(bloomTaxonomyLevel).split(' ')[0];
      if (verbMatch) bloomVerb = verbMatch;
    }
    const updatePayload: any = {};
    if (coData.code !== undefined) updatePayload.code = coData.code;
    if (coData.number !== undefined) updatePayload.number = Number(coData.number);
    if (coData.description !== undefined) updatePayload.description = coData.description;
    if (bloomsLevel !== undefined) updatePayload.bloomsLevel = Number(bloomsLevel);
    if (bloomVerb !== undefined) updatePayload.bloomVerb = bloomVerb;
    if (coData.isActive !== undefined) updatePayload.isActive = Boolean(coData.isActive);
    return prisma.courseOutcome.update({ where: { id }, data: updatePayload });
  },

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

  saveCOPOMappings: async (mappings: any[]) => {
    if (!Array.isArray(mappings) || mappings.length === 0) return [];
    const validMappings = mappings.filter((m) => {
      const coId = Number(m.courseOutcomeId);
      const poId = Number(m.programOutcomeId);
      return !isNaN(coId) && coId > 0 && !isNaN(poId) && poId > 0;
    });

    const results = [];
    const chunkSize = 15;
    for (let i = 0; i < validMappings.length; i += chunkSize) {
      const chunk = validMappings.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map((m) => {
          const mappingValue = Math.min(3, Math.max(0, Number(m.mappingValue ?? m.correlationLevel ?? 0)));
          const courseOutcomeId = Number(m.courseOutcomeId);
          const programOutcomeId = Number(m.programOutcomeId);
          return prisma.coPOMapping.upsert({
            where: { courseOutcomeId_programOutcomeId: { courseOutcomeId, programOutcomeId } },
            create: { courseOutcomeId, programOutcomeId, mappingValue },
            update: { mappingValue },
          });
        })
      );
      results.push(...chunkResults);
    }
    return results;
  },

  saveCOPSOMappings: async (mappings: any[]) => {
    if (!Array.isArray(mappings) || mappings.length === 0) return [];
    const validMappings = mappings.filter((m) => {
      const coId = Number(m.courseOutcomeId);
      const psoId = Number(m.programSpecificOutcomeId ?? m.psoId);
      return !isNaN(coId) && coId > 0 && !isNaN(psoId) && psoId > 0;
    });

    const results = [];
    const chunkSize = 15;
    for (let i = 0; i < validMappings.length; i += chunkSize) {
      const chunk = validMappings.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map((m) => {
          const mappingValue = Math.min(3, Math.max(0, Number(m.mappingValue ?? m.correlationLevel ?? 0)));
          const courseOutcomeId = Number(m.courseOutcomeId);
          const programSpecificOutcomeId = Number(m.programSpecificOutcomeId ?? m.psoId);
          return prisma.coPSOMapping.upsert({
            where: { courseOutcomeId_programSpecificOutcomeId: { courseOutcomeId, programSpecificOutcomeId } },
            create: { courseOutcomeId, programSpecificOutcomeId, mappingValue },
            update: { mappingValue },
          });
        })
      );
      results.push(...chunkResults);
    }
    return results;
  },
};


// ─── Course Allocations (Subject, Class, Division to Faculty) ──
export const CourseAllocationRepository = {
  findAll: async (filters: { departmentId?: number; academicYear?: string; facultyId?: number }) => {
    return prisma.courseFaculty.findMany({
      where: {
        isActive: true,
        ...(filters.facultyId ? { userId: Number(filters.facultyId) } : {}),
        ...(filters.academicYear ? { academicYear: filters.academicYear } : {}),
        ...(filters.departmentId ? {
          course: {
            program: {
              departmentId: Number(filters.departmentId),
            },
          },
        } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            designation: true,
            role: true,
            departmentId: true,
          },
        },
        course: {
          include: {
            program: { include: { department: true } },
            semester: true,
            academicYear: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  assign: async (data: {
    courseId: number;
    userId: number;
    academicClass?: string;
    division?: string;
    academicYear?: string;
    semester?: string;
  }) => {
    const existing = await prisma.courseFaculty.findFirst({
      where: {
        courseId: Number(data.courseId),
        userId: Number(data.userId),
        academicClass: data.academicClass || null,
        division: data.division || null,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            designation: true,
            role: true,
            departmentId: true,
          },
        },
        course: {
          include: {
            program: { include: { department: true } },
            semester: true,
            academicYear: true,
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.courseFaculty.create({
      data: {
        courseId: Number(data.courseId),
        userId: Number(data.userId),
        academicClass: data.academicClass,
        division: data.division,
        academicYear: data.academicYear,
        semester: data.semester,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            designation: true,
            role: true,
            departmentId: true,
          },
        },
        course: {
          include: {
            program: { include: { department: true } },
            semester: true,
            academicYear: true,
          },
        },
      },
    });
  },

  unassign: async (id: number) => {
    return prisma.courseFaculty.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
  },
};
