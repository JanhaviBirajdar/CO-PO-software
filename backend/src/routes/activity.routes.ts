// ============================================================
// Activity Routes — CCA, ECA, Surveys, Employer Survey
// ============================================================

import { Router } from 'express';
import {
  CCAController,
  ECAController,
  SurveyController,
  EmployerSurveyController,
} from '../controllers/activity.controller';
import { authenticate, isAdmin, isHOD, isFaculty } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// ─── CCA ────────────────────────────────────────────────────
router.get('/cca',         isFaculty, CCAController.getAll);
router.get('/cca/:id',     isFaculty, CCAController.getById);
router.post('/cca',        isFaculty, CCAController.create);
router.put('/cca/:id',     isFaculty, CCAController.update);
router.delete('/cca/:id',  isHOD,     CCAController.delete);

// ─── ECA ────────────────────────────────────────────────────
router.get('/eca',         isFaculty, ECAController.getAll);
router.get('/eca/:id',     isFaculty, ECAController.getById);
router.post('/eca',        isFaculty, ECAController.create);
router.put('/eca/:id',     isFaculty, ECAController.update);
router.delete('/eca/:id',  isHOD,     ECAController.delete);

// ─── Surveys ─────────────────────────────────────────────────
// IMPORTANT: Static sub-routes MUST come before dynamic :id route
router.get('/surveys',                   isFaculty, SurveyController.getAll);
router.post('/surveys',                  isHOD,     SurveyController.create);

// Static sub-routes (before /:id to prevent routing conflicts)
router.get('/surveys/attainment',        isHOD,     SurveyController.getAttainment);
router.get('/surveys/responses',         isHOD,     SurveyController.getResponses);
router.post('/surveys/questions',        isHOD,     SurveyController.addQuestion);
router.post('/surveys/responses',        isFaculty, SurveyController.submitResponse);
router.delete('/surveys/questions/:id',  isHOD,     SurveyController.deleteQuestion);

// Dynamic :id routes (after static sub-routes)
router.get('/surveys/:id',               isFaculty, SurveyController.getById);
router.put('/surveys/:id',               isHOD,     SurveyController.update);
router.delete('/surveys/:id',            isAdmin,   SurveyController.delete);

// ─── Employer Survey ─────────────────────────────────────────
// Static sub-routes before dynamic :id
router.get('/employer-surveys',              isHOD, EmployerSurveyController.getAll);
router.get('/employer-surveys/categories',   isFaculty, EmployerSurveyController.getCategories);
router.get('/employer-surveys/attainment',   isHOD, EmployerSurveyController.getAttainment);
router.post('/employer-surveys',             isFaculty, EmployerSurveyController.create);
router.get('/employer-surveys/:id',          isHOD, EmployerSurveyController.getById);
router.delete('/employer-surveys/:id',       isAdmin, EmployerSurveyController.delete);

export default router;
