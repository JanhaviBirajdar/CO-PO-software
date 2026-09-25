# OBE Attainment Calculation Formulas

> This document specifies every formula used in the OBE Attainment Management System.
> All thresholds and weightages are stored in the database and **configurable** by Admin/HOD.
> No formula is permanently hard-coded.

---

## 1. CO Attainment

### 1.1 Percentage of Students Above Threshold

For each CO in a course:

```
CO Percentage =
  (Number of students scoring ≥ threshold marks in CO)
  ─────────────────────────────────────────────────────
       Total number of students enrolled
   × 100
```

**Threshold Marks** (configurable per program):
- Default: students scoring ≥ 60% of max CO marks are counted.

### 1.2 CO Attainment Level

Using `attainment_thresholds` table:

| Level | Default Range     | Attainment Value |
|-------|-------------------|-----------------|
| 3     | CO% ≥ 70          | 3.00 |
| 2     | 60 ≤ CO% < 70     | 2.00 |
| 1     | 50 ≤ CO% < 60     | 1.00 |
| 0     | CO% < 50          | 0.00 |

Values are read from DB — **not hard-coded**.

---

## 2. Direct CO Attainment (from multiple assessments)

Each assessment has a configured weightage (from `assessment_weight_configs`).

```
Direct CO Attainment =
  Σ (Assessment_i CO Attainment × Assessment_i Weight)
  ────────────────────────────────────────────────────
               Σ (Assessment_i Weight)
```

**Default Weightage Example** (configurable):
| Assessment Type | Default Weight |
|----------------|---------------|
| Internal       | 20%           |
| End Semester   | 60%           |
| Assignment     | 20%           |

---

## 3. CO→PO Direct Attainment

For each PO:

```
PO Direct Contribution from CO_i =
  CO_i Attainment × CoPO_mapping_value(CO_i, PO_j)
  ──────────────────────────────────────────────────
                 max_mapping_scale (3)
```

Average across all mapped COs:

```
PO_j Direct Attainment =
  Σ [CO_i Attainment × CoPO(CO_i, PO_j)]    (for all CO_i where mapping > 0)
  ────────────────────────────────────────
           Σ CoPO(CO_i, PO_j)
```

This uses a **weighted average** — higher mapping values contribute more.

---

## 4. CO→PSO Direct Attainment

Same formula as CO→PO, using CO-PSO mapping:

```
PSO_k Direct Attainment =
  Σ [CO_i Attainment × CoPSO(CO_i, PSO_k)]
  ──────────────────────────────────────────
           Σ CoPSO(CO_i, PSO_k)
```

---

## 5. CCA Attainment (Indirect — CO-Curricular)

```
CCA PO_j Attainment =
  Σ (CCA_activity_i mapping(PO_j) × CCA_activity_i level)
  ──────────────────────────────────────────────────────────
               Number of CCA activities mapped to PO_j
```

- `mapping` = 0–3 (from `cca_po_mappings`)
- `level` = attainment level of the activity (0–3)

---

## 6. ECA Attainment (Indirect — Extra-Curricular)

```
ECA PO_j Attainment =
  Σ (ECA_activity_i mapping(PO_j) × ECA_activity_i level)
  ──────────────────────────────────────────────────────────
               Number of ECA activities mapped to PO_j
```

---

## 7. Survey Attainment

For each survey type (Alumni, Parent, Exit, Employer):

```
Survey Question Attainment =
  Average rating for question across all responses
  ─────────────────────────────────────────────────
               Maximum scale value (e.g., 5)
  × 3          (normalized to 0–3 scale)
```

```
PO_j Survey Attainment =
  Average of [Question Attainments for all questions mapped to PO_j]
```

---

## 8. Indirect PO Attainment

Combined from all indirect sources:

```
PO_j Indirect Attainment =
  (w_alumni × Alumni_PO_j)
+ (w_parent × Parent_PO_j)
+ (w_exit   × Exit_PO_j)
+ (w_employer × Employer_PO_j)
+ (w_cca    × CCA_PO_j)
+ (w_eca    × ECA_PO_j)
─────────────────────────
  (w_alumni + w_parent + w_exit + w_employer + w_cca + w_eca)
```

Default equal weights. Configurable in `obe_settings`.

---

## 9. Final PO Attainment

From `direct_indirect_weight_configs`:

```
Final PO_j Attainment =
  (Direct_PO_j × Direct_Weight)
+ (Indirect_PO_j × Indirect_Weight)
```

**Default**: Direct = 80%, Indirect = 20%

```
Final PO_j = (PO_j_Direct × 0.80) + (PO_j_Indirect × 0.20)
```

---

## 10. Final PSO Attainment

Same formula using PSO-specific direct/indirect values.

```
Final PSO_k = (PSO_k_Direct × Direct_Weight) + (PSO_k_Indirect × Indirect_Weight)
```

---

## 11. Employer Survey Attainment

```
Category_c Attainment =
  Σ (Rating_i for category_c) / Number of responses
  ──────────────────────────────────────────────────
                  Max scale (5)
  × 3
```

```
Overall Employer Attainment =
  Average of all Category Attainments
```

---

## Formula Engine API

All formulas are implemented in `backend/src/formula/` as pure functions:

| Function | Input | Output |
|----------|-------|--------|
| `calculateCOAttainment(courseId, assessmentConfig)` | Raw marks, thresholds | CO attainment value (0–3) |
| `calculateDirectAttainment(courseId, weightConfig)` | CO attainments, weights | Direct CO attainment |
| `calculatePODirectAttainment(programId, year)` | CO attainments, CO-PO mappings | PO direct values |
| `calculatePSODirectAttainment(programId, year)` | CO attainments, CO-PSO mappings | PSO direct values |
| `calculateCCAAttainment(academicYearId)` | CCA activities, PO mappings | CCA indirect per PO |
| `calculateECAAttainment(academicYearId)` | ECA activities, PO mappings | ECA indirect per PO |
| `calculateSurveyAttainment(surveyId)` | Survey responses | Survey PO attainment |
| `calculateIndirectAttainment(programId, year)` | All indirect sources | Weighted indirect per PO |
| `calculateFinalPOAttainment(programId, year)` | Direct + Indirect | Final PO values |
| `calculateFinalPSOAttainment(programId, year)` | Direct + Indirect | Final PSO values |

---

## Configuration Notes

> **IMPORTANT**: The system **never assumes** any specific institution formula.
> 
> Where formula documentation is incomplete:
> 1. The calculation is implemented as configurable
> 2. Admin/HOD can view and modify all weightages via the Settings page
> 3. Default values are clearly labeled as "DEFAULT — Please configure for your institution"
> 4. The formula used is displayed alongside every attainment report
