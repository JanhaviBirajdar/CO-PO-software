export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'HOD'
  | 'OBE_COORDINATOR'
  | 'FACULTY'
  | 'DEPARTMENT_COORDINATOR'
  | 'IQAC_ADMIN'
  | 'PRINCIPAL_MANAGEMENT';
export type CourseType = 'THEORY' | 'LAB' | 'PROJECT' | 'ELECTIVE' | 'AUDIT';
export type AssessmentType = 'INTERNAL' | 'UNIT_TEST' | 'MID_SEMESTER' | 'END_SEMESTER' | 'ASSIGNMENT' | 'PRACTICAL' | 'LAB' | 'PROJECT' | 'OTHER';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  departmentId?: number | null;
  department?: { id: number; name: string; code: string };
  createdAt?: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  programs?: Program[];
}

export interface Program {
  id: number;
  code: string;
  name: string;
  departmentId: number;
  department?: Department;
  isActive: boolean;
}

export interface AcademicYear {
  id: number;
  year: string;        // matches backend field name: e.g. "2024-25"
  yearRange?: string;  // alias kept for backward compat
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  isActive?: boolean;
}

export interface Batch {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
  programId: number;
  program?: Program;
}

export interface Semester {
  id: number;
  number: number;
  batchId: number;
  batch?: Batch;
}

export interface Student {
  id: number;
  rollNumber: string;
  registerNumber?: string;
  name: string;
  email?: string;
  batchId: number;
  batch?: Batch;
}

export interface ProgramOutcome {
  id: number;
  code: string; // PO1, PO2...
  number: number;
  description: string;
  programId: number;
  isActive: boolean;
}

export interface ProgramSpecificOutcome {
  id: number;
  code: string; // PSO1, PSO2...
  number: number;
  description: string;
  programId: number;
  isActive: boolean;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  courseType: CourseType;
  programId: number;
  semesterId: number;
  academicYearId: number;
  program?: Program;
  semester?: Semester;
  academicYear?: AcademicYear;
  courseOutcomes?: CourseOutcome[];
}

export interface CourseOutcome {
  id: number;
  code: string; // CO1, CO2...
  number: number;
  description: string;
  bloomsLevel?: number | null;
  bloomLevelId?: number | null;
  bloomVerb?: string | null;
  bloomOverrideReason?: string | null;
  bloomTaxonomyLevel?: string;
  targetMarksPercentage?: number;
  targetStudentPercentage?: number;
  courseId: number;
  isActive?: boolean;
  coPomappings?: CoPOMapping[];
}

export interface CoPOMapping {
  id: number;
  courseOutcomeId: number;
  programOutcomeId: number;
  correlationLevel: number; // 0, 1, 2, 3
  programOutcome?: ProgramOutcome;
}

export interface Assessment {
  id: number;
  name: string;
  type: AssessmentType;
  maxMarks: number;
  weightage: number;
  isExternal: boolean;
  courseId: number;
  academicYearId: number;
}

export interface AttainmentResult {
  coCode: string;
  coId: number;
  directAttainment: number;
  indirectAttainment?: number;
  finalAttainment: number;
  attainmentLevel?: number;
  attainmentValue?: number;
  passPercentage?: number;
  totalStudents?: number;
  studentsAbove?: number;
  targetAchieved?: boolean;
}

export interface PoAttainmentResult {
  poCode: string;
  poId?: number;
  directAttainment: number;
  indirectAttainment: number;
  finalAttainment: number;
  directWeight?: number;
  indirectWeight?: number;
  description?: string;
}

export interface PsoAttainmentResult {
  psoCode: string;
  psoId?: number;
  directAttainment: number;
  indirectAttainment: number;
  finalAttainment: number;
  description?: string;
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

export interface EmployerSurveyResult {
  category: string;
  averageRating: number;
  normalizedAttainment: number;
}

export interface AttainmentThreshold {
  id: number;
  level: number;
  minPercentage: number;
  maxPercentage: number;
  programId: number;
  isActive: boolean;
}

// Bloom's Taxonomy & Question Bank Types
export interface BloomLevel {
  id: number;
  levelNumber: number;
  levelCode: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
  levelName: string;
  description: string;
  actionVerbs: string;
  status: boolean;
  verbs?: BloomActionVerb[];
}

export interface BloomActionVerb {
  id: number;
  bloomLevelId: number;
  verb: string;
  description?: string;
  isActive: boolean;
  bloomLevel?: BloomLevel;
}

export type QuestionType =
  | 'MCQ'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'NUMERICAL'
  | 'PROGRAMMING'
  | 'PRACTICAL'
  | 'CASE_STUDY'
  | 'DESIGN_QUESTION';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: number;
  questionText: string;
  marks: number;
  unit: number;
  bloomVerb?: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  courseId: number;
  courseOutcomeId: number;
  bloomLevelId: number;
  academicYearId: number;
  isApproved: boolean;
  course?: Course;
  courseOutcome?: CourseOutcome;
  bloomLevel?: BloomLevel;
  createdBy?: { id: number; name: string };
}

export interface QuestionPaperBlueprint {
  id: number;
  title: string;
  totalMarks: number;
  totalQuestions: number;
  courseId: number;
  academicYearId: number;
  bloomDistribution: Record<string, number>;
  coDistribution: Record<string, number>;
  unitDistribution: Record<string, number>;
  course?: Course;
  createdBy?: { id: number; name: string };
}

export interface QuestionPaper {
  id: number;
  title: string;
  totalMarks: number;
  durationMinutes: number;
  courseId: number;
  academicYearId: number;
  isApproved: boolean;
  course?: Course;
  createdBy?: { id: number; name: string };
  questions?: { id: number; section: string; questionNumber: string; marks: number; question: Question }[];
}

export interface BloomAnalyticsData {
  totalCOs: number;
  totalQuestions: number;
  avgBloomLevel: number;
  minBloomLevel: number;
  maxBloomLevel: number;
  coDistribution: {
    levelNumber: number;
    levelName: string;
    levelCode: string;
    count: number;
    percentage: number;
  }[];
  questionDistribution: {
    levelNumber: number;
    levelName: string;
    levelCode: string;
    count: number;
    marks: number;
    percentage: number;
  }[];
}

export interface COQualityCheckResult {
  overallStatus: 'PASS' | 'WARNING' | 'NEEDS_REVIEW';
  score: number;
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
}

export interface DirectIndirectWeight {
  directWeight: number;
  indirectWeight: number;
}

