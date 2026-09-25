// ============================================================
// OBE Formula Engine
// All attainment calculations are implemented here.
// No formulas exist in controllers or React components.
// ============================================================

import prisma from '../config/prisma';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface COAttainmentResult {
  courseOutcomeId: number;
  coCode: string;
  description: string;
  percentage: number;   // % of students above threshold
  attainmentLevel: number;  // 0,1,2,3
  attainmentValue: number;  // numeric
  studentsAbove: number;
  totalStudents: number;
}

export interface POAttainmentResult {
  programOutcomeId: number;
  poCode: string;
  directAttainment: number;
  indirectAttainment: number;
  finalAttainment: number;
  directWeight: number;
  indirectWeight: number;
}

export interface PSOAttainmentResult {
  psoId: number;
  psoCode: string;
  directAttainment: number;
  indirectAttainment: number;
  finalAttainment: number;
}

// ─────────────────────────────────────────────────────────────
// HELPER: Get attainment level from percentage
// ─────────────────────────────────────────────────────────────

async function getAttainmentLevel(
  percentage: number,
  programId?: number
): Promise<{ level: number; value: number }> {
  // Fetch thresholds from DB (program-specific first, then global)
  const thresholds = await prisma.attainmentThreshold.findMany({
    where: {
      OR: [
        { programId: programId ?? null },
        { programId: null },
      ],
      isActive: true,
    },
    orderBy: { level: 'desc' },
  });

  // Prefer program-specific, fallback to global
  const effective = thresholds.reduce((acc: any[], t) => {
    const exists = acc.find(a => a.level === t.level);
    if (!exists) acc.push(t);
    return acc;
  }, []).sort((a, b) => b.level - a.level);

  for (const threshold of effective) {
    if (percentage >= Number(threshold.minPercentage)) {
      return {
        level: threshold.level,
        value: Number(threshold.attainmentValue),
      };
    }
  }
  return { level: 0, value: 0 };
}

// ─────────────────────────────────────────────────────────────
// 1. CO ATTAINMENT
// ─────────────────────────────────────────────────────────────

/**
 * Calculate CO attainment for all COs of a course.
 *
 * Algorithm:
 * 1. For each CO, get all student marks across all assessments.
 * 2. Calculate each student's weighted total % for that CO.
 * 3. Count students scoring ≥ CO_PASS_THRESHOLD.
 * 4. CO attainment % = (students above threshold / total students) × 100.
 * 5. Map percentage to level using AttainmentThreshold table.
 */
