-- ============================================================
-- OBE Attainment Management System
-- Complete MySQL Database Schema (Standalone Migration)
-- Version: 1.0.0
-- ============================================================
-- Run this script on a fresh MySQL 8.x database.
-- CREATE DATABASE obe_attainment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE obe_attainment_db;
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ─────────────────────────────────────────────────────────────
-- TABLE: departments
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `departments` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `code`       VARCHAR(20)  NOT NULL,
  `name`       VARCHAR(150) NOT NULL,
  `short_name` VARCHAR(20)  NOT NULL,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `departments_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: academic_years
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `year`       VARCHAR(10)  NOT NULL,
  `start_date` DATE         NOT NULL,
  `end_date`   DATE         NOT NULL,
  `is_current` TINYINT(1)   NOT NULL DEFAULT 0,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `academic_years_year_key` (`year`),
  KEY `academic_years_year_idx` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: programs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `programs` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `code`            VARCHAR(20)  NOT NULL,
  `name`            VARCHAR(200) NOT NULL,
  `short_name`      VARCHAR(20)  NOT NULL,
  `duration`        INT          NOT NULL DEFAULT 4,
  `total_semesters` INT          NOT NULL DEFAULT 8,
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `department_id`   INT          NOT NULL,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_code_department_id_key` (`code`, `department_id`),
  KEY `programs_department_id_idx` (`department_id`),
  CONSTRAINT `programs_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`                   INT          NOT NULL AUTO_INCREMENT,
  `name`                 VARCHAR(100) NOT NULL,
  `email`                VARCHAR(150) NOT NULL,
  `password`             VARCHAR(255) NOT NULL,
  `role`                 ENUM('SUPER_ADMIN','ADMIN','HOD','FACULTY') NOT NULL DEFAULT 'FACULTY',
  `is_active`            TINYINT(1)   NOT NULL DEFAULT 1,
  `last_login_at`        DATETIME(3)  NULL,
  `password_changed_at`  DATETIME(3)  NULL,
  `reset_token`          VARCHAR(255) NULL,
  `reset_token_expiry`   DATETIME(3)  NULL,
  `department_id`        INT          NULL,
  `created_at`           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_email_idx` (`email`),
  KEY `users_role_idx` (`role`),
  KEY `users_department_id_idx` (`department_id`),
  CONSTRAINT `users_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: batches
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `batches` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(50)  NOT NULL,
  `start_year`      INT          NOT NULL,
  `end_year`        INT          NOT NULL,
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `program_id`      INT          NOT NULL,
  `department_id`   INT          NOT NULL,
  `academic_year_id` INT         NOT NULL,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `batches_program_id_idx` (`program_id`),
  KEY `batches_department_id_idx` (`department_id`),
  KEY `batches_academic_year_id_idx` (`academic_year_id`),
  CONSTRAINT `batches_program_id_fk`      FOREIGN KEY (`program_id`)      REFERENCES `programs`      (`id`),
  CONSTRAINT `batches_department_id_fk`   FOREIGN KEY (`department_id`)   REFERENCES `departments`   (`id`),
  CONSTRAINT `batches_academic_year_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: semesters
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `semesters` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `number`     INT          NOT NULL,
  `name`       VARCHAR(30)  NOT NULL,
  `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
  `batch_id`   INT          NOT NULL,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `semesters_batch_id_number_key` (`batch_id`, `number`),
  KEY `semesters_batch_id_idx` (`batch_id`),
  CONSTRAINT `semesters_batch_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: program_outcomes (PO1-PO12)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `program_outcomes` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `code`        VARCHAR(10)  NOT NULL,
  `number`      INT          NOT NULL,
  `description` TEXT         NOT NULL,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `program_id`  INT          NOT NULL,
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `program_outcomes_program_id_code_key` (`program_id`, `code`),
  KEY `program_outcomes_program_id_idx` (`program_id`),
  CONSTRAINT `program_outcomes_program_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: program_specific_outcomes (PSO1-PSO3)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `program_specific_outcomes` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `code`        VARCHAR(10)  NOT NULL,
  `number`      INT          NOT NULL,
  `description` TEXT         NOT NULL,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `program_id`  INT          NOT NULL,
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `program_specific_outcomes_program_id_code_key` (`program_id`, `code`),
  KEY `program_specific_outcomes_program_id_idx` (`program_id`),
  CONSTRAINT `program_specific_outcomes_program_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: courses
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `courses` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `code`            VARCHAR(20)  NOT NULL,
  `name`            VARCHAR(200) NOT NULL,
  `credits`         DECIMAL(4,2) NOT NULL,
  `course_type`     ENUM('THEORY','LAB','PROJECT','ELECTIVE','AUDIT') NOT NULL DEFAULT 'THEORY',
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `program_id`      INT          NOT NULL,
  `semester_id`     INT          NOT NULL,
  `academic_year_id` INT         NOT NULL,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `courses_code_academic_year_id_semester_id_key` (`code`, `academic_year_id`, `semester_id`),
  KEY `courses_program_id_idx` (`program_id`),
  KEY `courses_semester_id_idx` (`semester_id`),
  KEY `courses_academic_year_id_idx` (`academic_year_id`),
  CONSTRAINT `courses_program_id_fk`      FOREIGN KEY (`program_id`)      REFERENCES `programs`      (`id`),
  CONSTRAINT `courses_semester_id_fk`     FOREIGN KEY (`semester_id`)     REFERENCES `semesters`     (`id`),
  CONSTRAINT `courses_academic_year_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: course_faculty
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `course_faculty` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `is_active`  TINYINT(1)  NOT NULL DEFAULT 1,
  `course_id`  INT         NOT NULL,
  `user_id`    INT         NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_faculty_course_id_user_id_key` (`course_id`, `user_id`),
  KEY `course_faculty_course_id_idx` (`course_id`),
  KEY `course_faculty_user_id_idx` (`user_id`),
  CONSTRAINT `course_faculty_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `course_faculty_user_id_fk`   FOREIGN KEY (`user_id`)   REFERENCES `users`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: course_outcomes (CO1-CO5 per course)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `course_outcomes` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `code`         VARCHAR(10)  NOT NULL,
  `number`       INT          NOT NULL,
  `description`  TEXT         NOT NULL,
  `blooms_level` INT          NULL,
  `is_active`    TINYINT(1)   NOT NULL DEFAULT 1,
  `course_id`    INT          NOT NULL,
  `created_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_outcomes_course_id_code_key` (`course_id`, `code`),
  KEY `course_outcomes_course_id_idx` (`course_id`),
  CONSTRAINT `course_outcomes_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: co_po_mappings (0=None, 1=Low, 2=Medium, 3=High)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `co_po_mappings` (
  `id`                INT         NOT NULL AUTO_INCREMENT,
  `mapping_value`     INT         NOT NULL DEFAULT 0,
  `course_outcome_id` INT         NOT NULL,
  `program_outcome_id` INT        NOT NULL,
  `created_at`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `co_po_mappings_co_po_key` (`course_outcome_id`, `program_outcome_id`),
  KEY `co_po_mappings_co_idx` (`course_outcome_id`),
  KEY `co_po_mappings_po_idx` (`program_outcome_id`),
  CONSTRAINT `co_po_mappings_co_fk` FOREIGN KEY (`course_outcome_id`)  REFERENCES `course_outcomes`  (`id`),
  CONSTRAINT `co_po_mappings_po_fk` FOREIGN KEY (`program_outcome_id`) REFERENCES `program_outcomes` (`id`),
  CONSTRAINT `co_po_mappings_value_chk` CHECK (`mapping_value` BETWEEN 0 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: co_pso_mappings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `co_pso_mappings` (
  `id`                         INT         NOT NULL AUTO_INCREMENT,
  `mapping_value`              INT         NOT NULL DEFAULT 0,
  `course_outcome_id`          INT         NOT NULL,
  `program_specific_outcome_id` INT        NOT NULL,
  `created_at`                 DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`                 DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `co_pso_mappings_co_pso_key` (`course_outcome_id`, `program_specific_outcome_id`),
  KEY `co_pso_mappings_co_idx`  (`course_outcome_id`),
  KEY `co_pso_mappings_pso_idx` (`program_specific_outcome_id`),
  CONSTRAINT `co_pso_mappings_co_fk`  FOREIGN KEY (`course_outcome_id`)          REFERENCES `course_outcomes`          (`id`),
  CONSTRAINT `co_pso_mappings_pso_fk` FOREIGN KEY (`program_specific_outcome_id`) REFERENCES `program_specific_outcomes` (`id`),
  CONSTRAINT `co_pso_mappings_value_chk` CHECK (`mapping_value` BETWEEN 0 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: students
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `students` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `roll_number` VARCHAR(30)  NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `email`       VARCHAR(150) NULL,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `batch_id`    INT          NOT NULL,
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `students_roll_number_batch_id_key` (`roll_number`, `batch_id`),
  KEY `students_batch_id_idx` (`batch_id`),
  CONSTRAINT `students_batch_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: student_courses (enrollment)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `student_courses` (
  `id`         INT         NOT NULL AUTO_INCREMENT,
  `is_active`  TINYINT(1)  NOT NULL DEFAULT 1,
  `student_id` INT         NOT NULL,
  `course_id`  INT         NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_courses_student_id_course_id_key` (`student_id`, `course_id`),
  KEY `student_courses_student_id_idx` (`student_id`),
  KEY `student_courses_course_id_idx`  (`course_id`),
  CONSTRAINT `student_courses_student_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `student_courses_course_id_fk`  FOREIGN KEY (`course_id`)  REFERENCES `courses`  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: assessments
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `assessments` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(100) NOT NULL,
  `assessment_type` ENUM('INTERNAL','UNIT_TEST','MID_SEMESTER','END_SEMESTER','ASSIGNMENT','PRACTICAL','LAB','PROJECT','OTHER') NOT NULL,
  `max_marks`       DECIMAL(8,2) NOT NULL,
  `weightage`       DECIMAL(5,2) NOT NULL,
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `conducted_date`  DATE         NULL,
  `course_id`       INT          NOT NULL,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `assessments_course_id_idx` (`course_id`),
  KEY `assessments_type_idx` (`assessment_type`),
  CONSTRAINT `assessments_course_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `assessments_max_marks_chk` CHECK (`max_marks` > 0),
  CONSTRAINT `assessments_weightage_chk` CHECK (`weightage` BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: assessment_cos (which COs does each assessment test)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `assessment_cos` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `max_marks`         DECIMAL(8,2) NOT NULL,
  `weightage`         DECIMAL(5,2) NOT NULL DEFAULT 100,
  `assessment_id`     INT          NOT NULL,
  `course_outcome_id` INT          NOT NULL,
  `created_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_cos_assessment_id_co_id_key` (`assessment_id`, `course_outcome_id`),
  KEY `assessment_cos_assessment_id_idx` (`assessment_id`),
  KEY `assessment_cos_co_id_idx`         (`course_outcome_id`),
  CONSTRAINT `assessment_cos_assessment_id_fk`     FOREIGN KEY (`assessment_id`)     REFERENCES `assessments`     (`id`),
  CONSTRAINT `assessment_cos_course_outcome_id_fk` FOREIGN KEY (`course_outcome_id`) REFERENCES `course_outcomes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: student_assessment_marks (raw marks per student per CO)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `student_assessment_marks` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `marks_obtained`    DECIMAL(8,2) NOT NULL DEFAULT 0,
  `is_absent`         TINYINT(1)   NOT NULL DEFAULT 0,
  `student_id`        INT          NOT NULL,
  `assessment_id`     INT          NOT NULL,
  `course_outcome_id` INT          NULL,
  `created_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_assessment_marks_unique` (`student_id`, `assessment_id`, `course_outcome_id`),
  KEY `student_assessment_marks_student_idx`    (`student_id`),
  KEY `student_assessment_marks_assessment_idx` (`assessment_id`),
  KEY `student_assessment_marks_co_idx`         (`course_outcome_id`),
  CONSTRAINT `sam_student_id_fk`        FOREIGN KEY (`student_id`)        REFERENCES `students`        (`id`),
  CONSTRAINT `sam_assessment_id_fk`     FOREIGN KEY (`assessment_id`)     REFERENCES `assessments`     (`id`),
  CONSTRAINT `sam_course_outcome_id_fk` FOREIGN KEY (`course_outcome_id`) REFERENCES `course_outcomes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `sam_marks_chk` CHECK (`marks_obtained` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: attainment_thresholds (configurable Level 0-3)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `attainment_thresholds` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `level`            INT          NOT NULL,
  `label`            VARCHAR(20)  NOT NULL,
  `min_percentage`   DECIMAL(5,2) NOT NULL,
  `max_percentage`   DECIMAL(5,2) NOT NULL,
  `attainment_value` DECIMAL(4,2) NOT NULL,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `program_id`       INT          NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `attainment_thresholds_program_id_idx` (`program_id`),
  CONSTRAINT `attainment_thresholds_program_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attainment_thresholds_level_chk` CHECK (`level` BETWEEN 0 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: assessment_weight_configs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `assessment_weight_configs` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `assessment_type` ENUM('INTERNAL','UNIT_TEST','MID_SEMESTER','END_SEMESTER','ASSIGNMENT','PRACTICAL','LAB','PROJECT','OTHER') NOT NULL,
  `weightage`       DECIMAL(5,2) NOT NULL,
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `program_id`      INT          NULL,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `assessment_weight_configs_program_id_idx` (`program_id`),
  CONSTRAINT `assessment_weight_configs_program_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessment_weight_configs_weightage_chk` CHECK (`weightage` BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: direct_indirect_weight_configs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `direct_indirect_weight_configs` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `direct_weight`   DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  `indirect_weight` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `program_id`      INT          NULL UNIQUE,
  `created_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `direct_indirect_weight_configs_program_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `direct_indirect_weight_sum_chk` CHECK ((`direct_weight` + `indirect_weight`) = 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: co_attainment (calculated results)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `co_attainment` (
  `id`                      INT          NOT NULL AUTO_INCREMENT,
  `direct_attainment`       DECIMAL(5,2) NOT NULL,
  `indirect_attainment`     DECIMAL(5,2) NULL,
  `final_attainment`        DECIMAL(5,2) NOT NULL,
  `attainment_level`        INT          NOT NULL,
  `students_above_threshold` INT         NULL,
  `total_students`          INT          NULL,
  `calculated_at`           DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `course_outcome_id`       INT          NOT NULL,
  `created_at`              DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`              DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `co_attainment_course_outcome_id_key` (`course_outcome_id`),
  KEY `co_attainment_co_idx` (`course_outcome_id`),
  CONSTRAINT `co_attainment_co_fk` FOREIGN KEY (`course_outcome_id`) REFERENCES `course_outcomes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: po_direct_attainment
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `po_direct_attainment` (
  `id`                 INT          NOT NULL AUTO_INCREMENT,
  `attainment_value`   DECIMAL(5,2) NOT NULL,
  `calculated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `program_outcome_id` INT          NOT NULL,
  `academic_year_id`   INT          NOT NULL,
  `created_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_direct_attainment_po_ay_key` (`program_outcome_id`, `academic_year_id`),
  KEY `po_direct_attainment_po_idx` (`program_outcome_id`),
  KEY `po_direct_attainment_ay_idx` (`academic_year_id`),
  CONSTRAINT `po_direct_attainment_po_fk` FOREIGN KEY (`program_outcome_id`) REFERENCES `program_outcomes` (`id`),
  CONSTRAINT `po_direct_attainment_ay_fk` FOREIGN KEY (`academic_year_id`)   REFERENCES `academic_years`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: po_indirect_attainment
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `po_indirect_attainment` (
  `id`                 INT          NOT NULL AUTO_INCREMENT,
  `attainment_value`   DECIMAL(5,2) NOT NULL,
  `source`             VARCHAR(50)  NOT NULL,
  `calculated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `program_outcome_id` INT          NOT NULL,
  `academic_year_id`   INT          NOT NULL,
  `created_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `po_indirect_attainment_po_idx` (`program_outcome_id`),
  KEY `po_indirect_attainment_ay_idx` (`academic_year_id`),
  CONSTRAINT `po_indirect_attainment_po_fk` FOREIGN KEY (`program_outcome_id`) REFERENCES `program_outcomes` (`id`),
  CONSTRAINT `po_indirect_attainment_ay_fk` FOREIGN KEY (`academic_year_id`)   REFERENCES `academic_years`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: po_final_attainment
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `po_final_attainment` (
  `id`                 INT          NOT NULL AUTO_INCREMENT,
  `direct_value`       DECIMAL(5,2) NOT NULL,
  `indirect_value`     DECIMAL(5,2) NOT NULL,
  `final_value`        DECIMAL(5,2) NOT NULL,
  `direct_weight`      DECIMAL(5,2) NOT NULL,
  `indirect_weight`    DECIMAL(5,2) NOT NULL,
  `calculated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `program_outcome_id` INT          NOT NULL,
  `academic_year_id`   INT          NOT NULL,
  `created_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_final_attainment_po_ay_key` (`program_outcome_id`, `academic_year_id`),
  KEY `po_final_attainment_po_idx` (`program_outcome_id`),
  KEY `po_final_attainment_ay_idx` (`academic_year_id`),
  CONSTRAINT `po_final_attainment_po_fk` FOREIGN KEY (`program_outcome_id`) REFERENCES `program_outcomes` (`id`),
  CONSTRAINT `po_final_attainment_ay_fk` FOREIGN KEY (`academic_year_id`)   REFERENCES `academic_years`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: pso_direct_attainment
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pso_direct_attainment` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `attainment_value` DECIMAL(5,2) NOT NULL,
  `calculated_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `pso_id`           INT          NOT NULL,
  `academic_year_id` INT          NOT NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `pso_direct_attainment_pso_ay_key` (`pso_id`, `academic_year_id`),
  KEY `pso_direct_attainment_pso_idx` (`pso_id`),
  KEY `pso_direct_attainment_ay_idx`  (`academic_year_id`),
  CONSTRAINT `pso_direct_attainment_pso_fk` FOREIGN KEY (`pso_id`)          REFERENCES `program_specific_outcomes` (`id`),
  CONSTRAINT `pso_direct_attainment_ay_fk`  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`           (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: pso_indirect_attainment
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pso_indirect_attainment` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `attainment_value` DECIMAL(5,2) NOT NULL,
  `source`           VARCHAR(50)  NOT NULL,
  `calculated_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `pso_id`           INT          NOT NULL,
  `academic_year_id` INT          NOT NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `pso_indirect_attainment_pso_idx` (`pso_id`),
  KEY `pso_indirect_attainment_ay_idx`  (`academic_year_id`),
  CONSTRAINT `pso_indirect_attainment_pso_fk` FOREIGN KEY (`pso_id`)          REFERENCES `program_specific_outcomes` (`id`),
  CONSTRAINT `pso_indirect_attainment_ay_fk`  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`           (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: pso_final_attainment
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pso_final_attainment` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `direct_value`     DECIMAL(5,2) NOT NULL,
  `indirect_value`   DECIMAL(5,2) NOT NULL,
  `final_value`      DECIMAL(5,2) NOT NULL,
  `direct_weight`    DECIMAL(5,2) NOT NULL,
  `indirect_weight`  DECIMAL(5,2) NOT NULL,
  `calculated_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `pso_id`           INT          NOT NULL,
  `academic_year_id` INT          NOT NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `pso_final_attainment_pso_ay_key` (`pso_id`, `academic_year_id`),
  KEY `pso_final_attainment_pso_idx` (`pso_id`),
  KEY `pso_final_attainment_ay_idx`  (`academic_year_id`),
  CONSTRAINT `pso_final_attainment_pso_fk` FOREIGN KEY (`pso_id`)          REFERENCES `program_specific_outcomes` (`id`),
  CONSTRAINT `pso_final_attainment_ay_fk`  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`           (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: cca_activities
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `cca_activities` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `name`             VARCHAR(150) NOT NULL,
  `description`      TEXT         NULL,
  `activity_date`    DATE         NULL,
  `number_of_events` INT          NOT NULL DEFAULT 1,
  `attainment_level` INT          NOT NULL DEFAULT 2,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `is_custom`        TINYINT(1)   NOT NULL DEFAULT 0,
  `academic_year_id` INT          NOT NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `cca_activities_academic_year_id_idx` (`academic_year_id`),
  CONSTRAINT `cca_activities_academic_year_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `cca_activities_attainment_level_chk` CHECK (`attainment_level` BETWEEN 0 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: cca_po_mappings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `cca_po_mappings` (
  `id`                 INT         NOT NULL AUTO_INCREMENT,
  `mapping_value`      INT         NOT NULL DEFAULT 0,
  `cca_activity_id`    INT         NOT NULL,
  `program_outcome_id` INT         NOT NULL,
  `created_at`         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cca_po_mappings_cca_po_key` (`cca_activity_id`, `program_outcome_id`),
  KEY `cca_po_mappings_cca_idx` (`cca_activity_id`),
  KEY `cca_po_mappings_po_idx`  (`program_outcome_id`),
  CONSTRAINT `cca_po_mappings_cca_fk` FOREIGN KEY (`cca_activity_id`)   REFERENCES `cca_activities`   (`id`),
  CONSTRAINT `cca_po_mappings_po_fk`  FOREIGN KEY (`program_outcome_id`) REFERENCES `program_outcomes` (`id`),
  CONSTRAINT `cca_po_mappings_value_chk` CHECK (`mapping_value` BETWEEN 0 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: eca_activities
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `eca_activities` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `name`             VARCHAR(150) NOT NULL,
  `category`         VARCHAR(50)  NOT NULL,
  `description`      TEXT         NULL,
  `activity_date`    DATE         NULL,
  `number_of_events` INT          NOT NULL DEFAULT 1,
  `attainment_level` INT          NOT NULL DEFAULT 2,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `is_custom`        TINYINT(1)   NOT NULL DEFAULT 0,
  `academic_year_id` INT          NOT NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `eca_activities_academic_year_id_idx` (`academic_year_id`),
  CONSTRAINT `eca_activities_academic_year_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `eca_activities_attainment_level_chk` CHECK (`attainment_level` BETWEEN 0 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: eca_po_mappings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `eca_po_mappings` (
  `id`                 INT         NOT NULL AUTO_INCREMENT,
  `mapping_value`      INT         NOT NULL DEFAULT 0,
  `eca_activity_id`    INT         NOT NULL,
  `program_outcome_id` INT         NOT NULL,
  `created_at`         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `eca_po_mappings_eca_po_key` (`eca_activity_id`, `program_outcome_id`),
  KEY `eca_po_mappings_eca_idx` (`eca_activity_id`),
  KEY `eca_po_mappings_po_idx`  (`program_outcome_id`),
  CONSTRAINT `eca_po_mappings_eca_fk` FOREIGN KEY (`eca_activity_id`)   REFERENCES `eca_activities`   (`id`),
  CONSTRAINT `eca_po_mappings_po_fk`  FOREIGN KEY (`program_outcome_id`) REFERENCES `program_outcomes` (`id`),
  CONSTRAINT `eca_po_mappings_value_chk` CHECK (`mapping_value` BETWEEN 0 AND 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: surveys
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `surveys` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `title`            VARCHAR(200) NOT NULL,
  `description`      TEXT         NULL,
  `survey_type`      ENUM('ALUMNI','PARENT','EXIT','EMPLOYER') NOT NULL,
  `scale_min`        INT          NOT NULL DEFAULT 1,
  `scale_max`        INT          NOT NULL DEFAULT 5,
  `is_active`        TINYINT(1)   NOT NULL DEFAULT 1,
  `is_closed`        TINYINT(1)   NOT NULL DEFAULT 0,
  `academic_year_id` INT          NOT NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `surveys_survey_type_idx`      (`survey_type`),
  KEY `surveys_academic_year_id_idx` (`academic_year_id`),
  CONSTRAINT `surveys_academic_year_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: survey_questions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `survey_questions` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `question_text` TEXT         NOT NULL,
  `question_no`   INT          NOT NULL,
  `category`      VARCHAR(100) NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `survey_id`     INT          NOT NULL,
  `created_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `survey_questions_survey_id_idx` (`survey_id`),
  CONSTRAINT `survey_questions_survey_id_fk` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: survey_question_po_maps
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `survey_question_po_maps` (
  `id`                 INT         NOT NULL AUTO_INCREMENT,
  `survey_question_id` INT         NOT NULL,
  `program_outcome_id` INT         NOT NULL,
  `created_at`         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `survey_question_po_maps_q_po_key` (`survey_question_id`, `program_outcome_id`),
  KEY `survey_question_po_maps_q_idx`  (`survey_question_id`),
  KEY `survey_question_po_maps_po_idx` (`program_outcome_id`),
  CONSTRAINT `survey_question_po_maps_q_fk`  FOREIGN KEY (`survey_question_id`) REFERENCES `survey_questions`  (`id`),
  CONSTRAINT `survey_question_po_maps_po_fk` FOREIGN KEY (`program_outcome_id`)  REFERENCES `program_outcomes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: survey_responses
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `survey_responses` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `respondent_name`   VARCHAR(100) NULL,
  `respondent_email`  VARCHAR(150) NULL,
  `submitted_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `survey_id`         INT          NOT NULL,
  `student_id`        INT          NULL,
  `created_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `survey_responses_survey_id_idx`  (`survey_id`),
  KEY `survey_responses_student_id_idx` (`student_id`),
  CONSTRAINT `survey_responses_survey_id_fk`  FOREIGN KEY (`survey_id`)  REFERENCES `surveys`  (`id`),
  CONSTRAINT `survey_responses_student_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: survey_response_details
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `survey_response_details` (
  `id`                 INT         NOT NULL AUTO_INCREMENT,
  `rating`             INT         NOT NULL,
  `response_id`        INT         NOT NULL,
  `survey_question_id` INT         NOT NULL,
  `created_at`         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `survey_response_details_resp_q_key` (`response_id`, `survey_question_id`),
  KEY `survey_response_details_resp_idx` (`response_id`),
  KEY `survey_response_details_q_idx`    (`survey_question_id`),
  CONSTRAINT `survey_response_details_resp_fk` FOREIGN KEY (`response_id`)        REFERENCES `survey_responses`  (`id`),
  CONSTRAINT `survey_response_details_q_fk`    FOREIGN KEY (`survey_question_id`) REFERENCES `survey_questions`  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: survey_attainment (aggregated)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `survey_attainment` (
  `id`                 INT          NOT NULL AUTO_INCREMENT,
  `survey_type`        ENUM('ALUMNI','PARENT','EXIT','EMPLOYER') NOT NULL,
  `attainment_value`   DECIMAL(5,2) NOT NULL,
  `total_responses`    INT          NOT NULL DEFAULT 0,
  `calculated_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `program_outcome_id` INT          NOT NULL,
  `academic_year_id`   INT          NOT NULL,
  `created_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `survey_attainment_po_idx`          (`program_outcome_id`),
  KEY `survey_attainment_ay_idx`          (`academic_year_id`),
  KEY `survey_attainment_survey_type_idx` (`survey_type`),
  CONSTRAINT `survey_attainment_po_fk` FOREIGN KEY (`program_outcome_id`) REFERENCES `program_outcomes` (`id`),
  CONSTRAINT `survey_attainment_ay_fk` FOREIGN KEY (`academic_year_id`)   REFERENCES `academic_years`   (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: employer_survey_categories
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `employer_survey_categories` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(200) NOT NULL,
  `order_index` INT          NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: employer_surveys
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `employer_surveys` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `company_name`      VARCHAR(200) NOT NULL,
  `respondent_name`   VARCHAR(100) NOT NULL,
  `respondent_email`  VARCHAR(150) NULL,
  `submitted_at`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `academic_year_id`  INT          NOT NULL,
  `created_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `employer_surveys_academic_year_id_idx` (`academic_year_id`),
  CONSTRAINT `employer_surveys_academic_year_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: employer_survey_ratings
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `employer_survey_ratings` (
  `id`          INT         NOT NULL AUTO_INCREMENT,
  `rating`      INT         NOT NULL,
  `survey_id`   INT         NOT NULL,
  `category_id` INT         NOT NULL,
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `employer_survey_ratings_survey_cat_key` (`survey_id`, `category_id`),
  KEY `employer_survey_ratings_survey_id_idx`   (`survey_id`),
  KEY `employer_survey_ratings_category_id_idx` (`category_id`),
  CONSTRAINT `employer_survey_ratings_survey_id_fk`   FOREIGN KEY (`survey_id`)   REFERENCES `employer_surveys`           (`id`),
  CONSTRAINT `employer_survey_ratings_category_id_fk` FOREIGN KEY (`category_id`) REFERENCES `employer_survey_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: obe_settings (key-value configuration)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `obe_settings` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `setting_key`  VARCHAR(100) NOT NULL,
  `setting_value` TEXT        NOT NULL,
  `description`  TEXT         NULL,
  `program_id`   INT          NULL,
  `created_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `obe_settings_key_program_id_key` (`setting_key`, `program_id`),
  KEY `obe_settings_program_id_idx` (`program_id`),
  CONSTRAINT `obe_settings_program_id_fk` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: reports
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reports` (
  `id`               INT          NOT NULL AUTO_INCREMENT,
  `title`            VARCHAR(200) NOT NULL,
  `report_type`      VARCHAR(50)  NOT NULL,
  `format`           VARCHAR(10)  NOT NULL,
  `file_path`        VARCHAR(500) NULL,
  `generated_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `parameters`       JSON         NULL,
  `generated_by_id`  INT          NOT NULL,
  `academic_year_id` INT          NULL,
  `created_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `reports_generated_by_id_idx`  (`generated_by_id`),
  KEY `reports_academic_year_id_idx` (`academic_year_id`),
  KEY `reports_report_type_idx`      (`report_type`),
  CONSTRAINT `reports_generated_by_id_fk`  FOREIGN KEY (`generated_by_id`)  REFERENCES `users`         (`id`),
  CONSTRAINT `reports_academic_year_id_fk` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLE: audit_logs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`             INT          NOT NULL AUTO_INCREMENT,
  `table_name`     VARCHAR(100) NOT NULL,
  `record_id`      INT          NOT NULL,
  `action`         VARCHAR(20)  NOT NULL,
  `field_name`     VARCHAR(100) NULL,
  `old_value`      TEXT         NULL,
  `new_value`      TEXT         NULL,
  `ip_address`     VARCHAR(50)  NULL,
  `user_agent`     VARCHAR(500) NULL,
  `user_id`        INT          NULL,
  `modified_by_id` INT          NULL,
  `created_at`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_table_name_idx`  (`table_name`),
  KEY `audit_logs_user_id_idx`     (`user_id`),
  KEY `audit_logs_created_at_idx`  (`created_at`),
  CONSTRAINT `audit_logs_user_id_fk`        FOREIGN KEY (`user_id`)        REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `audit_logs_modified_by_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SCHEMA MIGRATION
-- Total tables: 34
-- ============================================================
