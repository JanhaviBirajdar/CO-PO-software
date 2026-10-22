// ============================================================
// Assessment Repository
// ============================================================

import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error.middleware';

export const AssessmentRepository = {

  findAll: () => prisma.assessment.findMany({
    where: { isActive: true },
    include: {
      course: { select: { id: true, name: true, code: true } },
      assessmentCOs: {
        include: { courseOutcome: { select: { id: true, code: true, description: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  }),

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
    const { coMappings, academicYearId, rubricId, isExternal, type, ...assessmentData } = data;
    let assessmentType = assessmentData.assessmentType || type || 'INTERNAL';
    const validTypes = ['INTERNAL', 'UNIT_TEST', 'MID_SEMESTER', 'END_SEMESTER', 'ASSIGNMENT', 'PRACTICAL', 'LAB', 'PROJECT', 'OTHER'];
    if (!validTypes.includes(assessmentType)) {
      const upper = String(assessmentType).toUpperCase();
      if (upper.includes('TEST') || upper.includes('INTERNAL')) assessmentType = 'INTERNAL';
      else if (upper.includes('MID')) assessmentType = 'MID_SEMESTER';
      else if (upper.includes('END') || upper.includes('SEMESTER')) assessmentType = 'END_SEMESTER';
      else if (upper.includes('ASSIGN')) assessmentType = 'ASSIGNMENT';
      else if (upper.includes('LAB') || upper.includes('PRACT')) assessmentType = 'LAB';
      else if (upper.includes('PROJ')) assessmentType = 'PROJECT';
      else assessmentType = 'OTHER';
    }

    return prisma.assessment.create({
      data: {
        name: assessmentData.name || 'Assessment Component',
        assessmentType: assessmentType as any,
        maxMarks: Number(assessmentData.maxMarks || 50),
        weightage: Number(assessmentData.weightage || 20),
        courseId: Number(assessmentData.courseId),
        conductedDate: assessmentData.conductedDate ? new Date(assessmentData.conductedDate) : undefined,
        assessmentCOs: coMappings
          ? { create: coMappings }
          : undefined,
      },
      include: { assessmentCOs: true },
    });
  },

  update: async (id: number, data: any) => {
    const { coMappings, academicYearId, rubricId, isExternal, type, ...assessmentData } = data;
    const updateData: any = {};
    if (assessmentData.name !== undefined) updateData.name = assessmentData.name;
    if (assessmentData.maxMarks !== undefined) updateData.maxMarks = Number(assessmentData.maxMarks);
    if (assessmentData.weightage !== undefined) updateData.weightage = Number(assessmentData.weightage);
    if (assessmentData.assessmentType || type) {
      let at = assessmentData.assessmentType || type;
      const validTypes = ['INTERNAL', 'UNIT_TEST', 'MID_SEMESTER', 'END_SEMESTER', 'ASSIGNMENT', 'PRACTICAL', 'LAB', 'PROJECT', 'OTHER'];
      if (!validTypes.includes(at)) at = 'INTERNAL';
      updateData.assessmentType = at;
    }
    if (assessmentData.conductedDate) {
      updateData.conductedDate = new Date(assessmentData.conductedDate);
    }
    if (assessmentData.isActive !== undefined) {
      updateData.isActive = Boolean(assessmentData.isActive);
    }

    const updated = await prisma.assessment.update({
      where: { id },
      data: updateData,
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
    for (const rawMark of marks) {
      const mark = {
        studentId: Number(rawMark.studentId),
        assessmentId: Number(rawMark.assessmentId),
        courseOutcomeId: rawMark.courseOutcomeId ? Number(rawMark.courseOutcomeId) : null,
        marksObtained: Number(rawMark.marksObtained),
        isAbsent: Boolean(rawMark.isAbsent),
      };

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
          data: {
            studentId: mark.studentId,
            assessmentId: mark.assessmentId,
            courseOutcomeId: mark.courseOutcomeId,
            marksObtained: mark.marksObtained,
            isAbsent: mark.isAbsent,
          },
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
