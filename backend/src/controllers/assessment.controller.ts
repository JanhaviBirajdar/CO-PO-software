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
      if (!courseId) {
        const data = await AssessmentRepository.findAll();
        return res.json({ success: true, data, count: data.length });
      }
      const cId = Number(courseId);
      if (isNaN(cId)) return res.status(400).json({ success: false, message: 'Invalid courseId' });
      const data = await AssessmentRepository.findByCourse(cId);
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Valid assessment id required' });
      const data = await AssessmentRepository.findById(id);
      if (!data) return res.status(404).json({ success: false, message: 'Assessment not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, courseId } = req.body;
      if (!name || !courseId) {
        return res.status(400).json({ success: false, message: 'Assessment name and courseId are required' });
      }
      const data = await AssessmentRepository.create(req.body);
      await logAudit({ tableName: 'assessments', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Assessment created', data });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Valid assessment id required' });
      const data = await AssessmentRepository.update(id, req.body);
      await logAudit({ tableName: 'assessments', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Assessment updated', data });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ success: false, message: 'Valid assessment id required' });
      await AssessmentRepository.delete(id);
      return res.json({ success: true, message: 'Assessment deactivated' });
    } catch (err) { next(err); }
  },

  // Marks
  async submitMarks(req: Request, res: Response, next: NextFunction) {
    try {
      const assessmentId = Number(req.body.assessmentId || req.params.id);
      const rawMarks = req.body.marks ?? (Array.isArray(req.body) ? req.body : null);
      if (!assessmentId || isNaN(assessmentId)) {
        return res.status(400).json({ success: false, message: 'Valid assessmentId is required' });
      }
      if (!Array.isArray(rawMarks)) {
        return res.status(400).json({ success: false, message: 'marks array is required' });
      }
      const data = await AssessmentRepository.submitMarks(
        rawMarks.map((m: any) => ({ ...m, assessmentId }))
      );
      await logAudit({ tableName: 'student_assessment_marks', recordId: assessmentId, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: `Marks submitted successfully for ${data.length} students`, count: data.length });
    } catch (err) { next(err); }
  },

  async getMarksByAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.id || req.query.assessmentId;
      const assessmentId = Number(rawId);
      if (!assessmentId || isNaN(assessmentId)) {
        return res.status(400).json({ success: false, message: 'Valid assessmentId required' });
      }
      const data = await AssessmentRepository.getMarksByAssessment(assessmentId);
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  async getMarksByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query;
      const cId = Number(courseId);
      if (!courseId || isNaN(cId)) {
        return res.status(400).json({ success: false, message: 'Valid courseId required' });
      }
      const data = await AssessmentRepository.getMarksByCourse(cId);
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
};
