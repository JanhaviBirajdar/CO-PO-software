// ============================================================
// Bloom's Taxonomy Service
// DYP COEI OBE Process Implementation
// ============================================================

import { prisma } from '../config/prisma';

export interface BloomLevelSeed {
  levelNumber: number;
  levelCode: string;
  levelName: string;
  description: string;
  actionVerbs: string;
}

export const BLOOM_LEVELS_DEFAULT: BloomLevelSeed[] = [
  {
    levelNumber: 1,
    levelCode: 'REMEMBER',
    levelName: 'Remember',
    description: 'Retrieve relevant knowledge from long-term memory. Recognize, recall, define, or list facts, terms, basic concepts, or answers.',
    actionVerbs: 'Define, List, Identify, Name, Recall, Recognize, State, Label, Match, Memorize, Repeat, Select',
  },
  {
    levelNumber: 2,
    levelCode: 'UNDERSTAND',
    levelName: 'Understand',
    description: 'Construct meaning from instructional messages, including oral, written, and graphic communication. Explain ideas, summarize, or classify.',
    actionVerbs: 'Explain, Describe, Summarize, Classify, Compare, Discuss, Interpret, Clarify, Contrast, Exemplify, Illustrate, Translate',
  },
  {
    levelNumber: 3,
    levelCode: 'APPLY',
    levelName: 'Apply',
    description: 'Carry out or use a procedure in a given situation. Execute, implement, calculate, or solve problems by applying acquired knowledge.',
    actionVerbs: 'Apply, Calculate, Use, Implement, Solve, Demonstrate, Construct, Execute, Modify, Operate, Show, Sketch',
  },
  {
    levelNumber: 4,
    levelCode: 'ANALYZE',
    levelName: 'Analyze',
    description: 'Break material into constituent parts and determine how parts relate to one another and to an overall structure or purpose.',
    actionVerbs: 'Analyze, Differentiate, Compare, Examine, Categorize, Investigate, Organize, Deconstruct, Outline, Select, Separate, Structure',
  },
  {
    levelNumber: 5,
    levelCode: 'EVALUATE',
    levelName: 'Evaluate',
    description: 'Make judgments based on criteria and standards through checking and critiquing. Assess, defend, or validate choices.',
    actionVerbs: 'Evaluate, Assess, Justify, Critique, Defend, Judge, Validate, Appraise, Argue, Decide, Rate, Support',
  },
  {
    levelNumber: 6,
    levelCode: 'CREATE',
    levelName: 'Create',
    description: 'Put elements together to form a coherent or functional whole; reorganize elements into a new pattern or structure.',
    actionVerbs: 'Design, Develop, Create, Construct, Formulate, Generate, Produce, Build, Compose, Devise, Plan, Synthesize',
  },
];

export class BloomService {
  /**
   * Ensure Bloom's Taxonomy Master levels and verbs are seeded in DB
   */
  public async ensureSeedData(): Promise<void> {
    for (const seed of BLOOM_LEVELS_DEFAULT) {
      const existing = await prisma.bloomLevel.findUnique({
        where: { levelNumber: seed.levelNumber },
      });

      const level = existing ?? await prisma.bloomLevel.create({
        data: seed,
      });

      // Seed action verbs
      const verbList = seed.actionVerbs.split(',').map((v) => v.trim());
      for (const verbStr of verbList) {
        if (!verbStr) continue;
        const verbObj = await prisma.bloomActionVerb.findFirst({
          where: { bloomLevelId: level.id, verb: verbStr },
        });
        if (!verbObj) {
          await prisma.bloomActionVerb.create({
            data: {
              bloomLevelId: level.id,
              verb: verbStr,
              description: `Action verb associated with Bloom Level ${level.levelNumber} (${level.levelName})`,
            },
          });
        }
      }
    }
  }

  /**
   * Get all Bloom levels with verbs
   */
  public async getBloomLevels() {
    await this.ensureSeedData();
    return prisma.bloomLevel.findMany({
      orderBy: { levelNumber: 'asc' },
      include: {
        verbs: {
          where: { isActive: true },
          orderBy: { verb: 'asc' },
        },
      },
    });
  }

  /**
   * Update a Bloom Level (description, verbs summary, status)
   */
  public async updateBloomLevel(id: number, data: { description?: string; actionVerbs?: string; status?: boolean }) {
    return prisma.bloomLevel.update({
      where: { id },
      data,
    });
  }

