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
  CourseAllocationController,
} from '../controllers/course.controller';
import { authenticate, isAdmin, isHOD, isFaculty, isManagement } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// ─── Courses ────────────────────────────────────────────────
router.get('/courses',              isManagement, CourseController.getAll);
router.get('/courses/:id(\\d+)',    isManagement, CourseController.getById);
router.post('/courses',             isFaculty,    CourseController.create);
router.put('/courses/:id(\\d+)',    isFaculty,    CourseController.update);
router.delete('/courses/:id(\\d+)', isHOD,        CourseController.delete);

// ─── Course Allocations (Subject, Class, Division to Faculty) ──
router.get('/courses/assignments',              isFaculty, CourseAllocationController.getAll);
router.get('/courses/my-assigned',               isFaculty, CourseAllocationController.getMyAssigned);
router.post('/courses/assignments',             isHOD,     CourseAllocationController.assign);
router.delete('/courses/assignments/:id(\\d+)', isHOD,     CourseAllocationController.unassign);

// ─── Course Outcomes (COs) ───────────────────────────────────
router.get('/cos',                     isFaculty, CourseOutcomeController.getByCourse);
router.get('/courses/:courseId/cos',   isFaculty, CourseOutcomeController.getByCourse);
router.get('/cos/:id',                 isFaculty, CourseOutcomeController.getById);
router.post('/cos',                    isFaculty, CourseOutcomeController.create);
router.post('/courses/:courseId/cos',  isFaculty, CourseOutcomeController.create);
router.put('/cos/:id',                 isFaculty, CourseOutcomeController.update);
router.delete('/cos/:id',              isHOD,     CourseOutcomeController.delete);

// ─── Program Outcomes (POs) ──────────────────────────────────
router.get('/pos',            isFaculty, ProgramOutcomeController.getByProgram);
router.get('/courses/pos',    isFaculty, ProgramOutcomeController.getByProgram);
router.get('/pos/:id',        isFaculty, ProgramOutcomeController.getById);
router.post('/pos',           isAdmin,   ProgramOutcomeController.create);
router.post('/pos/bulk',      isAdmin,   ProgramOutcomeController.bulkUpsert);
router.put('/pos/:id',        isAdmin,   ProgramOutcomeController.update);
router.delete('/pos/:id',     isAdmin,   ProgramOutcomeController.delete);

// ─── PSOs ────────────────────────────────────────────────────
router.get('/psos',           isFaculty, PSOController.getByProgram);
router.get('/courses/psos',   isFaculty, PSOController.getByProgram);
router.post('/psos',          isAdmin,   PSOController.create);
router.put('/psos/:id',       isAdmin,   PSOController.update);
router.delete('/psos/:id',    isAdmin,   PSOController.delete);

// ─── CO-PO Mappings ─────────────────────────────────────────
router.get('/mappings/co-po',                   isFaculty, MappingController.getCOPOMatrix);
router.get('/courses/:courseId/co-po-matrix',   isFaculty, MappingController.getCOPOMatrix);
router.post('/mappings/co-po',                  isFaculty, MappingController.saveCOPOMatrix);
router.post('/courses/co-po-mappings/bulk',     isFaculty, MappingController.saveCOPOMatrix);

// ─── CO-PSO Mappings ─────────────────────────────────────────
router.get('/mappings/co-pso',                  isFaculty, MappingController.getCOPSOMatrix);
router.get('/courses/:courseId/co-pso-matrix',  isFaculty, MappingController.getCOPSOMatrix);
router.post('/mappings/co-pso',                 isFaculty, MappingController.saveCOPSOMatrix);
router.post('/courses/co-pso-mappings/bulk',    isFaculty, MappingController.saveCOPSOMatrix);

export default router;
