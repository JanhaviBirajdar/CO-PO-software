# OBE Attainment Management System

> **Dr. D.Y. Patil College of Engineering & Innovation — NBA OBE Process**

A complete, production-ready web application for managing Outcome-Based Education (OBE) attainment calculations, reports, and dashboards.

---

## 🚀 Phase Status

| Phase | Module | Status |
|-------|--------|--------|
| **1** | Database Schema + Seed Data | ✅ **Complete** |
| 2 | Authentication API (JWT + RBAC) | 🔜 Next |
| 3 | Academic Setup + CO/PO/PSO APIs | 🔜 |
| 4 | Course + Assessment APIs | 🔜 |
| 5 | Formula Engine + Attainment Calculation | 🔜 |
| 6 | CCA/ECA/Survey APIs | 🔜 |
| 7 | Report Generation (PDF + Excel) | 🔜 |
| 8 | Frontend (React + Vite + TypeScript) | 🔜 |
| 9 | Testing | 🔜 |

---

## 📂 Project Structure

```
CO-PO-software/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       ← Complete OBE database schema (34 tables)
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.ts       ← Prisma client singleton
│   │   ├── formula/
│   │   │   └── formulaEngine.ts ← All OBE calculation functions
│   │   ├── controllers/        ← (Phase 2+)
│   │   ├── services/           ← (Phase 2+)
│   │   ├── routes/             ← (Phase 2+)
│   │   ├── middleware/         ← (Phase 2+)
│   │   └── index.ts            ← Express app entry point
│   ├── .env                    ← Local env (update DATABASE_URL)
│   ├── .env.example            ← Template
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  ← Standalone MySQL script (no Prisma needed)
│   └── seed/
│       └── seed.ts             ← Complete demo data (DYP COEI OBE manual)
├── docs/
│   ├── DATABASE.md             ← Schema documentation
│   ├── FORMULAS.md             ← OBE calculation formulas
│   ├── SETUP.md                ← Installation guide
│   └── DECISIONS.md            ← Architecture decisions
└── README.md
```

---

## 🗄️ Database — Phase 1 Deliverables

### 34 Tables Created

| Category | Tables |
|----------|--------|
| Auth & Users | `users` |
| Academic Setup | `departments`, `programs`, `academic_years`, `batches`, `semesters` |
| Outcomes | `program_outcomes` (PO1–PO12), `program_specific_outcomes` (PSO1–PSO3), `course_outcomes` |
| Mapping | `co_po_mappings`, `co_pso_mappings`, `cca_po_mappings`, `eca_po_mappings`, `survey_question_po_maps` |
| Courses | `courses`, `course_faculty` |
| Students | `students`, `student_courses` |
| Assessment | `assessments`, `assessment_cos`, `student_assessment_marks` |
| Configuration | `attainment_thresholds`, `assessment_weight_configs`, `direct_indirect_weight_configs`, `obe_settings` |
| Attainment | `co_attainment`, `po_direct_attainment`, `po_indirect_attainment`, `po_final_attainment`, `pso_direct_attainment`, `pso_indirect_attainment`, `pso_final_attainment` |
| CCA/ECA | `cca_activities`, `eca_activities` |
| Surveys | `surveys`, `survey_questions`, `survey_responses`, `survey_response_details`, `survey_attainment`, `employer_surveys`, `employer_survey_categories`, `employer_survey_ratings` |
| System | `reports`, `audit_logs` |

### Demo Seed Data

- ✅ 2 Departments (CS, IT)
- ✅ 1 Program (BE Computer Engineering)
- ✅ 2 Academic Years (2023-24, **2024-25 current**)
- ✅ **PO1–PO12** with NBA-standard descriptions
- ✅ **PSO1–PSO3**
- ✅ 6 Users (Super Admin, Admin, HOD, 3× Faculty)
- ✅ 11 Courses (theory + lab + project, from DYP OBE manual)
- ✅ 5 Course Outcomes for PC510CS (DBMS) with Bloom's levels
- ✅ **5×12 CO-PO mapping matrix**
- ✅ **5×3 CO-PSO mapping matrix**
- ✅ 20 Students enrolled in DBMS
- ✅ Internal Assessment + End Semester marks (20×5 = 100 mark entries per assessment)
- ✅ 6 CCA Activities + PO mappings
- ✅ 6 ECA Activities + PO mappings
- ✅ Alumni Survey with 10 responses
- ✅ Employer Survey (9 categories, 5 companies)
- ✅ Attainment thresholds (Level 0–3, configurable)
- ✅ Assessment weight configs (Internal 20%, ESE 60%, etc.)
- ✅ Direct/Indirect weight config (80%/20%, configurable)

---

## ⚙️ Quick Setup

### Prerequisites
- Node.js ≥ 18
- MySQL 8.0+
- npm ≥ 9

### Steps

```bash
# 1. Setup MySQL
mysql -u root -p -e "CREATE DATABASE obe_attainment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Configure backend
cd backend
copy .env.example .env
# Edit .env → update DATABASE_URL with your MySQL credentials

# 3. Run migrations (creates all 34 tables)
npm run db:migrate

# 4. Load demo data
npm run db:seed

# 5. Verify with Prisma Studio
npm run db:studio
```

### Alternative: Use standalone SQL
```bash
mysql -u root -p obe_attainment_db < database/migrations/001_initial_schema.sql
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@obe.edu | SuperAdmin@12345 |
| Admin | admin@obe.edu | Admin@12345 |
| HOD | hod.cs@obe.edu | Hod@12345 |
| Faculty | faculty1.cs@obe.edu | Faculty@12345 |

> ⚠️ **DEMO DATA** — Change all passwords before production use!

---

## 📐 OBE Formula Engine

The `formulaEngine.ts` implements all 12 calculation functions:

| Function | Purpose |
|----------|---------|
| `calculateCOAttainment()` | CO-level attainment from raw marks |
| `calculateDirectAttainment()` | Weighted direct CO attainment |
| `calculatePODirectAttainment()` | PO direct from CO-PO mapping |
| `calculatePSODirectAttainment()` | PSO direct from CO-PSO mapping |
| `calculateCCAAttainment()` | CCA indirect contribution per PO |
| `calculateECAAttainment()` | ECA indirect contribution per PO |
| `calculateSurveyAttainment()` | Survey rating → PO attainment |
| `calculateIndirectAttainment()` | Combined indirect from all sources |
| `calculateFinalPOAttainment()` | `Direct×80% + Indirect×20%` |
| `calculateFinalPSOAttainment()` | Same formula for PSOs |
| `calculateEmployerSurveyAttainment()` | Employer survey per category |
| `persistCOAttainment()` | Save results to DB |

All thresholds, weightages, and formulas are **database-driven** — not hard-coded.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Database | MySQL 8.0 |
| ORM | Prisma 5.22 |
| Backend | Node.js + Express + TypeScript |
| Authentication | JWT + bcrypt |
| Reports | Puppeteer (PDF) + ExcelJS (Excel) |
| Frontend | React + Vite + TypeScript + Tailwind *(Phase 8)* |
