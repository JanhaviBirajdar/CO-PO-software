-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'HOD', 'OBE_COORDINATOR', 'FACULTY', 'DEPARTMENT_COORDINATOR', 'IQAC_ADMIN', 'PRINCIPAL_MANAGEMENT') NOT NULL DEFAULT 'FACULTY',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `passwordChangedAt` DATETIME(3) NULL,
    `resetToken` VARCHAR(255) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `departmentId` INTEGER NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `shortName` VARCHAR(20) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_code_key`(`code`),
    INDEX `departments_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `shortName` VARCHAR(20) NOT NULL,
    `duration` INTEGER NOT NULL DEFAULT 4,
    `totalSemesters` INTEGER NOT NULL DEFAULT 8,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `departmentId` INTEGER NOT NULL,

    INDEX `programs_departmentId_idx`(`departmentId`),
    UNIQUE INDEX `programs_code_departmentId_key`(`code`, `departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_years` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` VARCHAR(10) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `academic_years_year_key`(`year`),
    INDEX `academic_years_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `startYear` INTEGER NOT NULL,
    `endYear` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programId` INTEGER NOT NULL,
    `departmentId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `batches_programId_idx`(`programId`),
    INDEX `batches_departmentId_idx`(`departmentId`),
    INDEX `batches_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semesters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` INTEGER NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `batchId` INTEGER NOT NULL,

    INDEX `semesters_batchId_idx`(`batchId`),
    UNIQUE INDEX `semesters_batchId_number_key`(`batchId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_outcomes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL,
    `number` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programId` INTEGER NOT NULL,

    INDEX `program_outcomes_programId_idx`(`programId`),
    UNIQUE INDEX `program_outcomes_programId_code_key`(`programId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_specific_outcomes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL,
    `number` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programId` INTEGER NOT NULL,

    INDEX `program_specific_outcomes_programId_idx`(`programId`),
    UNIQUE INDEX `program_specific_outcomes_programId_code_key`(`programId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `credits` DECIMAL(4, 2) NOT NULL,
    `courseType` ENUM('THEORY', 'LAB', 'PROJECT', 'ELECTIVE', 'AUDIT') NOT NULL DEFAULT 'THEORY',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programId` INTEGER NOT NULL,
    `semesterId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `courses_programId_idx`(`programId`),
    INDEX `courses_semesterId_idx`(`semesterId`),
    INDEX `courses_academicYearId_idx`(`academicYearId`),
    UNIQUE INDEX `courses_code_academicYearId_semesterId_key`(`code`, `academicYearId`, `semesterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_faculty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `course_faculty_courseId_idx`(`courseId`),
    INDEX `course_faculty_userId_idx`(`userId`),
    UNIQUE INDEX `course_faculty_courseId_userId_key`(`courseId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_outcomes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL,
    `number` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `bloomsLevel` INTEGER NULL,
    `bloomVerb` VARCHAR(50) NULL,
    `bloomOverrideReason` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseId` INTEGER NOT NULL,
    `bloomLevelId` INTEGER NULL,

    INDEX `course_outcomes_courseId_idx`(`courseId`),
    UNIQUE INDEX `course_outcomes_courseId_code_key`(`courseId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `co_po_mappings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mappingValue` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseOutcomeId` INTEGER NOT NULL,
    `programOutcomeId` INTEGER NOT NULL,

    INDEX `co_po_mappings_courseOutcomeId_idx`(`courseOutcomeId`),
    INDEX `co_po_mappings_programOutcomeId_idx`(`programOutcomeId`),
    UNIQUE INDEX `co_po_mappings_courseOutcomeId_programOutcomeId_key`(`courseOutcomeId`, `programOutcomeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `co_pso_mappings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mappingValue` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseOutcomeId` INTEGER NOT NULL,
    `programSpecificOutcomeId` INTEGER NOT NULL,

    INDEX `co_pso_mappings_courseOutcomeId_idx`(`courseOutcomeId`),
    INDEX `co_pso_mappings_programSpecificOutcomeId_idx`(`programSpecificOutcomeId`),
    UNIQUE INDEX `co_pso_mappings_courseOutcomeId_programSpecificOutcomeId_key`(`courseOutcomeId`, `programSpecificOutcomeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rollNumber` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `batchId` INTEGER NOT NULL,

    INDEX `students_batchId_idx`(`batchId`),
    UNIQUE INDEX `students_rollNumber_batchId_key`(`rollNumber`, `batchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,

    INDEX `student_courses_studentId_idx`(`studentId`),
    INDEX `student_courses_courseId_idx`(`courseId`),
    UNIQUE INDEX `student_courses_studentId_courseId_key`(`studentId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `assessmentType` ENUM('INTERNAL', 'UNIT_TEST', 'MID_SEMESTER', 'END_SEMESTER', 'ASSIGNMENT', 'PRACTICAL', 'LAB', 'PROJECT', 'OTHER') NOT NULL,
    `maxMarks` DECIMAL(8, 2) NOT NULL,
    `weightage` DECIMAL(5, 2) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `conductedDate` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseId` INTEGER NOT NULL,

    INDEX `assessments_courseId_idx`(`courseId`),
    INDEX `assessments_assessmentType_idx`(`assessmentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment_cos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `maxMarks` DECIMAL(8, 2) NOT NULL,
    `weightage` DECIMAL(5, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `assessmentId` INTEGER NOT NULL,
    `courseOutcomeId` INTEGER NOT NULL,

    INDEX `assessment_cos_assessmentId_idx`(`assessmentId`),
    INDEX `assessment_cos_courseOutcomeId_idx`(`courseOutcomeId`),
    UNIQUE INDEX `assessment_cos_assessmentId_courseOutcomeId_key`(`assessmentId`, `courseOutcomeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_assessment_marks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marksObtained` DECIMAL(8, 2) NOT NULL,
    `isAbsent` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `assessmentId` INTEGER NOT NULL,
    `courseOutcomeId` INTEGER NULL,

    INDEX `student_assessment_marks_studentId_idx`(`studentId`),
    INDEX `student_assessment_marks_assessmentId_idx`(`assessmentId`),
    INDEX `student_assessment_marks_courseOutcomeId_idx`(`courseOutcomeId`),
    UNIQUE INDEX `student_assessment_marks_studentId_assessmentId_courseOutcom_key`(`studentId`, `assessmentId`, `courseOutcomeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attainment_thresholds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` INTEGER NOT NULL,
    `label` VARCHAR(20) NOT NULL,
    `minPercentage` DECIMAL(5, 2) NOT NULL,
    `maxPercentage` DECIMAL(5, 2) NOT NULL,
    `attainmentValue` DECIMAL(4, 2) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programId` INTEGER NULL,

    INDEX `attainment_thresholds_programId_idx`(`programId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment_weight_configs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessmentType` ENUM('INTERNAL', 'UNIT_TEST', 'MID_SEMESTER', 'END_SEMESTER', 'ASSIGNMENT', 'PRACTICAL', 'LAB', 'PROJECT', 'OTHER') NOT NULL,
    `weightage` DECIMAL(5, 2) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programId` INTEGER NULL,

    INDEX `assessment_weight_configs_programId_idx`(`programId`),
    UNIQUE INDEX `assessment_weight_configs_programId_assessmentType_key`(`programId`, `assessmentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `direct_indirect_weight_configs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directWeight` DECIMAL(5, 2) NOT NULL DEFAULT 80.00,
    `indirectWeight` DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programId` INTEGER NULL,

    UNIQUE INDEX `direct_indirect_weight_configs_programId_key`(`programId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `co_attainment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directAttainment` DECIMAL(5, 2) NOT NULL,
    `indirectAttainment` DECIMAL(5, 2) NULL,
    `finalAttainment` DECIMAL(5, 2) NOT NULL,
    `attainmentLevel` INTEGER NOT NULL,
    `studentsAboveThreshold` INTEGER NULL,
    `totalStudents` INTEGER NULL,
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseOutcomeId` INTEGER NOT NULL,

    INDEX `co_attainment_courseOutcomeId_idx`(`courseOutcomeId`),
    UNIQUE INDEX `co_attainment_courseOutcomeId_key`(`courseOutcomeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_direct_attainment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attainmentValue` DECIMAL(5, 2) NOT NULL,
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programOutcomeId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `po_direct_attainment_programOutcomeId_idx`(`programOutcomeId`),
    INDEX `po_direct_attainment_academicYearId_idx`(`academicYearId`),
    UNIQUE INDEX `po_direct_attainment_programOutcomeId_academicYearId_key`(`programOutcomeId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_indirect_attainment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attainmentValue` DECIMAL(5, 2) NOT NULL,
    `source` VARCHAR(50) NOT NULL,
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programOutcomeId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `po_indirect_attainment_programOutcomeId_idx`(`programOutcomeId`),
    INDEX `po_indirect_attainment_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_final_attainment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directValue` DECIMAL(5, 2) NOT NULL,
    `indirectValue` DECIMAL(5, 2) NOT NULL,
    `finalValue` DECIMAL(5, 2) NOT NULL,
    `directWeight` DECIMAL(5, 2) NOT NULL,
    `indirectWeight` DECIMAL(5, 2) NOT NULL,
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programOutcomeId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `po_final_attainment_programOutcomeId_idx`(`programOutcomeId`),
    INDEX `po_final_attainment_academicYearId_idx`(`academicYearId`),
    UNIQUE INDEX `po_final_attainment_programOutcomeId_academicYearId_key`(`programOutcomeId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pso_direct_attainment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attainmentValue` DECIMAL(5, 2) NOT NULL,
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `psoId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `pso_direct_attainment_psoId_idx`(`psoId`),
    INDEX `pso_direct_attainment_academicYearId_idx`(`academicYearId`),
    UNIQUE INDEX `pso_direct_attainment_psoId_academicYearId_key`(`psoId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pso_indirect_attainment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attainmentValue` DECIMAL(5, 2) NOT NULL,
    `source` VARCHAR(50) NOT NULL,
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `psoId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `pso_indirect_attainment_psoId_idx`(`psoId`),
    INDEX `pso_indirect_attainment_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pso_final_attainment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directValue` DECIMAL(5, 2) NOT NULL,
    `indirectValue` DECIMAL(5, 2) NOT NULL,
    `finalValue` DECIMAL(5, 2) NOT NULL,
    `directWeight` DECIMAL(5, 2) NOT NULL,
    `indirectWeight` DECIMAL(5, 2) NOT NULL,
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `psoId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `pso_final_attainment_psoId_idx`(`psoId`),
    INDEX `pso_final_attainment_academicYearId_idx`(`academicYearId`),
    UNIQUE INDEX `pso_final_attainment_psoId_academicYearId_key`(`psoId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cca_activities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `activityDate` DATE NULL,
    `numberOfEvents` INTEGER NOT NULL DEFAULT 1,
    `attainmentLevel` INTEGER NOT NULL DEFAULT 2,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `cca_activities_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cca_po_mappings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mappingValue` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ccaActivityId` INTEGER NOT NULL,
    `programOutcomeId` INTEGER NOT NULL,

    INDEX `cca_po_mappings_ccaActivityId_idx`(`ccaActivityId`),
    INDEX `cca_po_mappings_programOutcomeId_idx`(`programOutcomeId`),
    UNIQUE INDEX `cca_po_mappings_ccaActivityId_programOutcomeId_key`(`ccaActivityId`, `programOutcomeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eca_activities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `activityDate` DATE NULL,
    `numberOfEvents` INTEGER NOT NULL DEFAULT 1,
    `attainmentLevel` INTEGER NOT NULL DEFAULT 2,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `eca_activities_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eca_po_mappings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mappingValue` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ecaActivityId` INTEGER NOT NULL,
    `programOutcomeId` INTEGER NOT NULL,

    INDEX `eca_po_mappings_ecaActivityId_idx`(`ecaActivityId`),
    INDEX `eca_po_mappings_programOutcomeId_idx`(`programOutcomeId`),
    UNIQUE INDEX `eca_po_mappings_ecaActivityId_programOutcomeId_key`(`ecaActivityId`, `programOutcomeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `surveys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `surveyType` ENUM('ALUMNI', 'PARENT', 'EXIT', 'EMPLOYER') NOT NULL,
    `scaleMin` INTEGER NOT NULL DEFAULT 1,
    `scaleMax` INTEGER NOT NULL DEFAULT 5,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `surveys_surveyType_idx`(`surveyType`),
    INDEX `surveys_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionText` TEXT NOT NULL,
    `questionNo` INTEGER NOT NULL,
    `category` VARCHAR(100) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `surveyId` INTEGER NOT NULL,

    INDEX `survey_questions_surveyId_idx`(`surveyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_question_po_maps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `surveyQuestionId` INTEGER NOT NULL,
    `programOutcomeId` INTEGER NOT NULL,

    INDEX `survey_question_po_maps_surveyQuestionId_idx`(`surveyQuestionId`),
    INDEX `survey_question_po_maps_programOutcomeId_idx`(`programOutcomeId`),
    UNIQUE INDEX `survey_question_po_maps_surveyQuestionId_programOutcomeId_key`(`surveyQuestionId`, `programOutcomeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_responses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `respondentName` VARCHAR(100) NULL,
    `respondentEmail` VARCHAR(150) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `surveyId` INTEGER NOT NULL,
    `studentId` INTEGER NULL,

    INDEX `survey_responses_surveyId_idx`(`surveyId`),
    INDEX `survey_responses_studentId_idx`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_response_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `responseId` INTEGER NOT NULL,
    `surveyQuestionId` INTEGER NOT NULL,

    INDEX `survey_response_details_responseId_idx`(`responseId`),
    INDEX `survey_response_details_surveyQuestionId_idx`(`surveyQuestionId`),
    UNIQUE INDEX `survey_response_details_responseId_surveyQuestionId_key`(`responseId`, `surveyQuestionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_attainment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `surveyType` ENUM('ALUMNI', 'PARENT', 'EXIT', 'EMPLOYER') NOT NULL,
    `attainmentValue` DECIMAL(5, 2) NOT NULL,
    `totalResponses` INTEGER NOT NULL,
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programOutcomeId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `survey_attainment_programOutcomeId_idx`(`programOutcomeId`),
    INDEX `survey_attainment_academicYearId_idx`(`academicYearId`),
    INDEX `survey_attainment_surveyType_idx`(`surveyType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employer_surveys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(200) NOT NULL,
    `respondentName` VARCHAR(100) NOT NULL,
    `respondentEmail` VARCHAR(150) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `academicYearId` INTEGER NOT NULL,

    INDEX `employer_surveys_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employer_survey_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `orderIndex` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employer_survey_ratings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `surveyId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,

    INDEX `employer_survey_ratings_surveyId_idx`(`surveyId`),
    INDEX `employer_survey_ratings_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `employer_survey_ratings_surveyId_categoryId_key`(`surveyId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `obe_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `settingKey` VARCHAR(100) NOT NULL,
    `settingValue` TEXT NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `programId` INTEGER NULL,

    INDEX `obe_settings_programId_idx`(`programId`),
    UNIQUE INDEX `obe_settings_settingKey_programId_key`(`settingKey`, `programId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `reportType` VARCHAR(50) NOT NULL,
    `format` VARCHAR(10) NOT NULL,
    `filePath` VARCHAR(500) NULL,
    `generatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `parameters` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `generatedById` INTEGER NOT NULL,
    `academicYearId` INTEGER NULL,

    INDEX `reports_generatedById_idx`(`generatedById`),
    INDEX `reports_academicYearId_idx`(`academicYearId`),
    INDEX `reports_reportType_idx`(`reportType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tableName` VARCHAR(100) NOT NULL,
    `recordId` INTEGER NOT NULL,
    `action` VARCHAR(20) NOT NULL,
    `fieldName` VARCHAR(100) NULL,
    `oldValue` TEXT NULL,
    `newValue` TEXT NULL,
    `ipAddress` VARCHAR(50) NULL,
    `userAgent` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NULL,
    `modifiedById` INTEGER NULL,

    INDEX `audit_logs_tableName_idx`(`tableName`),
    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bloom_levels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `levelNumber` INTEGER NOT NULL,
    `levelCode` VARCHAR(20) NOT NULL,
    `levelName` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `actionVerbs` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bloom_levels_levelNumber_key`(`levelNumber`),
    UNIQUE INDEX `bloom_levels_levelCode_key`(`levelCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bloom_action_verbs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `verb` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `bloomLevelId` INTEGER NOT NULL,

    INDEX `bloom_action_verbs_bloomLevelId_idx`(`bloomLevelId`),
    UNIQUE INDEX `bloom_action_verbs_bloomLevelId_verb_key`(`bloomLevelId`, `verb`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionText` TEXT NOT NULL,
    `marks` DECIMAL(5, 2) NOT NULL,
    `unit` INTEGER NOT NULL DEFAULT 1,
    `bloomVerb` VARCHAR(50) NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    `questionType` ENUM('MCQ', 'SHORT_ANSWER', 'LONG_ANSWER', 'NUMERICAL', 'PROGRAMMING', 'PRACTICAL', 'CASE_STUDY', 'DESIGN_QUESTION') NOT NULL DEFAULT 'SHORT_ANSWER',
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `approvalReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseId` INTEGER NOT NULL,
    `courseOutcomeId` INTEGER NOT NULL,
    `bloomLevelId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `approvedById` INTEGER NULL,

    INDEX `questions_courseId_idx`(`courseId`),
    INDEX `questions_courseOutcomeId_idx`(`courseOutcomeId`),
    INDEX `questions_bloomLevelId_idx`(`bloomLevelId`),
    INDEX `questions_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_papers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `totalMarks` DECIMAL(5, 2) NOT NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 180,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `approvedById` INTEGER NULL,

    INDEX `question_papers_courseId_idx`(`courseId`),
    INDEX `question_papers_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_paper_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `section` VARCHAR(50) NOT NULL DEFAULT 'Section A',
    `questionNumber` VARCHAR(20) NOT NULL,
    `marks` DECIMAL(4, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `questionPaperId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,

    INDEX `question_paper_questions_questionPaperId_idx`(`questionPaperId`),
    INDEX `question_paper_questions_questionId_idx`(`questionId`),
    UNIQUE INDEX `question_paper_questions_questionPaperId_questionNumber_key`(`questionPaperId`, `questionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_paper_blueprints` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `totalMarks` DECIMAL(5, 2) NOT NULL,
    `totalQuestions` INTEGER NOT NULL,
    `bloomDistribution` TEXT NOT NULL,
    `coDistribution` TEXT NOT NULL,
    `unitDistribution` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `courseId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,

    INDEX `question_paper_blueprints_courseId_idx`(`courseId`),
    INDEX `question_paper_blueprints_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programs` ADD CONSTRAINT `programs_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batches` ADD CONSTRAINT `batches_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batches` ADD CONSTRAINT `batches_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batches` ADD CONSTRAINT `batches_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `semesters` ADD CONSTRAINT `semesters_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_outcomes` ADD CONSTRAINT `program_outcomes_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_specific_outcomes` ADD CONSTRAINT `program_specific_outcomes_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `semesters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_faculty` ADD CONSTRAINT `course_faculty_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_faculty` ADD CONSTRAINT `course_faculty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_outcomes` ADD CONSTRAINT `course_outcomes_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_outcomes` ADD CONSTRAINT `course_outcomes_bloomLevelId_fkey` FOREIGN KEY (`bloomLevelId`) REFERENCES `bloom_levels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `co_po_mappings` ADD CONSTRAINT `co_po_mappings_courseOutcomeId_fkey` FOREIGN KEY (`courseOutcomeId`) REFERENCES `course_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `co_po_mappings` ADD CONSTRAINT `co_po_mappings_programOutcomeId_fkey` FOREIGN KEY (`programOutcomeId`) REFERENCES `program_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `co_pso_mappings` ADD CONSTRAINT `co_pso_mappings_courseOutcomeId_fkey` FOREIGN KEY (`courseOutcomeId`) REFERENCES `course_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `co_pso_mappings` ADD CONSTRAINT `co_pso_mappings_programSpecificOutcomeId_fkey` FOREIGN KEY (`programSpecificOutcomeId`) REFERENCES `program_specific_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_cos` ADD CONSTRAINT `assessment_cos_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_cos` ADD CONSTRAINT `assessment_cos_courseOutcomeId_fkey` FOREIGN KEY (`courseOutcomeId`) REFERENCES `course_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_assessment_marks` ADD CONSTRAINT `student_assessment_marks_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_assessment_marks` ADD CONSTRAINT `student_assessment_marks_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attainment_thresholds` ADD CONSTRAINT `attainment_thresholds_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_weight_configs` ADD CONSTRAINT `assessment_weight_configs_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `direct_indirect_weight_configs` ADD CONSTRAINT `direct_indirect_weight_configs_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `co_attainment` ADD CONSTRAINT `co_attainment_courseOutcomeId_fkey` FOREIGN KEY (`courseOutcomeId`) REFERENCES `course_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_direct_attainment` ADD CONSTRAINT `po_direct_attainment_programOutcomeId_fkey` FOREIGN KEY (`programOutcomeId`) REFERENCES `program_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_direct_attainment` ADD CONSTRAINT `po_direct_attainment_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_indirect_attainment` ADD CONSTRAINT `po_indirect_attainment_programOutcomeId_fkey` FOREIGN KEY (`programOutcomeId`) REFERENCES `program_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_indirect_attainment` ADD CONSTRAINT `po_indirect_attainment_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_final_attainment` ADD CONSTRAINT `po_final_attainment_programOutcomeId_fkey` FOREIGN KEY (`programOutcomeId`) REFERENCES `program_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_final_attainment` ADD CONSTRAINT `po_final_attainment_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pso_direct_attainment` ADD CONSTRAINT `pso_direct_attainment_psoId_fkey` FOREIGN KEY (`psoId`) REFERENCES `program_specific_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pso_direct_attainment` ADD CONSTRAINT `pso_direct_attainment_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pso_indirect_attainment` ADD CONSTRAINT `pso_indirect_attainment_psoId_fkey` FOREIGN KEY (`psoId`) REFERENCES `program_specific_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pso_indirect_attainment` ADD CONSTRAINT `pso_indirect_attainment_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pso_final_attainment` ADD CONSTRAINT `pso_final_attainment_psoId_fkey` FOREIGN KEY (`psoId`) REFERENCES `program_specific_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pso_final_attainment` ADD CONSTRAINT `pso_final_attainment_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cca_activities` ADD CONSTRAINT `cca_activities_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cca_po_mappings` ADD CONSTRAINT `cca_po_mappings_ccaActivityId_fkey` FOREIGN KEY (`ccaActivityId`) REFERENCES `cca_activities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cca_po_mappings` ADD CONSTRAINT `cca_po_mappings_programOutcomeId_fkey` FOREIGN KEY (`programOutcomeId`) REFERENCES `program_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eca_activities` ADD CONSTRAINT `eca_activities_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eca_po_mappings` ADD CONSTRAINT `eca_po_mappings_ecaActivityId_fkey` FOREIGN KEY (`ecaActivityId`) REFERENCES `eca_activities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `eca_po_mappings` ADD CONSTRAINT `eca_po_mappings_programOutcomeId_fkey` FOREIGN KEY (`programOutcomeId`) REFERENCES `program_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `surveys` ADD CONSTRAINT `surveys_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_questions` ADD CONSTRAINT `survey_questions_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `surveys`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_question_po_maps` ADD CONSTRAINT `survey_question_po_maps_surveyQuestionId_fkey` FOREIGN KEY (`surveyQuestionId`) REFERENCES `survey_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_question_po_maps` ADD CONSTRAINT `survey_question_po_maps_programOutcomeId_fkey` FOREIGN KEY (`programOutcomeId`) REFERENCES `program_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_responses` ADD CONSTRAINT `survey_responses_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `surveys`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_responses` ADD CONSTRAINT `survey_responses_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_response_details` ADD CONSTRAINT `survey_response_details_responseId_fkey` FOREIGN KEY (`responseId`) REFERENCES `survey_responses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_response_details` ADD CONSTRAINT `survey_response_details_surveyQuestionId_fkey` FOREIGN KEY (`surveyQuestionId`) REFERENCES `survey_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employer_survey_ratings` ADD CONSTRAINT `employer_survey_ratings_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `employer_surveys`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employer_survey_ratings` ADD CONSTRAINT `employer_survey_ratings_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `employer_survey_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `obe_settings` ADD CONSTRAINT `obe_settings_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_modifiedById_fkey` FOREIGN KEY (`modifiedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bloom_action_verbs` ADD CONSTRAINT `bloom_action_verbs_bloomLevelId_fkey` FOREIGN KEY (`bloomLevelId`) REFERENCES `bloom_levels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_courseOutcomeId_fkey` FOREIGN KEY (`courseOutcomeId`) REFERENCES `course_outcomes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_bloomLevelId_fkey` FOREIGN KEY (`bloomLevelId`) REFERENCES `bloom_levels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_papers` ADD CONSTRAINT `question_papers_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_papers` ADD CONSTRAINT `question_papers_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_papers` ADD CONSTRAINT `question_papers_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_papers` ADD CONSTRAINT `question_papers_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_paper_questions` ADD CONSTRAINT `question_paper_questions_questionPaperId_fkey` FOREIGN KEY (`questionPaperId`) REFERENCES `question_papers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_paper_questions` ADD CONSTRAINT `question_paper_questions_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_paper_blueprints` ADD CONSTRAINT `question_paper_blueprints_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_paper_blueprints` ADD CONSTRAINT `question_paper_blueprints_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_paper_blueprints` ADD CONSTRAINT `question_paper_blueprints_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
