import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line,
} from 'recharts';
import {
  Building2, BookOpen, Users, Target, TrendingUp, Award,
  CheckCircle2, RefreshCw, ClipboardList, Calculator,
  GraduationCap, FileSpreadsheet, Activity, AlertTriangle,
  BookCheck, BarChart3, Layers, Star,
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────
// Shared mock data
// ─────────────────────────────────────────────────
const poChartData = [
  { poCode: 'PO1', direct: 2.6, indirect: 2.2, final: 2.52, target: 2.4 },
  { poCode: 'PO2', direct: 2.4, indirect: 2.1, final: 2.34, target: 2.4 },
  { poCode: 'PO3', direct: 2.7, indirect: 2.5, final: 2.66, target: 2.4 },
  { poCode: 'PO4', direct: 2.3, indirect: 2.0, final: 2.24, target: 2.4 },
  { poCode: 'PO5', direct: 2.8, indirect: 2.6, final: 2.76, target: 2.4 },
  { poCode: 'PO6', direct: 2.5, indirect: 2.3, final: 2.46, target: 2.4 },
  { poCode: 'PO7', direct: 2.2, indirect: 2.1, final: 2.18, target: 2.4 },
  { poCode: 'PO8', direct: 2.6, indirect: 2.4, final: 2.56, target: 2.4 },
  { poCode: 'PO9', direct: 2.4, indirect: 2.5, final: 2.42, target: 2.4 },
  { poCode: 'PO10', direct: 2.7, indirect: 2.6, final: 2.68, target: 2.4 },
  { poCode: 'PO11', direct: 2.3, indirect: 2.2, final: 2.28, target: 2.4 },
  { poCode: 'PO12', direct: 2.5, indirect: 2.4, final: 2.48, target: 2.4 },
];

const attainmentTrend = [
  { sem: 'Sem I', po: 2.10, pso: 2.15 },
  { sem: 'Sem II', po: 2.25, pso: 2.30 },
  { sem: 'Sem III', po: 2.40, pso: 2.35 },
  { sem: 'Sem IV', po: 2.52, pso: 2.48 },
  { sem: 'Sem V', po: 2.45, pso: 2.60 },
  { sem: 'Sem VI', po: 2.62, pso: 2.70 },
];

// ─────────────────────────────────────────────────
// SUPER ADMIN DASHBOARD
// ─────────────────────────────────────────────────
const SuperAdminDashboard: React.FC<{ loading: boolean; onRefresh: () => void }> = ({ loading, onRefresh }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Overview — OBE Attainment Hub</h1>
        <p className="text-xs text-slate-400 mt-1">Institution-wide analytics: All departments, programs, and outcomes</p>
      </div>
      <button onClick={onRefresh} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all">
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
        <span>Refresh Analytics</span>
      </button>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Departments', value: '5', sub: '8 Programs enrolled', icon: Building2, color: 'sky' },
        { label: 'Total Courses', value: '32', sub: 'Active Semester courses', icon: BookOpen, color: 'indigo' },
        { label: 'Active Students', value: '420', sub: 'Across 4 Batches', icon: Users, color: 'amber' },
        { label: 'Avg PO Attainment', value: '2.45 / 3.0', sub: '10 / 12 POs Met Target', icon: Award, color: 'emerald' },
      ].map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className={`bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">{c.label}</p>
                <h3 className={`text-xl font-extrabold text-${c.color}-400 mt-1`}>{c.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${c.color}-500/15 text-${c.color}-400 border border-${c.color}-500/30 flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">{c.sub}</p>
          </div>
        );
      })}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-sky-400" /> Institution PO Attainment (All Programs)
        </h2>
        <p className="text-xs text-slate-400 mb-4">Direct (80%) + Indirect (20%) vs Target (2.40)</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={poChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="poCode" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 3]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="direct" name="Direct (80%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="indirect" name="Indirect (20%)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="final" name="Final Attainment" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-purple-400" /> Outcome Profile
        </h2>
        <p className="text-xs text-slate-400 mb-4">PO attainment distribution</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={poChartData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="poCode" stroke="#94a3b8" fontSize={10} />
              <PolarRadiusAxis angle={30} domain={[0, 3]} stroke="#475569" fontSize={9} />
              <Radar name="Final" dataKey="final" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Dept-level attainment table */}
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-sky-400" />
        <h2 className="text-sm font-bold text-white">Department-wise NBA Attainment Summary</h2>
      </div>
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700">
          <tr>
            <th className="p-4">Department</th>
            <th className="p-4">Programs</th>
            <th className="p-4">Avg CO Attainment</th>
            <th className="p-4">Avg PO Attainment</th>
            <th className="p-4">Target Met</th>
            <th className="p-4">NBA Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-200">
          {[
            { dept: 'Computer Engineering (CSE)', prog: 2, co: '2.68', po: '2.52', met: '10/12', status: 'Compliant' },
            { dept: 'Information Technology (IT)', prog: 1, co: '2.55', po: '2.44', met: '9/12', status: 'Compliant' },
            { dept: 'Electronics & Telecomm (ENTC)', prog: 2, co: '2.42', po: '2.38', met: '8/12', status: 'In Progress' },
            { dept: 'Mechanical Engineering (MECH)', prog: 2, co: '2.35', po: '2.28', met: '7/12', status: 'In Progress' },
            { dept: 'Civil Engineering (CIVIL)', prog: 1, co: '2.60', po: '2.47', met: '9/12', status: 'Compliant' },
          ].map((r, i) => (
            <tr key={i} className="hover:bg-slate-800/30">
              <td className="p-4 font-semibold text-white">{r.dept}</td>
              <td className="p-4">{r.prog}</td>
              <td className="p-4 text-sky-400 font-mono">{r.co}</td>
              <td className="p-4 text-emerald-400 font-mono">{r.po}</td>
              <td className="p-4">{r.met}</td>
              <td className="p-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'Compliant' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─────────────────────────────────────────────────
// HOD DASHBOARD
// ─────────────────────────────────────────────────
const HodDashboard: React.FC<{ loading: boolean; onRefresh: () => void }> = ({ loading, onRefresh }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Department Dashboard — CSE</h1>
        <p className="text-xs text-slate-400 mt-1">Program attainment health, faculty course status, and NBA compliance overview</p>
      </div>
      <button onClick={onRefresh} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all">
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Courses in CSE', value: '12', sub: '6 Theory · 4 Lab · 2 Project', icon: BookOpen, color: 'sky' },
        { label: 'Faculty Members', value: '8', sub: '6 Active, 2 on Leave', icon: Users, color: 'amber' },
        { label: 'PO Attainment (Dept)', value: '2.52 / 3.0', sub: '10/12 POs achieved target', icon: Award, color: 'emerald' },
        { label: 'Pending Approvals', value: '3', sub: 'CO mapping / Marks entry', icon: AlertTriangle, color: 'red' },
      ].map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">{c.label}</p>
                <h3 className={`text-xl font-extrabold text-${c.color}-400 mt-1`}>{c.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${c.color}-500/15 text-${c.color}-400 border border-${c.color}-500/30 flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">{c.sub}</p>
          </div>
        );
      })}
    </div>

    {/* PO Attainment + trend */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-amber-400" /> CSE Department PO Attainment
        </h2>
        <p className="text-xs text-slate-400 mb-4">Final attainment vs target (2.40) across all 12 POs</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={poChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="poCode" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 3]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="final" name="Final PO Attainment" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target (2.40)" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Multi-Semester Trend
        </h2>
        <p className="text-xs text-slate-400 mb-4">PO & PSO attainment progression</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attainmentTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="sem" stroke="#94a3b8" fontSize={9} />
              <YAxis stroke="#94a3b8" fontSize={9} domain={[1.8, 3]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="po" name="PO Attainment" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="pso" name="PSO Attainment" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Faculty course status */}
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Users className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-bold text-white">Faculty Course Status & CO Entry Progress</h2>
      </div>
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700">
          <tr>
            <th className="p-4">Faculty</th>
            <th className="p-4">Assigned Course</th>
            <th className="p-4">CO Mapped</th>
            <th className="p-4">Marks Entered</th>
            <th className="p-4">Avg CO Attainment</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-200">
          {[
            { name: 'Prof. Anjali Sharma', course: 'Data Structures (CS301)', co: '✓', marks: '✓', att: '2.68', ok: true },
            { name: 'Prof. Vikram Deshmukh', course: 'DBMS (CS302)', co: '✓', marks: '✓', att: '2.55', ok: true },
            { name: 'Prof. Neha Kulkarni', course: 'Operating Systems (CS303)', co: '✓', marks: '⚠ Partial', att: '2.40', ok: false },
            { name: 'Prof. Rahul Jadhav', course: 'Computer Networks (CS304)', co: '✓', marks: '✗ Pending', att: '—', ok: false },
            { name: 'Prof. Priya Mehta', course: 'Software Engineering (CS401)', co: '✓', marks: '✓', att: '2.72', ok: true },
          ].map((r, i) => (
            <tr key={i} className="hover:bg-slate-800/30">
              <td className="p-4 font-semibold text-white">{r.name}</td>
              <td className="p-4 text-slate-300">{r.course}</td>
              <td className="p-4 text-emerald-400">{r.co}</td>
              <td className={`p-4 ${r.marks.includes('✓') ? 'text-emerald-400' : r.marks.includes('⚠') ? 'text-amber-400' : 'text-red-400'}`}>{r.marks}</td>
              <td className="p-4 text-sky-400 font-mono">{r.att}</td>
              <td className="p-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.ok ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {r.ok ? 'Complete' : 'Action Needed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─────────────────────────────────────────────────
// FACULTY DASHBOARD
// ─────────────────────────────────────────────────
const FacultyDashboard: React.FC<{ loading: boolean; onRefresh: () => void }> = ({ loading, onRefresh }) => {
  const myCourseCoData = [
    { co: 'CO1', ut1: 78, ut2: 82, endSem: 75, final: 2.65, target: 2.50 },
    { co: 'CO2', ut1: 65, ut2: 70, endSem: 62, final: 2.42, target: 2.50 },
    { co: 'CO3', ut1: 85, ut2: 88, endSem: 80, final: 2.88, target: 2.50 },
    { co: 'CO4', ut1: 72, ut2: 75, endSem: 68, final: 2.58, target: 2.50 },
    { co: 'CO5', ut1: 80, ut2: 82, endSem: 76, final: 2.73, target: 2.50 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Course Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            <span className="text-sky-400 font-semibold">Data Structures & Algorithms (CS301)</span> · Sem V · AY 2025–26
          </p>
        </div>
        <button onClick={onRefresh} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Faculty KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Courses', value: '3', sub: 'This semester', icon: BookOpen, color: 'sky' },
          { label: 'Students Enrolled', value: '62', sub: 'In CS301 (Assigned course)', icon: GraduationCap, color: 'indigo' },
          { label: 'Avg CO Attainment', value: '2.65 / 3.0', sub: '4 / 5 COs above target', icon: CheckCircle2, color: 'emerald' },
          { label: 'Marks Pending', value: '0', sub: 'All assessments entered', icon: ClipboardList, color: 'amber' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400">{c.label}</p>
                  <h3 className={`text-xl font-extrabold text-${c.color}-400 mt-1`}>{c.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${c.color}-500/15 text-${c.color}-400 border border-${c.color}-500/30 flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* CO attainment per assessment chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <BookCheck className="w-4 h-4 text-emerald-400" /> CO Attainment — CS301
          </h2>
          <p className="text-xs text-slate-400 mb-4">Final CO attainment vs target (2.50) across COs</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={myCourseCoData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="co" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 3]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="final" name="CO Attainment" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" /> Assessment-wise Pass % per CO
          </h2>
          <div className="space-y-3">
            {myCourseCoData.map((co, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-200">{co.co}</span>
                  <div className="flex gap-4 text-slate-400">
                    <span>UT1: <span className="text-sky-400 font-semibold">{co.ut1}%</span></span>
                    <span>UT2: <span className="text-indigo-400 font-semibold">{co.ut2}%</span></span>
                    <span>EndSem: <span className="text-purple-400 font-semibold">{co.endSem}%</span></span>
                  </div>
                  <span className={`font-bold ${co.final >= co.target ? 'text-emerald-400' : 'text-red-400'}`}>
                    {co.final >= co.target ? '✓' : '✗'} {co.final}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${co.final >= co.target ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${(co.final / 3) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Enter Assessment Marks', icon: ClipboardList, href: '/assessments', color: 'sky' },
          { label: 'View CO-PO Mappings', icon: Target, href: '/mappings', color: 'indigo' },
          { label: 'Run CO Attainment', icon: Calculator, href: '/attainment', color: 'emerald' },
          { label: 'Download Course Report', icon: FileSpreadsheet, href: '/reports', color: 'purple' },
        ].map((a, i) => {
          const Icon = a.icon;
          return (
            <a key={i} href={a.href} className={`flex items-center gap-3 p-4 bg-slate-900/80 border border-slate-800 hover:border-${a.color}-500/40 rounded-xl transition-all group`}>
              <div className={`w-9 h-9 rounded-lg bg-${a.color}-500/15 text-${a.color}-400 border border-${a.color}-500/30 flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{a.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────
const AdminDashboard: React.FC<{ loading: boolean; onRefresh: () => void }> = ({ loading, onRefresh }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Academic Administration Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Academic setup, user management, configuration and data entry oversight</p>
      </div>
      <button onClick={onRefresh} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all">
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        <span>Refresh</span>
      </button>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'System Users', value: '24', sub: '6 HODs · 18 Faculty', icon: Users, color: 'indigo' },
        { label: 'Academic Years', value: '4', sub: 'AY 2025-26 is Active', icon: Activity, color: 'sky' },
        { label: 'Programs Configured', value: '8', sub: 'All with PO/PSO set up', icon: BookOpen, color: 'emerald' },
        { label: 'Surveys Collected', value: '284', sub: 'Exit, Alumni, Parent, Employer', icon: Star, color: 'amber' },
      ].map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">{c.label}</p>
                <h3 className={`text-xl font-extrabold text-${c.color}-400 mt-1`}>{c.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${c.color}-500/15 text-${c.color}-400 border border-${c.color}-500/30 flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">{c.sub}</p>
          </div>
        );
      })}
    </div>

    {/* System setup health checklist */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Academic Setup Checklist
        </h2>
        <div className="space-y-3">
          {[
            { item: 'Academic Years & Batches configured', done: true },
            { item: 'Departments & Programs created', done: true },
            { item: 'Semesters mapped to Programs', done: true },
            { item: 'PO & PSO defined for all Programs', done: true },
            { item: 'Courses linked to Semesters', done: true },
            { item: 'CO defined for each Course', done: true },
            { item: 'CO-PO Mapping matrix filled', done: false },
            { item: 'Student rosters uploaded (all batches)', done: false },
            { item: 'Assessment types configured', done: true },
            { item: 'Attainment thresholds (L1/L2/L3) set', done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-500" />}
              </div>
              <span className={`text-xs ${item.done ? 'text-slate-300' : 'text-slate-500'}`}>{item.item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-indigo-400" /> Recent System Activity
        </h2>
        <div className="space-y-3">
          {[
            { action: 'Prof. Anjali Sharma entered marks for CS301 UT2', time: '2 hours ago', type: 'marks' },
            { action: 'Dr. Ramesh Patil approved CO-PO mapping for CS302', time: '4 hours ago', type: 'mapping' },
            { action: 'New user Prof. Sagar Joshi created (FACULTY role)', time: '6 hours ago', type: 'user' },
            { action: 'Program Exit Survey batch (112 responses) imported', time: '1 day ago', type: 'survey' },
            { action: 'Attainment thresholds updated by Super Admin', time: '1 day ago', type: 'config' },
            { action: 'PO Attainment calculated for AY 2025-26 Sem V', time: '2 days ago', type: 'attainment' },
          ].map((log, i) => {
            const colorMap: Record<string, string> = {
              marks: 'text-sky-400', mapping: 'text-indigo-400', user: 'text-purple-400',
              survey: 'text-amber-400', config: 'text-red-400', attainment: 'text-emerald-400',
            };
            return (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-300">{log.action}</p>
                  <p className={`text-[10px] ${colorMap[log.type]} mt-0.5`}>{log.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Quick admin actions */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Manage Academic Setup', icon: Building2, href: '/academic-setup', color: 'sky' },
        { label: 'Manage Users & Roles', icon: Users, href: '/users', color: 'indigo' },
        { label: 'Configure PO/PSO', icon: Target, href: '/outcomes', color: 'emerald' },
        { label: 'Generate Reports', icon: FileSpreadsheet, href: '/reports', color: 'purple' },
      ].map((a, i) => {
        const Icon = a.icon;
        return (
          <a key={i} href={a.href} className={`flex items-center gap-3 p-4 bg-slate-900/80 border border-slate-800 hover:border-${a.color}-500/40 rounded-xl transition-all group`}>
            <div className={`w-9 h-9 rounded-lg bg-${a.color}-500/15 text-${a.color}-400 border border-${a.color}-500/30 flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{a.label}</span>
          </a>
        );
      })}
    </div>
  </div>
);

// ─────────────────────────────────────────────────
// MAIN DASHBOARD ROUTER
// ─────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await apiClient.get('/reports/dashboard');
    } catch {
      // offline – just simulate refresh
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    // simulate initial load
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }, [user?.role]);

  const role = user?.role ?? 'SUPER_ADMIN';

  if (role === 'FACULTY') return <FacultyDashboard loading={loading} onRefresh={handleRefresh} />;
  if (role === 'HOD') return <HodDashboard loading={loading} onRefresh={handleRefresh} />;
  if (role === 'ADMIN') return <AdminDashboard loading={loading} onRefresh={handleRefresh} />;
  return <SuperAdminDashboard loading={loading} onRefresh={handleRefresh} />;
};
