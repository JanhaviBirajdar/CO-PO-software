// ============================================================
// Assessment Routes
// ============================================================

import { Router } from 'express';
import { AssessmentController } from '../controllers/assessment.controller';
import { authenticate, isHOD, isFaculty } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/assessments',             isFaculty, AssessmentController.getByCourse);
router.get('/assessments/:id',         isFaculty, AssessmentController.getById);
router.post('/assessments',            isFaculty, AssessmentController.create);
router.put('/assessments/:id',         isFaculty, AssessmentController.update);
router.delete('/assessments/:id',      isHOD,     AssessmentController.delete);

// Marks
router.post('/marks',                  isFaculty, AssessmentController.submitMarks);
router.get('/marks/by-assessment',     isFaculty, AssessmentController.getMarksByAssessment);
router.get('/marks/by-course',         isFaculty, AssessmentController.getMarksByCourse);

export default router;
