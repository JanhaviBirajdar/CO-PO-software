// ============================================================
// Audit Log Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const auditLog = (tableName: string, action: 'CREATE' | 'UPDATE' | 'DELETE') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Store original body for comparison; actual logging happens in services
    (req as any).auditContext = { tableName, action, userId: req.user?.userId };
    next();
  };
};

export async function logAudit(params: {
  tableName: string;
  recordId: number;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  userId?: number;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        tableName:  params.tableName,
        recordId:   params.recordId,
        action:     params.action,
        fieldName:  params.fieldName,
        oldValue:   params.oldValue,
        newValue:   params.newValue,
        userId:     params.userId,
        ipAddress:  params.ipAddress,
      },
    });
  } catch (err) {
    // Audit failure should not break request
    console.error('[AUDIT LOG ERROR]', err);
  }
}
