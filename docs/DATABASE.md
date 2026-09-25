# OBE Attainment Management System — Database Design

## Overview

This document describes the normalized MySQL database schema for the OBE Attainment Management System. The schema is managed via Prisma ORM.

---

## Entity Relationship Summary

```
Department
  └── Program
        ├── ProgramOutcome (PO1–PO12)
        ├── ProgramSpecificOutcome (PSO1–PSO3)
        ├── Batch
        │     ├── Semester
        │     └── Student
        └── Course
              ├── CourseFaculty
              ├── CourseOutcome (CO1–CO5)
              │     ├── CoPOMapping
              │     ├── CoPSOMapping
              │     └── AssessmentCO
              └── Assessment
                    └── StudentAssessmentMark

AcademicYear
  ├── CcaActivity → CcaPOMapping → ProgramOutcome
  ├── EcaActivity → EcaPOMapping → ProgramOutcome
  ├── Survey → SurveyQuestion → SurveyQuestionPOMap → ProgramOutcome
  │            └── SurveyResponse → SurveyResponseDetail
  └── EmployerSurvey → EmployerSurveyRating → EmployerSurveyCategory

Attainment (calculated):
  CoAttainment
  PoDirectAttainment
  PoIndirectAttainment
  PoFinalAttainment
  PsoDirectAttainment
  PsoIndirectAttainment
  PsoFinalAttainment
  SurveyAttainment

Configuration:
  AttainmentThreshold
  AssessmentWeightConfig
  DirectIndirectWeightConfig
  ObeSettings
```

---

## Tables

### Core Setup Tables

| Table | Description |
|-------|-------------|
| `users` | System users with roles (SUPER_ADMIN, ADMIN, HOD, FACULTY) |
| `departments` | Academic departments |
| `programs` | Degree programs under a department |
| `academic_years` | Academic years (e.g., 2024-25) |
| `batches` | Student batches (e.g., 2022–2026) |
| `semesters` | Semesters within a batch |

### Outcome Tables

| Table | Description |
|-------|-------------|
| `program_outcomes` | PO1–PO12 per program |
| `program_specific_outcomes` | PSO1–PSO3 per program |
| `course_outcomes` | CO1–CO5 per course |

### Mapping Tables

| Table | Description |
|-------|-------------|
| `co_po_mappings` | CO→PO correlation (0–3) |
| `co_pso_mappings` | CO→PSO correlation (0–3) |
| `cca_po_mappings` | CCA activity→PO (0–3) |
| `eca_po_mappings` | ECA activity→PO (0–3) |
| `survey_question_po_maps` | Survey question→PO |

### Assessment Tables

| Table | Description |
|-------|-------------|
| `courses` | Course details |
| `course_faculty` | Faculty assigned to course |
| `assessments` | Assessment types (internal, ESE, etc.) |
| `assessment_cos` | Which COs are tested in each assessment |
| `students` | Student records |
| `student_courses` | Student enrollment |
| `student_assessment_marks` | Raw marks per student per assessment per CO |

### Attainment Tables (Calculated)

| Table | Description |
|-------|-------------|
| `co_attainment` | CO-level attainment result |
| `po_direct_attainment` | Direct PO attainment from assessments |
| `po_indirect_attainment` | Indirect PO from CCA/ECA/surveys |
| `po_final_attainment` | Weighted final PO attainment |
| `pso_direct_attainment` | Direct PSO attainment |
| `pso_indirect_attainment` | Indirect PSO attainment |
| `pso_final_attainment` | Weighted final PSO attainment |

### Survey Tables

| Table | Description |
|-------|-------------|
| `surveys` | Survey definitions (Alumni, Parent, Exit, Employer) |
| `survey_questions` | Questions in each survey |
| `survey_responses` | Individual respondents |
| `survey_response_details` | Per-question ratings |
| `survey_attainment` | Aggregated survey attainment |
| `employer_surveys` | Employer satisfaction submissions |
| `employer_survey_categories` | Skill categories |
| `employer_survey_ratings` | Per-category ratings |

### CCA/ECA Tables

| Table | Description |
|-------|-------------|
| `cca_activities` | Co-curricular activities |
| `eca_activities` | Extra-curricular activities |

### Configuration Tables

| Table | Description |
|-------|-------------|
| `attainment_thresholds` | Level 0–3 thresholds (configurable) |
| `assessment_weight_configs` | Assessment type weightages |
| `direct_indirect_weight_configs` | 80/20 split config |
| `obe_settings` | Key-value OBE configuration |

---

## Mapping Correlation Scale

| Value | Label  | Meaning |
|-------|--------|---------|
| 0     | None   | No correlation |
| 1     | Low    | Low correlation |
| 2     | Medium | Medium correlation |
| 3     | High   | High correlation |

---

## CO Attainment Levels (Default — Configurable)

| Level | Range       | Attainment Value |
|-------|-------------|-----------------|
| 3     | ≥ 70%       | 3.00 |
| 2     | 60%–69.99%  | 2.00 |
| 1     | 50%–59.99%  | 1.00 |
| 0     | < 50%       | 0.00 |

These values are stored in `attainment_thresholds` and are fully configurable per program.

---

## Direct vs Indirect Weighting (Default — Configurable)

```
Final PO = (Direct × 0.80) + (Indirect × 0.20)
```

Stored in `direct_indirect_weight_configs`, configurable per program.

---

## Indexes

All foreign keys have corresponding indexes. Additional indexes exist on:
- `users.email`
- `users.role`
- `audit_logs.table_name`, `audit_logs.created_at`
- `surveys.survey_type`
- `po_final_attainment` composite on `(program_outcome_id, academic_year_id)`

---

## Naming Conventions

- Table names: `snake_case` plural
- Column names: `camelCase` in Prisma, `snake_case` in MySQL (Prisma maps automatically)
- All tables have `id`, `created_at`, `updated_at`
