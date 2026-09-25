// ============================================================
// Report Routes
// ============================================================

import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate, isAdmin, isHOD, isFaculty } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/reports/dashboard',  isFaculty, ReportController.getDashboard);
router.get('/reports/complete',   isHOD,     ReportController.getCompleteReport);
router.get('/reports/excel',      isHOD,     ReportController.exportExcel);
router.get('/reports/pdf',        isHOD,     ReportController.exportPDF);
router.get('/reports/audit',      isAdmin,   ReportController.getAuditLogs);

export default router;
