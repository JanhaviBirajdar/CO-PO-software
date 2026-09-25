// ============================================================
// Attainment Routes
// ============================================================

import { Router } from 'express';
import { AttainmentController } from '../controllers/attainment.controller';
import { authenticate, isAdmin, isHOD, isFaculty } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// CO attainment
router.get('/attainment/co',             isFaculty, AttainmentController.getCOAttainment);
router.post('/attainment/co/calculate',  isFaculty, AttainmentController.calculateAndPersistCO);

// PO attainment
router.get('/attainment/po',             isHOD, AttainmentController.getPOAttainment);
router.post('/attainment/po/calculate',  isHOD, AttainmentController.calculateAndPersistPO);

// PSO attainment
router.get('/attainment/pso',            isHOD, AttainmentController.getPSOAttainment);
router.post('/attainment/pso/calculate', isHOD, AttainmentController.calculateAndPersistPSO);

// Indirect attainment
router.get('/attainment/indirect',       isHOD, AttainmentController.getIndirectAttainment);

// CCA / ECA attainment
router.get('/attainment/cca',            isFaculty, AttainmentController.getCCAAttainment);
router.get('/attainment/eca',            isFaculty, AttainmentController.getECAAttainment);

// Configuration
router.get('/attainment/config/thresholds',       isHOD,   AttainmentController.getThresholds);
router.post('/attainment/config/thresholds',      isAdmin, AttainmentController.saveThresholds);
router.get('/attainment/config/weights',          isHOD,   AttainmentController.getDirectIndirectWeight);
router.post('/attainment/config/weights',         isAdmin, AttainmentController.saveDirectIndirectWeight);
router.get('/attainment/config/settings',         isHOD,   AttainmentController.getObeSettings);
router.post('/attainment/config/settings',        isAdmin, AttainmentController.saveObeSettings);

export default router;
