// ============================================================
// OBE Formula Engine — Complete Implementation
// All attainment calculations are here. No formulas in controllers
// or React components. All thresholds/weights are DB-driven.
//
// ALGORITHM REFERENCE: DYP COEI OBE Process Manual
// ============================================================

import prisma from '../config/prisma';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface COAttainmentResult {
  courseOutcomeId: number;
  coCode: string;
  description: string;
  /** % of students who scored ≥ CO_PASS_THRESHOLD across all assessments */
  passPercentage: number;
  /** 0–3 level derived from AttainmentThreshold table */
  attainmentLevel: number;
  /** Numeric attainment value (e.g. 3.0, 2.0) */
  attainmentValue: number;
  studentsAbove: number;
  totalStudents: number;
  /** Per-assessment weighted average CO score % */
  weightedPercentage: number;
}

export interface DirectCOAttainmentDetail {
  courseId: number;
  courseCode: string;
  courseName: string;
  cos: COAttainmentResult[];
  averageAttainment: number;
}

export interface POAttainmentResult {
  programOutcomeId: number;
  poCode: string;
  description: string;
  directAttainment: number;
  indirectAttainment: number;
  finalAttainment: number;
  directWeight: number;   // e.g. 80
  indirectWeight: number; // e.g. 20
}

export interface PSOAttainmentResult {
  psoId: number;
  psoCode: string;
  description: string;
  directAttainment: number;
  indirectAttainment: number;
  finalAttainment: number;
}

export interface IndirectAttainmentBreakdown {
  poCode: string;
  ccaAttainment: number;
  ecaAttainment: number;
  exitSurveyAttainment: number;
  alumniSurveyAttainment: number;
  parentSurveyAttainment: number;
  combined: number;
}

export interface FullAttainmentReport {
  coAttainment: Record<string, COAttainmentResult[]>;   // courseCode -> results
  poDirectAttainment: Record<string, number>;
  indirectBreakdown: IndirectAttainmentBreakdown[];
  poAttainment: POAttainmentResult[];
  psoAttainment: PSOAttainmentResult[];
  config: {
    directWeight: number;
    indirectWeight: number;
    passThreshold: number;
  };
}

// ─────────────────────────────────────────────────────────────
// HELPER: Load attainment threshold config from DB
// ─────────────────────────────────────────────────────────────

async function getThresholds(programId?: number) {
  const all = await prisma.attainmentThreshold.findMany({
    where: {
      OR: [
        { programId: programId ?? null },
        { programId: null },
      ],
      isActive: true,
    },
    orderBy: { level: 'desc' },
  });

  // Program-specific overrides globals at same level
  const effective = new Map<number, typeof all[number]>();
  // First pass: global
  for (const t of all.filter(t => t.programId === null)) {
    effective.set(t.level, t);
  }
  // Second pass: program-specific wins
  for (const t of all.filter(t => t.programId === programId)) {
    effective.set(t.level, t);
  }

  return [...effective.values()].sort((a, b) => b.level - a.level);
}

async function mapPercentageToLevel(
  percentage: number,
  programId?: number
): Promise<{ level: number; value: number }> {
  const thresholds = await getThresholds(programId);

  for (const t of thresholds) {
    if (percentage >= Number(t.minPercentage)) {
      return { level: t.level, value: Number(t.attainmentValue) };
    }
  }
  return { level: 0, value: 0 };
}

// ─────────────────────────────────────────────────────────────
// HELPER: Load direct/indirect weights from DB
// ─────────────────────────────────────────────────────────────

export async function getDirectIndirectWeights(programId?: number): Promise<{ directWeight: number; indirectWeight: number }> {
  const config = await prisma.directIndirectWeightConfig.findFirst({
    where: { OR: [{ programId: programId ?? null }, { programId: null }] },
    orderBy: { programId: 'desc' }, // program-specific wins
  });
  return {
    directWeight:   Number(config?.directWeight   ?? 80),
    indirectWeight: Number(config?.indirectWeight ?? 20),
  };
}

