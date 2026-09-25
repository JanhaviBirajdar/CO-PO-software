// ============================================================
// Attainment Controller — all formula-engine endpoints
// ============================================================

import { Request, Response, NextFunction } from 'express';
import {
  calculateCOAttainment,
  calculateFinalPOAttainment,
  calculateFinalPSOAttainment,
  calculateCCAAttainment,
  calculateECAAttainment,
  calculateIndirectAttainment,
  calculateSurveyAttainment,
  calculateEmployerSurveyAttainment,
  calculateAndPersistFullReport,
  persistCOAttainment,
} from '../formula/formulaEngine';
import { AttainmentConfigRepository } from '../repositories/activity.repository';
import { prisma } from '../config/prisma';
import { logAudit } from '../middleware/audit.middleware';

export const AttainmentController = {

  // ─── CO Attainment ─────────────────────────────────────────

  /** GET /api/v1/attainment/co/:courseId */
  async getCOAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = Number(req.params.courseId ?? req.query.courseId);
      if (!courseId) return res.status(400).json({ success: false, error: 'courseId is required' });
      const programId = req.query.programId ? Number(req.query.programId) : undefined;
      const data = await calculateCOAttainment(courseId, programId);
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** POST /api/v1/attainment/co/calculate — persists to DB */
  async calculateAndPersistCO(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, programId } = req.body;
      if (!courseId) return res.status(400).json({ success: false, error: 'courseId is required' });
      const data = await persistCOAttainment(Number(courseId), programId ? Number(programId) : undefined);
      await logAudit({ tableName: 'co_attainment', recordId: courseId, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'CO attainment calculated and saved', data });
    } catch (err) { next(err); }
  },

  // ─── PO Attainment ─────────────────────────────────────────

  /** GET /api/v1/attainment/po?programId=&academicYearId= */
  async getPOAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, error: 'programId and academicYearId are required' });
      const data = await calculateFinalPOAttainment(Number(programId), Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** POST /api/v1/attainment/po/calculate */
  async calculateAndPersistPO(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.body;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, error: 'programId and academicYearId required' });

      const results = await calculateFinalPOAttainment(Number(programId), Number(academicYearId));

      for (const r of results) {
        const existing = await prisma.poFinalAttainment.findFirst({
          where: { programOutcomeId: r.programOutcomeId, academicYearId: Number(academicYearId) },
        });
        if (existing) {
          await prisma.poFinalAttainment.update({
            where: { id: existing.id },
            data: { directValue: r.directAttainment, indirectValue: r.indirectAttainment, finalValue: r.finalAttainment, calculatedAt: new Date() },
          });
        } else {
          await prisma.poFinalAttainment.create({
            data: {
              programOutcomeId: r.programOutcomeId, academicYearId: Number(academicYearId),
              directValue: r.directAttainment, indirectValue: r.indirectAttainment,
              finalValue: r.finalAttainment, directWeight: r.directWeight, indirectWeight: r.indirectWeight,
            },
          });
        }
      }

      await logAudit({ tableName: 'po_final_attainment', recordId: Number(programId), action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'PO attainment calculated and saved', data: results });
    } catch (err) { next(err); }
  },

  // ─── PSO Attainment ────────────────────────────────────────

  /** GET /api/v1/attainment/pso?programId=&academicYearId= */
  async getPSOAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, error: 'programId and academicYearId are required' });
      const data = await calculateFinalPSOAttainment(Number(programId), Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** POST /api/v1/attainment/pso/calculate */
  async calculateAndPersistPSO(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.body;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, error: 'programId and academicYearId required' });

      const results = await calculateFinalPSOAttainment(Number(programId), Number(academicYearId));

      for (const r of results) {
        const existing = await prisma.psoFinalAttainment.findFirst({
          where: { psoId: r.psoId, academicYearId: Number(academicYearId) },
        });
        if (existing) {
          await prisma.psoFinalAttainment.update({
            where: { id: existing.id },
            data: { directValue: r.directAttainment, indirectValue: r.indirectAttainment, finalValue: r.finalAttainment, calculatedAt: new Date() },
          });
        } else {
          await prisma.psoFinalAttainment.create({
            data: {
              psoId: r.psoId, academicYearId: Number(academicYearId),
              directValue: r.directAttainment, indirectValue: r.indirectAttainment,
              finalValue: r.finalAttainment, directWeight: 80, indirectWeight: 20,
            },
          });
        }
      }

      await logAudit({ tableName: 'pso_final_attainment', recordId: Number(programId), action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'PSO attainment calculated and saved', data: results });
    } catch (err) { next(err); }
  },

  // ─── Indirect Attainment ──────────────────────────────────

  /** GET /api/v1/attainment/indirect?programId=&academicYearId= */
  async getIndirectAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, error: 'programId and academicYearId required' });
      const result = await calculateIndirectAttainment(Number(programId), Number(academicYearId));
      return res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  // ─── CCA / ECA Attainment ─────────────────────────────────

  /** GET /api/v1/attainment/cca?academicYearId=&programId= */
  async getCCAAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId, programId } = req.query;
      if (!academicYearId) return res.status(400).json({ success: false, error: 'academicYearId required' });
      const data = await calculateCCAAttainment(Number(academicYearId), programId ? Number(programId) : undefined);
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/attainment/eca?academicYearId=&programId= */
  async getECAAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId, programId } = req.query;
      if (!academicYearId) return res.status(400).json({ success: false, error: 'academicYearId required' });
      const data = await calculateECAAttainment(Number(academicYearId), programId ? Number(programId) : undefined);
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // ─── Survey Attainment ────────────────────────────────────

  /** GET /api/v1/attainment/survey/:surveyId */
  async getSurveyAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const surveyId = Number(req.params.surveyId);
      if (!surveyId) return res.status(400).json({ success: false, error: 'surveyId required' });
      const data = await calculateSurveyAttainment(surveyId);
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/v1/attainment/employer-survey?academicYearId= */
  async getEmployerSurveyAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId, scaleMax } = req.query;
      if (!academicYearId) return res.status(400).json({ success: false, error: 'academicYearId required' });
      const data = await calculateEmployerSurveyAttainment(
        Number(academicYearId),
        scaleMax ? Number(scaleMax) : undefined
      );
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // ─── Full Report (calculate all, persist all) ─────────────

  /** POST /api/v1/attainment/calculate-all */
  async calculateAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.body;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, error: 'programId and academicYearId required' });

      const report = await calculateAndPersistFullReport(Number(programId), Number(academicYearId));

      await logAudit({
        tableName: 'full_attainment_report',
        recordId: Number(programId),
        action: 'CALCULATE',
        userId: req.user?.userId,
      });

      return res.json({
        success: true,
        message: 'Full OBE attainment calculated and persisted',
        data: report,
      });
    } catch (err) { next(err); }
  },

  // ─── Configuration Endpoints ──────────────────────────────

  async getThresholds(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.query;
      const data = await AttainmentConfigRepository.getThresholds(programId ? Number(programId) : undefined);
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async saveThresholds(req: Request, res: Response, next: NextFunction) {
    try {
      const { thresholds, programId } = req.body;
      if (!Array.isArray(thresholds)) return res.status(400).json({ success: false, error: 'thresholds must be an array' });
      const data = await AttainmentConfigRepository.saveThresholds(thresholds, programId);
      await logAudit({ tableName: 'attainment_thresholds', recordId: 0, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Thresholds saved', data });
    } catch (err) { next(err); }
  },

  async getDirectIndirectWeight(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.query;
      const data = await AttainmentConfigRepository.getDirectIndirectWeight(programId ? Number(programId) : undefined);
      return res.json({ success: true, data: data ?? { directWeight: 80, indirectWeight: 20 } });
    } catch (err) { next(err); }
  },

  async saveDirectIndirectWeight(req: Request, res: Response, next: NextFunction) {
    try {
      const { directWeight, indirectWeight, programId } = req.body;
      if (directWeight + indirectWeight !== 100)
        return res.status(400).json({ success: false, error: 'directWeight + indirectWeight must equal 100' });
      const data = await AttainmentConfigRepository.saveDirectIndirectWeight(directWeight, indirectWeight, programId);
      await logAudit({ tableName: 'direct_indirect_weight_configs', recordId: 0, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Weights saved', data });
    } catch (err) { next(err); }
  },

  async getObeSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.query;
      const data = await AttainmentConfigRepository.getObeSettings(programId ? Number(programId) : undefined);
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async saveObeSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings, programId } = req.body;
      const data = await AttainmentConfigRepository.saveObeSettings(settings, programId);
      return res.json({ success: true, message: 'Settings saved', data });
    } catch (err) { next(err); }
  },
};