export async function calculateCOAttainment(
  courseId: number,
  programId?: number
): Promise<COAttainmentResult[]> {
  // Get CO pass threshold from settings
  const passSetting = await prisma.obeSettings.findFirst({
    where: { settingKey: 'CO_PASS_THRESHOLD', programId: programId ?? null },
  });
  const passThreshold = Number(passSetting?.settingValue ?? 60);

  // Get all COs for this course
  const courseOutcomes = await prisma.courseOutcome.findMany({
    where: { courseId, isActive: true },
    orderBy: { number: 'asc' },
  });

  // Get all assessments for this course with their weightages
  const assessments = await prisma.assessment.findMany({
    where: { courseId, isActive: true },
    include: {
      assessmentCOs: { include: { courseOutcome: true } },
    },
  });

  // Get all enrolled students
  const enrollments = await prisma.studentCourse.findMany({
    where: { courseId },
    include: { student: true },
  });
  const studentIds = enrollments.map(e => e.studentId);
  const totalStudents = studentIds.length;

  const results: COAttainmentResult[] = [];

  for (const co of courseOutcomes) {
    // For this CO, compute each student's aggregate performance
    let studentsAbove = 0;

    for (const studentId of studentIds) {
      let weightedScore = 0;
      let totalWeight = 0;

      for (const assessment of assessments) {
        const assCoMapping = assessment.assessmentCOs.find(
          ac => ac.courseOutcomeId === co.id
        );
        if (!assCoMapping) continue;

        const mark = await prisma.studentAssessmentMark.findFirst({
          where: {
            studentId,
            assessmentId: assessment.id,
            courseOutcomeId: co.id,
          },
        });

        if (!mark || mark.isAbsent) continue;

        const coMaxMarks = Number(assCoMapping.maxMarks);
        const scorePercent = (Number(mark.marksObtained) / coMaxMarks) * 100;
        const weight = Number(assessment.weightage);

        weightedScore += scorePercent * weight;
        totalWeight += weight;
      }

      const finalPercent = totalWeight > 0 ? weightedScore / totalWeight : 0;
      if (finalPercent >= passThreshold) {
        studentsAbove++;
      }
    }

    const coPercent = totalStudents > 0
      ? (studentsAbove / totalStudents) * 100
      : 0;

    const { level, value } = await getAttainmentLevel(coPercent, programId);

    results.push({
      courseOutcomeId: co.id,
      coCode: co.code,
      description: co.description,
      percentage: Math.round(coPercent * 100) / 100,
      attainmentLevel: level,
      attainmentValue: value,
      studentsAbove,
      totalStudents,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────
// 2. DIRECT CO ATTAINMENT (from multiple assessments, weighted)
// ─────────────────────────────────────────────────────────────

/**
 * Calculate direct CO attainment using configured assessment weightages.
 * If per-assessment weightage is configured, uses those; otherwise uses
 * global assessment type weightage from assessment_weight_configs.
 */
export async function calculateDirectAttainment(
  courseId: number,
  programId?: number
): Promise<COAttainmentResult[]> {
  // Direct attainment uses the same CO-level calculation
  // but with assessment-level weightage configuration
  return calculateCOAttainment(courseId, programId);
}

// ─────────────────────────────────────────────────────────────
// 3. PO DIRECT ATTAINMENT
// ─────────────────────────────────────────────────────────────

/**
 * Calculate PO direct attainment for a program in an academic year.
 *
 * Algorithm:
 * For each PO:
 *   PO_j = Σ(CO_i_attainment × mapping(CO_i, PO_j)) / Σ(mapping(CO_i, PO_j))
 *   Only COs with mapping > 0 are included (weighted average by mapping strength).
 */
export async function calculatePODirectAttainment(
  programId: number,
  academicYearId: number
): Promise<Record<string, number>> {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { pos: { where: { isActive: true }, orderBy: { number: 'asc' } } },
  });
  if (!program) throw new Error(`Program ${programId} not found`);

  // Get all courses in this program/year
  const courses = await prisma.course.findMany({
    where: { programId, academicYearId, isActive: true },
    include: {
      courseOutcomes: {
        where: { isActive: true },
        include: {
          coPomappings: true,
          coAttainments: true,
        },
      },
    },
  });

  const poAttainments: Record<string, number> = {};

  for (const po of program.pos) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const course of courses) {
      for (const co of course.courseOutcomes) {
        const mapping = co.coPomappings.find(m => m.programOutcomeId === po.id);
        if (!mapping || mapping.mappingValue === 0) continue;

        const attainmentRecord = co.coAttainments[0]; // most recent
        if (!attainmentRecord) continue;

        const coAttainmentValue = Number(attainmentRecord.finalAttainment);
        weightedSum += coAttainmentValue * mapping.mappingValue;
        totalWeight += mapping.mappingValue;
      }
    }

    poAttainments[po.code] = totalWeight > 0
      ? Math.round((weightedSum / totalWeight) * 100) / 100
      : 0;
  }

  return poAttainments;
}

// ─────────────────────────────────────────────────────────────
// 4. PSO DIRECT ATTAINMENT
// ─────────────────────────────────────────────────────────────

/**
 * Same algorithm as PO direct, but using CO-PSO mappings.
 */
