// ============================================================
// Zod Validators — Academic Setup
// ============================================================

import { z } from 'zod';
import { CourseType, AssessmentType, SurveyType } from '@prisma/client';

// ─── Department ───
export const createDepartmentSchema = z.object({
  body: z.object({
    code:      z.string().min(2).max(20),
    name:      z.string().min(2).max(150),
    shortName: z.string().min(1).max(20),
    isActive:  z.boolean().optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createDepartmentSchema.shape.body.partial(),
});

// ─── Program ───
export const createProgramSchema = z.object({
  body: z.object({
    code:           z.string().min(2).max(20),
    name:           z.string().min(2).max(200),
    shortName:      z.string().min(1).max(20),
    duration:       z.number().int().min(1).max(10).optional(),
    totalSemesters: z.number().int().min(1).max(20).optional(),
    departmentId:   z.number().int().positive(),
    isActive:       z.boolean().optional(),
  }),
});

export const updateProgramSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createProgramSchema.shape.body.partial(),
});

// ─── Academic Year ───
export const createAcademicYearSchema = z.object({
  body: z.object({
    year:      z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-YY'),
    startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    endDate:   z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    isCurrent: z.boolean().optional(),
    isActive:  z.boolean().optional(),
  }),
});

export const updateAcademicYearSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createAcademicYearSchema.shape.body.partial(),
});

// ─── Batch ───
export const createBatchSchema = z.object({
  body: z.object({
    name:           z.string().min(2).max(50),
    startYear:      z.number().int().min(2000),
    endYear:        z.number().int().min(2001),
    programId:      z.number().int().positive(),
    departmentId:   z.number().int().positive(),
    academicYearId: z.number().int().positive(),
    isActive:       z.boolean().optional(),
  }),
});

export const updateBatchSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createBatchSchema.shape.body.partial(),
});

// ─── Semester ───
export const createSemesterSchema = z.object({
  body: z.object({
    number:   z.number().int().min(1).max(20),
    name:     z.string().min(2).max(30),
    batchId:  z.number().int().positive(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Course ───
export const createCourseSchema = z.object({
  body: z.object({
    code:           z.string().min(2).max(20),
    name:           z.string().min(2).max(200),
    credits:        z.number().min(0),
    courseType:     z.nativeEnum(CourseType).optional(),
    programId:      z.number().int().positive(),
    semesterId:     z.number().int().positive(),
    academicYearId: z.number().int().positive(),
    facultyIds:     z.array(z.number().int().positive()).optional(),
    isActive:       z.boolean().optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createCourseSchema.shape.body.partial(),
});

// ─── Course Outcome ───
export const createCOSchema = z.object({
  body: z.object({
    code:        z.string().min(1).max(10),
    number:      z.number().int().positive(),
    description: z.string().min(5),
    bloomsLevel: z.number().int().min(1).max(6).optional(),
    courseId:    z.number().int().positive(),
    isActive:    z.boolean().optional(),
  }),
});

export const updateCOSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createCOSchema.shape.body.partial(),
});

// ─── Program Outcome ───
export const createPOSchema = z.object({
  body: z.object({
    code:        z.string().min(2).max(10),
    number:      z.number().int().positive(),
    description: z.string().min(5),
    programId:   z.number().int().positive(),
    isActive:    z.boolean().optional(),
  }),
});

export const updatePOSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createPOSchema.shape.body.partial(),
});

// ─── PSO ───
export const createPSOSchema = z.object({
  body: z.object({
    code:        z.string().min(3).max(10),
    number:      z.number().int().positive(),
    description: z.string().min(5),
    programId:   z.number().int().positive(),
    isActive:    z.boolean().optional(),
  }),
});

export const updatePSOSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createPSOSchema.shape.body.partial(),
});

// ─── CO-PO Mapping ───
export const saveCOPOMappingSchema = z.object({
  body: z.object({
    courseId:  z.number().int().positive(),
    mappings: z.array(z.object({
      courseOutcomeId:  z.number().int().positive(),
      programOutcomeId: z.number().int().positive(),
      mappingValue:     z.number().int().min(0).max(3),
    })),
  }),
});

// ─── CO-PSO Mapping ───
export const saveCOPSOMappingSchema = z.object({
  body: z.object({
    courseId:  z.number().int().positive(),
    mappings: z.array(z.object({
      courseOutcomeId:          z.number().int().positive(),
      programSpecificOutcomeId: z.number().int().positive(),
      mappingValue:             z.number().int().min(0).max(3),
    })),
  }),
});

// ─── Assessment ───
export const createAssessmentSchema = z.object({
  body: z.object({
    name:           z.string().min(2).max(100),
    assessmentType: z.nativeEnum(AssessmentType),
    maxMarks:       z.number().positive(),
    weightage:      z.number().min(0).max(100),
    conductedDate:  z.string().optional(),
    courseId:       z.number().int().positive(),
    coMappings:     z.array(z.object({
      courseOutcomeId: z.number().int().positive(),
      maxMarks:        z.number().positive(),
      weightage:       z.number().min(0).max(100),
    })).optional(),
  }),
});

export const updateAssessmentSchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createAssessmentSchema.shape.body.partial(),
});

