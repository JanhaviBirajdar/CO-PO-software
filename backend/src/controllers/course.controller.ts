// ============================================================
// Course & Outcome Controllers
// ============================================================

import { Request, Response, NextFunction } from 'express';
import {
  CourseRepository,
  CourseOutcomeRepository,
  ProgramOutcomeRepository,
  PSORepository,
  MappingRepository,
} from '../repositories/course.repository';
import { logAudit } from '../middleware/audit.middleware';

// ─── Course ───────────────────────────────────────────────────
export const CourseController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, semesterId, academicYearId, facultyId } = req.query;
      const user = req.user!;
      // Faculty can only see their own courses
      const effectiveFacultyId = user.role === 'FACULTY'
        ? user.userId
        : (facultyId ? Number(facultyId) : undefined);

      const data = await CourseRepository.findAll({
        programId:      programId      ? Number(programId)      : undefined,
        semesterId:     semesterId     ? Number(semesterId)     : undefined,
        academicYearId: academicYearId ? Number(academicYearId) : undefined,
        facultyId:      effectiveFacultyId,
      });
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CourseRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Course not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CourseRepository.create(req.body);
      await logAudit({ tableName: 'courses', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Course created', data });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await CourseRepository.update(id, req.body);
      await logAudit({ tableName: 'courses', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Course updated', data });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await CourseRepository.delete(id);
      return res.json({ success: true, message: 'Course deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Course Outcome ───────────────────────────────────────────
export const CourseOutcomeController = {
  async getByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query;
      if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });
      const data = await CourseOutcomeRepository.findByCourse(Number(courseId));
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CourseOutcomeRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'CO not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CourseOutcomeRepository.create(req.body);
      await logAudit({ tableName: 'course_outcomes', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'CO created', data });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const old = await CourseOutcomeRepository.findById(id);
      const data = await CourseOutcomeRepository.update(id, req.body);
      await logAudit({ tableName: 'course_outcomes', recordId: id, action: 'UPDATE', userId: req.user?.userId, oldValue: JSON.stringify(old?.description), newValue: JSON.stringify(req.body.description) });
      return res.json({ success: true, message: 'CO updated', data });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await CourseOutcomeRepository.delete(id);
      return res.json({ success: true, message: 'CO deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Program Outcome ──────────────────────────────────────────
export const ProgramOutcomeController = {
  async getByProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.query;
      if (!programId) return res.status(400).json({ success: false, message: 'programId required' });
      const data = await ProgramOutcomeRepository.findByProgram(Number(programId));
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProgramOutcomeRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'PO not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProgramOutcomeRepository.create(req.body);
      await logAudit({ tableName: 'program_outcomes', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'PO created', data });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await ProgramOutcomeRepository.update(id, req.body);
      await logAudit({ tableName: 'program_outcomes', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'PO updated', data });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProgramOutcomeRepository.delete(Number(req.params.id));
      return res.json({ success: true, message: 'PO deactivated' });
    } catch (err) { next(err); }
  },

  async bulkUpsert(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, pos } = req.body;
      const data = await ProgramOutcomeRepository.upsertMany(Number(programId), pos);
      return res.json({ success: true, message: 'POs saved', data });
    } catch (err) { next(err); }
  },
};

// ─── PSO ──────────────────────────────────────────────────────
export const PSOController = {
  async getByProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId } = req.query;
      if (!programId) return res.status(400).json({ success: false, message: 'programId required' });
      const data = await PSORepository.findByProgram(Number(programId));
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PSORepository.create(req.body);
      await logAudit({ tableName: 'program_specific_outcomes', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'PSO created', data });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await PSORepository.update(id, req.body);
      await logAudit({ tableName: 'program_specific_outcomes', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'PSO updated', data });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await PSORepository.delete(Number(req.params.id));
      return res.json({ success: true, message: 'PSO deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Mappings ─────────────────────────────────────────────────
export const MappingController = {
  async getCOPOMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query;
      if (!courseId) return res.status(400).json({ success: false, message: 'courseId required' });
      const data = await MappingRepository.getCOPOMatrix(Number(courseId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async saveCOPOMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const { mappings } = req.body;
      const data = await MappingRepository.saveCOPOMappings(mappings);
      await logAudit({ tableName: 'co_po_mappings', recordId: 0, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'CO-PO mappings saved', data });
    } catch (err) { next(err); }
  },

  async getCOPSOMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.query;
      if (!courseId) return res.status(400).json({ success: false, message: 'courseId required' });
      const data = await MappingRepository.getCOPSOMatrix(Number(courseId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  async saveCOPSOMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const { mappings } = req.body;
      const data = await MappingRepository.saveCOPSOMappings(mappings);
      await logAudit({ tableName: 'co_pso_mappings', recordId: 0, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'CO-PSO mappings saved', data });
    } catch (err) { next(err); }
  },
};
