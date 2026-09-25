// ============================================================
// Attainment Routes
// ============================================================

import { Router } from 'express';
import { AttainmentController } from '../controllers/attainment.controller';
import { authenticate, isAdmin, isHOD, isFaculty } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// ─── CO Attainment ────────────────────────────────────────────
router.get('/attainment/co/:courseId',       isFaculty, AttainmentController.getCOAttainment);
router.get('/attainment/co',                 isFaculty, AttainmentController.getCOAttainment);
router.post('/attainment/co/calculate',      isFaculty, AttainmentController.calculateAndPersistCO);

// ─── PO Attainment ────────────────────────────────────────────
router.get('/attainment/po',                 isHOD, AttainmentController.getPOAttainment);
router.post('/attainment/po/calculate',      isHOD, AttainmentController.calculateAndPersistPO);

// ─── PSO Attainment ───────────────────────────────────────────
router.get('/attainment/pso',                isHOD, AttainmentController.getPSOAttainment);
router.post('/attainment/pso/calculate',     isHOD, AttainmentController.calculateAndPersistPSO);

// ─── Indirect Attainment ──────────────────────────────────────
router.get('/attainment/indirect',           isHOD, AttainmentController.getIndirectAttainment);

// ─── CCA / ECA Attainment ─────────────────────────────────────
router.get('/attainment/cca',                isFaculty, AttainmentController.getCCAAttainment);
router.get('/attainment/eca',                isFaculty, AttainmentController.getECAAttainment);

// ─── Survey Attainment ────────────────────────────────────────
router.get('/attainment/survey/:surveyId',   isFaculty, AttainmentController.getSurveyAttainment);
router.get('/attainment/employer-survey',    isHOD, AttainmentController.getEmployerSurveyAttainment);

// ─── Full Report (calculate-all) ──────────────────────────────
router.post('/attainment/calculate-all',     isHOD, AttainmentController.calculateAll);

// ─── Configuration ────────────────────────────────────────────
router.get('/attainment/config/thresholds',       isHOD,   AttainmentController.getThresholds);
router.post('/attainment/config/thresholds',      isAdmin, AttainmentController.saveThresholds);
router.get('/attainment/config/weights',          isHOD,   AttainmentController.getDirectIndirectWeight);
router.post('/attainment/config/weights',         isAdmin, AttainmentController.saveDirectIndirectWeight);
router.get('/attainment/config/settings',         isHOD,   AttainmentController.getObeSettings);
router.post('/attainment/config/settings',        isAdmin, AttainmentController.saveObeSettings);

export default router;
