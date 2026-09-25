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
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, message: 'programId and academicYearId required' });

      const pId = Number(programId);
      const aId = Number(academicYearId);

      const [program, academicYear, pos, psos, courses, poFinal, psoFinal, cca, eca, indirect] = await Promise.all([
        prisma.program.findUnique({ where: { id: pId }, include: { department: true } }),
        prisma.academicYear.findUnique({ where: { id: aId } }),
        prisma.programOutcome.findMany({ where: { programId: pId, isActive: true }, orderBy: { number: 'asc' } }),
        prisma.programSpecificOutcome.findMany({ where: { programId: pId, isActive: true }, orderBy: { number: 'asc' } }),
        prisma.course.findMany({
          where: { programId: pId, academicYearId: aId, isActive: true },
          include: {
            courseOutcomes: {
              where: { isActive: true },
              orderBy: { number: 'asc' },
              include: { coAttainments: true, coPomappings: true, coPsomappings: true },
            },
          },
        }),
        prisma.poFinalAttainment.findMany({
          where: { academicYearId: aId, programOutcome: { programId: pId } },
          include: { programOutcome: true },
          orderBy: { programOutcome: { number: 'asc' } },
        }),
        prisma.psoFinalAttainment.findMany({
          where: { academicYearId: aId, programSpecificOutcome: { programId: pId } },
          include: { programSpecificOutcome: true },
          orderBy: { programSpecificOutcome: { number: 'asc' } },
        }),
        calculateCCAAttainment(aId),
        calculateECAAttainment(aId),
        calculateIndirectAttainment(pId, aId),
      ]);

      return res.json({
        success: true,
        data: {
          program,
          academicYear,
          pos,
          psos,
          courses: courses.map(c => ({
            id:   c.id,
            code: c.code,
            name: c.name,
            courseOutcomes: c.courseOutcomes.map(co => ({
              id:          co.id,
              code:        co.code,
              description: co.description,
              attainment:  co.coAttainments[0] ?? null,
              poMappings:  co.coPomappings,
              psoMappings: co.coPsomappings,
            })),
          })),
          poFinalAttainment:  poFinal.map(p => ({ code: p.programOutcome.code, directValue: Number(p.directValue), indirectValue: Number(p.indirectValue), finalValue: Number(p.finalValue) })),
          psoFinalAttainment: psoFinal.map(p => ({ code: p.programSpecificOutcome.code, directValue: Number(p.directValue), indirectValue: Number(p.indirectValue), finalValue: Number(p.finalValue) })),
          ccaAttainment: cca,
          ecaAttainment: eca,
          indirectAttainment: indirect,
        },
      });
    } catch (err) { next(err); }
  },

  // ─── Excel Export ─────────────────────────────────────────
  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, message: 'programId and academicYearId required' });

      const pId = Number(programId);
      const aId = Number(academicYearId);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'OBE Attainment Management System';
      workbook.created = new Date();

      const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      };

      const dataStyle: Partial<ExcelJS.Style> = {
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
      };

      // Helper to add header row
      const addHeader = (sheet: ExcelJS.Worksheet, cols: string[]) => {
        const row = sheet.addRow(cols);
        row.eachCell(cell => Object.assign(cell, headerStyle));
        row.height = 30;
      };

      // ── Sheet 1: PO Attainment ─────────────────────────────
      const poSheet = workbook.addWorksheet('PO Attainment');
      const pos = await prisma.programOutcome.findMany({ where: { programId: pId, isActive: true }, orderBy: { number: 'asc' } });
      const poFinal = await prisma.poFinalAttainment.findMany({
        where: { academicYearId: aId, programOutcome: { programId: pId } },
        include: { programOutcome: true },
        orderBy: { programOutcome: { number: 'asc' } },
      });

      addHeader(poSheet, ['PO Code', 'Description', 'Direct Attainment', 'Indirect Attainment', 'Final Attainment']);
      poSheet.columns = [
        { key: 'code', width: 12 }, { key: 'desc', width: 50 },
        { key: 'direct', width: 18 }, { key: 'indirect', width: 18 }, { key: 'final', width: 18 },
      ];

      for (const po of pos) {
        const att = poFinal.find(p => p.programOutcome.code === po.code);
        const row = poSheet.addRow({
          code: po.code, desc: po.description,
          direct:   att ? Number(att.directValue).toFixed(2)   : '-',
          indirect: att ? Number(att.indirectValue).toFixed(2) : '-',
          final:    att ? Number(att.finalValue).toFixed(2)    : '-',
        });
        row.eachCell(cell => Object.assign(cell, dataStyle));
      }

      // ── Sheet 2: PSO Attainment ────────────────────────────
      const psoSheet = workbook.addWorksheet('PSO Attainment');
      const psoFinal = await prisma.psoFinalAttainment.findMany({
        where: { academicYearId: aId, programSpecificOutcome: { programId: pId } },
        include: { programSpecificOutcome: true },
        orderBy: { programSpecificOutcome: { number: 'asc' } },
      });

      addHeader(psoSheet, ['PSO Code', 'Description', 'Direct Attainment', 'Indirect Attainment', 'Final Attainment']);
      const psos = await prisma.programSpecificOutcome.findMany({ where: { programId: pId, isActive: true }, orderBy: { number: 'asc' } });
      for (const pso of psos) {
        const att = psoFinal.find(p => p.programSpecificOutcome.code === pso.code);
        psoSheet.addRow([
          pso.code, pso.description,
          att ? Number(att.directValue).toFixed(2)   : '-',
          att ? Number(att.indirectValue).toFixed(2) : '-',
          att ? Number(att.finalValue).toFixed(2)    : '-',
        ]);
      }

      // ── Sheet 3: CO Attainment ─────────────────────────────
      const coSheet = workbook.addWorksheet('CO Attainment');
      addHeader(coSheet, ['Course Code', 'CO Code', 'Description', 'Direct Attainment', 'Attainment Level']);
      const courses = await prisma.course.findMany({
        where: { programId: pId, academicYearId: aId, isActive: true },
        include: {
          courseOutcomes: {
            where: { isActive: true },
            include: { coAttainments: true },
          },
        },
      });
      for (const c of courses) {
        for (const co of c.courseOutcomes) {
          const att = co.coAttainments[0];
          coSheet.addRow([c.code, co.code, co.description, att ? Number(att.finalAttainment).toFixed(2) : '-', att?.attainmentLevel ?? '-']);
        }
      }

      // ── Sheet 4: CO-PO Mapping ─────────────────────────────
      const copoSheet = workbook.addWorksheet('CO-PO Mapping');
      const poHeaders = ['CO / Course', ...pos.map(p => p.code)];
      addHeader(copoSheet, poHeaders);
      for (const c of courses) {
        for (const co of c.courseOutcomes) {
          const coPO = await prisma.coPOMapping.findMany({ where: { courseOutcomeId: co.id } });
          const row: (string | number)[] = [`${c.code} - ${co.code}`];
          for (const po of pos) {
            const mapping = coPO.find(m => m.programOutcomeId === po.id);
            row.push(mapping ? mapping.mappingValue : '-');
          }
          copoSheet.addRow(row);
        }
      }

      // ── Sheet 5: CCA ──────────────────────────────────────
      const ccaSheet = workbook.addWorksheet('CCA');
      const ccaActs = await prisma.ccaActivity.findMany({
        where: { academicYearId: aId, isActive: true },
        include: { poMappings: { include: { programOutcome: true } } },
      });
      addHeader(ccaSheet, ['Activity', 'Attainment Level', ...pos.map(p => p.code)]);
      for (const act of ccaActs) {
        const row: (string | number)[] = [act.name, act.attainmentLevel];
        for (const po of pos) {
          const m = act.poMappings.find(pm => pm.programOutcome.code === po.code);
          row.push(m ? m.mappingValue : '-');
        }
        ccaSheet.addRow(row);
      }

      // ── Sheet 6: ECA ──────────────────────────────────────
      const ecaSheet = workbook.addWorksheet('ECA');
      const ecaActs = await prisma.ecaActivity.findMany({
        where: { academicYearId: aId, isActive: true },
        include: { poMappings: { include: { programOutcome: true } } },
      });
      addHeader(ecaSheet, ['Activity', 'Category', 'Attainment Level', ...pos.map(p => p.code)]);
      for (const act of ecaActs) {
        const row: (string | number)[] = [act.name, act.category, act.attainmentLevel];
        for (const po of pos) {
          const m = act.poMappings.find(pm => pm.programOutcome.code === po.code);
          row.push(m ? m.mappingValue : '-');
        }
        ecaSheet.addRow(row);
      }

      // ── Sheet 7: Surveys ──────────────────────────────────
      const surveySheet = workbook.addWorksheet('Survey Attainment');
      const surveys = await prisma.survey.findMany({ where: { academicYearId: aId }, include: { _count: { select: { responses: true } } } });
      addHeader(surveySheet, ['Survey', 'Type', 'Responses', 'Avg PO Attainment']);
      for (const s of surveys) {
        surveySheet.addRow([s.title, s.surveyType, s._count.responses, '-']);
      }

      // Set freeze panes and filters on all sheets
      workbook.worksheets.forEach(ws => {
        ws.views = [{ state: 'frozen', ySplit: 1 }];
        ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
      });

      ensureDir(REPORTS_DIR);
      const filename = `OBE_Report_${Date.now()}.xlsx`;
      const filePath = path.join(REPORTS_DIR, filename);
      await workbook.xlsx.writeFile(filePath);

      // Log
      await logAudit({ tableName: 'reports', recordId: 0, action: 'CREATE', userId: req.user?.userId, newValue: filePath });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) { next(err); }
  },

  // ─── PDF Export (HTML-based) ────────────────────────────────
  async exportPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { programId, academicYearId } = req.query;
      if (!programId || !academicYearId)
        return res.status(400).json({ success: false, message: 'programId and academicYearId required' });

      const pId = Number(programId);
      const aId = Number(academicYearId);

      const [program, academicYear, pos, psos] = await Promise.all([
        prisma.program.findUnique({ where: { id: pId }, include: { department: true } }),
        prisma.academicYear.findUnique({ where: { id: aId } }),
        prisma.programOutcome.findMany({ where: { programId: pId, isActive: true }, orderBy: { number: 'asc' } }),
        prisma.programSpecificOutcome.findMany({ where: { programId: pId, isActive: true }, orderBy: { number: 'asc' } }),
      ]);

      const poFinal = await prisma.poFinalAttainment.findMany({
        where: { academicYearId: aId, programOutcome: { programId: pId } },
        include: { programOutcome: true },
        orderBy: { programOutcome: { number: 'asc' } },
      });

      const psoFinal = await prisma.psoFinalAttainment.findMany({
        where: { academicYearId: aId, programSpecificOutcome: { programId: pId } },
        include: { programSpecificOutcome: true },
        orderBy: { programSpecificOutcome: { number: 'asc' } },
      });

      // Generate HTML for PDF
      const html = generateOBEReportHTML({ program, academicYear, pos, psos, poFinal, psoFinal });

      // Try Puppeteer if available; otherwise return HTML
      try {
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.default.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } });
        await browser.close();

        await logAudit({ tableName: 'reports', recordId: 0, action: 'CREATE', userId: req.user?.userId, newValue: 'PDF' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="OBE_Report_${Date.now()}.pdf"`);
        return res.send(Buffer.from(pdf));
      } catch {
        // Fallback: return HTML
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

// ─── HTML Template for PDF ────────────────────────────────────
function generateOBEReportHTML(data: any): string {
  const { program, academicYear, pos, psos, poFinal, psoFinal } = data;

  const poRows = pos.map((po: any) => {
    const att = poFinal.find((p: any) => p.programOutcome.code === po.code);
    return `<tr>
      <td>${po.code}</td>
      <td>${po.description}</td>
      <td>${att ? Number(att.directValue).toFixed(2)   : '-'}</td>
      <td>${att ? Number(att.indirectValue).toFixed(2) : '-'}</td>
      <td><strong>${att ? Number(att.finalValue).toFixed(2) : '-'}</strong></td>
    </tr>`;
  }).join('');

  const psoRows = psos.map((pso: any) => {
    const att = psoFinal.find((p: any) => p.programSpecificOutcome.code === pso.code);
    return `<tr>
      <td>${pso.code}</td>
      <td>${pso.description}</td>
      <td>${att ? Number(att.directValue).toFixed(2)   : '-'}</td>
      <td>${att ? Number(att.indirectValue).toFixed(2) : '-'}</td>
      <td><strong>${att ? Number(att.finalValue).toFixed(2) : '-'}</strong></td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OBE Attainment Report</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #222; }
    h1 { text-align: center; color: #1A3A5C; font-size: 18px; margin-bottom: 4px; }
    h2 { text-align: center; font-size: 14px; color: #444; margin: 4px 0 16px 0; }
    .section { margin: 24px 0; }
    .section-title { background: #1A3A5C; color: white; padding: 8px 12px; font-size: 13px; font-weight: bold; margin-bottom: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 0; }
    th { background: #2B5585; color: white; padding: 8px 6px; text-align: center; font-size: 11px; border: 1px solid #ccc; }
    td { padding: 7px 6px; border: 1px solid #ccc; text-align: center; }
    tr:nth-child(even) { background: #f5f8fc; }
    .generated { text-align: right; font-size: 10px; color: #888; margin-top: 32px; }
    .header-info { text-align: center; margin-bottom: 20px; }
    .header-info p { margin: 2px; font-size: 12px; }
  </style>
</head>
<body>
  <h1>OBE ATTAINMENT REPORT</h1>
  <div class="header-info">
    <p><strong>${program?.department?.name ?? ''}</strong></p>
    <p>Program: ${program?.name ?? ''} | Academic Year: ${academicYear?.year ?? ''}</p>
  </div>

  <div class="section">
    <div class="section-title">SECTION 1 — Program Outcome (PO) Attainment</div>
    <table>
      <thead><tr><th>PO</th><th>Description</th><th>Direct</th><th>Indirect</th><th>Final</th></tr></thead>
      <tbody>${poRows || '<tr><td colspan="5">No data available</td></tr>'}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">SECTION 2 — Program Specific Outcome (PSO) Attainment</div>
    <table>
      <thead><tr><th>PSO</th><th>Description</th><th>Direct</th><th>Indirect</th><th>Final</th></tr></thead>
      <tbody>${psoRows || '<tr><td colspan="5">No data available</td></tr>'}</tbody>
    </table>
  </div>

  <p class="generated">Generated on: ${new Date().toLocaleString('en-IN')} | OBE Attainment Management System</p>
</body>
</html>`;
}
