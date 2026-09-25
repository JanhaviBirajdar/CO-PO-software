// ============================================================
// CCA / ECA / Survey / Attainment Config Repositories
// ============================================================

import { SurveyType } from '@prisma/client';
import { prisma } from '../config/prisma';

// ─── CCA ──────────────────────────────────────────────────────
export const CCARepository = {
  findAll: (academicYearId?: number) => prisma.ccaActivity.findMany({
    where: { isActive: true, ...(academicYearId && { academicYearId }) },
    include: {
      academicYear: true,
      poMappings: { include: { programOutcome: true } },
    },
    orderBy: { name: 'asc' },
  }),
  findById: (id: number) => prisma.ccaActivity.findUnique({
    where: { id },
    include: { poMappings: { include: { programOutcome: true } }, academicYear: true },
  }),
  create: async (data: any) => {
    const { poMappings, ...activityData } = data;
    return prisma.ccaActivity.create({
      data: {
        ...activityData,
        activityDate: activityData.activityDate ? new Date(activityData.activityDate) : undefined,
        poMappings: poMappings
          ? { create: poMappings }
          : undefined,
      },
      include: { poMappings: { include: { programOutcome: true } } },
    });
  },
  update: async (id: number, data: any) => {
    const { poMappings, ...activityData } = data;
    const updated = await prisma.ccaActivity.update({
      where: { id },
      data: {
        ...activityData,
        activityDate: activityData.activityDate ? new Date(activityData.activityDate) : undefined,
      },
    });
    if (poMappings) {
      await prisma.ccaPOMapping.deleteMany({ where: { ccaActivityId: id } });
      if (poMappings.length > 0) {
        await prisma.ccaPOMapping.createMany({ data: poMappings.map((m: any) => ({ ...m, ccaActivityId: id })) });
      }
    }
    return updated;
  },
  delete: (id: number) => prisma.ccaActivity.update({ where: { id }, data: { isActive: false } }),
};

// ─── ECA ──────────────────────────────────────────────────────
export const ECARepository = {
  findAll: (academicYearId?: number, category?: string) => prisma.ecaActivity.findMany({
    where: { isActive: true, ...(academicYearId && { academicYearId }), ...(category && { category }) },
    include: { academicYear: true, poMappings: { include: { programOutcome: true } } },
    orderBy: { name: 'asc' },
  }),
  findById: (id: number) => prisma.ecaActivity.findUnique({
    where: { id },
    include: { poMappings: { include: { programOutcome: true } }, academicYear: true },
  }),
  create: async (data: any) => {
    const { poMappings, ...activityData } = data;
    return prisma.ecaActivity.create({
      data: {
        ...activityData,
        activityDate: activityData.activityDate ? new Date(activityData.activityDate) : undefined,
        poMappings: poMappings ? { create: poMappings } : undefined,
      },
      include: { poMappings: { include: { programOutcome: true } } },
    });
  },
  update: async (id: number, data: any) => {
    const { poMappings, ...activityData } = data;
    const updated = await prisma.ecaActivity.update({
      where: { id },
      data: { ...activityData, activityDate: activityData.activityDate ? new Date(activityData.activityDate) : undefined },
    });
    if (poMappings) {
      await prisma.ecaPOMapping.deleteMany({ where: { ecaActivityId: id } });
      if (poMappings.length > 0) {
        await prisma.ecaPOMapping.createMany({ data: poMappings.map((m: any) => ({ ...m, ecaActivityId: id })) });
      }
    }
    return updated;
  },
  delete: (id: number) => prisma.ecaActivity.update({ where: { id }, data: { isActive: false } }),
};

// ─── Survey ───────────────────────────────────────────────────
export const SurveyRepository = {
  findAll: (academicYearId?: number, surveyType?: SurveyType) => prisma.survey.findMany({
    where: {
      isActive: true,
      ...(academicYearId && { academicYearId }),
      ...(surveyType     && { surveyType }),
    },
    include: {
      academicYear: true,
      _count: { select: { questions: true, responses: true } },
    },
    orderBy: { createdAt: 'desc' },
  }),
  findById: (id: number) => prisma.survey.findUnique({
    where: { id },
    include: {
      academicYear: true,
      questions: {
        where: { isActive: true },
        orderBy: { questionNo: 'asc' },
        include: { poMappings: { include: { programOutcome: true } } },
      },
      responses: {
        include: { details: { include: { surveyQuestion: true } } },
      },
    },
  }),
  create: (data: any) => prisma.survey.create({ data, include: { academicYear: true } }),
  update: (id: number, data: any) => prisma.survey.update({ where: { id }, data }),
  delete: (id: number) => prisma.survey.update({ where: { id }, data: { isActive: false } }),

  addQuestion: async (data: any) => {
    const { poMappings, ...questionData } = data;
    return prisma.surveyQuestion.create({
      data: {
        ...questionData,
        poMappings: poMappings
          ? { create: poMappings.map((poId: number) => ({ programOutcomeId: poId })) }
          : undefined,
      },
      include: { poMappings: { include: { programOutcome: true } } },
    });
  },

  updateQuestion: (id: number, data: any) => prisma.surveyQuestion.update({ where: { id }, data }),
  deleteQuestion: (id: number) => prisma.surveyQuestion.update({ where: { id }, data: { isActive: false } }),

  submitResponse: async (data: any) => {
    const { ratings, ...responseData } = data;
    return prisma.surveyResponse.create({
      data: {
        ...responseData,
        details: { create: ratings.map((r: any) => ({ surveyQuestionId: r.surveyQuestionId, rating: r.rating })) },
      },
      include: { details: true },
    });
  },

  getResponses: (surveyId: number) => prisma.surveyResponse.findMany({
    where: { surveyId },
    include: { details: { include: { surveyQuestion: true } } },
  }),
};