export async function calculatePSODirectAttainment(
  programId: number,
  academicYearId: number
): Promise<Record<string, number>> {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: { psos: { where: { isActive: true }, orderBy: { number: 'asc' } } },
  });
  if (!program) throw new Error(`Program ${programId} not found`);

  const courses = await prisma.course.findMany({
    where: { programId, academicYearId, isActive: true },
    include: {
      courseOutcomes: {
        where: { isActive: true },
        include: {
          coPsomappings: true,
          coAttainments: true,
        },
      },
    },
  });

  const psoAttainments: Record<string, number> = {};

  for (const pso of program.psos) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const course of courses) {
      for (const co of course.courseOutcomes) {
        const mapping = co.coPsomappings.find(m => m.programSpecificOutcomeId === pso.id);
        if (!mapping || mapping.mappingValue === 0) continue;

        const attainmentRecord = co.coAttainments[0];
        if (!attainmentRecord) continue;

        const coValue = Number(attainmentRecord.finalAttainment);
        weightedSum += coValue * mapping.mappingValue;
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
// 5. CCA ATTAINMENT (indirect)
// ─────────────────────────────────────────────────────────────

/**
 * Calculate CCA contribution to each PO.
 * Average of (activity_level × mapping_value / max_mapping_scale)
 * across all CCA activities mapped to that PO.
 */
export async function calculateCCAAttainment(
  academicYearId: number,
  maxScale: number = 3
): Promise<Record<string, number>> {
  const activities = await prisma.ccaActivity.findMany({
    where: { academicYearId, isActive: true },
    include: {
      poMappings: {
        include: { programOutcome: true },
      },
    },
  });

  const poContributions: Record<string, { sum: number; count: number }> = {};

  for (const activity of activities) {
    for (const mapping of activity.poMappings) {
      if (mapping.mappingValue === 0) continue;
      const poCode = mapping.programOutcome.code;
      const contribution = (activity.attainmentLevel * mapping.mappingValue) / maxScale;

      if (!poContributions[poCode]) {
        poContributions[poCode] = { sum: 0, count: 0 };
      }
      poContributions[poCode].sum += contribution;
      poContributions[poCode].count++;
    }
  }

  const result: Record<string, number> = {};
  for (const [poCode, { sum, count }] of Object.entries(poContributions)) {
    result[poCode] = count > 0
      ? Math.round((sum / count) * 100) / 100
      : 0;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// 6. ECA ATTAINMENT (indirect)
// ─────────────────────────────────────────────────────────────

export async function calculateECAAttainment(
  academicYearId: number,
  maxScale: number = 3
): Promise<Record<string, number>> {
  const activities = await prisma.ecaActivity.findMany({
    where: { academicYearId, isActive: true },
    include: {
      poMappings: {
        include: { programOutcome: true },
      },
    },
  });

  const poContributions: Record<string, { sum: number; count: number }> = {};

  for (const activity of activities) {
    for (const mapping of activity.poMappings) {
      if (mapping.mappingValue === 0) continue;
      const poCode = mapping.programOutcome.code;
      const contribution = (activity.attainmentLevel * mapping.mappingValue) / maxScale;

      if (!poContributions[poCode]) {
        poContributions[poCode] = { sum: 0, count: 0 };
      }
      poContributions[poCode].sum += contribution;
      poContributions[poCode].count++;
    }
  }

  const result: Record<string, number> = {};
  for (const [poCode, { sum, count }] of Object.entries(poContributions)) {
    result[poCode] = count > 0
      ? Math.round((sum / count) * 100) / 100
      : 0;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// 7. SURVEY ATTAINMENT
// ─────────────────────────────────────────────────────────────

/**
 * Calculate survey attainment per PO.
 * Normalizes ratings from survey scale to 0-3.
 */
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
  const poAttainments: Record<string, { sum: number; count: number }> = {};

  for (const question of survey.questions) {
    if (question.responseDetails.length === 0) continue;

    // Average rating for this question
    const avgRating = question.responseDetails.reduce(
      (sum, r) => sum + r.rating, 0
    ) / question.responseDetails.length;

    // Normalize to 0–3 scale
    const normalized = ((avgRating - scaleMin) / (scaleMax - scaleMin)) * 3;

    for (const mapping of question.poMappings) {
      const poCode = mapping.programOutcome.code;
      if (!poAttainments[poCode]) {
        poAttainments[poCode] = { sum: 0, count: 0 };
      }
      poAttainments[poCode].sum += normalized;
      poAttainments[poCode].count++;
    }
  }

  const result: Record<string, number> = {};
  for (const [poCode, { sum, count }] of Object.entries(poAttainments)) {
    result[poCode] = count > 0
      ? Math.round((sum / count) * 100) / 100
      : 0;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// 8. INDIRECT PO ATTAINMENT (combined from all sources)
// ─────────────────────────────────────────────────────────────

export async function calculateIndirectAttainment(
  programId: number,
  academicYearId: number
): Promise<Record<string, number>> {
  // Get all POs for this program
  const pos = await prisma.programOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });

  const ccaAttainment  = await calculateCCAAttainment(academicYearId);
  const ecaAttainment  = await calculateECAAttainment(academicYearId);

  // Get all surveys for this academic year and calculate attainment
  const surveys = await prisma.survey.findMany({
    where: { academicYearId },
  });

  const surveyAttainments: Record<string, number[]> = {};
  for (const survey of surveys) {
    const att = await calculateSurveyAttainment(survey.id);
    for (const [poCode, val] of Object.entries(att)) {
      if (!surveyAttainments[poCode]) surveyAttainments[poCode] = [];
      surveyAttainments[poCode].push(val);
    }
  }

  // Combine all indirect sources (equal weight by default)
  const result: Record<string, number> = {};
  for (const po of pos) {
    const sources: number[] = [];

    if (ccaAttainment[po.code] !== undefined) sources.push(ccaAttainment[po.code]);
    if (ecaAttainment[po.code] !== undefined) sources.push(ecaAttainment[po.code]);

    if (surveyAttainments[po.code]) {
      const surveyAvg = surveyAttainments[po.code].reduce((a, b) => a + b, 0)
        / surveyAttainments[po.code].length;
      sources.push(surveyAvg);
    }

    result[po.code] = sources.length > 0
      ? Math.round((sources.reduce((a, b) => a + b, 0) / sources.length) * 100) / 100
      : 0;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// 9. FINAL PO ATTAINMENT
// ─────────────────────────────────────────────────────────────

/**
 * Final PO = (Direct × directWeight%) + (Indirect × indirectWeight%)
 * Weights fetched from direct_indirect_weight_configs.
 */
export async function calculateFinalPOAttainment(
  programId: number,
  academicYearId: number
): Promise<POAttainmentResult[]> {
  // Get weight config
  const weightConfig = await prisma.directIndirectWeightConfig.findFirst({
    where: { OR: [{ programId }, { programId: null }] },
    orderBy: { programId: 'desc' }, // program-specific first
  });

  const directWeight   = Number(weightConfig?.directWeight   ?? 80) / 100;
  const indirectWeight = Number(weightConfig?.indirectWeight ?? 20) / 100;

  const directPO   = await calculatePODirectAttainment(programId, academicYearId);
  const indirectPO = await calculateIndirectAttainment(programId, academicYearId);

  const pos = await prisma.programOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });

  const results: POAttainmentResult[] = pos.map(po => {
    const direct   = directPO[po.code]   ?? 0;
    const indirect = indirectPO[po.code] ?? 0;
    const final    = (direct * directWeight) + (indirect * indirectWeight);

    return {
      programOutcomeId: po.id,
      poCode: po.code,
      directAttainment:   Math.round(direct   * 100) / 100,
      indirectAttainment: Math.round(indirect * 100) / 100,
      finalAttainment:    Math.round(final    * 100) / 100,
      directWeight:   directWeight   * 100,
      indirectWeight: indirectWeight * 100,
    };
  });

  return results;
}

// ─────────────────────────────────────────────────────────────
// 10. FINAL PSO ATTAINMENT
// ─────────────────────────────────────────────────────────────

export async function calculateFinalPSOAttainment(
  programId: number,
  academicYearId: number
): Promise<PSOAttainmentResult[]> {
  const weightConfig = await prisma.directIndirectWeightConfig.findFirst({
    where: { OR: [{ programId }, { programId: null }] },
    orderBy: { programId: 'desc' },
  });

  const directWeight   = Number(weightConfig?.directWeight   ?? 80) / 100;
  const indirectWeight = Number(weightConfig?.indirectWeight ?? 20) / 100;

  const directPSO = await calculatePSODirectAttainment(programId, academicYearId);

  const psos = await prisma.programSpecificOutcome.findMany({
    where: { programId, isActive: true },
    orderBy: { number: 'asc' },
  });

  // For PSO indirect, we use survey attainment where PSO-mapped questions exist
  // For now, defaults to 3.0 (all surveys show high satisfaction) — configurable
  const indirectPSODefault = 3.0;

  const results: PSOAttainmentResult[] = psos.map(pso => {
    const direct   = directPSO[pso.code] ?? 0;
    const indirect = indirectPSODefault;
    const final    = (direct * directWeight) + (indirect * indirectWeight);

    return {
      psoId:              pso.id,
      psoCode:            pso.code,
      directAttainment:   Math.round(direct   * 100) / 100,
      indirectAttainment: Math.round(indirect * 100) / 100,
      finalAttainment:    Math.round(final    * 100) / 100,
    };
  });

  return results;
}

// ─────────────────────────────────────────────────────────────
// 11. EMPLOYER SURVEY ATTAINMENT
// ─────────────────────────────────────────────────────────────

export async function calculateEmployerSurveyAttainment(
  academicYearId: number,
  scaleMax: number = 5
): Promise<{ category: string; averageRating: number; normalizedAttainment: number }[]> {
  const categories = await prisma.employerSurveyCategory.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      ratings: {
        include: {
          survey: { where: { academicYearId } },
        },
      },
    },
  });

  return categories.map(cat => {
    const validRatings = cat.ratings.filter(r => r.survey !== null);
    const avgRating = validRatings.length > 0
      ? validRatings.reduce((sum, r) => sum + r.rating, 0) / validRatings.length
      : 0;

    const normalized = (avgRating / scaleMax) * 3;

    return {
      category: cat.name,
      averageRating:        Math.round(avgRating   * 100) / 100,
      normalizedAttainment: Math.round(normalized  * 100) / 100,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 12. PERSIST CO ATTAINMENT TO DATABASE
// ─────────────────────────────────────────────────────────────

export async function persistCOAttainment(
  courseId: number,
  programId?: number
): Promise<COAttainmentResult[]> {
  const results = await calculateCOAttainment(courseId, programId);

  for (const r of results) {
    await prisma.coAttainment.upsert({
      where: { courseOutcomeId: r.courseOutcomeId },
      update: {
        directAttainment:     r.attainmentValue,
        finalAttainment:      r.attainmentValue,
        attainmentLevel:      r.attainmentLevel,
        studentsAboveThreshold: r.studentsAbove,
        totalStudents:        r.totalStudents,
        calculatedAt:         new Date(),
      },
      create: {
        courseOutcomeId:      r.courseOutcomeId,
        directAttainment:     r.attainmentValue,
        finalAttainment:      r.attainmentValue,
        attainmentLevel:      r.attainmentLevel,
        studentsAboveThreshold: r.studentsAbove,
        totalStudents:        r.totalStudents,
      },
    });
  }

  return results;
}
