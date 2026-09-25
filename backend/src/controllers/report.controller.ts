// ============================================================
// Report Controller — PDF & Excel generation
// ============================================================

import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import {
  calculateFinalPOAttainment,
  calculateFinalPSOAttainment,
  calculateCCAAttainment,
  calculateECAAttainment,
  calculateIndirectAttainment,
  calculateEmployerSurveyAttainment,
} from '../formula/formulaEngine';
import { prisma } from '../config/prisma';
import { logAudit } from '../middleware/audit.middleware';
import {
  assembleOBEReportData,
  generateOBEReportWorkbook,
  generateOBEReportHTML,
} from '../services/obeReport.service';

const REPORTS_DIR = process.env.REPORTS_DIR ?? './reports';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────
// Dashboard summary data
// ─────────────────────────────────────────────────────────────
export const ReportController = {

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;

      const [
        courseCount,
        coCount,
        poCount,
        psoCount,
        studentCount,
      ] = await Promise.all([
        prisma.course.count({ where: { isActive: true, ...(programId && { programId: Number(programId) }), ...(academicYearId && { academicYearId: Number(academicYearId) }) } }),
        prisma.courseOutcome.count({ where: { isActive: true, course: { ...(programId && { programId: Number(programId) }), ...(academicYearId && { academicYearId: Number(academicYearId) }) } } }),
        prisma.programOutcome.count({ where: { isActive: true, ...(programId && { programId: Number(programId) }) } }),
        prisma.programSpecificOutcome.count({ where: { isActive: true, ...(programId && { programId: Number(programId) }) } }),
        prisma.student.count({ where: { isActive: true } }),
      ]);

      // Get average attainment values from stored results
      const coAttainments = await prisma.coAttainment.findMany({
        include: { courseOutcome: { include: { course: { select: { programId: true, academicYearId: true } } } } },
      });

      const filteredCO = coAttainments.filter(ca => {
        const c = ca.courseOutcome.course;
        if (programId && c.programId !== Number(programId)) return false;
        if (academicYearId && c.academicYearId !== Number(academicYearId)) return false;
        return true;
      });

      const avgCOAttainment = filteredCO.length > 0
        ? filteredCO.reduce((sum, ca) => sum + Number(ca.finalAttainment), 0) / filteredCO.length
        : null;

      // PO / PSO averages from persisted records
      const poAttainments = await prisma.poFinalAttainment.findMany({
        where: {
          ...(academicYearId && { academicYearId: Number(academicYearId) }),
          ...(programId && { programOutcome: { programId: Number(programId) } }),
        },
        include: { programOutcome: true },
      });

      const avgPOAttainment = poAttainments.length > 0
        ? poAttainments.reduce((sum, pa) => sum + Number(pa.finalValue), 0) / poAttainments.length
        : null;

      const psoAttainments = await prisma.psoFinalAttainment.findMany({
        where: {
          ...(academicYearId && { academicYearId: Number(academicYearId) }),
          ...(programId && { programSpecificOutcome: { programId: Number(programId) } }),
        },
        include: { programSpecificOutcome: true },
      });

      const avgPSOAttainment = psoAttainments.length > 0
        ? psoAttainments.reduce((sum, pa) => sum + Number(pa.finalValue), 0) / psoAttainments.length
        : null;

      return res.json({
        success: true,
        data: {
          summary: {
            totalCourses:   courseCount,
            totalCOs:       coCount,
            totalPOs:       poCount,
            totalPSOs:      psoCount,
            totalStudents:  studentCount,
            avgCOAttainment: avgCOAttainment !== null ? Math.round(avgCOAttainment * 100) / 100 : null,
            avgPOAttainment: avgPOAttainment !== null ? Math.round(avgPOAttainment * 100) / 100 : null,
            avgPSOAttainment: avgPSOAttainment !== null ? Math.round(avgPSOAttainment * 100) / 100 : null,
          },
          poAttainments: poAttainments.map(pa => ({
            code:           pa.programOutcome.code,
            directValue:    Number(pa.directValue),
            indirectValue:  Number(pa.indirectValue),
            finalValue:     Number(pa.finalValue),
          })),
          psoAttainments: psoAttainments.map(pa => ({
            code:           pa.programSpecificOutcome.code,
            directValue:    Number(pa.directValue),
            indirectValue:  Number(pa.indirectValue),
            finalValue:     Number(pa.finalValue),
          })),
          coAttainments: filteredCO.map(ca => ({
            coCode:         ca.courseOutcome.code,
            attainmentLevel: ca.attainmentLevel,
            finalAttainment: Number(ca.finalAttainment),
          })),
        },
      });
    } catch (err) { next(err); }
  },

  // ─── Complete OBE Report data (JSON) ──────────────────────
  async getCompleteReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId = '1', academicYearId = '1' } = req.query;
      const data = await assembleOBEReportData(Number(programId), Number(academicYearId));
      return res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // ─── Excel Export (15 Sheets matching NBA & master plan) ──
  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId = '1', academicYearId = '1' } = req.query;
      const pId = Number(programId);
      const aId = Number(academicYearId);
      const data = await assembleOBEReportData(pId, aId);
      const workbook = await generateOBEReportWorkbook(data);

      ensureDir(REPORTS_DIR);
      const filename = `OBE_Report_${data.program.code}_${Date.now()}.xlsx`;
      const filePath = path.join(REPORTS_DIR, filename);
      await workbook.xlsx.writeFile(filePath);

      await logAudit({ tableName: 'reports', recordId: 0, action: 'CREATE', userId: req.user?.userId, newValue: filePath });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) { next(err); }
  },

  // ─── PDF Export (exact visual reproduction of manual) ─────
  async exportPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId = '1', academicYearId = '1' } = req.query;
      const pId = Number(programId);
      const aId = Number(academicYearId);
      const data = await assembleOBEReportData(pId, aId);
      const html = generateOBEReportHTML(data);

      // Try Puppeteer if available; otherwise return HTML for instant print-to-PDF
      try {
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
          format: 'A4',
          landscape: true,
          printBackground: true,
          margin: { top: '10mm', right: '8mm', bottom: '12mm', left: '8mm' },
        });
        await browser.close();

        ensureDir(REPORTS_DIR);
        const filename = `OBE_Report_${data.program.code}_${Date.now()}.pdf`;
        await logAudit({ tableName: 'reports', recordId: 0, action: 'CREATE', userId: req.user?.userId, newValue: 'PDF' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(Buffer.from(pdf));
      } catch (err) {
        // Fallback: Return beautifully styled HTML document (browser can print / Save as PDF)
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
      }
    } catch (err) { next(err); }
  },

  // ─── Course-specific Excel Export ────────────────────────
  async exportCourseExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const cId = Number(courseId);
      const course = await prisma.course.findUnique({
        where: { id: cId },
        include: {
          program: true,
          academicYear: true,
          courseOutcomes: {
            where: { isActive: true },
            include: { coAttainments: true, coPomappings: { include: { programOutcome: true } } },
          },
        },
      });

      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(`${course.code} Attainment`);
      sheet.addRow([`Course OBE Attainment Report: ${course.code} - ${course.name}`]);
      sheet.addRow([`Program: ${course.program.name} | Credits: ${course.credits}`]);
      sheet.addRow([]);

      sheet.addRow(['CO Code', 'Description', 'Direct Attainment', 'Level', 'Students Evaluated', 'Pass %']);
      for (const co of course.courseOutcomes) {
        const att = co.coAttainments[0];
        sheet.addRow([
          co.code,
          co.description,
          att ? Number(att.finalAttainment).toFixed(2) : '-',
          att?.attainmentLevel ?? '-',
          att?.totalStudents ?? '-',
          att ? (att.totalStudents && att.totalStudents > 0 ? `${(((att.studentsAboveThreshold ?? 0) / att.totalStudents) * 100).toFixed(1)}%` : '-') : '-',
        ]);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="Course_${course.code}_Attainment.xlsx"`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) { next(err); }
  },

  // ─── Course-specific PDF Export ──────────────────────────
  async exportCoursePDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const cId = Number(courseId);
      const course = await prisma.course.findUnique({
        where: { id: cId },
        include: {
          program: true,
          academicYear: true,
          courseOutcomes: {
            where: { isActive: true },
            include: { coAttainments: true, coPomappings: { include: { programOutcome: true } } },
          },
        },
      });

      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

      const coRows = course.courseOutcomes.map(co => {
        const att = co.coAttainments[0];
        return `<tr>
          <td>${co.code}</td>
          <td style="text-align: left">${co.description}</td>
          <td>${att ? Number(att.finalAttainment).toFixed(2) : '-'}</td>
          <td>${att?.attainmentLevel ?? '-'}</td>
          <td>${att ? (att.totalStudents && att.totalStudents > 0 ? `${(((att.studentsAboveThreshold ?? 0) / att.totalStudents) * 100).toFixed(1)}%` : '-') : '-'}</td>
        </tr>`;
      }).join('');

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Course Attainment Report - ${course.code}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; color: #222; }
    h1 { text-align: center; color: #1A3A5C; font-size: 18px; margin-bottom: 4px; }
    .header-info { text-align: center; margin-bottom: 20px; font-size: 13px; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #1A3A5C; color: white; padding: 8px 6px; text-align: center; font-size: 11px; border: 1px solid #ccc; }
    td { padding: 7px 6px; border: 1px solid #ccc; text-align: center; }
    tr:nth-child(even) { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>COURSE OUTCOME ATTAINMENT REPORT</h1>
  <div class="header-info">
    <p><strong>${course.code} — ${course.name}</strong></p>
    <p>Program: ${course.program.name} | Credits: ${course.credits}</p>
  </div>
  <table>
    <thead><tr><th>CO Code</th><th>Description</th><th>Attainment</th><th>Level</th><th>Pass %</th></tr></thead>
    <tbody>${coRows || '<tr><td colspan="5">No Course Outcomes Defined</td></tr>'}</tbody>
  </table>
  <p style="text-align: right; font-size: 10px; color: #888; margin-top: 24px;">Generated by OBE Attainment Management System</p>
</body>
</html>`;

      try {
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Course_${course.code}_Attainment.pdf"`);
        return res.send(Buffer.from(pdf));
      } catch {
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
      }
    } catch (err) { next(err); }
  },

  // Audit Log
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableName, userId, limit = '50', page = '1' } = req.query;
      const take = Number(limit);
      const skip = (Number(page) - 1) * take;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: {
            ...(tableName && { tableName: String(tableName) }),
            ...(userId    && { userId: Number(userId) }),
          },
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take,
          skip,
        }),
        prisma.auditLog.count({ where: { ...(tableName && { tableName: String(tableName) }) } }),
      ]);

      return res.json({ success: true, data: logs, total, page: Number(page), limit: take });
    } catch (err) { next(err); }
  },
};

