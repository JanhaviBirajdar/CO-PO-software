import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Layers,
  BookOpen,
  Briefcase,
  Users,
  Plus,
  CheckCircle,
  X,
  Trash2,
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { isReadOnly } from '../utils/rbac';
import { ReadOnlyNotice } from '../components/common/ReadOnlyNotice';
import {
  superAdminStorage,
  STANDARD_CLASS_CODES,
} from '../utils/superAdminData';
import type { AcademicYear, Department, Stream, AcademicClass, ClassDivision } from '../types';

export const AcademicSetup: React.FC = () => {
  const { user } = useAuth();
  const readOnly = isReadOnly('academic-setup', user?.role);
  const [activeTab, setActiveTab] = useState<
    'years' | 'streams' | 'departments' | 'classes' | 'divisions' | 'batches' | 'students'
  >('years');

  // State data
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [divisions, setDivisions] = useState<ClassDivision[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [yearForm, setYearForm] = useState({ year: '', startDate: '', endDate: '', isCurrent: false });
  const [streamForm, setStreamForm] = useState({ name: '', code: '', degreeLevel: 'UG' as 'UG' | 'PG' | 'Diploma', duration: 4, totalSemesters: 8, description: '' });
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '', streamCode: 'ENG' });
  const [classForm, setClassForm] = useState({ code: 'FE' as 'FE' | 'SE' | 'TE' | 'BE', name: '', departmentId: 1, streamCode: 'ENG', academicYear: '2025-2026', semesterRange: 'Sem I & II' });
  const [divisionForm, setDivisionForm] = useState({ name: 'Division A', code: 'A', classId: 1, capacity: 60, roomNo: '', classTeacher: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'departments') {
        const res = await apiClient.get('/departments');
        if (res.data.data && res.data.data.length > 0) {
          setDepartments(res.data.data);
          return;
        }
      } else if (activeTab === 'years') {
        const res = await apiClient.get('/academic-years');
        if (res.data.data && res.data.data.length > 0) {
          setAcademicYears(res.data.data);
          return;
        }
      } else if (activeTab === 'batches') {
        const res = await apiClient.get('/batches');
        if (res.data.data && res.data.data.length > 0) {
          setBatches(res.data.data);
          return;
        }
      } else if (activeTab === 'students') {
        const res = await apiClient.get('/students');
        if (res.data.data && res.data.data.length > 0) {
          setStudents(res.data.data);
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      setAcademicYears(superAdminStorage.getAcademicYears());
      setStreams(superAdminStorage.getStreams());
      setDepartments(superAdminStorage.getDepartments());
      setClasses(superAdminStorage.getClasses());
      setDivisions(superAdminStorage.getDivisions());
      if (batches.length === 0) {
        setBatches([
          { id: 1, name: '2022-2026 (Final Year)', startYear: 2022, endYear: 2026, program: { name: 'B.E. Computer Engineering' } },
          { id: 2, name: '2023-2027 (Third Year)', startYear: 2023, endYear: 2027, program: { name: 'B.E. Computer Engineering' } },
          { id: 3, name: '2024-2028 (Second Year)', startYear: 2024, endYear: 2028, program: { name: 'B.E. Computer Engineering' } },
        ]);
      }
      if (students.length === 0) {
        setStudents([
          { id: 1, rollNumber: '210201', name: 'Aarav Sharma', email: 'aarav.sharma@obe.edu', batch: { name: '2022-2026' } },
          { id: 2, rollNumber: '210202', name: 'Ananya Patel', email: 'ananya.patel@obe.edu', batch: { name: '2022-2026' } },
          { id: 3, rollNumber: '210203', name: 'Aditya Deshmukh', email: 'aditya.deshmukh@obe.edu', batch: { name: '2022-2026' } },
        ]);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearForm.year) return;
    superAdminStorage.saveAcademicYear(yearForm);
    try {
      await apiClient.post('/academic-years', {
        year: yearForm.year,
        startDate: yearForm.startDate || `${yearForm.year.split('-')[0]}-07-01`,
        endDate: yearForm.endDate || `${parseInt(yearForm.year.split('-')[0]) + 1}-06-30`,
        isCurrent: yearForm.isCurrent,
      });
    } catch {
      // persisted locally
    }
    setShowModal(false);
    setYearForm({ year: '', startDate: '', endDate: '', isCurrent: false });
    fetchData();
  };

  const handleCreateStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamForm.name || !streamForm.code) return;
    superAdminStorage.saveStream(streamForm);
    setShowModal(false);
    setStreamForm({ name: '', code: '', degreeLevel: 'UG', duration: 4, totalSemesters: 8, description: '' });
    fetchData();
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    superAdminStorage.saveDepartment({
      name: deptForm.name,
      code: deptForm.code,
      description: `Stream: ${deptForm.streamCode} · ${deptForm.description || deptForm.name}`,
      isActive: true,
    });
    try {
      await apiClient.post('/departments', {
        name: deptForm.name,
        code: deptForm.code,
        shortName: deptForm.code,
      });
    } catch {
      // persisted locally
    }
    setShowModal(false);
    setDeptForm({ code: '', name: '', description: '', streamCode: 'ENG' });
    fetchData();
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === Number(classForm.departmentId));
    const autoName = classForm.name || `${classForm.code} - ${dept?.name || 'Department'}`;
    superAdminStorage.saveClass({
      code: classForm.code,
      name: autoName,
      departmentId: Number(classForm.departmentId),
      departmentName: dept?.name || 'Engineering',
      streamCode: classForm.streamCode,
      academicYear: classForm.academicYear,
      semesterRange: classForm.semesterRange,
    });
    setShowModal(false);
    setClassForm({ code: 'FE', name: '', departmentId: departments[0]?.id || 1, streamCode: 'ENG', academicYear: '2025-2026', semesterRange: 'Sem I & II' });
    fetchData();
  };

  const handleCreateDivision = (e: React.FormEvent) => {
    e.preventDefault();
    const parentClass = classes.find((c) => c.id === Number(divisionForm.classId));
    superAdminStorage.saveDivision({
      name: divisionForm.name,
      code: divisionForm.code,
      classId: Number(divisionForm.classId),
      classCode: parentClass?.code || 'FE',
      className: parentClass?.name || 'Class',
      departmentName: parentClass?.departmentName || '',
      capacity: Number(divisionForm.capacity),
      roomNo: divisionForm.roomNo,
      classTeacher: divisionForm.classTeacher,
    });
    setShowModal(false);
    setDivisionForm({ name: 'Division A', code: 'A', classId: classes[0]?.id || 1, capacity: 60, roomNo: '', classTeacher: '' });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {readOnly && <ReadOnlyNotice featureName="Academic Setup" />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Academic Hierarchy & Setup</h1>
          <p className="text-xs text-slate-400 mt-1">Configure academic years, streams, departments, classes (FE, SE, TE, BE), and divisions</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add {activeTab.slice(0, -1).toUpperCase()}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'years', label: 'Academic Years', icon: Calendar, count: academicYears.length },
          { id: 'streams', label: 'Streams (Engg/BCA/MBA)', icon: Briefcase, count: streams.length },
          { id: 'departments', label: 'Departments', icon: Building2, count: departments.length },
          { id: 'classes', label: 'Classes (FE, SE, TE, BE)', icon: Layers, count: classes.length },
          { id: 'divisions', label: 'Divisions', icon: BookOpen, count: divisions.length },
          { id: 'batches', label: 'Batches', icon: Users, count: batches.length },
          { id: 'students', label: 'Students', icon: Users, count: students.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md p-4">
        {activeTab === 'years' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {academicYears.map((ay) => (
              <div
                key={ay.id}
                className={`p-4 rounded-xl border ${
                  ay.isCurrent
                    ? 'bg-sky-500/10 border-sky-500/30'
                    : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{ay.year}</span>
                  {ay.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                      Current Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {ay.startDate || 'Jul 1'} → {ay.endDate || 'Jun 30'}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {streams.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-800 bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {s.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{s.degreeLevel} · {s.duration} Years</span>
                </div>
                <h4 className="font-bold text-white mt-2 text-sm">{s.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>Total Semesters: <strong className="text-slate-300">{s.totalSemesters || 8}</strong></span>
                  <span className="text-emerald-400 font-semibold">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-xl border border-slate-800 bg-slate-800/40">
                <span className="px-2 py-0.5 font-bold font-mono text-xs rounded bg-purple-500/20 text-purple-300">
                  {dept.code}
                </span>
                <h4 className="font-bold text-white mt-2 text-sm">{dept.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{dept.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[600px]">
              <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="p-3">Class</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Stream</th>
                  <th className="p-3">Academic Year</th>
                  <th className="p-3">Semesters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-amber-300 bg-amber-500/20">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white">{c.name}</td>
                    <td className="p-3 text-slate-300">{c.departmentName}</td>
                    <td className="p-3 text-indigo-400 font-bold">{c.streamCode || 'ENG'}</td>
                    <td className="p-3 font-mono">{c.academicYear}</td>
                    <td className="p-3 text-slate-400">{c.semesterRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'divisions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {divisions.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-800 bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-500/20 text-teal-300">
                    {d.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    {d.classCode}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white mt-2">{d.className}</h4>
                <p className="text-[10px] text-slate-400">{d.departmentName}</p>
                <div className="mt-3 pt-2 text-[11px] text-slate-300 space-y-0.5 border-t border-slate-800">
                  <div>Intake: <strong className="text-white">{d.capacity || 60}</strong></div>
                  {d.classTeacher && <div>Teacher: {d.classTeacher}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Program</th>
                  <th className="p-4">Years</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-sky-400">{b.name}</td>
                    <td className="p-4 font-medium text-white">{b.program?.name || 'Computer Engineering'}</td>
                    <td className="p-4 text-slate-300">{b.startYear} – {b.endYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-sky-400">{st.rollNumber}</td>
                    <td className="p-4 font-medium text-white">{st.name}</td>
                    <td className="p-4 text-slate-300">{st.batch?.name || '2022-2026'}</td>
                    <td className="p-4 text-slate-400">{st.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Add {activeTab.slice(0, -1).toUpperCase()}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'years' && (
              <form onSubmit={handleCreateYear} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-2027"
                    value={yearForm.year}
                    onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={yearForm.isCurrent}
                    onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })}
                  />
                  <label htmlFor="isCurrent" className="text-slate-300">Set as Current Active Year</label>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-sky-500 font-bold text-white rounded-xl">Save Year</button>
                </div>
              </form>
            )}

            {activeTab === 'streams' && (
              <form onSubmit={handleCreateStream} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Stream Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering / BCA / MBA"
                    value={streamForm.name}
                    onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Stream Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ENG, BCA, MBA"
                      value={streamForm.code}
                      onChange={(e) => setStreamForm({ ...streamForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Degree Level</label>
                    <select
                      value={streamForm.degreeLevel}
                      onChange={(e) => setStreamForm({ ...streamForm, degreeLevel: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="UG">Undergraduate (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                      <option value="Diploma">Diploma</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 font-bold text-white rounded-xl">Save Stream</button>
                </div>
              </form>
            )}

            {activeTab === 'departments' && (
              <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-purple-500 font-bold text-white rounded-xl">Save Department</button>
                </div>
              </form>
            )}

            {activeTab === 'classes' && (
              <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Class Code</label>
                    <select
                      value={classForm.code}
                      onChange={(e) => setClassForm({ ...classForm, code: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                    >
                      {STANDARD_CLASS_CODES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Academic Year</label>
                    <select
                      value={classForm.academicYear}
                      onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.year}>
                          {y.year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={classForm.departmentId}
                    onChange={(e) => setClassForm({ ...classForm, departmentId: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-amber-500 font-bold text-white rounded-xl">Save Class</button>
                </div>
              </form>
            )}

            {activeTab === 'divisions' && (
              <form onSubmit={handleCreateDivision} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Class</label>
                  <select
                    value={divisionForm.classId}
                    onChange={(e) => setDivisionForm({ ...divisionForm, classId: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.code}] {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Division Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Division A"
                      value={divisionForm.name}
                      onChange={(e) => setDivisionForm({ ...divisionForm, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={divisionForm.capacity}
                      onChange={(e) => setDivisionForm({ ...divisionForm, capacity: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-teal-500 font-bold text-white rounded-xl">Save Division</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
