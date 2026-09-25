// ============================================================
// Academic Setup Controllers
// ============================================================

import { Request, Response, NextFunction } from 'express';
import {
  DepartmentRepository,
  ProgramRepository,
  AcademicYearRepository,
  BatchRepository,
  SemesterRepository,
  StudentRepository,
} from '../repositories/academic.repository';
import { logAudit } from '../middleware/audit.middleware';

// ─── Department ───────────────────────────────────────────────
export const DepartmentController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DepartmentRepository.findAll();
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DepartmentRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Department not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DepartmentRepository.create(req.body);
      await logAudit({ tableName: 'departments', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Department created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await DepartmentRepository.update(id, req.body);
      await logAudit({ tableName: 'departments', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Department updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DepartmentRepository.delete(id);
      await logAudit({ tableName: 'departments', recordId: id, action: 'DELETE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Department deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Program ──────────────────────────────────────────────────
export const ProgramController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { departmentId } = req.query;
      const data = await ProgramRepository.findAll(departmentId ? Number(departmentId) : undefined);
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProgramRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Program not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProgramRepository.create(req.body);
      await logAudit({ tableName: 'programs', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Program created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await ProgramRepository.update(id, req.body);
      await logAudit({ tableName: 'programs', recordId: id, action: 'UPDATE', userId: req.user?.userId });
      return res.json({ success: true, message: 'Program updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await ProgramRepository.delete(id);
      return res.json({ success: true, message: 'Program deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Academic Year ────────────────────────────────────────────
export const AcademicYearController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AcademicYearRepository.findAll();
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getCurrent(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AcademicYearRepository.findCurrent();
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AcademicYearRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Academic year not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AcademicYearRepository.create(req.body);
      await logAudit({ tableName: 'academic_years', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Academic year created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await AcademicYearRepository.update(id, req.body);
      return res.json({ success: true, message: 'Academic year updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await AcademicYearRepository.delete(id);
      return res.json({ success: true, message: 'Academic year deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Batch ────────────────────────────────────────────────────
export const BatchController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, departmentId } = req.query;
      const data = await BatchRepository.findAll(
        programId    ? Number(programId)    : undefined,
        departmentId ? Number(departmentId) : undefined,
      );
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BatchRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Batch not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await BatchRepository.create(req.body);
      await logAudit({ tableName: 'batches', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Batch created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await BatchRepository.update(id, req.body);
      return res.json({ success: true, message: 'Batch updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await BatchRepository.delete(id);
      return res.json({ success: true, message: 'Batch deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Semester ─────────────────────────────────────────────────
export const SemesterController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { batchId } = req.query;
      if (!batchId) return res.status(400).json({ success: false, message: 'batchId is required' });
      const data = await SemesterRepository.findAll(Number(batchId));
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SemesterRepository.create(req.body);
      await logAudit({ tableName: 'semesters', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Semester created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await SemesterRepository.update(id, req.body);
      return res.json({ success: true, message: 'Semester updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await SemesterRepository.delete(id);
      return res.json({ success: true, message: 'Semester deactivated' });
    } catch (err) { next(err); }
  },
};

// ─── Student ──────────────────────────────────────────────────
export const StudentController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { batchId, courseId } = req.query;
      const data = await StudentRepository.findAll(
        batchId  ? Number(batchId)  : undefined,
        courseId ? Number(courseId) : undefined,
      );
      return res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StudentRepository.findById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await StudentRepository.create(req.body);
      await logAudit({ tableName: 'students', recordId: data.id, action: 'CREATE', userId: req.user?.userId });
      return res.status(201).json({ success: true, message: 'Student created', data });
    } catch (err) { next(err); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = await StudentRepository.update(id, req.body);
      return res.json({ success: true, message: 'Student updated', data });
    } catch (err) { next(err); }
  },
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await StudentRepository.delete(id);
      return res.json({ success: true, message: 'Student deactivated' });
    } catch (err) { next(err); }
  },
  async enrollCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, courseId } = req.body;
      const data = await StudentRepository.enrollInCourse(studentId, courseId);
      return res.json({ success: true, message: 'Student enrolled', data });
    } catch (err) { next(err); }
  },
};
