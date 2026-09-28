// ============================================================
// Question Bank & Blueprint Controller
// DYP COEI OBE Process Implementation
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { questionBankService } from '../services/questionBank.service';

export class QuestionBankController {
  public async createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createdById = req.user?.userId || 1;
      const question = await questionBankService.createQuestion({
        ...req.body,
        createdById,
      });
      res.json({ success: true, data: question, message: 'Question created successfully in Question Bank' });
    } catch (err) {
      next(err);
    }
  }

  public async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string, 10) : undefined;
      const courseOutcomeId = req.query.courseOutcomeId ? parseInt(req.query.courseOutcomeId as string, 10) : undefined;
      const bloomLevelId = req.query.bloomLevelId ? parseInt(req.query.bloomLevelId as string, 10) : undefined;
      const unit = req.query.unit ? parseInt(req.query.unit as string, 10) : undefined;
      const difficulty = req.query.difficulty as string;
      const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string, 10) : undefined;

      const questions = await questionBankService.getQuestions({
        courseId,
        courseOutcomeId,
        bloomLevelId,
        unit,
        difficulty,
        academicYearId,
      });

      res.json({ success: true, data: questions });
    } catch (err) {
      next(err);
    }
  }

  public async createBlueprint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createdById = req.user?.userId || 1;
      const blueprint = await questionBankService.createBlueprint({
        ...req.body,
        createdById,
      });
      res.json({ success: true, data: blueprint, message: 'Question paper blueprint created successfully' });
    } catch (err) {
      next(err);
    }
  }

  public async getBlueprints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string, 10) : undefined;
      const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string, 10) : undefined;

      const list = await questionBankService.getBlueprints(courseId, academicYearId);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  public async createQuestionPaper(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createdById = req.user?.userId || 1;
      const paper = await questionBankService.createQuestionPaper({
        ...req.body,
        createdById,
      });
      res.json({ success: true, data: paper, message: 'Question paper created & analyzed successfully' });
    } catch (err) {
      next(err);
    }
  }

  public async getQuestionPapers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string, 10) : undefined;
      const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string, 10) : undefined;

      const list = await questionBankService.getQuestionPapers(courseId, academicYearId);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  public async getQuestionPaperDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const details = await questionBankService.getQuestionPaperDetails(id);
      res.json({ success: true, data: details });
    } catch (err) {
      next(err);
    }
  }
}

export const questionBankController = new QuestionBankController();
