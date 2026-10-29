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
import { useTheme } from '../context/ThemeContext';
import { SuperAdminHub } from '../components/superadmin/SuperAdminHub';
import { superAdminStorage, type CourseAllocation } from '../utils/superAdminData';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Search, Filter, Check, X, UserCheck, BookMarked, ArrowRight, ShieldCheck } from 'lucide-react';

// Color map for static Tailwind compilation & high contrast in all themes
const COLOR_STYLES: Record<string, { text: string; bg: string; border: string; hoverBorder: string }> = {
  sky: {
    text: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-500/15',
    border: 'border-sky-200 dark:border-sky-500/30',
    hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-500/50',
  },
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/15',
    border: 'border-indigo-200 dark:border-indigo-500/30',
    hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-500/50',
  },
  amber: {
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/15',
    border: 'border-amber-200 dark:border-amber-500/30',
    hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500/50',
  },
  emerald: {
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500/50',
  },
  purple: {
    text: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-500/15',
    border: 'border-purple-200 dark:border-purple-500/30',
    hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-500/50',
  },
  red: {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/15',
    border: 'border-rose-200 dark:border-rose-500/30',
    hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-500/50',
  },
};

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
const SuperAdminDashboard: React.FC<{ loading: boolean; onRefresh: () => void }> = ({ loading, onRefresh }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">System Overview — OBE Attainment Hub</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Institution-wide analytics: All departments, programs, and outcomes</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300'}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Super Admin Control Center Hub */}
      <SuperAdminHub />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Departments', value: '5', sub: '8 Programs enrolled', icon: Building2, color: 'sky' },
          { label: 'System Users', value: '24', sub: 'Faculty & Administrators', icon: Users, color: 'indigo' },
          { label: 'Active Students', value: '420', sub: 'Across 4 Batches', icon: Users, color: 'amber' },
          { label: 'Avg PO Attainment', value: '2.45 / 3.0', sub: '10 / 12 POs Met Target', icon: Award, color: 'emerald' },
        ].map((c, i) => {
          const Icon = c.icon;
          const style = COLOR_STYLES[c.color] || COLOR_STYLES.sky;
          return (
            <div key={i} className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{c.label}</p>
                  <h3 className={`text-xl font-extrabold ${style.text} mt-1`}>{c.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} border ${style.border} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Institution PO Attainment (All Programs)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">Direct (80%) + Indirect (20%) vs Target (2.40)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={poChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.8} />
                <XAxis dataKey="poCode" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} domain={[0, 3]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                  itemStyle={{ color: 'inherit' }}
                  labelStyle={{ color: 'inherit', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: isDark ? '#94a3b8' : '#475569' }} />
                <Bar dataKey="direct" name="Direct (80%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="indirect" name="Indirect (20%)" fill="#9333ea" radius={[4, 4, 0, 0]} />
                <Bar dataKey="final" name="Final Attainment" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Outcome Profile
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">PO attainment distribution</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={poChartData}>
                <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="poCode" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 3]} stroke={isDark ? '#475569' : '#94a3b8'} fontSize={9} />
                <Radar name="Final" dataKey="final" stroke="#0284c7" fill="#0284c7" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dept-level attainment table */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs dark:shadow-none backdrop-blur-md">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Department-wise NBA Attainment Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[550px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Department</th>
                <th className="p-4">Programs</th>
                <th className="p-4">Avg CO Attainment</th>
                <th className="p-4">Avg PO Attainment</th>
                <th className="p-4">Target Met</th>
                <th className="p-4">NBA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {[
                { dept: 'Computer Engineering (CSE)', prog: 2, co: '2.68', po: '2.52', met: '10/12', status: 'Compliant' },
                { dept: 'Information Technology (IT)', prog: 1, co: '2.55', po: '2.44', met: '9/12', status: 'Compliant' },
                { dept: 'Electronics & Telecomm (ENTC)', prog: 2, co: '2.42', po: '2.38', met: '8/12', status: 'In Progress' },
                { dept: 'Mechanical Engineering (MECH)', prog: 2, co: '2.35', po: '2.28', met: '7/12', status: 'In Progress' },
                { dept: 'Civil Engineering (CIVIL)', prog: 1, co: '2.60', po: '2.47', met: '9/12', status: 'Compliant' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">{r.dept}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{r.prog}</td>
                  <td className="p-4 text-sky-600 dark:text-sky-400 font-mono font-bold">{r.co}</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-mono font-bold">{r.po}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">{r.met}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────
// HOD DASHBOARD
// ─────────────────────────────────────────────────
const HodDashboard: React.FC<{ loading: boolean; onRefresh: () => void }> = ({ loading, onRefresh }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [allocations, setAllocations] = useState<CourseAllocation[]>(() => superAdminStorage.getAllocations());
  const [faculties, setFaculties] = useState<any[]>(() => superAdminStorage.getFaculties());
  const [courses, setCourses] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<'ALL' | 'FE' | 'SE' | 'TE' | 'BE'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states for Subject & Division Assignment
  const [assignForm, setAssignForm] = useState({
    facultyId: '',
    courseId: '',
    classCode: 'TE',
    division: 'Division A',
    academicYear: '2025-2026',
    semester: 'Semester V',
  });

  const loadData = async () => {
    try {
      const [facRes, crsRes, allocRes] = await Promise.allSettled([
        apiClient.get('/users'),
        apiClient.get('/courses'),
        apiClient.get('/courses/assignments'),
      ]);

      if (facRes.status === 'fulfilled' && facRes.value.data?.success) {
        const remoteFac = facRes.value.data.data || [];
        const localFac = superAdminStorage.getFaculties();
        const merged = [...remoteFac];
        localFac.forEach((lf: any) => {
          if (!merged.some((mf: any) => mf.id === lf.id || mf.email === lf.email)) {
            merged.push(lf);
          }
        });
        setFaculties(merged);
      }

      if (crsRes.status === 'fulfilled' && crsRes.value.data?.success && crsRes.value.data.data.length > 0) {
        setCourses(crsRes.value.data.data);
      } else {
        setCourses([
          { id: 1, code: 'CS501', name: 'Database Management Systems', credits: 4, courseType: 'THEORY' },
          { id: 2, code: 'CS502', name: 'Computer Networks', credits: 4, courseType: 'THEORY' },
          { id: 3, code: 'CS503', name: 'Operating Systems', credits: 3, courseType: 'THEORY' },
          { id: 4, code: 'CS504', name: 'Software Engineering', credits: 3, courseType: 'THEORY' },
          { id: 5, code: 'CS505', name: 'DBMS & Network Laboratory', credits: 2, courseType: 'LAB' },
          { id: 6, code: 'CS506', name: 'Web Technology', credits: 3, courseType: 'THEORY' },
        ]);
      }

      if (allocRes.status === 'fulfilled' && allocRes.value.data?.success && allocRes.value.data.data.length > 0) {
        const remoteAllocs: CourseAllocation[] = allocRes.value.data.data.map((a: any) => ({
          id: a.id,
          facultyId: a.userId,
          facultyName: a.user?.name || 'Faculty Member',
          facultyEmail: a.user?.email,
          employeeId: a.user?.employeeId,
          designation: a.user?.designation || 'Faculty Member',
          courseId: a.courseId,
          courseCode: a.course?.code || 'CRS',
          courseName: a.course?.name || 'Subject',
          credits: a.course?.credits || 3,
          courseType: a.course?.courseType || 'THEORY',
          classCode: a.academicClass || 'TE',
          className: `${a.academicClass || 'TE'} Engineering`,
          division: a.division || 'Division A',
          academicYear: a.academicYear || '2025-2026',
          semester: a.semester || 'Semester V',
          status: 'Active',
          createdAt: a.createdAt,
        }));
        setAllocations(remoteAllocs);
      } else {
        setAllocations(superAdminStorage.getAllocations());
      }
    } catch {
      setAllocations(superAdminStorage.getAllocations());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.facultyId) {
      alert('Please select a faculty member from the dropdown.');
      return;
    }
    if (!assignForm.courseId) {
      alert('Please select a subject from the dropdown.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedFac = faculties.find((f: any) => String(f.id) === String(assignForm.facultyId));
      const selectedCrs = courses.find((c: any) => String(c.id) === String(assignForm.courseId));

      try {
        await apiClient.post('/courses/assignments', {
          courseId: Number(assignForm.courseId),
          userId: Number(assignForm.facultyId),
          academicClass: assignForm.classCode,
          division: assignForm.division,
          academicYear: assignForm.academicYear,
          semester: assignForm.semester,
        });
      } catch (apiErr) {
        console.warn('API assignment fell back to local storage', apiErr);
      }

      superAdminStorage.saveAllocation({
        facultyId: Number(assignForm.facultyId),
        facultyName: selectedFac?.name || 'Faculty Member',
        facultyEmail: selectedFac?.email,
        employeeId: selectedFac?.empId || selectedFac?.employeeId,
        designation: selectedFac?.designation || 'Faculty Member',
        courseId: Number(assignForm.courseId),
        courseCode: selectedCrs?.code || 'CRS',
        courseName: selectedCrs?.name || 'Subject',
        credits: Number(selectedCrs?.credits) || 3,
        courseType: selectedCrs?.courseType || 'THEORY',
        classCode: assignForm.classCode,
        className: `${assignForm.classCode} Engineering`,
        division: assignForm.division,
        academicYear: assignForm.academicYear,
        semester: assignForm.semester,
        departmentId: 1,
        departmentName: 'Department of Computer Engineering',
        status: 'Active',
      });

      setAllocations(superAdminStorage.getAllocations());
      setShowAssignModal(false);
      setNotification({
        type: 'success',
        message: `Successfully assigned "${selectedCrs?.name || 'Subject'}" (${assignForm.classCode} - ${assignForm.division}) to ${selectedFac?.name}!`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to assign subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async (id: number, courseName: string, facultyName: string) => {
    if (!window.confirm(`Are you sure you want to unassign "${courseName}" from ${facultyName}?`)) return;

    try {
      try {
        await apiClient.delete(`/courses/assignments/${id}`);
      } catch (apiErr) {
        console.warn('API unassign fell back to local storage', apiErr);
      }

      superAdminStorage.deleteAllocation(id);
      setAllocations(superAdminStorage.getAllocations());
      setNotification({
        type: 'success',
        message: `Unassigned "${courseName}" from ${facultyName}.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert('Failed to remove assignment: ' + err.message);
    }
  };

  const filteredAllocations = allocations.filter((a) => {
    const matchesSearch =
      a.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.employeeId && a.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = classFilter === 'ALL' || a.classCode === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="hod-dashboard space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Department Dashboard — CSE</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Program attainment health, faculty subject allocations, and NBA compliance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-500/20 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Subject to Faculty</span>
          </button>
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Courses in CSE', value: String(courses.length || 12), sub: 'Theory, Lab & Electives', icon: BookOpen, color: 'sky' },
          { label: 'Faculty Members', value: String(faculties.length || 8), sub: 'Active Department Faculty', icon: Users, color: 'amber' },
          { label: 'Subject Allocations', value: String(allocations.length), sub: 'Assigned Classes & Divisions', icon: UserCheck, color: 'emerald' },
          { label: 'PO Attainment (Dept)', value: '2.52 / 3.0', sub: '10/12 POs achieved target', icon: Award, color: 'purple' },
        ].map((c, i) => {
          const Icon = c.icon;
          const style = COLOR_STYLES[c.color] || COLOR_STYLES.amber;
          return (
            <div key={i} className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{c.label}</p>
                  <h3 className={`text-xl font-extrabold ${style.text} mt-1`}>{c.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} border ${style.border} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Faculty Subject & Division Allocation Management Section */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs dark:shadow-none backdrop-blur-md">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Faculty Subject, Class & Division Allocations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assigned subjects automatically synchronize with each faculty member's Courses & COs view</p>
            </div>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign New Subject</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by faculty name, employee ID, course, or division..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Class:
            </span>
            {(['ALL', 'FE', 'SE', 'TE', 'BE'] as const).map((cls) => (
              <button
                key={cls}
                onClick={() => setClassFilter(cls)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  classFilter === cls
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Allocations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4">Faculty Member</th>
                <th className="p-4">Assigned Subject</th>
                <th className="p-4">Class & Division</th>
                <th className="p-4">Academic Year & Sem</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No course allocations found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAllocations.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs">
                          {a.facultyName.replace(/^Prof.s*|^Dr.s*/i, '').charAt(0) || 'F'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{a.facultyName}</span>
                            {a.employeeId && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {a.employeeId}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{a.designation || 'Faculty Member'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 px-2 py-0.5 rounded text-[11px]">
                          {a.courseCode}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{a.courseName}</span>
                        {a.credits && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">({a.credits} cr)</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30">
                          {a.classCode}
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30">
                          {a.division}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        <span>AY {a.academicYear}</span>
                        {a.semester && <span className="block text-[10px] text-slate-400">{a.semester}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                        {a.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUnassign(a.id, a.courseName, a.facultyName)}
                        title="Unassign Subject"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Attainment Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" /> CSE Department PO Attainment
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">Final attainment vs target (2.40) across all 12 POs</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={poChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.8} />
                <XAxis dataKey="poCode" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} domain={[0, 3]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '11px',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                  itemStyle={{ color: 'inherit' }}
                  labelStyle={{ color: 'inherit', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#475569' }} />
                <Bar dataKey="final" name="Final PO Attainment" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target (2.40)" fill={isDark ? '#334155' : '#cbd5e1'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Multi-Semester Trend
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">PO & PSO attainment progression</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attainmentTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.8} />
                <XAxis dataKey="sem" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={9} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={9} domain={[1.8, 3]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '11px',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    color: isDark ? '#f8fafc' : '#0f172a',
                  }}
                  itemStyle={{ color: 'inherit' }}
                  labelStyle={{ color: 'inherit', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#475569' }} />
                <Line type="monotone" dataKey="po" name="PO Attainment" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pso" name="PSO Attainment" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal: Assign Subject, Class & Division to Faculty */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Assign Subject to Faculty</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Allocate Course, Class & Division in CSE Department</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubject} className="p-5 space-y-4">
              {/* Faculty Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Faculty Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignForm.facultyId}
                  onChange={(e) => setAssignForm({ ...assignForm, facultyId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="">-- Choose Faculty Member from Dropdown --</option>
                  {faculties.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.designation || 'Faculty'} {f.empId || f.employeeId ? `(${f.empId || f.employeeId})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Faculty list populated with registered departmental staff.
                </p>
              </div>

              {/* Subject / Course Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Subject / Course <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignForm.courseId}
                  onChange={(e) => setAssignForm({ ...assignForm, courseId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="">-- Choose Subject / Course --</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name} ({c.credits || 3} Credits · {c.courseType || 'Theory'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Class & Division Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Class (FE / SE / TE / BE) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={assignForm.classCode}
                    onChange={(e) => {
                      const newClass = e.target.value;
                      let defaultSem = 'Semester I';
                      if (newClass === 'SE') defaultSem = 'Semester III';
                      if (newClass === 'TE') defaultSem = 'Semester V';
                      if (newClass === 'BE') defaultSem = 'Semester VII';
                      setAssignForm({ ...assignForm, classCode: newClass, semester: defaultSem });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Division <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={assignForm.division}
                    onChange={(e) => setAssignForm({ ...assignForm, division: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Division A">Division A</option>
                    <option value="Division B">Division B</option>
                    <option value="Division C">Division C</option>
                    <option value="Division D">Division D</option>
                  </select>
                </div>
              </div>

              {/* Academic Year & Semester Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={assignForm.academicYear}
                    onChange={(e) => setAssignForm({ ...assignForm, academicYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="2025-2026">2025-2026 (Current)</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Semester
                  </label>
                  <select
                    value={assignForm.semester}
                    onChange={(e) => setAssignForm({ ...assignForm, semester: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V</option>
                    <option value="Semester VI">Semester VI</option>
                    <option value="Semester VII">Semester VII</option>
                    <option value="Semester VIII">Semester VIII</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Summary */}
              {assignForm.facultyId && assignForm.courseId && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Allocation Preview</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    Assigning <span className="font-bold text-amber-700 dark:text-amber-400">{courses.find((c: any) => String(c.id) === String(assignForm.courseId))?.name}</span> to{' '}
                    <span className="font-bold text-slate-900 dark:text-white">{faculties.find((f: any) => String(f.id) === String(assignForm.facultyId))?.name}</span> for{' '}
                    <span className="font-bold">{assignForm.classCode} — {assignForm.division}</span> ({assignForm.academicYear}).
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md shadow-amber-500/20 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Assigning...' : 'Save & Assign Subject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────────
// FACULTY DASHBOARD
// ─────────────────────────────────────────────────
const FacultyDashboard: React.FC<{ loading: boolean; onRefresh: () => void }> = ({ loading, onRefresh }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();

  const [assignedCourses, setAssignedCourses] = useState<CourseAllocation[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    const loadAssigned = async () => {
      try {
        const res = await apiClient.get('/courses/my-assigned');
        if (res.data?.success && res.data.data && res.data.data.length > 0) {
          const mapped: CourseAllocation[] = res.data.data.map((a: any) => ({
            id: a.id,
            facultyId: a.userId,
            facultyName: a.user?.name || user?.name || 'Faculty Member',
            facultyEmail: a.user?.email,
            employeeId: a.user?.employeeId,
            designation: a.user?.designation,
            courseId: a.courseId,
            courseCode: a.course?.code || 'CRS',
            courseName: a.course?.name || 'Subject',
            credits: a.course?.credits || 4,
            courseType: a.course?.courseType || 'THEORY',
            classCode: a.academicClass || 'TE',
            className: `${a.academicClass || 'TE'} Engineering`,
            division: a.division || 'Division A',
            academicYear: a.academicYear || '2025-2026',
            semester: a.semester || 'Semester V',
            status: 'Active',
            createdAt: a.createdAt,
          }));
          setAssignedCourses(mapped);
          return;
        }
      } catch {
        // fallback to storage
      }

      const local = superAdminStorage.getAllocationsByFaculty(user?.id || user?.email || user?.name || '');
      if (local.length > 0) {
        setAssignedCourses(local);
      } else {
        const all = superAdminStorage.getAllocations();
        setAssignedCourses(all.length > 0 ? [all[0]] : []);
      }
    };

    loadAssigned();
  }, [user]);

  const activeCourse = assignedCourses[selectedIdx] || {
    id: 1,
    courseCode: 'CS501',
    courseName: 'Database Management Systems',
    credits: 4,
    classCode: 'TE',
    division: 'Division A',
    academicYear: '2025-2026',
    semester: 'Semester V',
  };

  const myCourseCoData = [
    { co: 'CO1', ut1: 78, ut2: 82, endSem: 75, final: 2.65, target: 2.50 },
    { co: 'CO2', ut1: 65, ut2: 70, endSem: 62, final: 2.42, target: 2.50 },
    { co: 'CO3', ut1: 85, ut2: 88, endSem: 80, final: 2.88, target: 2.50 },
    { co: 'CO4', ut1: 72, ut2: 75, endSem: 68, final: 2.58, target: 2.50 },
    { co: 'CO5', ut1: 80, ut2: 82, endSem: 76, final: 2.73, target: 2.50 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Course Dashboard</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Assigned Subject:{' '}
            <span className="text-sky-600 dark:text-sky-400 font-bold">{activeCourse.courseName} ({activeCourse.courseCode})</span>
            {' '}· Class: <span className="font-bold text-purple-600 dark:text-purple-400">{activeCourse.classCode}</span>
            {' '}· <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeCourse.division}</span>
            {' '}· AY {activeCourse.academicYear} ({activeCourse.semester || 'Semester V'})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/courses"
            className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <BookCheck className="w-3.5 h-3.5" />
            <span>Open in Courses & COs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Multiple Course Switcher if faculty teaches > 1 subject/division */}
      {assignedCourses.length > 1 && (
        <div className="p-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center gap-2 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-500" /> Switch Assigned Course:
          </span>
          {assignedCourses.map((ac, idx) => (
            <button
              key={ac.id}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span>{ac.courseCode}</span>
              <span className="text-[10px] font-normal opacity-90">({ac.classCode} - {ac.division})</span>
            </button>
          ))}
        </div>
      )}

      {/* Faculty KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Assigned Subject', value: activeCourse.courseCode, sub: `${activeCourse.classCode} · ${activeCourse.division}`, icon: BookOpen, color: 'sky' },
          { label: 'Students in Division', value: '65', sub: `Enrolled in ${activeCourse.division}`, icon: GraduationCap, color: 'indigo' },
          { label: 'Avg CO Attainment', value: '2.65 / 3.0', sub: '4 / 5 COs above target', icon: CheckCircle2, color: 'emerald' },
          { label: 'Marks Pending', value: '0', sub: 'All assessments recorded', icon: ClipboardList, color: 'amber' },
        ].map((c, i) => {
          const Icon = c.icon;
          const style = COLOR_STYLES[c.color] || COLOR_STYLES.emerald;
          return (
            <div key={i} className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{c.label}</p>
                  <h3 className={`text-xl font-extrabold ${style.text} mt-1`}>{c.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} border ${style.border} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* CO attainment per assessment chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <BookCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> CO Attainment — {activeCourse.courseCode} ({activeCourse.division})
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">Final CO attainment vs target (2.50) across COs</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={myCourseCoData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} opacity={0.8} />
                <XAxis dataKey="co" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} domain={[0, 3]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    fontSize: '11px',
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ color: 'inherit' }}
                  labelStyle={{ color: 'inherit', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#475569' }} />
                <Bar dataKey="final" name="CO Attainment" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill={isDark ? '#334155' : '#cbd5e1'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Assessment-wise Pass % per CO
          </h2>
          <div className="space-y-3">
            {myCourseCoData.map((co, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{co.co}</span>
                  <div className="flex gap-4 text-slate-600 dark:text-slate-400 font-medium">
                    <span>UT1: <span className="text-sky-600 dark:text-sky-400 font-bold">{co.ut1}%</span></span>
                    <span>UT2: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{co.ut2}%</span></span>
                    <span>EndSem: <span className="text-purple-600 dark:text-purple-400 font-bold">{co.endSem}%</span></span>
                  </div>
                  <span className={`font-bold ${co.final >= co.target ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {co.final >= co.target ? '✓' : '✗'} {co.final}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${co.final >= co.target ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${(co.final / 3) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Enter Assessment Marks', icon: ClipboardList, href: '/assessments', color: 'sky' },
          { label: 'View CO-PO Mappings', icon: Target, href: '/mappings', color: 'indigo' },
          { label: 'Run CO Attainment', icon: Calculator, href: '/attainment', color: 'emerald' },
          { label: 'Download Course Report', icon: FileSpreadsheet, href: '/reports', color: 'purple' },
        ].map((a, i) => {
          const Icon = a.icon;
          const style = COLOR_STYLES[a.color] || COLOR_STYLES.sky;
          return (
            <a
              key={i}
              href={a.href}
              className={`flex items-center gap-3 p-4 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 ${style.hoverBorder} rounded-xl shadow-xs dark:shadow-none transition-all group`}
            >
              <div className={`w-9 h-9 rounded-lg ${style.bg} ${style.text} border ${style.border} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{a.label}</span>
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Administration Dashboard</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Academic setup, user management, configuration and data entry oversight</p>
      </div>
      <button
        onClick={onRefresh}
        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all self-start sm:self-auto shrink-0 cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`} />
        <span>Refresh</span>
      </button>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[
        { label: 'System Users', value: '24', sub: '6 HODs · 18 Faculty', icon: Users, color: 'indigo' },
        { label: 'Academic Years', value: '4', sub: 'AY 2025-26 is Active', icon: Activity, color: 'sky' },
        { label: 'Programs Configured', value: '8', sub: 'All with PO/PSO set up', icon: BookOpen, color: 'emerald' },
        { label: 'Surveys Collected', value: '284', sub: 'Exit, Alumni, Parent, Employer', icon: Star, color: 'amber' },
      ].map((c, i) => {
        const Icon = c.icon;
        const style = COLOR_STYLES[c.color] || COLOR_STYLES.indigo;
        return (
          <div key={i} className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{c.label}</p>
                <h3 className={`text-xl font-extrabold ${style.text} mt-1`}>{c.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.text} border ${style.border} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-medium">{c.sub}</p>
          </div>
        );
      })}
    </div>

    {/* System setup health checklist */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Academic Setup Checklist
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
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'}`}>
                {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />}
              </div>
              <span className={`text-xs font-medium ${item.done ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>{item.item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-xs dark:shadow-none backdrop-blur-md">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Recent System Activity
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
              marks: 'text-sky-600 dark:text-sky-400', mapping: 'text-indigo-600 dark:text-indigo-400', user: 'text-purple-600 dark:text-purple-400',
              survey: 'text-amber-600 dark:text-amber-400', config: 'text-rose-600 dark:text-rose-400', attainment: 'text-emerald-600 dark:text-emerald-400',
            };
            return (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-300">{log.action}</p>
                  <p className={`text-[10px] ${colorMap[log.type] || 'text-slate-500 dark:text-slate-400'} mt-0.5 font-medium`}>{log.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Quick admin actions */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Manage Academic Setup', icon: Building2, href: '/academic-setup', color: 'sky' },
        { label: 'Manage Users & Roles', icon: Users, href: '/users', color: 'indigo' },
        { label: 'Configure PO/PSO', icon: Target, href: '/outcomes', color: 'emerald' },
        { label: 'Generate Reports', icon: FileSpreadsheet, href: '/reports', color: 'purple' },
      ].map((a, i) => {
        const Icon = a.icon;
        const style = COLOR_STYLES[a.color] || COLOR_STYLES.sky;
        return (
          <a
            key={i}
            href={a.href}
            className={`flex items-center gap-3 p-4 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 ${style.hoverBorder} rounded-xl shadow-xs dark:shadow-none transition-all group`}
          >
            <div className={`w-9 h-9 rounded-lg ${style.bg} ${style.text} border ${style.border} flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{a.label}</span>
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
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  }, [user?.role]);

  const role = user?.role ?? 'SUPER_ADMIN';

  if (role === 'FACULTY') return <FacultyDashboard loading={loading} onRefresh={handleRefresh} />;
  if (role === 'HOD') return <HodDashboard loading={loading} onRefresh={handleRefresh} />;
  if (role === 'ADMIN') return <AdminDashboard loading={loading} onRefresh={handleRefresh} />;
  return <SuperAdminDashboard loading={loading} onRefresh={handleRefresh} />;
};
