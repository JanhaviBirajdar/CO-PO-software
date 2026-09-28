// ============================================================
// Question Bank Routes
// DYP COEI OBE Process Implementation
// ============================================================

import { Router } from 'express';
import { questionBankController } from '../controllers/questionBank.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/questions', questionBankController.createQuestion.bind(questionBankController));
router.get('/questions', questionBankController.getQuestions.bind(questionBankController));

router.post('/blueprints', questionBankController.createBlueprint.bind(questionBankController));
router.get('/blueprints', questionBankController.getBlueprints.bind(questionBankController));

router.post('/papers', questionBankController.createQuestionPaper.bind(questionBankController));
router.get('/papers', questionBankController.getQuestionPapers.bind(questionBankController));
router.get('/papers/:id', questionBankController.getQuestionPaperDetails.bind(questionBankController));

export default router;
