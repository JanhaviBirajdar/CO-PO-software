// ============================================================
// Attainment Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import {
  calculateCOAttainment,
  calculateFinalPOAttainment,
  calculateFinalPSOAttainment,
  calculateCCAAttainment,
  calculateECAAttainment,
  calculateIndirectAttainment,
  persistCOAttainment,
} from '../formula/formulaEngine';
import { AttainmentConfigRepository } from '../repositories/activity.repository';
import { prisma } from '../config/prisma';
import { logAudit } from '../middleware/audit.middleware';

export const AttainmentController = {

  // GET /api/attainment/co?courseId=&programId=
  async getCOAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, programId } = req.query;
      if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });
      const data = await calculateCOAttainment(Number(courseId), programId ? Number(programId) : undefined);
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // POST /api/attainment/co/calculate — persists to DB
  async calculateAndPersistCO(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, programId } = req.body;
      if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });
      const data = await persistCOAttainment(Number(courseId), programId ? Number(programId) : undefined);
      await logAudit({ tableName: 'co_attainment', recordId: courseId, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'CO attainment calculated and saved', data });
    } catch (err) { next(err); }
  },

  // GET /api/attainment/po?programId=&academicYearId=
  async getPOAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, message: 'programId and academicYearId are required' });
      const data = await calculateFinalPOAttainment(Number(programId), Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // POST /api/attainment/po/calculate
  async calculateAndPersistPO(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.body;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, message: 'programId and academicYearId required' });

      const results = await calculateFinalPOAttainment(Number(programId), Number(academicYearId));

      // Persist to DB
      for (const r of results) {
        await prisma.poFinalAttainment.upsert({
          where: { programOutcomeId_academicYearId: { programOutcomeId: r.programOutcomeId, academicYearId: Number(academicYearId) } },
          create: {
            programOutcomeId: r.programOutcomeId,
            academicYearId:   Number(academicYearId),
            directValue:      r.directAttainment,
            indirectValue:    r.indirectAttainment,
            finalValue:       r.finalAttainment,
            directWeight:     r.directWeight,
            indirectWeight:   r.indirectWeight,
          },
          update: {
            directValue:    r.directAttainment,
            indirectValue:  r.indirectAttainment,
            finalValue:     r.finalAttainment,
            directWeight:   r.directWeight,
            indirectWeight: r.indirectWeight,
            calculatedAt:   new Date(),
          },
        });
      }

      await logAudit({ tableName: 'po_final_attainment', recordId: Number(programId), action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'PO attainment calculated and saved', data: results });
    } catch (err) { next(err); }
  },

  // GET /api/attainment/pso?programId=&academicYearId=
  async getPSOAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, message: 'programId and academicYearId are required' });
      const data = await calculateFinalPSOAttainment(Number(programId), Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // POST /api/attainment/pso/calculate
  async calculateAndPersistPSO(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.body;
      const results = await calculateFinalPSOAttainment(Number(programId), Number(academicYearId));

      for (const r of results) {
        await prisma.psoFinalAttainment.upsert({
          where: { psoId_academicYearId: { psoId: r.psoId, academicYearId: Number(academicYearId) } },
          create: {
            psoId:         r.psoId,
            academicYearId: Number(academicYearId),
            directValue:    r.directAttainment,
            indirectValue:  r.indirectAttainment,
            finalValue:     r.finalAttainment,
            directWeight:   80,
            indirectWeight: 20,
          },
          update: {
            directValue:   r.directAttainment,
            indirectValue: r.indirectAttainment,
            finalValue:    r.finalAttainment,
            calculatedAt:  new Date(),
          },
        });
      }

      await logAudit({ tableName: 'pso_final_attainment', recordId: Number(programId), action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'PSO attainment calculated and saved', data: results });
    } catch (err) { next(err); }
  },

  // GET /api/attainment/indirect?programId=&academicYearId=
  async getIndirectAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, message: 'programId and academicYearId required' });
      const data = await calculateIndirectAttainment(Number(programId), Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // GET /api/attainment/cca?academicYearId=
  async getCCAAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId } = req.query;
      if (!academicYearId) return res.status(400).json({ success: false, message: 'academicYearId required' });
      const data = await calculateCCAAttainment(Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // GET /api/attainment/eca?academicYearId=
  async getECAAttainment(req: Request, res: Response, next: NextFunction) {
    try {
      const { academicYearId } = req.query;
      if (!academicYearId) return res.status(400).json({ success: false, message: 'academicYearId required' });
      const data = await calculateECAAttainment(Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // ─── Config ───────────────────────────────────────────────
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