  /**
   * Get Action Verb Library
   */
  public async getBloomVerbs(bloomLevelId?: number) {
    await this.ensureSeedData();
    return prisma.bloomActionVerb.findMany({
      where: bloomLevelId ? { bloomLevelId, isActive: true } : { isActive: true },
      include: { bloomLevel: true },
      orderBy: [{ bloomLevelId: 'asc' }, { verb: 'asc' }],
    });
  }

  /**
   * Add custom action verb to a level
   */
  public async addBloomVerb(bloomLevelId: number, verb: string, description?: string) {
    const cleanVerb = verb.trim();
    return prisma.bloomActionVerb.upsert({
      where: {
        bloomLevelId_verb: { bloomLevelId, verb: cleanVerb },
      },
      update: { isActive: true, description },
      create: {
        bloomLevelId,
        verb: cleanVerb,
        description,
      },
    });
  }

  /**
   * Automatic Bloom Level & Verb Suggestion Engine
   * Parses input text (CO statement or Question text) to extract leading action verbs
   */
  public async suggestBloomLevel(text: string): Promise<{
    suggestedLevelId: number;
    levelNumber: number;
    levelName: string;
    levelCode: string;
    matchedVerb: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  }> {
    await this.ensureSeedData();
    const cleanText = text.trim();
    const firstWord = cleanText.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '');

    const levels = await this.getBloomLevels();

    // Check exact first-word verb match
    if (firstWord) {
      for (const level of levels) {
        const match = level.verbs.find(
          (v) => v.verb.toLowerCase() === firstWord.toLowerCase()
        );
        if (match) {
          return {
            suggestedLevelId: level.id,
            levelNumber: level.levelNumber,
            levelName: level.levelName,
            levelCode: level.levelCode,
            matchedVerb: match.verb,
            confidence: 'HIGH',
            reason: `The leading action verb "${match.verb}" directly aligns with Bloom Level ${level.levelNumber} (${level.levelName}).`,
          };
        }
      }
    }

    // Check substring verb matches anywhere in text
    for (const level of [...levels].reverse()) {
      for (const v of level.verbs) {
        const regex = new RegExp(`\\b${v.verb}\\b`, 'i');
        if (regex.test(cleanText)) {
          return {
            suggestedLevelId: level.id,
            levelNumber: level.levelNumber,
            levelName: level.levelName,
            levelCode: level.levelCode,
            matchedVerb: v.verb,
            confidence: 'MEDIUM',
            reason: `The text contains the action verb "${v.verb}", which maps to Bloom Level ${level.levelNumber} (${level.levelName}).`,
          };
        }
      }
    }

