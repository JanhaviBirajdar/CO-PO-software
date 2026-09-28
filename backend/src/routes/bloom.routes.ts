// ============================================================
// Bloom's Taxonomy Routes
// DYP COEI OBE Process Implementation
// ============================================================

import { Router } from 'express';
import { bloomController } from '../controllers/bloom.controller';
import { authenticate, isFaculty, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Public/Faculty endpoints
router.get('/levels', bloomController.getBloomLevels.bind(bloomController));
router.get('/verbs', bloomController.getBloomVerbs.bind(bloomController));
router.post('/suggest', bloomController.suggestBloomLevel.bind(bloomController));
router.post('/validate-co', bloomController.validateCOBloomLevel.bind(bloomController));
router.post('/check-quality', bloomController.checkCOQuality.bind(bloomController));
router.post('/generate-ai-co', bloomController.generateAICourseOutcome.bind(bloomController));
router.get('/analytics', bloomController.getBloomAnalytics.bind(bloomController));

// Admin endpoints
router.put('/levels/:id', isAdmin, bloomController.updateBloomLevel.bind(bloomController));
router.post('/verbs', isAdmin, bloomController.addBloomVerb.bind(bloomController));

export default router;