// ─── Attainment Config ────────────────────────────────────────
export const AttainmentConfigRepository = {
  getThresholds: (programId?: number) => prisma.attainmentThreshold.findMany({
    where: { isActive: true, OR: [{ programId: programId ?? undefined }, { programId: null }] },
    orderBy: { level: 'asc' },
  }),

  saveThresholds: async (thresholds: any[], programId?: number) => {
    if (programId) {
      await prisma.attainmentThreshold.updateMany({ where: { programId }, data: { isActive: false } });
    } else {
      await prisma.attainmentThreshold.updateMany({ where: { programId: null }, data: { isActive: false } });
    }
    return prisma.attainmentThreshold.createMany({
      data: thresholds.map(t => ({ ...t, programId: programId ?? null })),
    });
  },

  getDirectIndirectWeight: (programId?: number) => prisma.directIndirectWeightConfig.findFirst({
    where: { OR: [{ programId: programId ?? undefined }, { programId: null }] },
    orderBy: { programId: 'desc' },
  }),

  saveDirectIndirectWeight: async (directWeight: number, indirectWeight: number, programId?: number) => {
    if (directWeight + indirectWeight !== 100) {
      throw new Error('Direct weight + indirect weight must equal 100');
    }
    const whereCondition = programId !== undefined ? programId : undefined;
    // For null programId (global), we need to find existing record with programId IS NULL
    const existing = await prisma.directIndirectWeightConfig.findFirst({
      where: { programId: programId ?? null },
    });
    if (existing) {
      return prisma.directIndirectWeightConfig.update({
        where: { id: existing.id },
        data: { directWeight, indirectWeight },
      });
    }
    return prisma.directIndirectWeightConfig.create({
      data: { directWeight, indirectWeight, programId: programId ?? null },
    });
  },

  getAssessmentWeights: (programId?: number) => prisma.assessmentWeightConfig.findMany({
    where: { isActive: true, OR: [{ programId: programId ?? undefined }, { programId: null }] },
    orderBy: { assessmentType: 'asc' },
  }),

  getObeSettings: (programId?: number) => prisma.obeSettings.findMany({
    where: { OR: [{ programId: programId ?? undefined }, { programId: null }] },
    orderBy: { settingKey: 'asc' },
  }),

  saveObeSettings: async (settings: { settingKey: string; settingValue: string; description?: string }[], programId?: number) => {
    const results = [];
    for (const s of settings) {
      const existing = await prisma.obeSettings.findFirst({
        where: { settingKey: s.settingKey, programId: programId ?? null },
      });
      if (existing) {
        results.push(await prisma.obeSettings.update({
          where: { id: existing.id },
          data: { settingValue: s.settingValue, description: s.description },
        }));
      } else {
        results.push(await prisma.obeSettings.create({
          data: { ...s, programId: programId ?? null },
        }));
      }
    }
    return results;
  },
};

// ─── Employer Survey ──────────────────────────────────────────
export const EmployerSurveyRepository = {
  findAll: (academicYearId?: number) => prisma.employerSurvey.findMany({
    where: { ...(academicYearId && { academicYearId }) },
    include: { ratings: { include: { category: true } } },
    orderBy: { submittedAt: 'desc' },
  }),
  findById: (id: number) => prisma.employerSurvey.findUnique({
    where: { id },
    include: { ratings: { include: { category: true } } },
  }),
  getCategories: () => prisma.employerSurveyCategory.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' },
  }),
  create: async (data: any) => {
    const { ratings, ...surveyData } = data;
    return prisma.employerSurvey.create({
      data: {
        ...surveyData,
        ratings: ratings ? { create: ratings } : undefined,
      },
      include: { ratings: { include: { category: true } } },
    });
  },
  delete: (id: number) => prisma.employerSurvey.delete({ where: { id } }),
};