    // Fallback default: Understand (Level 2)
    const level2 = levels.find((l) => l.levelNumber === 2) || levels[1] || levels[0];
    return {
      suggestedLevelId: level2.id,
      levelNumber: level2.levelNumber,
      levelName: level2.levelName,
      levelCode: level2.levelCode,
      matchedVerb: 'Explain',
      confidence: 'LOW',
      reason: 'No standard action verb detected. Defaulted to Level 2 (Understand). Please review and select appropriate level.',
    };
  }

  /**
   * Validate CO Description & Verb alignment with selected Bloom Level
   */
  public async validateCOBloomLevel(
    description: string,
    bloomLevelId: number,
    selectedVerb?: string
  ): Promise<{
    isValid: boolean;
    warnings: string[];
    suggestedVerb?: string;
    suggestedLevel?: string;
  }> {
    const warnings: string[] = [];
    const suggestion = await this.suggestBloomLevel(description);

    // Check unmeasurable vague verbs
    const vagueVerbs = ['know', 'understand', 'learn', 'be familiar', 'study', 'grasp', 'perceive'];
    const lowerDesc = description.toLowerCase();
    for (const vague of vagueVerbs) {
      if (lowerDesc.includes(`to ${vague}`) || lowerDesc.startsWith(vague)) {
        warnings.push(
          `WARNING: The term "${vague}" is difficult to observe and measure directly in assessment. Consider using an active verb such as "${suggestion.matchedVerb}".`
        );
      }
    }

    if (suggestion.suggestedLevelId !== bloomLevelId) {
      warnings.push(
        `WARNING: The statement implies Bloom Level ${suggestion.levelNumber} (${suggestion.levelName}) based on verb "${suggestion.matchedVerb}", but Level ID ${bloomLevelId} is selected.`
      );
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestedVerb: suggestion.matchedVerb,
      suggestedLevel: suggestion.levelName,
    };
  }

  /**
   * 7-Dimension CO Quality Checker
   * Evaluates observable verb, measurability, specificity, clarity, Bloom level, PO mapping, PSO mapping
   */
  public async checkCOQuality(co: {
    description: string;
    bloomsLevel?: number | null;
    bloomVerb?: string | null;
    poMappingsCount?: number;
    psoMappingsCount?: number;
  }): Promise<{
    overallStatus: 'PASS' | 'WARNING' | 'NEEDS_REVIEW';
    score: number; // out of 100
    criteria: {
      observableVerb: boolean;
      measurableOutcome: boolean;
      isSpecific: boolean;
      isUnderstandable: boolean;
      hasBloomLevel: boolean;
      hasPOMappings: boolean;
      hasPSOMappings: boolean;
    };
    feedback: string[];
  }> {
    const feedback: string[] = [];
    const desc = co.description.trim();
    let score = 0;

    // 1. Observable Verb Check
    const suggestion = await this.suggestBloomLevel(desc);
    const hasObservableVerb = suggestion.confidence === 'HIGH' || suggestion.confidence === 'MEDIUM';
    if (hasObservableVerb) {
      score += 20;
    } else {
      feedback.push('Statement lacks a clear observable action verb at the start.');
    }

    // 2. Measurable Outcome
    const vagueWords = ['know', 'learn', 'understand', 'familiarity'];
    const isMeasurable = !vagueWords.some((w) => desc.toLowerCase().includes(w));
    if (isMeasurable) {
      score += 20;
    } else {
      feedback.push('Statement uses vague terms (e.g., "know", "learn") that hinder objective measurement.');
    }

    // 3. Specificity
    const isSpecific = desc.length >= 25 && desc.split(/\s+/).length >= 5;
    if (isSpecific) {
      score += 15;
    } else {
      feedback.push('CO statement is too brief or generic. Provide more domain-specific context.');
    }

    // 4. Understandability
    const isUnderstandable = desc.length <= 250;
    if (isUnderstandable) {
      score += 15;
    } else {
      feedback.push('CO statement is excessively lengthy or complex.');
    }

    // 5. Has Bloom Level
    const hasBloomLevel = Boolean(co.bloomsLevel);
    if (hasBloomLevel) {
      score += 10;
    } else {
      feedback.push('No Bloom Level assigned to this CO.');
    }

    // 6. Has PO Mappings
    const hasPOMappings = (co.poMappingsCount || 0) > 0;
    if (hasPOMappings) {
      score += 10;
    } else {
      feedback.push('CO is not mapped to any Program Outcome (PO).');
    }

    // 7. Has PSO Mappings
    const hasPSOMappings = (co.psoMappingsCount || 0) > 0;
    if (hasPSOMappings) {
      score += 10;
    } else {
      feedback.push('CO is not mapped to any Program Specific Outcome (PSO).');
    }

    let overallStatus: 'PASS' | 'WARNING' | 'NEEDS_REVIEW' = 'PASS';
    if (score < 60 || !hasObservableVerb) {
      overallStatus = 'NEEDS_REVIEW';
    } else if (score < 85 || feedback.length > 0) {
      overallStatus = 'WARNING';
    }

    return {
      overallStatus,
      score,
      criteria: {
        observableVerb: hasObservableVerb,
        measurableOutcome: isMeasurable,
        isSpecific,
        isUnderstandable,
        hasBloomLevel,
        hasPOMappings,
        hasPSOMappings,
      },
      feedback,
    };
  }

  /**
   * AI-Assisted CO Creation
   * Generates a structured CO Statement, recommended Bloom Level, Action Verb, and explanation.
   */
  public async generateAICourseOutcome(prompt: {
    courseName: string;
    unit?: number;
    topic: string;
    expectedOutcome?: string;
    difficulty?: string;
  }): Promise<{
    coStatement: string;
    recommendedBloomLevel: number;
    recommendedLevelName: string;
    recommendedVerb: string;
    explanation: string;
  }> {
    await this.ensureSeedData();
    const topicLower = prompt.topic.toLowerCase();
    const levels = await this.getBloomLevels();

    let targetLevelNum = 3; // Default Apply
    let verb = 'Apply';

    if (topicLower.includes('design') || topicLower.includes('create') || topicLower.includes('develop') || topicLower.includes('project')) {
      targetLevelNum = 6; verb = 'Design';
    } else if (topicLower.includes('evaluate') || topicLower.includes('assess') || topicLower.includes('critique')) {
      targetLevelNum = 5; verb = 'Evaluate';
    } else if (topicLower.includes('analyze') || topicLower.includes('compare') || topicLower.includes('differentiate')) {
      targetLevelNum = 4; verb = 'Analyze';
    } else if (topicLower.includes('apply') || topicLower.includes('calculate') || topicLower.includes('implement') || topicLower.includes('solve')) {
      targetLevelNum = 3; verb = 'Apply';
    } else if (topicLower.includes('explain') || topicLower.includes('describe') || topicLower.includes('summarize')) {
      targetLevelNum = 2; verb = 'Explain';
    } else if (topicLower.includes('define') || topicLower.includes('list') || topicLower.includes('recall')) {
      targetLevelNum = 1; verb = 'Define';
    }

    const levelObj = levels.find((l) => l.levelNumber === targetLevelNum) || levels[2];

    let statement = `${verb} ${prompt.topic} in ${prompt.courseName}`;
    if (prompt.expectedOutcome) {
      statement += ` to ${prompt.expectedOutcome.toLowerCase()}`;
    }
    statement += '.';

    return {
      coStatement: statement,
      recommendedBloomLevel: levelObj.levelNumber,
      recommendedLevelName: levelObj.levelName,
      recommendedVerb: verb,
      explanation: `Selected action verb "${verb}" aligns with Bloom's Level ${levelObj.levelNumber} (${levelObj.levelName}) based on topic requirement "${prompt.topic}".`,
    };
  }

  /**
   * Bloom's Taxonomy Level Analytics
   */
  public async getBloomAnalytics(filters: {
    courseId?: number;
    academicYearId?: number;
    departmentId?: number;
  }) {
    await this.ensureSeedData();
    const levels = await this.getBloomLevels();

    // Fetch COs matching filter
    const whereCourse: any = {};
    if (filters.courseId) whereCourse.id = filters.courseId;
    if (filters.academicYearId) whereCourse.academicYearId = filters.academicYearId;

    const cos = await prisma.courseOutcome.findMany({
      where: {
        course: whereCourse,
        isActive: true,
      },
      include: {
        course: true,
        bloomLevel: true,
      },
    });

    // Fetch Questions matching filter
    const whereQuestion: any = {};
    if (filters.courseId) whereQuestion.courseId = filters.courseId;
    if (filters.academicYearId) whereQuestion.academicYearId = filters.academicYearId;

    const questions = await prisma.question.findMany({
      where: whereQuestion,
      include: {
        bloomLevel: true,
        courseOutcome: true,
      },
    });

    const totalCOs = cos.length;
    const totalQuestions = questions.length;

    // Distribution by Bloom Level
    const coDistribution = levels.map((lvl) => {
      const count = cos.filter((c) => c.bloomsLevel === lvl.levelNumber || c.bloomLevelId === lvl.id).length;
      const percentage = totalCOs > 0 ? parseFloat(((count / totalCOs) * 100).toFixed(2)) : 0;
      return {
        levelNumber: lvl.levelNumber,
        levelName: lvl.levelName,
        levelCode: lvl.levelCode,
        count,
        percentage,
      };
    });

    const questionDistribution = levels.map((lvl) => {
      const qList = questions.filter((q) => q.bloomLevelId === lvl.id || q.bloomLevel?.levelNumber === lvl.levelNumber);
      const count = qList.length;
      const marks = qList.reduce((acc, q) => acc + Number(q.marks), 0);
      const percentage = totalQuestions > 0 ? parseFloat(((count / totalQuestions) * 100).toFixed(2)) : 0;
      return {
        levelNumber: lvl.levelNumber,
        levelName: lvl.levelName,
        levelCode: lvl.levelCode,
        count,
        marks,
        percentage,
      };
    });

    // Average, Lowest, Highest Bloom Level
    const assignedLevels = cos.map((c) => c.bloomsLevel || 1).filter(Boolean);
    const avgBloomLevel = assignedLevels.length > 0
      ? parseFloat((assignedLevels.reduce((a, b) => a + b, 0) / assignedLevels.length).toFixed(2))
      : 0;
    const minBloomLevel = assignedLevels.length > 0 ? Math.min(...assignedLevels) : 0;
    const maxBloomLevel = assignedLevels.length > 0 ? Math.max(...assignedLevels) : 0;

    return {
      totalCOs,
      totalQuestions,
      avgBloomLevel,
      minBloomLevel,
      maxBloomLevel,
      coDistribution,
      questionDistribution,
    };
  }
}

export const bloomService = new BloomService();
