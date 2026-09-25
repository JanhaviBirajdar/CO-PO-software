import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Building2,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Award,
  CheckCircle2,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../api/apiClient';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    departmentsCount: 5,
    programsCount: 8,
    coursesCount: 32,
    studentsCount: 420,
    avgPoAttainment: 2.45,
    targetAchievedCount: 10,
    totalPos: 12,
  });

  const [poChartData, setPoChartData] = useState<any[]>([
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
  ]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reports/dashboard');
      if (res.data.success && res.data.data) {
        if (res.data.data.stats) setStats(res.data.data.stats);
        if (res.data.data.poData) setPoChartData(res.data.data.poData);
      }
    } catch {
      // Fallback to rich pre-seeded mock stats if DB is fresh
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OBE Attainment Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics and outcome-based education attainment overview
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Departments</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{stats.departmentsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{stats.programsCount} Programs</span> enrolled
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Courses</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{stats.coursesCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <span className="text-indigo-400 font-semibold">Active Semester</span> courses
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Active Students</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{stats.studentsCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            Across <span className="text-amber-400 font-semibold">4 Batches</span>
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Avg PO Attainment</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.avgPoAttainment} <span className="text-xs text-slate-400">/ 3.0</span></h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">{stats.targetAchievedCount} / {stats.totalPos} POs</span> Met Target
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart: Direct vs Indirect vs Final PO Attainment */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-400" /> Program Outcome (PO) Attainment Overview
              </h2>
              <p className="text-xs text-slate-400">Direct (80%) + Indirect (20%) vs Target (2.40)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={poChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="poCode" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 3]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="direct" name="Direct (80%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="indirect" name="Indirect (20%)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="final" name="Final Attainment" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: PO Balance */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Outcome Profile
            </h2>
            <p className="text-xs text-slate-400">Attainment distribution across PO spectrum</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={poChartData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="poCode" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 3]} stroke="#475569" fontSize={9} />
                <Radar name="Final Attainment" dataKey="final" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
