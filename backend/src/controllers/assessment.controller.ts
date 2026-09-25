// ============================================================
// Assessment Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { AssessmentRepository } from '../repositories/assessment.repository';
import { logAudit } from '../middleware/audit.middleware';

export const AssessmentController = {

  async getByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query;
      if (!courseId) return res.status(400).json({ success: false, message: 'courseId required' });
      const data = await AssessmentRepository.findByCourse(Number(courseId));
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AssessmentRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Assessment not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AssessmentRepository.create(req.body);
      await logAudit({ tableName: 'assessments', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Assessment created', data });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await AssessmentRepository.update(id, req.body);
      await logAudit({ tableName: 'assessments', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Assessment updated', data });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await AssessmentRepository.delete(Number(req.params.id));
      return res.json({ success: true, message: 'Assessment deactivated' });
    } catch (err) { next(err); }
  },

  // Marks
  async submitMarks(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId, marks } = req.body;
      const data = await AssessmentRepository.submitMarks(
        marks.map((m: any) => ({ ...m, assessmentId }))
      );
      await logAudit({ tableName: 'student_assessment_marks', recordId: assessmentId, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Marks submitted', count: data.length });
    } catch (err) { next(err); }
  },

  async getMarksByAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const { assessmentId } = req.query;
      if (!assessmentId) return res.status(400).json({ success: false, message: 'assessmentId required' });
      const data = await AssessmentRepository.getMarksByAssessment(Number(assessmentId));
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  async getMarksByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query;
      if (!courseId) return res.status(400).json({ success: false, message: 'courseId required' });
      const data = await AssessmentRepository.getMarksByCourse(Number(courseId));
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
};
