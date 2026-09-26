import React, { useState, useEffect } from 'react';
import { Building2, GraduationCap, Calendar, Users, Plus, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { isReadOnly } from '../utils/rbac';
import { ReadOnlyNotice } from '../components/common/ReadOnlyNotice';

export const AcademicSetup: React.FC = () => {
  const { user } = useAuth();
  const readOnly = isReadOnly('academic-setup', user?.role);
  const [activeTab, setActiveTab] = useState<'departments' | 'programs' | 'years' | 'batches' | 'students'>('departments');

  // State data
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '' });
  const [progForm, setProgForm] = useState({ code: '', name: '', departmentId: '' });
  const [yearForm, setYearForm] = useState({ year: '', startDate: '', endDate: '', isCurrent: false });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'departments') {
        const res = await apiClient.get('/academic/departments');
        setDepartments(res.data.data || []);
      } else if (activeTab === 'programs') {
        const res = await apiClient.get('/academic/programs');
        setPrograms(res.data.data || []);
      } else if (activeTab === 'years') {
        const res = await apiClient.get('/academic/years');
        setAcademicYears(res.data.data || []);
      } else if (activeTab === 'batches') {
        const res = await apiClient.get('/academic/batches');
        setBatches(res.data.data || []);
      } else if (activeTab === 'students') {
        const res = await apiClient.get('/academic/students');
        setStudents(res.data.data || []);
      }
    } catch {
      // Fallback sample data for offline exploration
      if (activeTab === 'departments') {
        setDepartments([
          { id: 1, code: 'CSE', name: 'Department of Computer Engineering', description: 'Computing, Software Systems & Data Engineering', isActive: true },
          { id: 2, code: 'AI&DS', name: 'Artificial Intelligence & Data Science', description: 'Machine Learning, Deep Learning & Big Data', isActive: true },
          { id: 3, code: 'IT', name: 'Information Technology', description: 'Network Security, Cloud Computing & Web Technologies', isActive: true },
          { id: 4, code: 'ECE', name: 'Electronics & Telecommunication', description: 'Embedded Systems, IoT & VLSI Design', isActive: true },
          { id: 5, code: 'MECH', name: 'Mechanical Engineering', description: 'Thermal Engineering, Robotics & CAD/CAM', isActive: true },
        ]);
      } else if (activeTab === 'programs') {
        setPrograms([
          { id: 1, code: 'BE-CSE', name: 'B.E. Computer Engineering', department: { name: 'Department of Computer Engineering' }, isActive: true },
          { id: 2, code: 'BTECH-AIDS', name: 'B.Tech AI & Data Science', department: { name: 'Artificial Intelligence & Data Science' }, isActive: true },
          { id: 3, code: 'BE-IT', name: 'B.E. Information Technology', department: { name: 'Information Technology' }, isActive: true },
        ]);
      } else if (activeTab === 'years') {
        setAcademicYears([
          { id: 1, yearRange: '2025-2026', isCurrent: true, startDate: '2025-07-01', endDate: '2026-06-30' },
          { id: 2, yearRange: '2024-2025', isCurrent: false, startDate: '2024-07-01', endDate: '2025-06-30' },
          { id: 3, yearRange: '2023-2024', isCurrent: false, startDate: '2023-07-01', endDate: '2024-06-30' },
        ]);
      } else if (activeTab === 'batches') {
        setBatches([
          { id: 1, name: '2022-2026 (Final Year)', startYear: 2022, endYear: 2026, program: { name: 'B.E. Computer Engineering' } },
          { id: 2, name: '2023-2027 (Third Year)', startYear: 2023, endYear: 2027, program: { name: 'B.E. Computer Engineering' } },
          { id: 3, name: '2024-2028 (Second Year)', startYear: 2024, endYear: 2028, program: { name: 'B.E. Computer Engineering' } },
        ]);
      } else if (activeTab === 'students') {
        setStudents([
          { id: 1, rollNumber: '210201', name: 'Aarav Sharma', email: 'aarav.sharma@obe.edu', batch: { name: '2022-2026' } },
          { id: 2, rollNumber: '210202', name: 'Ananya Patel', email: 'ananya.patel@obe.edu', batch: { name: '2022-2026' } },
          { id: 3, rollNumber: '210203', name: 'Aditya Deshmukh', email: 'aditya.deshmukh@obe.edu', batch: { name: '2022-2026' } },
          { id: 4, rollNumber: '210204', name: 'Bhavna Kulkarni', email: 'bhavna.kulkarni@obe.edu', batch: { name: '2022-2026' } },
          { id: 5, rollNumber: '210205', name: 'Chaitanya Joshi', email: 'chaitanya.joshi@obe.edu', batch: { name: '2022-2026' } },
          { id: 6, rollNumber: '210206', name: 'Divya Iyer', email: 'divya.iyer@obe.edu', batch: { name: '2022-2026' } },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/academic/departments', deptForm);
      setShowModal(false);
      setDeptForm({ code: '', name: '', description: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create department');
    }
  };

  const handleCreateProg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/academic/programs', {
        ...progForm,
        departmentId: Number(progForm.departmentId),
      });
      setShowModal(false);
      setProgForm({ code: '', name: '', departmentId: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create program');
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Map yearRange UI field to backend's 'year' field
      await apiClient.post('/academic/years', {
        year:      yearForm.year,
        startDate: yearForm.startDate || `${yearForm.year.split('-')[0]}-06-01`,
        endDate:   yearForm.endDate   || `20${yearForm.year.split('-')[1]}-05-31`,
        isCurrent: yearForm.isCurrent,
      });
      setShowModal(false);
      setYearForm({ year: '', startDate: '', endDate: '', isCurrent: false });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create academic year');
    }
  };

  return (
    <div className="space-y-6">
      {readOnly && <ReadOnlyNotice featureName="Academic Setup" />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Academic Setup</h1>
          <p className="text-xs text-slate-400 mt-1">Configure departments, degree programs, academic sessions & student rosters</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {activeTab.slice(0, -1).toUpperCase()}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-1">
        {[
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'programs', label: 'Degree Programs', icon: GraduationCap },
          { id: 'years', label: 'Academic Years', icon: Calendar },
          { id: 'batches', label: 'Batches & Semesters', icon: Calendar },
          { id: 'students', label: 'Student Roster', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading data...</div>
        ) : (
          <>
            {activeTab === 'departments' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Department Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No departments found. Click 'Add New Department' to create one.
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-sky-400">{dept.code}</td>
                        <td className="p-4 font-medium text-white">{dept.name}</td>
                        <td className="p-4 text-slate-400">{dept.description || '—'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${dept.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {dept.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="p-1.5 text-slate-400 hover:text-sky-400"><Edit className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'programs' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Program Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {programs.map((prog) => (
                    <tr key={prog.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-purple-400">{prog.code}</td>
                      <td className="p-4 font-medium text-white">{prog.name}</td>
                      <td className="p-4 text-slate-300">{prog.department?.name || '—'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'years' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                  <tr>
                    <th className="p-4">Academic Year</th>
                    <th className="p-4">Current Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {academicYears.map((yr) => (
                    <tr key={yr.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-amber-400">{yr.year || yr.yearRange}</td>
                      <td className="p-4">
                        {yr.isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">Current Active Year</span>
                        ) : (
                          <span className="text-slate-500">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'students' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                  <tr>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Student Name</th>
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
            )}
          </>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Add {activeTab.slice(0, -1).toUpperCase()}</h2>
            
            {activeTab === 'departments' && (
              <form onSubmit={handleCreateDept} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CSE"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Computer Science & Engineering"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-sky-500 text-white text-xs font-semibold rounded-xl">Save</button>
                </div>
              </form>
            )}

            {activeTab === 'years' && (
              <form onSubmit={handleCreateYear} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year Range</label>
                  <input
                    type="text"
                    required
                    placeholder="2026-27"
                    value={yearForm.year}
                    onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Format: YYYY-YY (e.g. 2024-25)</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={yearForm.isCurrent}
                    onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })}
                  />
                  <label htmlFor="isCurrent" className="text-xs text-slate-300">Set as Current Active Session</label>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-sky-500 text-white text-xs font-semibold rounded-xl">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
