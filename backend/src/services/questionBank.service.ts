// ============================================================
// Question Bank & Question Paper Service
// DYP COEI OBE Process Implementation
// ============================================================

import { prisma } from '../config/prisma';
import { bloomService } from './bloom.service';

export interface CreateQuestionDTO {
  questionText: string;
  marks: number;
  unit?: number;
  bloomVerb?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questionType?: 'MCQ' | 'SHORT_ANSWER' | 'LONG_ANSWER' | 'NUMERICAL' | 'PROGRAMMING' | 'PRACTICAL' | 'CASE_STUDY' | 'DESIGN_QUESTION';
  courseId: number;
  courseOutcomeId: number;
  bloomLevelId: number;
  academicYearId: number;
  createdById: number;
}

export interface CreateBlueprintDTO {
  title: string;
  totalMarks: number;
  totalQuestions: number;
  courseId: number;
  academicYearId: number;
  createdById: number;
  bloomDistribution: Record<string, number>; // levelNumber -> marks or %
  coDistribution: Record<string, number>;    // CO code -> marks or %
  unitDistribution: Record<string, number>;  // unit -> marks or %
}

export class QuestionBankService {
  /**
   * Create Question in Question Bank with auto Bloom suggestion validation
   */
  public async createQuestion(data: CreateQuestionDTO) {
    const suggestion = await bloomService.suggestBloomLevel(data.questionText);
    const verb = data.bloomVerb || suggestion.matchedVerb;

    return prisma.question.create({
      data: {
        questionText: data.questionText,
        marks: data.marks,
        unit: data.unit || 1,
        bloomVerb: verb,
        difficulty: data.difficulty || 'MEDIUM',
        questionType: data.questionType || 'SHORT_ANSWER',
        courseId: data.courseId,
        courseOutcomeId: data.courseOutcomeId,
        bloomLevelId: data.bloomLevelId || suggestion.suggestedLevelId,
        academicYearId: data.academicYearId,
        createdById: data.createdById,
        isApproved: true,
      },
      include: {
        course: true,
        courseOutcome: true,
        bloomLevel: true,
      },
    });
  }

  /**
   * List Questions with filtering options
   */
  public async getQuestions(filters: {
    courseId?: number;
    courseOutcomeId?: number;
    bloomLevelId?: number;
    unit?: number;
    difficulty?: string;
    academicYearId?: number;
  }) {
    const where: any = {};
    if (filters.courseId) where.courseId = filters.courseId;
    if (filters.courseOutcomeId) where.courseOutcomeId = filters.courseOutcomeId;
    if (filters.bloomLevelId) where.bloomLevelId = filters.bloomLevelId;
    if (filters.unit) where.unit = filters.unit;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.academicYearId) where.academicYearId = filters.academicYearId;

