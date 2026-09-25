# OBE Attainment Management System — Design Decisions

This document records significant design decisions made during development where the specification was incomplete or ambiguous.

---

## DD-001: CO-PO Weighted Average Formula

**Date**: 2026-09-25  
**Decision**: For calculating PO direct attainment from CO attainments, use a **weighted average** where the mapping value (1–3) acts as the weight.

**Formula**:
```
PO_j = Σ(CO_i_attainment × CO_PO_mapping(i,j)) / Σ(CO_PO_mapping(i,j))
```

Only COs with mapping value > 0 are included.

**Reason**: This is the most common NBA/OBE practice. It ensures that COs with stronger PO correlation contribute proportionally more.

**Configurability**: The formula type is stored in `obe_settings` and can be changed to simple average if needed.

---

## DD-002: Global vs Program-Level Configuration

**Date**: 2026-09-25  
**Decision**: All configuration tables (`attainment_thresholds`, `assessment_weight_configs`, `direct_indirect_weight_configs`) support `programId = NULL` as a **global default**, and can be overridden per program.

**Reason**: Different programs (BE-CS vs ME-CS) may have different accreditation requirements.

---

## DD-003: Indirect Attainment Calculation Method

**Date**: 2026-09-25  
**Decision**: For indirect attainment, use equal weights across all survey types (Alumni, Parent, Exit, Employer, CCA, ECA) by default.

**Configurability**: Weights are stored in `obe_settings` as JSON and editable via Admin settings page.

---

## DD-004: Survey Rating Normalization

**Date**: 2026-09-25  
**Decision**: Survey ratings are normalized from their scale (1–5) to the attainment scale (0–3):

```
Normalized = (Average_Rating - scaleMin) / (scaleMax - scaleMin) × 3
```

**Reason**: Keeps all attainment values on the same 0–3 scale for final PO calculation.

---

## DD-005: CO Attainment Threshold Definition

**Date**: 2026-09-25  
**Decision**: The threshold for "student attains CO" is configurable (default 60% of CO max marks). Students scoring ≥ threshold are counted toward CO attainment percentage.

**Storage**: In `obe_settings` as `CO_PASS_THRESHOLD`.

---

## DD-006: Assessment CO-Wise Mark Entry

**Date**: 2026-09-25  
**Decision**: Marks are stored **per student, per assessment, per CO** in `student_assessment_marks`. This allows CO-wise attainment calculation without assumptions.

**Alternative considered**: Store only total marks per assessment. Rejected because this would prevent CO-wise disaggregation.

---

## DD-007: Audit Log Strategy

**Date**: 2026-09-25  
**Decision**: Implement application-level audit logging (not MySQL triggers) in the backend service layer. Store old and new values as text.

**Reason**: ORM-level triggers are complex. Application-level logging provides cleaner control and easier filtering.

---

## DD-008: Report Storage

**Date**: 2026-09-25  
**Decision**: Generated PDF/Excel reports are stored on the server filesystem (configurable path) with metadata in the `reports` table. File paths are returned to the frontend for download.

**Reason**: Storing binary blobs in MySQL is inefficient for large files.

---

## DD-009: PSO Count Configurability

**Date**: 2026-09-25  
**Decision**: PSO count is configurable per program. The system does not hard-code 3 PSOs. However, seed data provides PSO1–PSO3 as per the DYP COEI OBE manual.

---

## DD-010: Prisma ORM Choice

**Date**: 2026-09-25  
**Decision**: Use Prisma ORM over Sequelize or TypeORM.

**Reasons**:
1. Type-safe generated client
2. Excellent migration tooling
3. Prisma Studio for visual DB inspection
4. Better TypeScript integration
