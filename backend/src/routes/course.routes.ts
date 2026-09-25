// ============================================================
// Course, Outcome & Mapping Routes
// ============================================================

import { Router } from 'express';
import {
  CourseController,
  CourseOutcomeController,
  ProgramOutcomeController,
  PSOController,
  MappingController,
} from '../controllers/course.controller';
import { authenticate, isAdmin, isHOD, isFaculty } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// ─── Courses ────────────────────────────────────────────────
router.get('/courses',         isFaculty, CourseController.getAll);
router.get('/courses/:id',     isFaculty, CourseController.getById);
router.post('/courses',        isAdmin,   CourseController.create);
router.put('/courses/:id',     isAdmin,   CourseController.update);
router.delete('/courses/:id',  isAdmin,   CourseController.delete);

// ─── Course Outcomes (COs) ───────────────────────────────────
router.get('/cos',        isFaculty, CourseOutcomeController.getByCourse);
router.get('/cos/:id',    isFaculty, CourseOutcomeController.getById);
router.post('/cos',       isFaculty, CourseOutcomeController.create);
router.put('/cos/:id',    isFaculty, CourseOutcomeController.update);
router.delete('/cos/:id', isHOD,     CourseOutcomeController.delete);

// ─── Program Outcomes (POs) ──────────────────────────────────
router.get('/pos',            isFaculty, ProgramOutcomeController.getByProgram);
router.get('/pos/:id',        isFaculty, ProgramOutcomeController.getById);
router.post('/pos',           isAdmin,   ProgramOutcomeController.create);
router.post('/pos/bulk',      isAdmin,   ProgramOutcomeController.bulkUpsert);
router.put('/pos/:id',        isAdmin,   ProgramOutcomeController.update);
router.delete('/pos/:id',     isAdmin,   ProgramOutcomeController.delete);

// ─── PSOs ────────────────────────────────────────────────────
router.get('/psos',           isFaculty, PSOController.getByProgram);
router.post('/psos',          isAdmin,   PSOController.create);
router.put('/psos/:id',       isAdmin,   PSOController.update);
router.delete('/psos/:id',    isAdmin,   PSOController.delete);

// ─── CO-PO Mappings ─────────────────────────────────────────
router.get('/mappings/co-po',   isFaculty, MappingController.getCOPOMatrix);
router.post('/mappings/co-po',  isFaculty, MappingController.saveCOPOMatrix);

// ─── CO-PSO Mappings ─────────────────────────────────────────
router.get('/mappings/co-pso',  isFaculty, MappingController.getCOPSOMatrix);
router.post('/mappings/co-pso', isFaculty, MappingController.saveCOPSOMatrix);

export default router;