    return prisma.question.findMany({
      where,
      include: {
        course: true,
        courseOutcome: true,
        bloomLevel: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ unit: 'asc' }, { id: 'asc' }],
    });
  }

  /**
   * Create Question Paper Blueprint
   */
  public async createBlueprint(data: CreateBlueprintDTO) {
    return prisma.questionPaperBlueprint.create({
      data: {
        title: data.title,
        totalMarks: data.totalMarks,
        totalQuestions: data.totalQuestions,
        courseId: data.courseId,
        academicYearId: data.academicYearId,
        createdById: data.createdById,
        bloomDistribution: JSON.stringify(data.bloomDistribution),
        coDistribution: JSON.stringify(data.coDistribution),
        unitDistribution: JSON.stringify(data.unitDistribution),
      },
    });
  }

  /**
   * List Blueprints
   */
  public async getBlueprints(courseId?: number, academicYearId?: number) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (academicYearId) where.academicYearId = academicYearId;

    const list = await prisma.questionPaperBlueprint.findMany({
      where,
      include: {
        course: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((b) => ({
      ...b,
      bloomDistribution: JSON.parse(b.bloomDistribution || '{}'),
      coDistribution: JSON.parse(b.coDistribution || '{}'),
      unitDistribution: JSON.parse(b.unitDistribution || '{}'),
    }));
  }

  /**
   * Create Question Paper & attach questions
   */
  public async createQuestionPaper(data: {
    title: string;
    courseId: number;
    academicYearId: number;
    totalMarks: number;
    durationMinutes?: number;
    createdById: number;
    questionItems: { questionId: number; section: string; questionNumber: string; marks: number }[];
  }) {
    const paper = await prisma.questionPaper.create({
      data: {
        title: data.title,
        courseId: data.courseId,
        academicYearId: data.academicYearId,
        totalMarks: data.totalMarks,
        durationMinutes: data.durationMinutes || 180,
        createdById: data.createdById,
        isApproved: true,
      },
    });

    for (const item of data.questionItems) {
      await prisma.questionPaperQuestion.create({
        data: {
          questionPaperId: paper.id,
          questionId: item.questionId,
          section: item.section,
          questionNumber: item.questionNumber,
          marks: item.marks,
        },
      });
    }

    return this.getQuestionPaperDetails(paper.id);
  }

  /**
   * Get Question Paper Details with Question Paper Analysis
   */
  public async getQuestionPaperDetails(paperId: number) {
    const paper = await prisma.questionPaper.findUnique({
      where: { id: paperId },
      include: {
        course: true,
        createdBy: { select: { id: true, name: true } },
        questions: {
          include: {
            question: {
              include: {
                courseOutcome: true,
                bloomLevel: true,
              },
            },
          },
          orderBy: { questionNumber: 'asc' },
        },
      },
    });

    if (!paper) throw new Error('Question paper not found');

    // Generate Question Paper Analysis (CO Coverage, Bloom Coverage, Unit Coverage, Marks Distribution)
    const totalMarks = Number(paper.totalMarks) || 100;
    const questionsList = paper.questions.map((pq) => pq.question);

    const bloomLevels = await bloomService.getBloomLevels();

    const bloomAnalysis = bloomLevels.map((lvl) => {
      const levelQuestions = paper.questions.filter(
        (pq) => pq.question.bloomLevelId === lvl.id || pq.question.bloomLevel?.levelNumber === lvl.levelNumber
      );
      const marks = levelQuestions.reduce((sum, pq) => sum + Number(pq.marks), 0);
      const count = levelQuestions.length;
      const percentage = totalMarks > 0 ? parseFloat(((marks / totalMarks) * 100).toFixed(2)) : 0;
      return {
        levelNumber: lvl.levelNumber,
        levelName: lvl.levelName,
        count,
        marks,
        percentage,
      };
    });

    // CO Coverage
    const coMap: Record<string, { coCode: string; count: number; marks: number }> = {};
    for (const pq of paper.questions) {
      const coCode = pq.question.courseOutcome?.code || 'CO1';
      if (!coMap[coCode]) {
        coMap[coCode] = { coCode, count: 0, marks: 0 };
      }
      coMap[coCode].count += 1;
      coMap[coCode].marks += Number(pq.marks);
    }

    const coAnalysis = Object.values(coMap).map((co) => ({
      ...co,
      percentage: totalMarks > 0 ? parseFloat(((co.marks / totalMarks) * 100).toFixed(2)) : 0,
    }));

    // Unit Coverage
    const unitMap: Record<number, { unit: number; count: number; marks: number }> = {};
    for (const pq of paper.questions) {
      const unit = pq.question.unit || 1;
      if (!unitMap[unit]) {
        unitMap[unit] = { unit, count: 0, marks: 0 };
      }
      unitMap[unit].count += 1;
      unitMap[unit].marks += Number(pq.marks);
    }

    const unitAnalysis = Object.values(unitMap).map((u) => ({
      ...u,
      percentage: totalMarks > 0 ? parseFloat(((u.marks / totalMarks) * 100).toFixed(2)) : 0,
    }));

    return {
      paper,
      analysis: {
        totalMarks,
        totalQuestions: paper.questions.length,
        bloomAnalysis,
        coAnalysis,
        unitAnalysis,
      },
    };
  }

  /**
   * List all Question Papers
   */
  public async getQuestionPapers(courseId?: number, academicYearId?: number) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (academicYearId) where.academicYearId = academicYearId;

    return prisma.questionPaper.findMany({
      where,
      include: {
        course: true,
        createdBy: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const questionBankService = new QuestionBankService();
