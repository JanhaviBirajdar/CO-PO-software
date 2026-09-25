export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'HOD' | 'FACULTY';
export type CourseType = 'THEORY' | 'PRACTICAL' | 'INTEGRATED' | 'PROJECT';
export type AssessmentType = 'INTERNAL_TEST_1' | 'INTERNAL_TEST_2' | 'MID_SEM' | 'END_SEM' | 'ASSIGNMENT' | 'PRACTICAL_EXAM' | 'PROJECT_EVAL';

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
  yearRange: string; // e.g. "2025-2026"
  isCurrent: boolean;
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
  bloomTaxonomyLevel?: string;
  targetMarksPercentage?: number;
  targetStudentPercentage?: number;
  courseId: number;
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

export interface DirectIndirectWeight {
  directWeight: number;
  indirectWeight: number;
}