// ─── Student Marks ───
export const submitMarksSchema = z.object({
  body: z.object({
    assessmentId: z.number().int().positive(),
    marks: z.array(z.object({
      studentId:       z.number().int().positive(),
      courseOutcomeId: z.number().int().positive().nullable().optional(),
      marksObtained:   z.number().min(0),
      isAbsent:        z.boolean().optional(),
    })),
  }),
});

// ─── Student ───
export const createStudentSchema = z.object({
  body: z.object({
    rollNumber: z.string().min(1).max(30),
    name:       z.string().min(2).max(100),
    email:      z.string().email().optional(),
    batchId:    z.number().int().positive(),
  }),
});

// ─── CCA Activity ───
export const createCCASchema = z.object({
  body: z.object({
    name:           z.string().min(2).max(150),
    description:    z.string().optional(),
    activityDate:   z.string().optional(),
    numberOfEvents: z.number().int().positive().optional(),
    attainmentLevel: z.number().int().min(0).max(3).optional(),
    academicYearId: z.number().int().positive(),
    isCustom:       z.boolean().optional(),
    poMappings:     z.array(z.object({
      programOutcomeId: z.number().int().positive(),
      mappingValue:     z.number().int().min(0).max(3),
    })).optional(),
  }),
});

export const updateCCASchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createCCASchema.shape.body.partial(),
});

// ─── ECA Activity ───
export const createECASchema = z.object({
  body: z.object({
    name:            z.string().min(2).max(150),
    category:        z.string().min(2).max(50),
    description:     z.string().optional(),
    activityDate:    z.string().optional(),
    numberOfEvents:  z.number().int().positive().optional(),
    attainmentLevel: z.number().int().min(0).max(3).optional(),
    academicYearId:  z.number().int().positive(),
    isCustom:        z.boolean().optional(),
    poMappings:      z.array(z.object({
      programOutcomeId: z.number().int().positive(),
      mappingValue:     z.number().int().min(0).max(3),
    })).optional(),
  }),
});

export const updateECASchema = z.object({
  params: z.object({ id: z.string() }),
  body:   createECASchema.shape.body.partial(),
});

// ─── Survey ───
export const createSurveySchema = z.object({
  body: z.object({
    title:          z.string().min(2).max(200),
    description:    z.string().optional(),
    surveyType:     z.nativeEnum(SurveyType),
    scaleMin:       z.number().int().min(0).optional(),
    scaleMax:       z.number().int().min(1).optional(),
    academicYearId: z.number().int().positive(),
  }),
});

export const createSurveyQuestionSchema = z.object({
  body: z.object({
    questionText:     z.string().min(5),
    questionNo:       z.number().int().positive(),
    category:         z.string().optional(),
    surveyId:         z.number().int().positive(),
    poMappings:       z.array(z.number().int().positive()).optional(),
  }),
});

export const submitSurveyResponseSchema = z.object({
  body: z.object({
    surveyId:        z.number().int().positive(),
    respondentName:  z.string().optional(),
    respondentEmail: z.string().email().optional(),
    studentId:       z.number().int().positive().optional(),
    ratings: z.array(z.object({
      surveyQuestionId: z.number().int().positive(),
      rating:           z.number().int().min(0),
    })),
  }),
});

// ─── Attainment Configuration ───
export const updateAttainmentThresholdSchema = z.object({
  body: z.object({
    thresholds: z.array(z.object({
      level:           z.number().int().min(0).max(5),
      label:           z.string().min(1),
      minPercentage:   z.number().min(0).max(100),
      maxPercentage:   z.number().min(0).max(100),
      attainmentValue: z.number().min(0),
    })),
    programId: z.number().int().positive().optional(),
  }),
});

export const updateDirectIndirectWeightSchema = z.object({
  body: z.object({
    directWeight:   z.number().min(0).max(100),
    indirectWeight: z.number().min(0).max(100),
    programId:      z.number().int().positive().optional(),
  }),
});

// ─── OBE Settings ───
export const updateObeSettingsSchema = z.object({
  body: z.object({
    settings: z.array(z.object({
      settingKey:   z.string().min(1),
      settingValue: z.string(),
      description:  z.string().optional(),
    })),
    programId: z.number().int().positive().optional(),
  }),
});

// ─── Report Query ───
export const reportQuerySchema = z.object({
  query: z.object({
    programId:      z.string().optional(),
    academicYearId: z.string().optional(),
    semesterId:     z.string().optional(),
    courseId:       z.string().optional(),
    format:         z.enum(['PDF', 'EXCEL']).optional(),
  }),
});
