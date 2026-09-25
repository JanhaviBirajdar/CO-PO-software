// ============================================================
// User Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { logAudit } from '../middleware/audit.middleware';

export const UserController = {

  // GET /api/users
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, departmentId, isActive } = req.query;
      const users = await UserRepository.findAll({
        role:         role as any,
        departmentId: departmentId ? Number(departmentId) : undefined,
        isActive:     isActive !== undefined ? isActive === 'true' : undefined,
      });
      return res.json({ success: true, data: users, count: users.length });
    } catch (err) { next(err); }
  },

  // GET /api/users/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserRepository.findById(Number(req.params.id));
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, data: user });
    } catch (err) { next(err); }
  },

  // POST /api/users
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserRepository.create(req.body);
      await logAudit({ tableName: 'users', recordId: user.id, action: 'CREATE', userId: req.user?.userId, newValue: JSON.stringify({ name: user.name, email: user.email, role: user.role }) });
      return res.status(201).json({ success: true, message: 'User created', data: user });
    } catch (err) { next(err); }
  },

  // PUT /api/users/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const existing = await UserRepository.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: 'User not found' });
      const user = await UserRepository.update(id, req.body);
      await logAudit({ tableName: 'users', recordId: id, action: 'UPDATE', userId: req.user?.userId, oldValue: JSON.stringify(existing), newValue: JSON.stringify(req.body) });
      return res.json({ success: true, message: 'User updated', data: user });
    } catch (err) { next(err); }
  },

  // DELETE /api/users/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await UserRepository.delete(id);
      await logAudit({ tableName: 'users', recordId: id, action: 'DELETE', userId: req.user?.userId });
      return res.json({ success: true, message: 'User deactivated' });
    } catch (err) { next(err); }
  },
};
