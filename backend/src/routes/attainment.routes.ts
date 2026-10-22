// ============================================================
// Attainment Routes
// ============================================================

import { Router } from 'express';
import { AttainmentController } from '../controllers/attainment.controller';
import { authenticate, isAdmin, isHOD, isFaculty, isManagement } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// ─── CO Attainment ────────────────────────────────────────────
router.get('/attainment/co/:courseId',       isFaculty,    AttainmentController.getCOAttainment);
router.get('/attainment/co',                 isFaculty,    AttainmentController.getCOAttainment);
router.post('/attainment/co/calculate',      isFaculty,    AttainmentController.calculateAndPersistCO);

// ─── PO Attainment ────────────────────────────────────────────
router.get('/attainment/po',                 isManagement, AttainmentController.getPOAttainment);
router.post('/attainment/po/calculate',      isFaculty,    AttainmentController.calculateAndPersistPO);

// ─── PSO Attainment ───────────────────────────────────────────
router.get('/attainment/pso',                isManagement, AttainmentController.getPSOAttainment);
router.post('/attainment/pso/calculate',     isFaculty,    AttainmentController.calculateAndPersistPSO);

// ─── Indirect Attainment ──────────────────────────────────────
router.get('/attainment/indirect',           isManagement, AttainmentController.getIndirectAttainment);

// ─── CCA / ECA Attainment ─────────────────────────────────────
router.get('/attainment/cca',                isManagement, AttainmentController.getCCAAttainment);
router.get('/attainment/eca',                isManagement, AttainmentController.getECAAttainment);

// ─── Survey Attainment ────────────────────────────────────────
router.get('/attainment/survey/:surveyId',   isManagement, AttainmentController.getSurveyAttainment);
router.get('/attainment/employer-survey',    isManagement, AttainmentController.getEmployerSurveyAttainment);

// ─── Full Report (calculate-all) ──────────────────────────────
router.post('/attainment/calculate-all',     isFaculty,    AttainmentController.calculateAll);

// ─── Configuration ────────────────────────────────────────────
router.get('/attainment/config/thresholds',       isManagement, AttainmentController.getThresholds);
router.post('/attainment/config/thresholds',      isAdmin,      AttainmentController.saveThresholds);
router.get('/attainment/config/weights',          isManagement, AttainmentController.getDirectIndirectWeight);
router.post('/attainment/config/weights',         isAdmin,      AttainmentController.saveDirectIndirectWeight);
router.get('/attainment/config/settings',         isManagement, AttainmentController.getObeSettings);
router.post('/attainment/config/settings',        isAdmin,      AttainmentController.saveObeSettings);

export default router;