// ─────────────────────────────────────────────────────────────
// HELPER: Get OBE setting value
// ─────────────────────────────────────────────────────────────

async function getObeSetting(key: string, programId?: number, defaultValue = '60'): Promise<string> {
  const setting = await prisma.obeSettings.findFirst({
    where: {
      settingKey: key,
      OR: [{ programId: programId ?? null }, { programId: null }],
    },
    orderBy: { programId: 'desc' },
  });
  return setting?.settingValue ?? defaultValue;
}

// ─────────────────────────────────────────────────────────────
// 1. CO ATTAINMENT (Per Course)
//
// Algorithm (from OBE manual):
//   For each CO:
//     1. Get all assessments that test this CO (via AssessmentCO table).
//     2. For each student, compute weighted average score % across assessments.
//        weightedScore = Σ(studentMark/maxMarks × 100 × assessmentWeightage)
//        totalWeight   = Σ(assessmentWeightage for assessments covering this CO)
//        studentPercent = weightedScore / totalWeight
//     3. Count students where studentPercent ≥ CO_PASS_THRESHOLD.
//     4. coPassRate = (studentsAbove / totalStudents) × 100
//     5. Map coPassRate to attainment level via threshold table.
// ─────────────────────────────────────────────────────────────

export async function calculateCOAttainment(
  courseId: number,
  programId?: number
): Promise<COAttainmentResult[]> {
  const passThreshold = parseFloat(await getObeSetting('CO_PASS_THRESHOLD', programId, '60'));

  const courseOutcomes = await prisma.courseOutcome.findMany({
    where: { courseId, isActive: true },
    orderBy: { number: 'asc' },
  });

  const assessments = await prisma.assessment.findMany({
    where: { courseId, isActive: true },
    include: { assessmentCOs: true },
  });

  const enrollments = await prisma.studentCourse.findMany({
    where: { courseId },
    select: { studentId: true },
  });
  const studentIds = enrollments.map(e => e.studentId);
  const totalStudents = studentIds.length;

  if (totalStudents === 0) {
    return courseOutcomes.map(co => ({
      courseOutcomeId: co.id,
      coCode: co.code,
      description: co.description,
      passPercentage: 0,
      attainmentLevel: 0,
      attainmentValue: 0,
      studentsAbove: 0,
      totalStudents: 0,
      weightedPercentage: 0,
    }));
  }

  // Batch-fetch all marks for this course (performance optimization)
  const allMarks = await prisma.studentAssessmentMark.findMany({
    where: {
      assessmentId: { in: assessments.map(a => a.id) },
      studentId: { in: studentIds },
    },
  });

  const marksIndex = new Map<string, typeof allMarks[number]>();
  for (const m of allMarks) {
    marksIndex.set(`${m.studentId}_${m.assessmentId}_${m.courseOutcomeId ?? 'null'}`, m);
  }

  const results: COAttainmentResult[] = [];

  for (const co of courseOutcomes) {
    // Which assessments test this CO?
    const relevantAssessments = assessments.filter(a =>
      a.assessmentCOs.some(ac => ac.courseOutcomeId === co.id)
    );

    if (relevantAssessments.length === 0) {
      results.push({
        courseOutcomeId: co.id,
        coCode: co.code,
        description: co.description,
        passPercentage: 0,
        attainmentLevel: 0,
        attainmentValue: 0,
        studentsAbove: 0,
        totalStudents,
        weightedPercentage: 0,
      });
      continue;
    }

    let studentsAbove = 0;
    let totalWeightedPercent = 0;

    for (const studentId of studentIds) {
      let weightedScore = 0;
      let totalWeight   = 0;

      for (const assessment of relevantAssessments) {
        const asCO = assessment.assessmentCOs.find(ac => ac.courseOutcomeId === co.id)!;
        const mark = marksIndex.get(`${studentId}_${assessment.id}_${co.id}`);

        if (!mark || mark.isAbsent) continue;

        const coMaxMarks  = Number(asCO.maxMarks);
        const scorePercent = coMaxMarks > 0 ? (Number(mark.marksObtained) / coMaxMarks) * 100 : 0;
        const weight       = Number(assessment.weightage); // e.g. 20, 20, 60

        weightedScore += scorePercent * weight;
        totalWeight   += weight;
      }

      const studentPercent = totalWeight > 0 ? weightedScore / totalWeight : 0;
      totalWeightedPercent += studentPercent;

      if (studentPercent >= passThreshold) {
        studentsAbove++;
      }
    }

    const coPassRate         = (studentsAbove / totalStudents) * 100;
    const avgWeightedPercent = totalWeightedPercent / totalStudents;
    const { level, value }  = await mapPercentageToLevel(coPassRate, programId);

    results.push({
      courseOutcomeId:   co.id,
      coCode:            co.code,
      description:       co.description,
      passPercentage:    Math.round(coPassRate         * 100) / 100,
      weightedPercentage: Math.round(avgWeightedPercent * 100) / 100,
      attainmentLevel:   level,
      attainmentValue:   value,
      studentsAbove,
      totalStudents,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────
// 2. PERSIST CO ATTAINMENT
// ─────────────────────────────────────────────────────────────

export async function persistCOAttainment(
  courseId: number,
  programId?: number
): Promise<COAttainmentResult[]> {
  const results = await calculateCOAttainment(courseId, programId);

  for (const r of results) {
    // CoAttainment has @unique([courseOutcomeId])
    const existing = await prisma.coAttainment.findFirst({
      where: { courseOutcomeId: r.courseOutcomeId },
    });

    if (existing) {
      await prisma.coAttainment.update({
        where: { id: existing.id },
        data: {
          directAttainment:      r.attainmentValue,
          finalAttainment:       r.attainmentValue,
          attainmentLevel:       r.attainmentLevel,
          studentsAboveThreshold: r.studentsAbove,
          totalStudents:         r.totalStudents,
          calculatedAt:          new Date(),
        },
      });
    } else {
      await prisma.coAttainment.create({
        data: {
          courseOutcomeId:        r.courseOutcomeId,
          directAttainment:       r.attainmentValue,
          finalAttainment:        r.attainmentValue,
          attainmentLevel:        r.attainmentLevel,
          studentsAboveThreshold: r.studentsAbove,
          totalStudents:          r.totalStudents,
        },
      });
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────
// 3. PO DIRECT ATTAINMENT
//
// Algorithm (from OBE manual):
//   PO_j = Σ(CO_i_attainmentValue × mapping(CO_i, PO_j)) / Σ(mapping(CO_i, PO_j))
//   Only COs with mapping > 0 are included.
//   This is a weighted average where the CO-PO correlation level is the weight.
// ─────────────────────────────────────────────────────────────

export async function calculatePODirectAttainment(
  programId: number,
  academicYearId: number
): Promise<Record<string, number>> {
  const pos = await prisma.programOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });

  // Get all courses in this program/year with CO attainment data
  const courses = await prisma.course.findMany({
    where: { programId, academicYearId, isActive: true },
    include: {
      courseOutcomes: {
        where: { isActive: true },
        include: {
          coPomappings: { where: { mappingValue: { gt: 0 } } },
          coAttainments: { orderBy: { calculatedAt: 'desc' }, take: 1 },
        },
      },
    },
  });

  const poAttainments: Record<string, number> = {};

  for (const po of pos) {
    let weightedSum  = 0;
    let totalWeight  = 0;

    for (const course of courses) {
      for (const co of course.courseOutcomes) {
        const mapping = co.coPomappings.find(m => m.programOutcomeId === po.id);
        if (!mapping || mapping.mappingValue === 0) continue;

        const attainmentRecord = co.coAttainments[0];
        if (!attainmentRecord) continue;

        const coValue    = Number(attainmentRecord.finalAttainment);
        const mapWeight  = mapping.mappingValue; // 1, 2, or 3

        weightedSum  += coValue * mapWeight;
        totalWeight  += mapWeight;
      }
    }

    poAttainments[po.code] = totalWeight > 0
      ? Math.round((weightedSum / totalWeight) * 100) / 100
      : 0;
  }

  return poAttainments;
}

// ─────────────────────────────────────────────────────────────
// 4. PSO DIRECT ATTAINMENT (same algorithm, using CO-PSO mappings)
// ─────────────────────────────────────────────────────────────

export async function calculatePSODirectAttainment(
  programId: number,
  academicYearId: number
): Promise<Record<string, number>> {
  const psos = await prisma.programSpecificOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });

  const courses = await prisma.course.findMany({
    where: { programId, academicYearId, isActive: true },
    include: {
      courseOutcomes: {
        where: { isActive: true },
        include: {
          coPsomappings: { where: { mappingValue: { gt: 0 } } },
          coAttainments: { orderBy: { calculatedAt: 'desc' }, take: 1 },
        },
      },
    },
  });

  const psoAttainments: Record<string, number> = {};

  for (const pso of psos) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const course of courses) {
      for (const co of course.courseOutcomes) {
        const mapping = co.coPsomappings.find(m => m.programSpecificOutcomeId === pso.id);
        if (!mapping || mapping.mappingValue === 0) continue;

        const attainmentRecord = co.coAttainments[0];
        if (!attainmentRecord) continue;

        weightedSum += Number(attainmentRecord.finalAttainment) * mapping.mappingValue;
        totalWeight += mapping.mappingValue;
      }
    }

    psoAttainments[pso.code] = totalWeight > 0
      ? Math.round((weightedSum / totalWeight) * 100) / 100
      : 0;
  }

  return psoAttainments;
}

// ─────────────────────────────────────────────────────────────
// 5. CCA ATTAINMENT PER PO
//
// For each PO, average across all CCA activities mapped to it:
//   poAttainment = Σ(activity.attainmentLevel × mapping.mappingValue) / Σ(mapping.mappingValue)
// Normalized to 0–3 scale (since attainmentLevel is already 0–3).
// ─────────────────────────────────────────────────────────────

export async function calculateCCAAttainment(
  academicYearId: number,
  programId?: number
): Promise<Record<string, number>> {
  // Note: CcaActivity has no programId field; filter by programId via PO mappings program relation
  const activities = await prisma.ccaActivity.findMany({
    where: {
      academicYearId,
      isActive: true,
    },
    include: {
      poMappings: {
        include: { programOutcome: true },
        // Filter to only POs belonging to the requested program
        ...(programId ? { where: { programOutcome: { programId } } } : {}),
      },
    },
  });

  const poContrib: Record<string, { weightedSum: number; totalWeight: number }> = {};

  for (const activity of activities) {
    for (const mapping of activity.poMappings) {
      if (mapping.mappingValue === 0) continue;
      const poCode = mapping.programOutcome.code;

      if (!poContrib[poCode]) poContrib[poCode] = { weightedSum: 0, totalWeight: 0 };

      // attainmentLevel × mappingValue (both on 0–3 scale, result normalized below)
      poContrib[poCode].weightedSum  += activity.attainmentLevel * mapping.mappingValue;
      poContrib[poCode].totalWeight  += mapping.mappingValue;
    }
  }

  const result: Record<string, number> = {};
  for (const [poCode, { weightedSum, totalWeight }] of Object.entries(poContrib)) {
    // Normalize: divide by max attainmentLevel (3) to keep on 0–3 scale
    const raw = totalWeight > 0 ? weightedSum / totalWeight : 0;
    // raw is already on 0–3 scale (attainmentLevel is 0–3)
    result[poCode] = Math.round(raw * 100) / 100;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// 6. ECA ATTAINMENT PER PO (same algorithm as CCA)
// ─────────────────────────────────────────────────────────────

export async function calculateECAAttainment(
  academicYearId: number,
  programId?: number
): Promise<Record<string, number>> {
  // Note: EcaActivity has no programId field; filter by programId via PO mappings program relation
  const activities = await prisma.ecaActivity.findMany({
    where: {
      academicYearId,
      isActive: true,
    },
    include: {
      poMappings: {
        include: { programOutcome: true },
        // Filter to only POs belonging to the requested program
        ...(programId ? { where: { programOutcome: { programId } } } : {}),
      },
    },
  });

  const poContrib: Record<string, { weightedSum: number; totalWeight: number }> = {};

  for (const activity of activities) {
    for (const mapping of activity.poMappings) {
      if (mapping.mappingValue === 0) continue;
      const poCode = mapping.programOutcome.code;

      if (!poContrib[poCode]) poContrib[poCode] = { weightedSum: 0, totalWeight: 0 };
      poContrib[poCode].weightedSum  += activity.attainmentLevel * mapping.mappingValue;
      poContrib[poCode].totalWeight  += mapping.mappingValue;
    }
  }

  const result: Record<string, number> = {};
  for (const [poCode, { weightedSum, totalWeight }] of Object.entries(poContrib)) {
    result[poCode] = Math.round((totalWeight > 0 ? weightedSum / totalWeight : 0) * 100) / 100;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// 7. SURVEY ATTAINMENT PER PO (for a single survey)
//
// For each survey question that maps to a PO:
//   questionAvgRating = mean of all response ratings for that question
//   normalizedRating  = (questionAvgRating - scaleMin) / (scaleMax - scaleMin) × 3
// Then per PO:
//   poSurveyAttainment = mean of normalizedRating across all questions mapped to that PO
// ─────────────────────────────────────────────────────────────

export async function calculateSurveyAttainment(
  surveyId: number
): Promise<Record<string, number>> {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: {
        include: {
          poMappings: { include: { programOutcome: true } },
          responseDetails: true,
        },
      },
    },
  });

  if (!survey) throw new Error(`Survey ${surveyId} not found`);

  const scaleMax = survey.scaleMax;
  const scaleMin = survey.scaleMin;

  const poAccum: Record<string, { sum: number; count: number }> = {};

  for (const question of survey.questions) {
    if (question.responseDetails.length === 0) continue;

    const avgRating = question.responseDetails.reduce(
      (sum, r) => sum + r.rating, 0
    ) / question.responseDetails.length;

    // Normalize to 0–3 scale
    const normalized = scaleMax > scaleMin
      ? ((avgRating - scaleMin) / (scaleMax - scaleMin)) * 3
      : 0;

    for (const mapping of question.poMappings) {
      const poCode = mapping.programOutcome.code;
      if (!poAccum[poCode]) poAccum[poCode] = { sum: 0, count: 0 };
      poAccum[poCode].sum   += normalized;
      poAccum[poCode].count++;
    }
  }

  const result: Record<string, number> = {};
  for (const [poCode, { sum, count }] of Object.entries(poAccum)) {
    result[poCode] = Math.round((count > 0 ? sum / count : 0) * 100) / 100;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// 8. EMPLOYER SURVEY ATTAINMENT
// ─────────────────────────────────────────────────────────────

export async function calculateEmployerSurveyAttainment(
  academicYearId: number,
  scaleMax?: number
): Promise<{ category: string; averageRating: number; normalizedAttainment: number }[]> {
  const configuredScale = parseFloat(await getObeSetting('EMPLOYER_SURVEY_SCALE', undefined, '5'));
  const effectiveMax = scaleMax ?? configuredScale;

  const categories = await prisma.employerSurveyCategory.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      ratings: {
        where: { survey: { academicYearId } },
        include: { survey: true },
      },
    },
  });

  return categories.map(cat => {
    const ratings = cat.ratings;
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: { rating: number }) => sum + Number(r.rating), 0) / ratings.length
      : 0;
    const normalized = effectiveMax > 0 ? (avgRating / effectiveMax) * 3 : 0;

    return {
      category:             cat.name,
      averageRating:        Math.round(avgRating   * 100) / 100,
      normalizedAttainment: Math.round(normalized  * 100) / 100,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 9. INDIRECT PO ATTAINMENT (combined from CCA, ECA, all surveys)
//
// Sources combined with configurable weights from ObeSettings.
// Default: equal weight across available sources.
// The combined indirect attainment is what appears in the final report.
// ─────────────────────────────────────────────────────────────

export async function calculateIndirectAttainment(
  programId: number,
  academicYearId: number
): Promise<{ byPO: Record<string, number>; breakdown: IndirectAttainmentBreakdown[] }> {
  const pos = await prisma.programOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });

  // Get individual source attainments
  const ccaAtt  = await calculateCCAAttainment(academicYearId, programId);
  const ecaAtt  = await calculateECAAttainment(academicYearId, programId);

  // Get surveys by type for this academic year
  const surveys = await prisma.survey.findMany({
    where: { academicYearId },
  });

  const surveyByType: Record<string, Record<string, number>[]> = {};
  for (const survey of surveys) {
    const att = await calculateSurveyAttainment(survey.id);
    const type = survey.surveyType;
    if (!surveyByType[type]) surveyByType[type] = [];
    surveyByType[type].push(att);
  }

  const avgSurveyByType = (type: string): Record<string, number> => {
    const results = surveyByType[type] ?? [];
    if (results.length === 0) return {};
    const combined: Record<string, number> = {};
    for (const res of results) {
      for (const [poCode, val] of Object.entries(res)) {
        if (!combined[poCode]) combined[poCode] = 0;
        combined[poCode] += val;
      }
    }
    for (const poCode of Object.keys(combined)) {
      combined[poCode] = Math.round((combined[poCode] / results.length) * 100) / 100;
    }
    return combined;
  };

  const exitAtt   = avgSurveyByType('EXIT');
  const alumniAtt = avgSurveyByType('ALUMNI');
  const parentAtt = avgSurveyByType('PARENT');

  // Combine indirect sources per PO
  const byPO: Record<string, number>   = {};
  const breakdown: IndirectAttainmentBreakdown[] = [];

  for (const po of pos) {
    const sources: number[] = [];

    const cca    = ccaAtt[po.code]    ?? 0;
    const eca    = ecaAtt[po.code]    ?? 0;
    const exit_  = exitAtt[po.code]   ?? 0;
    const alumni = alumniAtt[po.code] ?? 0;
    const parent = parentAtt[po.code] ?? 0;

    // Include source only if > 0 (i.e., data exists)
    if (cca    > 0) sources.push(cca);
    if (eca    > 0) sources.push(eca);
    if (exit_  > 0) sources.push(exit_);
    if (alumni > 0) sources.push(alumni);
    if (parent > 0) sources.push(parent);

    const combined = sources.length > 0
      ? Math.round((sources.reduce((a, b) => a + b, 0) / sources.length) * 100) / 100
      : 0;

    byPO[po.code] = combined;
    breakdown.push({
      poCode:                 po.code,
      ccaAttainment:          Math.round(cca    * 100) / 100,
      ecaAttainment:          Math.round(eca    * 100) / 100,
      exitSurveyAttainment:   Math.round(exit_  * 100) / 100,
      alumniSurveyAttainment: Math.round(alumni * 100) / 100,
      parentSurveyAttainment: Math.round(parent * 100) / 100,
      combined,
    });
  }

  return { byPO, breakdown };
}

// ─────────────────────────────────────────────────────────────
// 10. FINAL PO ATTAINMENT
//
// Formula (OBE Manual):
//   Final_PO_j = (Direct_PO_j × directWeight/100) + (Indirect_PO_j × indirectWeight/100)
//
// Weights are configurable per program via DirectIndirectWeightConfig.
// Default: Direct = 80%, Indirect = 20%.
// ─────────────────────────────────────────────────────────────

export async function calculateFinalPOAttainment(
  programId: number,
  academicYearId: number
): Promise<POAttainmentResult[]> {
  const weights = await getDirectIndirectWeights(programId);
  const { directWeight, indirectWeight } = weights;

  const directPO   = await calculatePODirectAttainment(programId, academicYearId);
  const { byPO: indirectPO } = await calculateIndirectAttainment(programId, academicYearId);

  const pos = await prisma.programOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });

  return pos.map(po => {
    const direct   = directPO[po.code]   ?? 0;
    const indirect = indirectPO[po.code] ?? 0;
    const final    = (direct * directWeight / 100) + (indirect * indirectWeight / 100);

    return {
      programOutcomeId:   po.id,
      poCode:             po.code,
      description:        po.description,
      directAttainment:   Math.round(direct   * 100) / 100,
      indirectAttainment: Math.round(indirect * 100) / 100,
      finalAttainment:    Math.round(final    * 100) / 100,
      directWeight,
      indirectWeight,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 11. FINAL PSO ATTAINMENT
//
// Same formula as PO, but for PSOs.
// PSO indirect = average of survey attainments for PSO-mapped questions.
// When no PSO-specific indirect data exists, use program-level indirect.
// ─────────────────────────────────────────────────────────────

export async function calculateFinalPSOAttainment(
  programId: number,
  academicYearId: number
): Promise<PSOAttainmentResult[]> {
  const weights = await getDirectIndirectWeights(programId);
  const { directWeight, indirectWeight } = weights;

  const directPSO = await calculatePSODirectAttainment(programId, academicYearId);

  const psos = await prisma.programSpecificOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });

  // PSO indirect: use all survey attainments averaged (no PSO-specific survey mapping yet)
  // If surveys exist, use their average; otherwise default to 3.0 as per manual convention
  const surveys = await prisma.survey.findMany({ where: { academicYearId } });
  let indirectDefault = 3.0;

  if (surveys.length > 0) {
    const allSurveyAtts: number[] = [];
    for (const survey of surveys) {
      const att = await calculateSurveyAttainment(survey.id);
      const vals = Object.values(att).filter(v => v > 0);
      if (vals.length > 0) {
        allSurveyAtts.push(vals.reduce((a, b) => a + b, 0) / vals.length);
      }
    }
    if (allSurveyAtts.length > 0) {
      indirectDefault = allSurveyAtts.reduce((a, b) => a + b, 0) / allSurveyAtts.length;
    }
  }

  return psos.map(pso => {
    const direct   = directPSO[pso.code] ?? 0;
    const indirect = indirectDefault;
    const final    = (direct * directWeight / 100) + (indirect * indirectWeight / 100);

    return {
      psoId:              pso.id,
      psoCode:            pso.code,
      description:        pso.description,
      directAttainment:   Math.round(direct   * 100) / 100,
      indirectAttainment: Math.round(indirect * 100) / 100,
      finalAttainment:    Math.round(final    * 100) / 100,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 12. FULL REPORT — calculate everything in one pass and persist
// ─────────────────────────────────────────────────────────────

export async function calculateAndPersistFullReport(
  programId: number,
  academicYearId: number
): Promise<FullAttainmentReport> {
  // Step 1: Persist CO attainments for all courses in this program/year
  const courses = await prisma.course.findMany({
    where: { programId, academicYearId, isActive: true },
    include: { courseOutcomes: true },
  });

  const coAttainment: Record<string, COAttainmentResult[]> = {};
  for (const course of courses) {
    const results = await persistCOAttainment(course.id, programId);
    coAttainment[course.code] = results;
  }

  // Step 2: PO direct attainment (reads from persisted CO data)
  const poDirectAttainment = await calculatePODirectAttainment(programId, academicYearId);

  // Persist PO direct attainments
  const pos = await prisma.programOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });
  for (const po of pos) {
    const val = poDirectAttainment[po.code] ?? 0;
    const existing = await prisma.poDirectAttainment.findFirst({
      where: { programOutcomeId: po.id, academicYearId },
    });
    if (existing) {
      await prisma.poDirectAttainment.update({
        where: { id: existing.id },
        data: { attainmentValue: val, calculatedAt: new Date() },
      });
    } else {
      await prisma.poDirectAttainment.create({
        data: { programOutcomeId: po.id, academicYearId, attainmentValue: val },
      });
    }
  }

  // Step 3: Indirect attainment
  const { byPO: indirectByPO, breakdown } = await calculateIndirectAttainment(programId, academicYearId);

  // Persist indirect per source
  for (const item of breakdown) {
    const po = pos.find(p => p.code === item.poCode);
    if (!po) continue;

    const sourcePairs = [
      { source: 'CCA', value: item.ccaAttainment },
      { source: 'ECA', value: item.ecaAttainment },
      { source: 'EXIT', value: item.exitSurveyAttainment },
      { source: 'ALUMNI', value: item.alumniSurveyAttainment },
      { source: 'PARENT', value: item.parentSurveyAttainment },
    ];

    for (const { source, value } of sourcePairs) {
      if (value === 0) continue;
      await prisma.poIndirectAttainment.create({
        data: { programOutcomeId: po.id, academicYearId, attainmentValue: value, source },
      }).catch(() => { /* ignore duplicates */ });
    }
  }

  // Step 4: Final PO attainment
  const weights = await getDirectIndirectWeights(programId);
  const poAttainment = await calculateFinalPOAttainment(programId, academicYearId);

  for (const r of poAttainment) {
    const existing = await prisma.poFinalAttainment.findFirst({
      where: { programOutcomeId: r.programOutcomeId, academicYearId },
    });
    if (existing) {
      await prisma.poFinalAttainment.update({
        where: { id: existing.id },
        data: {
          directValue:    r.directAttainment,
          indirectValue:  r.indirectAttainment,
          finalValue:     r.finalAttainment,
          calculatedAt:   new Date(),
        },
      });
    } else {
      await prisma.poFinalAttainment.create({
        data: {
          programOutcomeId: r.programOutcomeId,
          academicYearId,
          directValue:      r.directAttainment,
          indirectValue:    r.indirectAttainment,
          finalValue:       r.finalAttainment,
          directWeight:     r.directWeight,
          indirectWeight:   r.indirectWeight,
        },
      });
    }
  }

  // Step 5: PSO attainment
  const psoAttainment = await calculateFinalPSOAttainment(programId, academicYearId);

  const psos = await prisma.programSpecificOutcome.findMany({
    where: { programId, isActive: true },
  });
  for (const r of psoAttainment) {
    const existing = await prisma.psoFinalAttainment.findFirst({
      where: { psoId: r.psoId, academicYearId },
    });
    if (existing) {
      await prisma.psoFinalAttainment.update({
        where: { id: existing.id },
        data: { directValue: r.directAttainment, indirectValue: r.indirectAttainment, finalValue: r.finalAttainment, calculatedAt: new Date() },
      });
    } else {
      await prisma.psoFinalAttainment.create({
        data: {
          psoId: r.psoId, academicYearId,
          directValue: r.directAttainment, indirectValue: r.indirectAttainment,
          finalValue: r.finalAttainment, directWeight: weights.directWeight,
          indirectWeight: weights.indirectWeight,
        },
      });
    }
  }

  const passThreshold = parseFloat(await getObeSetting('CO_PASS_THRESHOLD', programId, '60'));

  return {
    coAttainment,
    poDirectAttainment,
    indirectBreakdown: breakdown,
    poAttainment,
    psoAttainment,
    config: {
      directWeight:   weights.directWeight,
      indirectWeight: weights.indirectWeight,
      passThreshold,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// 13. DIRECT ATTAINMENT (alias for CO attainment — for controller compat)
// ─────────────────────────────────────────────────────────────

export async function calculateDirectAttainment(
  courseId: number,
  programId?: number
): Promise<COAttainmentResult[]> {
  return calculateCOAttainment(courseId, programId);
}
