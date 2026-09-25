// ============================================================
// CCA / ECA / Survey Controllers
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { SurveyType } from '@prisma/client';
import { CCARepository, ECARepository, SurveyRepository, EmployerSurveyRepository } from '../repositories/activity.repository';
import { calculateSurveyAttainment, calculateEmployerSurveyAttainment } from '../formula/formulaEngine';
import { logAudit } from '../middleware/audit.middleware';

// ─── CCA ──────────────────────────────────────────────────────
export const CCAController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId } = req.query;
      const data = await CCARepository.findAll(academicYearId ? Number(academicYearId) : undefined);
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CCARepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'CCA activity not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CCARepository.create(req.body);
      await logAudit({ tableName: 'cca_activities', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'CCA activity created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await CCARepository.update(id, req.body);
      await logAudit({ tableName: 'cca_activities', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'CCA activity updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CCARepository.delete(Number(req.params.id));
      return res.json({ success: true, message: 'CCA activity deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── ECA ──────────────────────────────────────────────────────
export const ECAController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId, category } = req.query;
      const data = await ECARepository.findAll(
        academicYearId ? Number(academicYearId) : undefined,
        category as string,
      );
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ECARepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'ECA activity not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ECARepository.create(req.body);
      await logAudit({ tableName: 'eca_activities', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'ECA activity created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await ECARepository.update(id, req.body);
      await logAudit({ tableName: 'eca_activities', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'ECA activity updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ECARepository.delete(Number(req.params.id));
      return res.json({ success: true, message: 'ECA activity deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Survey ───────────────────────────────────────────────────
export const SurveyController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId, surveyType } = req.query;
      const data = await SurveyRepository.findAll(
        academicYearId ? Number(academicYearId) : undefined,
        surveyType as SurveyType,
      );
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SurveyRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Survey not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SurveyRepository.create(req.body);
      await logAudit({ tableName: 'surveys', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Survey created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await SurveyRepository.update(id, req.body);
      return res.json({ success: true, message: 'Survey updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SurveyRepository.delete(Number(req.params.id));
      return res.json({ success: true, message: 'Survey deactivated' });
    } catch (err) { next(err); }
  },
  async addQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SurveyRepository.addQuestion(req.body);
      return res.status(201).json({ success: true, message: 'Question added', data });
    } catch (err) { next(err); }
  },
  async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      await SurveyRepository.deleteQuestion(Number(req.params.id));
      return res.json({ success: true, message: 'Question removed' });
    } catch (err) { next(err); }
  },
  async submitResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SurveyRepository.submitResponse(req.body);
      return res.status(201).json({ success: true, message: 'Response submitted', data });
    } catch (err) { next(err); }
  },
  async getResponses(req: Request, res: Response, next: NextFunction) {
    try {
      const { surveyId } = req.query;
      if (!surveyId) return res.status(400).json({ success: false, message: 'surveyId required' });
      const data = await SurveyRepository.getResponses(Number(surveyId));
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { surveyId } = req.query;
      if (!surveyId) return res.status(400).json({ success: false, message: 'surveyId required' });
      const data = await calculateSurveyAttainment(Number(surveyId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};

// ─── Employer Survey ──────────────────────────────────────────
export const EmployerSurveyController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId } = req.query;
      const data = await EmployerSurveyRepository.findAll(academicYearId ? Number(academicYearId) : undefined);
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await EmployerSurveyRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Employer survey not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await EmployerSurveyRepository.getCategories();
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await EmployerSurveyRepository.create(req.body);
      return res.status(201).json({ success: true, message: 'Employer survey submitted', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await EmployerSurveyRepository.delete(Number(req.params.id));
      return res.json({ success: true, message: 'Employer survey deleted' });
    } catch (err) { next(err); }
  },
  async getAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId } = req.query;
      if (!academicYearId) return res.status(400).json({ success: false, message: 'academicYearId required' });
      const data = await calculateEmployerSurveyAttainment(Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};
