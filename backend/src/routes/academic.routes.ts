// ============================================================
// Academic Setup Routes
// ============================================================

import { Router } from 'express';
import {
  DepartmentController,
  ProgramController,
  AcademicYearController,
  BatchController,
  SemesterController,
  StudentController,
} from '../controllers/academic.controller';
import { authenticate, isAdmin, isHOD, isFaculty } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// ─── Departments ─────────────────────────────────────────────
router.get('/departments',        isFaculty, DepartmentController.getAll);
router.get('/departments/:id',    isFaculty, DepartmentController.getById);
router.post('/departments',       isAdmin,   DepartmentController.create);
router.put('/departments/:id',    isAdmin,   DepartmentController.update);
router.delete('/departments/:id', isAdmin,   DepartmentController.delete);

// ─── Programs ────────────────────────────────────────────────
router.get('/programs',        isFaculty, ProgramController.getAll);
router.get('/programs/:id',    isFaculty, ProgramController.getById);
router.post('/programs',       isAdmin,   ProgramController.create);
router.put('/programs/:id',    isAdmin,   ProgramController.update);
router.delete('/programs/:id', isAdmin,   ProgramController.delete);

// ─── Academic Years ──────────────────────────────────────────
router.get('/academic-years',         isFaculty, AcademicYearController.getAll);
router.get('/academic-years/current', isFaculty, AcademicYearController.getCurrent);
router.get('/academic-years/:id',     isFaculty, AcademicYearController.getById);
router.post('/academic-years',        isAdmin,   AcademicYearController.create);
router.put('/academic-years/:id',     isAdmin,   AcademicYearController.update);
router.delete('/academic-years/:id',  isAdmin,   AcademicYearController.delete);

// ─── Batches ─────────────────────────────────────────────────
router.get('/batches',        isFaculty, BatchController.getAll);
router.get('/batches/:id',    isFaculty, BatchController.getById);
router.post('/batches',       isAdmin,   BatchController.create);
router.put('/batches/:id',    isAdmin,   BatchController.update);
router.delete('/batches/:id', isAdmin,   BatchController.delete);

// ─── Semesters ───────────────────────────────────────────────
router.get('/semesters',        isFaculty, SemesterController.getAll);
router.post('/semesters',       isAdmin,   SemesterController.create);
router.put('/semesters/:id',    isAdmin,   SemesterController.update);
router.delete('/semesters/:id', isAdmin,   SemesterController.delete);

// ─── Students ────────────────────────────────────────────────
router.get('/students',                   isFaculty, StudentController.getAll);
router.get('/students/:id',               isFaculty, StudentController.getById);
router.post('/students',                  isHOD,     StudentController.create);
router.put('/students/:id',               isHOD,     StudentController.update);
router.delete('/students/:id',            isAdmin,   StudentController.delete);
router.post('/students/enroll',           isHOD,     StudentController.enrollCourse);

export default router;
