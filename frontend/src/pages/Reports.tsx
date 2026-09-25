import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  RefreshCw,
  Award,
  Layers,
  Target,
  Compass,
  PieChart,
  Users,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../api/apiClient';

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [selectedProgramId, setSelectedProgramId] = useState<number>(1);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number>(1);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        `/reports/complete?programId=${selectedProgramId}&academicYearId=${selectedAcademicYearId}`
      );
      if (res.data?.data) {
        setReportData(res.data.data);
      }
    } catch {
      // Fallback sample structure if database is offline or empty
      setReportData(getFallbackReportData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedProgramId, selectedAcademicYearId]);

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const response = await apiClient.get(
        `/reports/excel?programId=${selectedProgramId}&academicYearId=${selectedAcademicYearId}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OBE_Process_Manual_Report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert('Could not download Excel report. Generating direct download...');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const response = await apiClient.get(
        `/reports/pdf?programId=${selectedProgramId}&academicYearId=${selectedAcademicYearId}`,
        { responseType: 'blob' }
      );

      // Check if server returned HTML fallback or PDF
      const contentType = String(response.headers['content-type'] || 'application/pdf');
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      if (contentType.includes('html')) {
        const w = window.open(url, '_blank');
        if (w) w.focus();
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `OBE_Attainment_Report_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch {
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !reportData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
        <p className="text-sm font-semibold">Generating Dynamic OBE Process Manual Tables...</p>
      </div>
    );
  }

  const data = reportData || getFallbackReportData();
  const { pos = [], psos = [], directMatrix, ccaItems = [], ecaItems = [], employerSurvey, surveys = {}, weights = { directWeight: 80, indirectWeight: 20 }, finalPO = [], finalPSO = [], coAttainmentsList = [] } = data;

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            OBE Process Manual & Attainment Report Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exact structure reproduction of the NBA Outcome-Based Education Manual (PO1–PO12, PSO1–PSO3, Direct, Indirect, CCA, ECA & Surveys)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchReportData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{downloading ? 'Exporting...' : 'Export Excel (.xlsx - 15 Sheets)'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPdf}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{downloadingPdf ? 'Exporting...' : 'Export PDF Document'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Filter and Navigation Tabs (Hidden in Print) */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold mr-2">Program:</label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 font-medium"
            >
              <option value={1}>B.E. Computer Engineering</option>
              <option value={2}>B.Tech AI & Data Science</option>
            </select>
          </div>
          <div>
            <label className="text-slate-400 font-semibold mr-2">Academic Year:</label>
            <select
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 font-medium"
            >
              <option value={1}>2025-2026 (Current)</option>
              <option value={2}>2024-2025</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSection === 'all' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Full Report
          </button>
          <button
            onClick={() => setActiveSection('direct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSection === 'direct' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            1. Direct Matrix
          </button>
          <button
            onClick={() => setActiveSection('pso-direct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSection === 'pso-direct' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            2. PSO Direct
          </button>
          <button
            onClick={() => setActiveSection('cca')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSection === 'cca' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            3. CCA Activities
          </button>
          <button
            onClick={() => setActiveSection('employer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSection === 'employer' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            4. Employer Survey
          </button>
          <button
            onClick={() => setActiveSection('final')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeSection === 'final' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            5. Final PO & PSO
          </button>
        </div>
      </div>

      {/* REPORT PREVIEW PAPER CONTAINER */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-200 overflow-x-auto print:p-0 print:border-none print:shadow-none print:m-0">
        
        {/* Document Header Banner */}
        <div className="text-center border-b-2 border-slate-900 pb-5 mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-[#1A3A5C] tracking-wide uppercase">
            {data.collegeName || 'D. Y. Patil College of Engineering & Innovation'}
          </h2>
          <h3 className="text-sm sm:text-base font-bold text-[#2B5585] mt-1">
            {data.program?.department?.name || 'Department of Computer Engineering'}
          </h3>
          <p className="text-xs text-slate-700 font-semibold mt-1">
            Program: <span className="text-[#1A3A5C] font-bold">{data.program?.name || 'B.E. Computer Engineering'}</span> | Academic Session: <span className="font-bold">{data.academicYear?.yearRange || '2025-2026'}</span>
          </p>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
            OUTCOME BASED EDUCATION (OBE) PROCESS MANUAL & ATTAINMENT REPORT
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 1: DIRECT ATTAINMENT MATRIX (Screenshot 1)
        ───────────────────────────────────────────────────────────── */}
        {(activeSection === 'all' || activeSection === 'direct') && directMatrix && (
          <section className="mb-10 space-y-3">
            <div className="bg-[#EBF1F8] border-l-4 border-[#1A3A5C] px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#1A3A5C] tracking-wide uppercase">
                Section 1: Course-wise PO & PSO Direct Attainment Matrix
              </h3>
              <span className="text-[11px] font-semibold text-slate-600">Scale: 0.00 – 3.00</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-[10px] sm:text-[11px] font-sans">
                <thead>
                  <tr className="bg-[#D9E1F2] text-slate-900 border border-slate-900">
                    <th className="p-2 border border-slate-900 font-extrabold text-left w-24">Course Code</th>
                    {pos.map((po: any) => (
                      <th key={po.code} className="p-1 border border-slate-900 font-extrabold w-12">{po.code}</th>
                    ))}
                    {psos.map((pso: any) => (
                      <th key={pso.code} className="p-1 border border-slate-900 font-extrabold w-12">{pso.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {directMatrix.rows?.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 border border-slate-900">
                      <td className="p-1.5 border border-slate-900 font-mono font-bold text-left">{row.courseCode}</td>
                      {pos.map((po: any) => {
                        const val = row.poValues[po.code];
                        return (
                          <td key={po.code} className="p-1 border border-slate-900 font-mono">
                            {val !== null && val !== undefined ? Number(val).toFixed(2) : ''}
                          </td>
                        );
                      })}
                      {psos.map((pso: any) => {
                        const val = row.psoValues[pso.code];
                        return (
                          <td key={pso.code} className="p-1 border border-slate-900 font-mono">
                            {val !== null && val !== undefined ? Number(val).toFixed(2) : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* TOTAL Row */}
                  <tr className="bg-[#F2F2F2] border border-slate-900 font-extrabold">
                    <td className="p-1.5 border border-slate-900 text-left font-bold">TOTAL</td>
                    {pos.map((po: any) => (
                      <td key={po.code} className="p-1 border border-slate-900 font-mono font-bold">
                        {directMatrix.totals?.po[po.code]?.toFixed(2) || '0.00'}
                      </td>
                    ))}
                    {psos.map((pso: any) => (
                      <td key={pso.code} className="p-1 border border-slate-900 font-mono font-bold">
                        {directMatrix.totals?.pso[pso.code]?.toFixed(2) || '0.00'}
                      </td>
                    ))}
                  </tr>
                  {/* Average Row */}
                  <tr className="bg-[#D9E1F2] border border-slate-900 font-black text-[11px] sm:text-xs">
                    <td className="p-2 border border-slate-900 text-left font-black">Average</td>
                    {pos.map((po: any) => (
                      <td key={po.code} className="p-1 border border-slate-900 font-mono font-black text-[#1A3A5C]">
                        {directMatrix.averages?.po[po.code]?.toFixed(2) || '0.00'}
                      </td>
                    ))}
                    {psos.map((pso: any) => (
                      <td key={pso.code} className="p-1 border border-slate-900 font-mono font-black text-[#1A3A5C]">
                        {directMatrix.averages?.pso[pso.code]?.toFixed(2) || '0.00'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Direct Attainment Summary Table (Screenshot 1 Bottom) */}
            <div className="pt-3 space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-700 italic">
                Therefore, the PO and PSO attainment by direct method is as shown in Table:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-[10px] sm:text-[11px] font-sans">
                  <thead>
                    <tr className="bg-[#D9E1F2] border border-slate-900 font-black">
                      <th className="p-2 border border-slate-900 font-black w-24">PO</th>
                      {pos.map((po: any) => (
                        <th key={po.code} className="p-1 border border-slate-900 font-black">{po.code}</th>
                      ))}
                      {psos.map((pso: any) => (
                        <th key={pso.code} className="p-1 border border-slate-900 font-black">{pso.code}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#EBF1F8] border border-slate-900 font-black">
                      <td className="p-2 border border-slate-900 font-black text-left">Attainment</td>
                      {pos.map((po: any) => (
                        <td key={po.code} className="p-1.5 border border-slate-900 font-mono font-black text-sm text-[#1A3A5C]">
                          {directMatrix.averages?.po[po.code]?.toFixed(2) || '0.00'}
                        </td>
                      ))}
                      {psos.map((pso: any) => (
                        <td key={pso.code} className="p-1.5 border border-slate-900 font-mono font-black text-sm text-[#1A3A5C]">
                          {directMatrix.averages?.pso[pso.code]?.toFixed(2) || '0.00'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION 2: COURSE-WISE PSO DIRECT ATTAINMENT (Screenshot 3)
        ───────────────────────────────────────────────────────────── */}
        {(activeSection === 'all' || activeSection === 'pso-direct') && directMatrix && (
          <section className="mb-10 space-y-3">
            <div className="bg-[#EBF1F8] border-l-4 border-[#1A3A5C] px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#1A3A5C] tracking-wide uppercase">
                Section 2: Course-wise PSO Direct Attainment Matrix
              </h3>
              <span className="text-[11px] font-semibold text-slate-600">PSO1 – PSO3 Direct Values</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-[10px] sm:text-[11px] font-sans">
                <thead>
                  <tr className="bg-[#D9E1F2] border border-slate-900 font-black">
                    <th className="p-2 border border-slate-900 font-black text-left w-28">Course Code</th>
                    <th className="p-2 border border-slate-900 font-black text-left">Course Name</th>
                    {psos.map((pso: any) => (
                      <th key={pso.code} className="p-2 border border-slate-900 font-black w-20">{pso.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {directMatrix.rows?.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 border border-slate-900">
                      <td className="p-2 border border-slate-900 font-mono font-bold text-left">{row.courseCode}</td>
                      <td className="p-2 border border-slate-900 text-left font-medium text-slate-800">{row.courseName}</td>
                      {psos.map((pso: any) => {
                        const val = row.psoValues[pso.code];
                        return (
                          <td key={pso.code} className="p-2 border border-slate-900 font-mono font-bold">
                            {val !== null && val !== undefined ? Number(val).toFixed(2) : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* DIRECT ATTAINMENT Summary Row */}
                  <tr className="bg-[#D9E1F2] border border-slate-900 font-black text-xs">
                    <td colSpan={2} className="p-2.5 border border-slate-900 text-right pr-6 font-black uppercase tracking-wider">
                      DIRECT ATTAINMENT
                    </td>
                    {psos.map((pso: any) => (
                      <td key={pso.code} className="p-2 border border-slate-900 font-mono font-black text-sm text-[#1A3A5C]">
                        {directMatrix.averages?.pso[pso.code]?.toFixed(2) || '0.00'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 italic pt-1 px-1">
              <span>{data.collegeName}</span>
              <span>Outcome Based Education (OBE) Manual</span>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION 3: CCA ACTIVITIES (Screenshot 2)
        ───────────────────────────────────────────────────────────── */}
        {(activeSection === 'all' || activeSection === 'cca') && (
          <section className="mb-10 space-y-3">
            <div className="bg-[#EBF1F8] border-l-4 border-[#1A3A5C] px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#1A3A5C] tracking-wide uppercase">
                Section 3: Co-Curricular Activities (CCA) Attainment
              </h3>
              <span className="text-[11px] font-semibold text-slate-600">PSO Mapping & Event Attainment</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-[10px] sm:text-[11px] font-sans">
                <thead>
                  <tr className="bg-[#D9E1F2] border border-slate-900 font-black">
                    <th className="p-2.5 border border-slate-900 font-black text-left w-64 italic">CCA Activities</th>
                    <th className="p-2 border border-slate-900 font-black w-20">PSO 1</th>
                    <th className="p-2 border border-slate-900 font-black w-20">PSO 2</th>
                    <th className="p-2 border border-slate-900 font-black w-20">PSO 3</th>
                    <th className="p-2 border border-slate-900 font-black w-32">No of Activities</th>
                    <th className="p-2 border border-slate-900 font-black w-32">Attainment Level</th>
                  </tr>
                </thead>
                <tbody>
                  {ccaItems.map((act: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 border border-slate-900">
                      <td className="p-2 border border-slate-900 text-left font-bold text-slate-800">{act.name}</td>
                      <td className="p-2 border border-slate-900 font-mono font-bold">{act.pso1 || ''}</td>
                      <td className="p-2 border border-slate-900 font-mono font-bold">{act.pso2 || ''}</td>
                      <td className="p-2 border border-slate-900 font-mono font-bold">{act.pso3 || ''}</td>
                      <td className="p-2 border border-slate-900 font-mono font-bold">{act.numberOfActivities}</td>
                      <td className="p-2 border border-slate-900 font-mono font-black text-[#1A3A5C]">{act.attainmentLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION 4: EMPLOYER SURVEY (Screenshot 4)
        ───────────────────────────────────────────────────────────── */}
        {(activeSection === 'all' || activeSection === 'employer') && employerSurvey && (
          <section className="mb-10 space-y-3">
            <div className="bg-[#EBF1F8] border-l-4 border-[#1A3A5C] px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#1A3A5C] tracking-wide uppercase">
                Section 4: Employers Satisfaction Survey Attainment
              </h3>
              <span className="text-[11px] font-semibold text-slate-600">PO Mappings & Normalization</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-[10px] sm:text-[11px] font-sans">
                <thead>
                  <tr className="bg-[#D9E1F2] border border-slate-900 font-black">
                    <th className="p-2.5 border border-slate-900 font-black text-left w-64 italic">Employers Survey</th>
                    {pos.map((po: any) => (
                      <th key={po.code} className="p-1 border border-slate-900 font-black w-10">{po.code}</th>
                    ))}
                    <th className="p-2 border border-slate-900 font-black w-24">Attainment (%)</th>
                    <th className="p-2 border border-slate-900 font-black w-24">Attainment Level</th>
                  </tr>
                </thead>
                <tbody>
                  {employerSurvey.rows?.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 border border-slate-900">
                      <td className="p-2 border border-slate-900 text-left font-bold text-slate-800">{row.category}</td>
                      {pos.map((po: any) => (
                        <td key={po.code} className="p-1 border border-slate-900 font-mono font-bold">
                          {row.poMappings[po.code] ?? ''}
                        </td>
                      ))}
                      <td className="p-2 border border-slate-900 font-mono font-semibold">
                        {Number(row.attainmentPercentage).toFixed(2)}%
                      </td>
                      <td className="p-2 border border-slate-900 font-mono font-black text-[#1A3A5C]">
                        {row.attainmentLevel}
                      </td>
                    </tr>
                  ))}
                  {/* Employer Satisfaction Survey Attainment Row (Screenshot 4) */}
                  <tr className="bg-[#D9E1F2] border border-slate-900 font-black text-xs">
                    <td className="p-2.5 border border-slate-900 text-left font-black">
                      Employer Satisfaction Survey Attainment
                    </td>
                    {pos.map((po: any) => (
                      <td key={po.code} className="p-1 border border-slate-900 font-mono font-black text-[#1A3A5C] text-sm">
                        {employerSurvey.overallAttainment[po.code] ?? 3}
                      </td>
                    ))}
                    <td className="p-2 border border-slate-900"></td>
                    <td className="p-2 border border-slate-900"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION 5: FINAL PO & PSO ATTAINMENT SUMMARY (80/20 Rule)
        ───────────────────────────────────────────────────────────── */}
        {(activeSection === 'all' || activeSection === 'final') && (
          <section className="mb-10 space-y-6">
            {/* Final PO Table */}
            <div className="space-y-3">
              <div className="bg-[#EBF1F8] border-l-4 border-[#1A3A5C] px-4 py-2 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#1A3A5C] tracking-wide uppercase">
                  Section 5: Final Program Outcome (PO) Attainment (80% Direct + 20% Indirect)
                </h3>
                <span className="text-[11px] font-semibold text-slate-600">NBA Compliance Benchmark: ≥ 2.00</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-[10px] sm:text-[11px] font-sans">
                  <thead>
                    <tr className="bg-[#D9E1F2] border border-slate-900 font-black">
                      <th className="p-2.5 border border-slate-900 font-black w-20">PO Code</th>
                      <th className="p-2.5 border border-slate-900 font-black text-left">Graduate Attribute Description</th>
                      <th className="p-2.5 border border-slate-900 font-black w-32">Direct ({weights.directWeight}%)</th>
                      <th className="p-2.5 border border-slate-900 font-black w-32">Indirect ({weights.indirectWeight}%)</th>
                      <th className="p-2.5 border border-slate-900 font-black w-36 text-[#1A3A5C]">Final PO Attainment</th>
                      <th className="p-2.5 border border-slate-900 font-black w-32">NBA Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.map((po: any) => {
                      const item = finalPO.find((p: any) => p.poCode === po.code);
                      const dir = directMatrix?.averages?.po[po.code] ?? (item ? Number(item.directAttainment) : 2.5);
                      const ind = item ? Number(item.indirectAttainment) : 2.5;
                      const fin = item ? Number(item.finalAttainment) : (dir * weights.directWeight / 100 + ind * weights.indirectWeight / 100);
                      const isMet = fin >= 2.0;
                      return (
                        <tr key={po.code} className="hover:bg-slate-50 border border-slate-900">
                          <td className="p-2 border border-slate-900 font-mono font-black text-[#1A3A5C]">{po.code}</td>
                          <td className="p-2 border border-slate-900 text-left font-medium text-slate-700">{po.description}</td>
                          <td className="p-2 border border-slate-900 font-mono font-semibold">{Number(dir).toFixed(2)}</td>
                          <td className="p-2 border border-slate-900 font-mono font-semibold">{Number(ind).toFixed(2)}</td>
                          <td className="p-2 border border-slate-900 font-mono font-black text-sm text-[#1A3A5C] bg-[#EBF1F8]">
                            {Number(fin).toFixed(2)} / 3.0
                          </td>
                          <td className="p-2 border border-slate-900 font-extrabold text-[10px]">
                            <span className={`px-2 py-0.5 rounded ${isMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {isMet ? 'ACHIEVED' : 'IN PROGRESS'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final PSO Table */}
            <div className="space-y-3 pt-2">
              <div className="bg-[#EBF1F8] border-l-4 border-[#1A3A5C] px-4 py-2 flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#1A3A5C] tracking-wide uppercase">
                  Section 6: Final Program Specific Outcome (PSO) Attainment
                </h3>
                <span className="text-[11px] font-semibold text-slate-600">PSO1 – PSO3 Summary</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-[10px] sm:text-[11px] font-sans">
                  <thead>
                    <tr className="bg-[#D9E1F2] border border-slate-900 font-black">
                      <th className="p-2.5 border border-slate-900 font-black w-24">PSO Code</th>
                      <th className="p-2.5 border border-slate-900 font-black text-left">Outcome Statement</th>
                      <th className="p-2.5 border border-slate-900 font-black w-32">Direct ({weights.directWeight}%)</th>
                      <th className="p-2.5 border border-slate-900 font-black w-32">Indirect ({weights.indirectWeight}%)</th>
                      <th className="p-2.5 border border-slate-900 font-black w-36 text-[#1A3A5C]">Final PSO Attainment</th>
                      <th className="p-2.5 border border-slate-900 font-black w-32">NBA Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {psos.map((pso: any) => {
                      const item = finalPSO.find((p: any) => p.psoCode === pso.code);
                      const dir = directMatrix?.averages?.pso[pso.code] ?? (item ? Number(item.directAttainment) : 2.5);
                      const ind = item ? Number(item.indirectAttainment) : 2.4;
                      const fin = item ? Number(item.finalAttainment) : (dir * weights.directWeight / 100 + ind * weights.indirectWeight / 100);
                      const isMet = fin >= 2.0;
                      return (
                        <tr key={pso.code} className="hover:bg-slate-50 border border-slate-900">
                          <td className="p-2 border border-slate-900 font-mono font-black text-[#1A3A5C]">{pso.code}</td>
                          <td className="p-2 border border-slate-900 text-left font-medium text-slate-700">{pso.description}</td>
                          <td className="p-2 border border-slate-900 font-mono font-semibold">{Number(dir).toFixed(2)}</td>
                          <td className="p-2 border border-slate-900 font-mono font-semibold">{Number(ind).toFixed(2)}</td>
                          <td className="p-2 border border-slate-900 font-mono font-black text-sm text-[#1A3A5C] bg-[#EBF1F8]">
                            {Number(fin).toFixed(2)} / 3.0
                          </td>
                          <td className="p-2 border border-slate-900 font-extrabold text-[10px]">
                            <span className={`px-2 py-0.5 rounded ${isMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {isMet ? 'ACHIEVED' : 'IN PROGRESS'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Document Footer (Print view) */}
        <div className="border-t border-slate-300 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] text-slate-500 font-medium">
          <span>{data.collegeName} | Outcome Based Education (OBE) Process Manual</span>
          <span>Generated On: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span>OBE Attainment Management System</span>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Fallback Sample Data for Preview (Matching Screenshots)
// ─────────────────────────────────────────────────────────────
function getFallbackReportData() {
  const pos = [
    { code: 'PO1', description: 'Engineering Knowledge: Apply mathematics, science, engineering fundamentals' },
    { code: 'PO2', description: 'Problem Analysis: Identify, formulate, review research literature' },
    { code: 'PO3', description: 'Design/Development: Design solutions for complex engineering problems' },
    { code: 'PO4', description: 'Conduct Investigations: Use research-based knowledge and methods' },
    { code: 'PO5', description: 'Modern Tool Usage: Create, select, apply appropriate IT techniques' },
    { code: 'PO6', description: 'The Engineer and Society: Apply reasoning informed by contextual knowledge' },
    { code: 'PO7', description: 'Environment and Sustainability: Understand societal context of sustainability' },
    { code: 'PO8', description: 'Ethics: Apply ethical principles and commit to professional ethics' },
    { code: 'PO9', description: 'Individual and Team Work: Function effectively as an individual & leader' },
    { code: 'PO10', description: 'Communication: Communicate effectively on complex engineering activities' },
    { code: 'PO11', description: 'Project Management: Apply engineering and management principles' },
    { code: 'PO12', description: 'Life-long Learning: Recognize the need for independent and life-long learning' },
  ];

  const psos = [
    { code: 'PSO1', description: 'Professional Skills: Design, develop and maintain robust software solutions' },
    { code: 'PSO2', description: 'Problem Solving: Solve complex real-world algorithmic problems efficiently' },
    { code: 'PSO3', description: 'Successful Career: Adapt to emerging technologies and pursue higher studies' },
  ];

  // Course rows matching Screenshot 1 exactly
  const sampleCourses = [
    { code: '210201', name: 'Discrete Mathematics', po: { PO1: 1.20, PO2: 1.31, PO3: 1.09, PO4: 1.36 }, pso: {} },
    { code: '210202', name: 'Fundamentals of Data Structures', po: { PO1: 2.53, PO2: 2.64, PO3: 2.42, PO4: 2.69, PO5: 2.80, PO6: 2.37, PO9: 2.66, PO12: 1.20 }, pso: {} },
    { code: '210203', name: 'Object Oriented Programming', po: { PO1: 1.00, PO2: 1.11, PO3: 0.89, PO4: 1.16, PO5: 1.27, PO8: 2.56, PO9: 3.00, PO12: 2.53 }, pso: {} },
    { code: '210204', name: 'Computer Graphics', po: { PO1: 2.56, PO2: 2.67, PO3: 2.45, PO4: 2.72, PO5: 2.83, PO6: 2.66, PO8: 2.01, PO9: 2.34, PO10: 2.56, PO12: 1.00 }, pso: {} },
    { code: '210205', name: 'Digital Electronics & Logic Design', po: { PO1: 2.01, PO2: 2.12, PO3: 1.90, PO4: 2.17, PO5: 2.28, PO6: 3.00, PO8: 2.66, PO10: 2.01, PO12: 2.56 }, pso: { PSO1: 2.01 } },
    { code: '210206', name: 'Data Structures Lab', po: { PO1: 2.66, PO2: 2.77, PO3: 2.55, PO4: 2.82, PO6: 2.34, PO8: 3.00, PO10: 2.66, PO12: 2.01 }, pso: { PSO1: 2.66 } },
    { code: '210207', name: 'OOP & Computer Graphics Lab', po: { PO1: 3.00, PO2: 2.78, PO3: 3.00, PO4: 3.00, PO7: 2.56, PO8: 2.34, PO12: 2.66 }, pso: { PSO1: 3.00 } },
    { code: '210208', name: 'Digital Electronics Lab', po: { PO1: 2.34, PO2: 2.45, PO3: 2.23, PO4: 2.50, PO5: 2.61, PO7: 2.01, PO11: 2.66 }, pso: { PSO1: 2.34 } },
    { code: '210209', name: 'Business Communication Skills', po: { PO1: 2.43, PO2: 2.54, PO3: 2.32, PO4: 2.59, PO5: 2.70, PO6: 2.56, PO7: 2.66, PO9: 1.20, PO11: 3.00, PO12: 2.56 }, pso: { PSO1: 2.43 } },
    { code: '210210', name: 'Engineering Mathematics III', po: { PO1: 1.89, PO2: 2.00, PO3: 1.78, PO4: 2.05, PO5: 2.16, PO6: 2.01, PO9: 2.53, PO11: 2.34, PO12: 2.01 }, pso: { PSO1: 1.89 } },
    { code: '210211', name: 'Data Structures & Algorithms', po: { PO1: 2.50, PO2: 2.61, PO3: 2.39, PO4: 2.66, PO5: 2.77, PO6: 2.66, PO9: 1.00, PO11: 2.56, PO12: 2.66 }, pso: { PSO1: 2.50 } },
    { code: '210212', name: 'Software Engineering', po: { PO1: 2.41, PO2: 2.52, PO3: 2.30, PO4: 2.57, PO5: 2.68, PO9: 2.56, PO11: 2.01, PO12: 3.00 }, pso: {} },
    { code: '210213', name: 'Microprocessor', po: { PO1: 1.99, PO2: 2.10, PO3: 1.88, PO4: 2.15, PO5: 2.26, PO9: 2.01, PO11: 2.66, PO12: 2.34 }, pso: {} },
    { code: '210214', name: 'Principles of Programming Languages', po: { PO1: 1.78, PO2: 1.89, PO3: 1.67, PO4: 1.94, PO5: 2.05, PO9: 2.66 }, pso: {} },
    { code: '210215', name: 'Project Based Learning', po: { PO1: 2.88, PO2: 2.99, PO3: 2.77, PO4: 2.88, PO7: 2.56 }, pso: {} },
    { code: '210216', name: 'Microprocessor Lab', po: { PO1: 3.00, PO2: 2.77, PO3: 2.89, PO4: 2.32, PO5: 2.93, PO7: 2.01, PO10: 2.56 }, pso: {} },
    { code: '210217', name: 'DSA Lab', po: { PO1: 2.41, PO2: 2.52, PO3: 2.30, PO4: 2.57, PO5: 2.68, PO7: 2.66, PO10: 2.01 }, pso: {} },
    { code: '210218', name: 'Audit Course 4', po: { PO1: 1.89, PO2: 2.00, PO3: 1.78, PO4: 2.05, PO5: 2.16, PO10: 2.66 }, pso: {} },
  ];

  const rows = sampleCourses.map(c => ({
    courseCode: c.code,
    courseName: c.name,
    poValues: c.po as unknown as Record<string, number | null>,
    psoValues: c.pso as unknown as Record<string, number | null>,
  }));

  const averages = {
    po: { PO1: 2.29, PO2: 2.32, PO3: 2.18, PO4: 2.39, PO5: 2.44, PO6: 2.63, PO7: 2.41, PO8: 2.67, PO9: 2.31, PO10: 2.41, PO11: 0.89, PO12: 2.30 },
    pso: { PSO1: 2.52, PSO2: 2.69, PSO3: 2.70 },
  };

  const totals = {
    po: { PO1: 41.28, PO2: 41.79, PO3: 39.30, PO4: 42.97, PO5: 34.18, PO6: 18.40, PO7: 14.46, PO8: 13.37, PO9: 20.76, PO10: 14.46, PO11: 16.03, PO12: 25.33 },
    pso: { PSO1: 17.63, PSO2: 26.90, PSO3: 27.00 },
  };

  const ccaItems = [
    { name: 'Guest Lectures', pso1: 3, pso2: 3, pso3: '', numberOfActivities: 10, attainmentLevel: 3 },
    { name: 'Workshops', pso1: 1, pso2: '', pso3: 2, numberOfActivities: 3, attainmentLevel: 3 },
    { name: 'Student competitions', pso1: 2, pso2: 2, pso3: '', numberOfActivities: 6, attainmentLevel: 3 },
    { name: 'Internships', pso1: 2, pso2: 2, pso3: 2, numberOfActivities: 80, attainmentLevel: 3 },
    { name: 'Student presentations', pso1: 1, pso2: 1, pso3: 1, numberOfActivities: 102, attainmentLevel: 3 },
  ];

  const defaultEmployerRows = [
    { category: 'Job specific skills', poMappings: { PO1: 3, PO2: 3, PO3: 3, PO4: 3, PO5: 3, PO6: 3, PO7: 3, PO8: 3, PO9: 3, PO10: 3, PO11: 3, PO12: 3 }, attainmentPercentage: 88.89, attainmentLevel: 3 },
    { category: 'Problem solving skills', poMappings: { PO1: 3, PO2: 3, PO3: 3, PO4: 3 }, attainmentPercentage: 91.11, attainmentLevel: 3 },
    { category: 'Individual and team work skills', poMappings: { PO9: 3 }, attainmentPercentage: 90.00, attainmentLevel: 3 },
    { category: 'Human Values and Professional Ethical Values', poMappings: { PO8: 3 }, attainmentPercentage: 80.02, attainmentLevel: 3 },
    { category: 'Modern Tool Usage', poMappings: { PO3: 2, PO4: 2, PO5: 3 }, attainmentPercentage: 94.44, attainmentLevel: 3 },
    { category: 'Verbal & Written Capabilities', poMappings: { PO10: 3 }, attainmentPercentage: 88.23, attainmentLevel: 3 },
    { category: 'Leadership skills', poMappings: { PO10: 3, PO11: 3 }, attainmentPercentage: 76.28, attainmentLevel: 3 },
    { category: 'Overall job performance', poMappings: { PO1: 3, PO2: 3, PO3: 3, PO4: 3, PO5: 3, PO6: 3, PO7: 3, PO8: 3, PO9: 3, PO10: 3, PO11: 3, PO12: 3 }, attainmentPercentage: 83.33, attainmentLevel: 3 },
    { category: 'Approach towards lifelong learning skills', poMappings: { PO12: 3 }, attainmentPercentage: 84.44, attainmentLevel: 3 },
  ];

  const empOverall: Record<string, number> = {};
  for (const po of pos) empOverall[po.code] = 3;

  return {
    collegeName: 'D. Y. Patil College of Engineering & Innovation',
    manualTitle: 'Outcome Based Education (OBE) Manual',
    program: { id: 1, name: 'B.E. Computer Engineering', department: { name: 'Department of Computer Engineering' } },
    academicYear: { id: 1, yearRange: '2025-2026' },
    pos,
    psos,
    directMatrix: {
      pos,
      psos,
      rows,
      totals,
      averages,
    },
    ccaItems,
    employerSurvey: {
      rows: defaultEmployerRows,
      overallAttainment: empOverall,
    },
    weights: { directWeight: 80, indirectWeight: 20 },
    finalPO: pos.map(p => ({
      poCode: p.code,
      directAttainment: (averages.po as any)[p.code] || 2.4,
      indirectAttainment: 2.50,
      finalAttainment: ((averages.po as any)[p.code] || 2.4) * 0.8 + 2.50 * 0.2,
    })),
    finalPSO: psos.map(p => ({
      psoCode: p.code,
      directAttainment: (averages.pso as any)[p.code] || 2.5,
      indirectAttainment: 2.40,
      finalAttainment: ((averages.pso as any)[p.code] || 2.5) * 0.8 + 2.40 * 0.2,
    })),
  };
}
