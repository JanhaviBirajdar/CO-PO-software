// ============================================================
// Bloom's Taxonomy Controller
// DYP COEI OBE Process Implementation
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { bloomService } from '../services/bloom.service';

export class BloomController {
  public async getBloomLevels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const levels = await bloomService.getBloomLevels();
      res.json({ success: true, data: levels });
    } catch (err) {
      next(err);
    }
  }

  public async updateBloomLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await bloomService.updateBloomLevel(id, req.body);
      res.json({ success: true, data: updated, message: "Bloom level updated successfully" });
    } catch (err) {
      next(err);
    }
  }

  public async getBloomVerbs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const levelId = req.query.bloomLevelId ? parseInt(req.query.bloomLevelId as string, 10) : undefined;
      const verbs = await bloomService.getBloomVerbs(levelId);
      res.json({ success: true, data: verbs });
    } catch (err) {
      next(err);
    }
  }

  public async addBloomVerb(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bloomLevelId, verb, description } = req.body;
      const created = await bloomService.addBloomVerb(bloomLevelId, verb, description);
      res.json({ success: true, data: created, message: "Action verb added successfully" });
    } catch (err) {
      next(err);
    }
  }

  public async suggestBloomLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ success: false, message: "Text statement is required" });
        return;
      }
      const suggestion = await bloomService.suggestBloomLevel(text);
      res.json({ success: true, data: suggestion });
    } catch (err) {
      next(err);
    }
  }

  public async validateCOBloomLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description, bloomLevelId, selectedVerb } = req.body;
      const validation = await bloomService.validateCOBloomLevel(description, bloomLevelId, selectedVerb);
      res.json({ success: true, data: validation });
    } catch (err) {
      next(err);
    }
  }

  public async checkCOQuality(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await bloomService.checkCOQuality(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async generateAICourseOutcome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const generated = await bloomService.generateAICourseOutcome(req.body);
      res.json({ success: true, data: generated, message: "AI CO draft generated successfully" });
    } catch (err) {
      next(err);
    }
  }

  public async getBloomAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string, 10) : undefined;
      const academicYearId = req.query.academicYearId ? parseInt(req.query.academicYearId as string, 10) : undefined;
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string, 10) : undefined;

      const analytics = await bloomService.getBloomAnalytics({ courseId, academicYearId, departmentId });
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
}

export const bloomController = new BloomController();
