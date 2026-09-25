// ============================================================
// Assessment Repository
// ============================================================

import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

export const AssessmentRepository = {

  findByCourse: (courseId: number) => prisma.assessment.findMany({
    where: { courseId, isActive: true },
    include: {
      assessmentCOs: {
        include: { courseOutcome: { select: { id: true, code: true, description: true } } },
      },
    },
    orderBy: { assessmentType: 'asc' },
  }),

  findById: (id: number) => prisma.assessment.findUnique({
    where: { id },
    include: {
      course: true,
      assessmentCOs: { include: { courseOutcome: true } },
      studentMarks:  { include: { student: true } },
    },
  }),

  create: async (data: any) => {
    const { coMappings, ...assessmentData } = data;
    return prisma.assessment.create({
      data: {
        ...assessmentData,
        conductedDate: assessmentData.conductedDate ? new Date(assessmentData.conductedDate) : undefined,
        assessmentCOs: coMappings
          ? { create: coMappings }
          : undefined,
      },
      include: { assessmentCOs: true },
    });
  },

  update: async (id: number, data: any) => {
    const { coMappings, ...assessmentData } = data;

    const updated = await prisma.assessment.update({
      where: { id },
      data: {
        ...assessmentData,
        conductedDate: assessmentData.conductedDate ? new Date(assessmentData.conductedDate) : undefined,
      },
    });

    if (coMappings) {
      await prisma.assessmentCO.deleteMany({ where: { assessmentId: id } });
      if (coMappings.length > 0) {
        await prisma.assessmentCO.createMany({
          data: coMappings.map((m: any) => ({ ...m, assessmentId: id })),
        });
      }
    }

    return updated;
  },

  delete: (id: number) => prisma.assessment.update({ where: { id }, data: { isActive: false } }),

  // Marks
  submitMarks: async (marks: { studentId: number; assessmentId: number; courseOutcomeId?: number | null; marksObtained: number; isAbsent?: boolean }[]) => {
    const results = [];
    for (const mark of marks) {
      // Validate marks do not exceed max
      const assessmentCO = mark.courseOutcomeId
        ? await prisma.assessmentCO.findFirst({
            where: { assessmentId: mark.assessmentId, courseOutcomeId: mark.courseOutcomeId },
          })
        : null;

      const assessment = await prisma.assessment.findUnique({ where: { id: mark.assessmentId } });
      const maxMarks = assessmentCO ? Number(assessmentCO.maxMarks) : Number(assessment?.maxMarks ?? 999);

      if (!mark.isAbsent && mark.marksObtained > maxMarks) {
        throw new AppError(
          `Marks obtained (${mark.marksObtained}) cannot exceed maximum marks (${maxMarks})`,
          400
        );
      }

      const existing = await prisma.studentAssessmentMark.findFirst({
        where: {
          studentId:       mark.studentId,
          assessmentId:    mark.assessmentId,
          courseOutcomeId: mark.courseOutcomeId ?? null,
        },
      });

      if (existing) {
        results.push(await prisma.studentAssessmentMark.update({
          where: { id: existing.id },
          data:  { marksObtained: mark.marksObtained, isAbsent: mark.isAbsent ?? false },
        }));
      } else {
        results.push(await prisma.studentAssessmentMark.create({
          data: mark,
        }));
      }
    }
    return results;
  },

  getMarksByAssessment: (assessmentId: number) => prisma.studentAssessmentMark.findMany({
    where: { assessmentId },
    include: {
      student:       { select: { id: true, rollNumber: true, name: true } },
      assessment:    { select: { id: true, name: true, maxMarks: true } },
    },
    orderBy: [
      { student: { rollNumber: 'asc' } },
    ],
  }),

  getMarksByCourse: (courseId: number) => prisma.studentAssessmentMark.findMany({
    where: { assessment: { courseId } },
    include: {
      student:    { select: { id: true, rollNumber: true, name: true } },
      assessment: { select: { id: true, name: true, assessmentType: true, maxMarks: true } },
    },
    orderBy: [{ student: { rollNumber: 'asc' } }],
  }),
};
