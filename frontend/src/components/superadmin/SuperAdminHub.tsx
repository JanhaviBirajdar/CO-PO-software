import React, { useState, useEffect } from 'react';
import {
  Building2,
  GraduationCap,
  Calendar,
  Users,
  Target,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  Briefcase,
  X,
  BookOpen,
  Award,
  ShieldCheck,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import {
  superAdminStorage,
  FACULTY_DESIGNATIONS,
  STANDARD_CLASS_CODES,
  type FacultyMember,
  type ProgramOutcomeExtended,
  type ProgramSpecificOutcomeExtended,
} from '../../utils/superAdminData';
import type { AcademicYear, Department, Stream, AcademicClass, ClassDivision } from '../../types';
import { apiClient } from '../../api/apiClient';

interface SuperAdminHubProps {
  initialTab?: 'analytics' | 'academic' | 'faculty' | 'outcomes';
}

export const SuperAdminHub: React.FC<SuperAdminHubProps> = ({ initialTab = 'academic' }) => {
  const [activeMainTab, setActiveMainTab] = useState<'analytics' | 'academic' | 'faculty' | 'outcomes'>(initialTab);
  const [academicSubTab, setAcademicSubTab] = useState<'years' | 'streams' | 'departments' | 'classes' | 'divisions'>('years');
  const [outcomesSubTab, setOutcomesSubTab] = useState<'pos' | 'psos'>('pos');

  // Data states
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [divisions, setDivisions] = useState<ClassDivision[]>([]);
  const [faculties, setFaculties] = useState<FacultyMember[]>([]);
  const [pos, setPos] = useState<ProgramOutcomeExtended[]>([]);
  const [psos, setPsos] = useState<ProgramSpecificOutcomeExtended[]>([]);

  // Search & Filter
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('ALL');
  const [facultyDesignationFilter, setFacultyDesignationFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [streamFilter, setStreamFilter] = useState('ALL');

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'year' | 'stream' | 'department' | 'class' | 'division' | 'faculty' | 'outcome' | null
  >(null);

  // Form states
  const [yearForm, setYearForm] = useState({
    year: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });

  const [streamForm, setStreamForm] = useState({
    name: '',
    code: '',
    degreeLevel: 'UG' as 'UG' | 'PG' | 'Diploma',
    duration: 4,
    totalSemesters: 8,
    description: '',
  });

  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    streamCode: 'ENG',
    description: '',
  });

  const [classForm, setClassForm] = useState({
    code: 'FE' as 'FE' | 'SE' | 'TE' | 'BE',
    name: '',
    departmentId: 1,
    streamCode: 'ENG',
    academicYear: '2025-2026',
    semesterRange: 'Sem I & II',
  });

  const [divisionForm, setDivisionForm] = useState({
    name: 'Division A',
    code: 'A',
    classId: 1,
    capacity: 60,
    roomNo: '',
    classTeacher: '',
  });

  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    designation: 'Assistant Professor',
    role: 'FACULTY',
    departmentId: 1,
    empId: '',
    phone: '',
    status: 'Active' as 'Active' | 'On Leave',
  });

  const [outcomeForm, setOutcomeForm] = useState({
    type: 'PO' as 'PO' | 'PSO',
    code: 'PO13',
    number: 13,
    title: '',
    description: '',
    streamCode: 'ENG',
    targetLevel: 2.4,
  });

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    setAcademicYears(superAdminStorage.getAcademicYears());
    setStreams(superAdminStorage.getStreams());
    setDepartments(superAdminStorage.getDepartments());
    setClasses(superAdminStorage.getClasses());
    setDivisions(superAdminStorage.getDivisions());
    setFaculties(superAdminStorage.getFaculties());
    setPos(superAdminStorage.getPOs());
    setPsos(superAdminStorage.getPSOs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // ─── Handlers ───────────────────────────────────────────────

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearForm.year) return;
    try {
      superAdminStorage.saveAcademicYear(yearForm);
      try {
        await apiClient.post('/academic-years', {
          year: yearForm.year,
          startDate: yearForm.startDate || `${yearForm.year.split('-')[0]}-07-01`,
          endDate: yearForm.endDate || `${parseInt(yearForm.year.split('-')[0]) + 1}-06-30`,
          isCurrent: yearForm.isCurrent,
        });
      } catch {
        // saved locally
      }
      setYearForm({ year: '', startDate: '', endDate: '', isCurrent: false });
      setActiveModal(null);
      loadData();
      showNotification(`Academic Year ${yearForm.year} created successfully.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to create academic year', 'error');
    }
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamForm.name || !streamForm.code) return;
    try {
      superAdminStorage.saveStream(streamForm);
      setStreamForm({ name: '', code: '', degreeLevel: 'UG', duration: 4, totalSemesters: 8, description: '' });
      setActiveModal(null);
      loadData();
      showNotification(`Stream "${streamForm.name}" created successfully.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to create stream', 'error');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    try {
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
        // saved locally
      }
      setDeptForm({ name: '', code: '', streamCode: 'ENG', description: '' });
      setActiveModal(null);
      loadData();
      showNotification(`Department "${deptForm.name}" added successfully.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to create department', 'error');
    }
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
    setClassForm({
      code: 'FE',
      name: '',
      departmentId: departments[0]?.id || 1,
      streamCode: 'ENG',
      academicYear: '2025-2026',
      semesterRange: 'Sem I & II',
    });
    setActiveModal(null);
    loadData();
    showNotification(`Class "${autoName}" created successfully.`);
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
    setDivisionForm({
      name: 'Division A',
      code: 'A',
      classId: classes[0]?.id || 1,
      capacity: 60,
      roomNo: '',
      classTeacher: '',
    });
    setActiveModal(null);
    loadData();
    showNotification(`Division "${divisionForm.name}" created for ${parentClass?.name || 'Class'}.`);
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name || !facultyForm.email) return;
    const dept = departments.find((d) => d.id === Number(facultyForm.departmentId));
    try {
      superAdminStorage.saveFaculty({
        name: facultyForm.name,
        email: facultyForm.email,
        designation: facultyForm.designation,
        role: facultyForm.role,
        departmentId: Number(facultyForm.departmentId),
        departmentName: dept?.name || 'Department',
        empId: facultyForm.empId || `FAC-${Math.floor(100 + Math.random() * 900)}`,
        phone: facultyForm.phone,
        status: facultyForm.status,
      });

      try {
        await apiClient.post('/users', {
          name: facultyForm.name,
          email: facultyForm.email,
          password: 'Password@123',
          role: facultyForm.role,
          departmentId: Number(facultyForm.departmentId),
          designation: facultyForm.designation,
        });
      } catch {
        // persisted locally
      }

      setFacultyForm({
        name: '',
        email: '',
        designation: 'Assistant Professor',
        role: 'FACULTY',
        departmentId: departments[0]?.id || 1,
        empId: '',
        phone: '',
        status: 'Active',
      });
      setActiveModal(null);
      loadData();
      showNotification(`Faculty "${facultyForm.name}" (${facultyForm.designation}) added successfully.`);
    } catch (err: any) {
      showNotification(err.message || 'Failed to add faculty', 'error');
    }
  };

  const handleCreateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeForm.code || !outcomeForm.description) return;
    try {
      if (outcomeForm.type === 'PO') {
        superAdminStorage.savePO({
          code: outcomeForm.code.toUpperCase().trim(),
          number: Number(outcomeForm.number) || 1,
          title: outcomeForm.title || outcomeForm.code,
          description: outcomeForm.description,
          streamCode: outcomeForm.streamCode,
          targetLevel: Number(outcomeForm.targetLevel) || 2.4,
          programId: 1,
          isActive: true,
        });
        try {
          await apiClient.post('/pos', {
            code: outcomeForm.code.toUpperCase().trim(),
            number: Number(outcomeForm.number) || 1,
            description: outcomeForm.description,
            programId: 1,
          });
        } catch {
          // saved locally
        }
        showNotification(`Program Outcome ${outcomeForm.code} created successfully.`);
      } else {
        superAdminStorage.savePSO({
          code: outcomeForm.code.toUpperCase().trim(),
          number: Number(outcomeForm.number) || 1,
          title: outcomeForm.title || outcomeForm.code,
          description: outcomeForm.description,
          streamCode: outcomeForm.streamCode,
          targetLevel: Number(outcomeForm.targetLevel) || 2.5,
          programId: 1,
          isActive: true,
        });
        try {
          await apiClient.post('/psos', {
            code: outcomeForm.code.toUpperCase().trim(),
            number: Number(outcomeForm.number) || 1,
            description: outcomeForm.description,
            programId: 1,
          });
        } catch {
          // saved locally
        }
        showNotification(`Program Specific Outcome ${outcomeForm.code} created successfully.`);
      }

      setOutcomeForm({
        type: 'PO',
        code: `PO${pos.length + 1}`,
        number: pos.length + 1,
        title: '',
        description: '',
        streamCode: 'ENG',
        targetLevel: 2.4,
      });
      setActiveModal(null);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to create outcome', 'error');
    }
  };

  // Filtered faculties
  const filteredFaculties = faculties.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
      f.email.toLowerCase().includes(facultySearch.toLowerCase()) ||
      (f.empId && f.empId.toLowerCase().includes(facultySearch.toLowerCase()));
    const matchesDept = facultyDeptFilter === 'ALL' || f.departmentName === facultyDeptFilter;
    const matchesDesig = facultyDesignationFilter === 'ALL' || f.designation === facultyDesignationFilter;
    return matchesSearch && matchesDept && matchesDesig;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between shadow-lg text-xs font-semibold animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="p-1 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400 border border-sky-300 dark:border-sky-500/30">
                Super Admin Configuration Control
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Institutional Setup & Governance Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create academic years, streams, departments, classes, divisions, faculty appointments, and NBA outcomes.
            </p>
          </div>

          {/* Quick Creation Buttons Dropdown/Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveModal('year')}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Academic Year</span>
            </button>
            <button
              onClick={() => setActiveModal('stream')}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>+ Stream</span>
            </button>
            <button
              onClick={() => setActiveModal('department')}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ Department</span>
            </button>
            <button
              onClick={() => setActiveModal('class')}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>+ Class (FE/SE/TE/BE)</span>
            </button>
            <button
              onClick={() => setActiveModal('division')}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>+ Division</span>
            </button>
            <button
              onClick={() => setActiveModal('faculty')}
              className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Faculty</span>
            </button>
            <button
              onClick={() => setActiveModal('outcome')}
              className="px-3 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-rose-500/20 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>+ Add PO / PSO</span>
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 mt-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveMainTab('academic')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'academic'
                ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Academic Setup & Hierarchy</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-200/60 dark:bg-sky-500/20">
              {academicYears.length + streams.length + departments.length + classes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('faculty')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'faculty'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Faculty Management (Designations)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-500/20">
              {faculties.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('outcomes')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'outcomes'
                ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Program Outcomes (PO & PSO)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-200/60 dark:bg-purple-500/20">
              {pos.length + psos.length}
            </span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: ACADEMIC SETUP & HIERARCHY
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'academic' && (
        <div className="space-y-4">
          {/* Sub tabs: Years | Streams | Departments | Classes | Divisions */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'years', label: '1. Academic Years', count: academicYears.length },
              { id: 'streams', label: '2. Streams (Engg/BCA/MBA)', count: streams.length },
              { id: 'departments', label: '3. Departments', count: departments.length },
              { id: 'classes', label: '4. Classes (FE, SE, TE, BE)', count: classes.length },
              { id: 'divisions', label: '5. Divisions in Classes', count: divisions.length },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setAcademicSubTab(st.id as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  academicSubTab === st.id
                    ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span>{st.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Subtab: Academic Years */}
          {academicSubTab === 'years' && (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Configured Academic Years</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Institutional calendar periods and active evaluation cycle</p>
                </div>
                <button
                  onClick={() => setActiveModal('year')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Academic Year</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {academicYears.map((ay) => (
                  <div
                    key={ay.id}
                    className={`p-4 rounded-xl border transition-all ${
                      ay.isCurrent
                        ? 'bg-sky-50/70 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{ay.year}</span>
                      {ay.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                          Current AY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Duration: {ay.startDate || 'Jul 1'} → {ay.endDate || 'Jun 30'}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                      {!ay.isCurrent && (
                        <button
                          onClick={() => {
                            superAdminStorage.saveAcademicYear({ ...ay, isCurrent: true });
                            loadData();
                            showNotification(`${ay.year} set as Current Academic Year`);
                          }}
                          className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Set as Current
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab: Streams */}
          {academicSubTab === 'streams' && (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Streams</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Faculty streams (Engineering, BCA, MBA, etc.)</p>
                </div>
                <button
                  onClick={() => setActiveModal('stream')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Stream</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {streams.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        {s.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {s.degreeLevel || 'UG'} Degree · {s.duration || 4} Years
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mt-2">{s.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {s.description || 'Program curriculum structure'}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Total Semesters: <strong className="text-slate-800 dark:text-slate-200">{s.totalSemesters || 8}</strong></span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Configured</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab: Departments */}
          {academicSubTab === 'departments' && (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Departments</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Departments under Engineering, BCA, MBA streams</p>
                </div>
                <button
                  onClick={() => setActiveModal('department')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Department</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                        {d.code}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{d.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{d.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab: Classes (FE, SE, TE, BE) */}
          {academicSubTab === 'classes' && (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Class Hierarchy (FE, SE, TE, BE)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Standard graduation years and semesters across departments</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">All Class Codes</option>
                    <option value="FE">FE (First Year)</option>
                    <option value="SE">SE (Second Year)</option>
                    <option value="TE">TE (Third Year)</option>
                    <option value="BE">BE (Final Year)</option>
                  </select>
                  <button
                    onClick={() => setActiveModal('class')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Class</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Class Code</th>
                      <th className="p-3">Class Title</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Stream</th>
                      <th className="p-3">Semesters</th>
                      <th className="p-3">Academic Year</th>
                      <th className="p-3">Divisions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {classes
                      .filter((c) => classFilter === 'ALL' || c.code === classFilter)
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-3">
                            <span className="px-2 py-0.5 font-bold font-mono rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                              {c.code}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{c.departmentName}</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold">
                              {c.streamCode || 'ENG'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{c.semesterRange || 'Sem I & II'}</td>
                          <td className="p-3 font-mono">{c.academicYear || '2025-2026'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                              {divisions.filter((d) => d.classId === c.id).length || c.divisionsCount || 1} Divs
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab: Divisions in Classes */}
          {academicSubTab === 'divisions' && (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Divisions in Classes</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Class sections (Div A, Div B...) and student intake capacity</p>
                </div>
                <button
                  onClick={() => setActiveModal('division')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Division</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {divisions.map((div) => (
                  <div key={div.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 font-bold text-xs rounded bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300">
                        {div.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {div.classCode}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">{div.className}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{div.departmentName}</p>
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                      <div>Intake: <strong className="text-slate-800 dark:text-slate-200">{div.capacity || 60} Students</strong></div>
                      {div.classTeacher && (
                        <div>Teacher: <span className="text-sky-600 dark:text-sky-400 font-medium">{div.classTeacher}</span></div>
                      )}
                      {div.roomNo && (
                        <div>Room: <span className="font-mono text-slate-500">{div.roomNo}</span></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FACULTY MANAGEMENT (WITH DESIGNATION DROPDOWN)
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'faculty' && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Faculty Directory & Appointment Designations</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage teaching faculty, designations (Professor, Assistant Professor, HOD, Lab Incharge, Academic Dean, NBA Coordinator) and department roles.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('faculty')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-sm self-start md:self-auto cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Faculty</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-4 border border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search faculty name, email or ID..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-xs rounded-lg pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <select
                value={facultyDesignationFilter}
                onChange={(e) => setFacultyDesignationFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-xs rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Designations</option>
                {FACULTY_DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={facultyDeptFilter}
                onChange={(e) => setFacultyDeptFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 text-xs rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Faculty Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Faculty Member</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredFaculties.map((f) => {
                  const isHOD = f.designation.includes('HOD');
                  const isDean = f.designation.includes('Dean');
                  const isProf = f.designation === 'Professor';
                  const isCoordinator = f.designation.includes('Coordinator');
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{f.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{f.email}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                            isDean
                              ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30'
                              : isHOD
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                              : isProf
                              ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30'
                              : isCoordinator
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                          }`}
                        >
                          <Briefcase className="w-3 h-3" />
                          <span>{f.designation}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{f.departmentName}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {f.role}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{f.empId || '—'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          {f.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            superAdminStorage.deleteFaculty(f.id);
                            loadData();
                            showNotification(`Removed ${f.name} from faculty directory`);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Remove Faculty"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: PROGRAM OUTCOMES (PO & PSO)
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'outcomes' && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Program Outcomes (POs) & Program Specific Outcomes (PSOs)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define and configure NBA Graduate Attributes (PO1 - PO12) and specialization PSOs.
              </p>
            </div>
            <button
              onClick={() => setActiveModal('outcome')}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Outcome (PO / PSO)</span>
            </button>
          </div>

          {/* Sub tabs: POs vs PSOs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 mb-4">
            <button
              onClick={() => setOutcomesSubTab('pos')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                outcomesSubTab === 'pos'
                  ? 'border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300'
                  : 'border-transparent text-slate-500 dark:text-slate-400'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Program Outcomes (PO1 - PO12)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                {pos.length}
              </span>
            </button>
            <button
              onClick={() => setOutcomesSubTab('psos')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                outcomesSubTab === 'psos'
                  ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                  : 'border-transparent text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Program Specific Outcomes (PSOs)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {psos.length}
              </span>
            </button>
          </div>

          {/* PO List */}
          {outcomesSubTab === 'pos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pos.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 font-bold font-mono text-xs rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                        {p.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Target: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{p.targetLevel || 2.4}/3.0</strong>
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                      {p.title || `Outcome ${p.code}`}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Stream: <strong className="text-slate-700 dark:text-slate-300">{p.streamCode || 'ENG'}</strong></span>
                    <button
                      onClick={() => {
                        superAdminStorage.deletePO(p.id);
                        loadData();
                        showNotification(`Removed ${p.code}`);
                      }}
                      className="text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PSO List */}
          {outcomesSubTab === 'psos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {psos.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 font-bold font-mono text-xs rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        {p.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Target: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{p.targetLevel || 2.5}/3.0</strong>
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                      {p.title || `Specific Outcome ${p.code}`}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Stream: <strong className="text-slate-700 dark:text-slate-300">{p.streamCode || 'ENG'}</strong></span>
                    <button
                      onClick={() => {
                        superAdminStorage.deletePSO(p.id);
                        loadData();
                        showNotification(`Removed ${p.code}`);
                      }}
                      className="text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CREATION MODALS
      ───────────────────────────────────────────────────────────── */}

      {/* Modal 1: Academic Year */}
      {activeModal === 'year' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Create Academic Year</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateYear} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year Range</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-2027"
                  value={yearForm.year}
                  onChange={(e) => setYearForm({ ...yearForm, year: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={yearForm.startDate}
                    onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={yearForm.endDate}
                    onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentYear"
                  checked={yearForm.isCurrent}
                  onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })}
                  className="rounded border-slate-300 text-sky-600"
                />
                <label htmlFor="isCurrentYear" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Set as Current Academic Year
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Academic Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Stream */}
      {activeModal === 'stream' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Create Stream (Engineering / BCA / MBA)</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateStream} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stream Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering / BCA / MBA / Pharmacy"
                  value={streamForm.name}
                  onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stream Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENG, BCA, MBA"
                    value={streamForm.code}
                    onChange={(e) => setStreamForm({ ...streamForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree Level</label>
                  <select
                    value={streamForm.degreeLevel}
                    onChange={(e) => setStreamForm({ ...streamForm, degreeLevel: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="Diploma">Diploma / Polytechnic</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={streamForm.duration}
                    onChange={(e) =>
                      setStreamForm({
                        ...streamForm,
                        duration: Number(e.target.value),
                        totalSemesters: Number(e.target.value) * 2,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Semesters</label>
                  <input
                    type="number"
                    value={streamForm.totalSemesters}
                    onChange={(e) => setStreamForm({ ...streamForm, totalSemesters: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details about program curriculum standards and scope..."
                  value={streamForm.description}
                  onChange={(e) => setStreamForm({ ...streamForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Department */}
      {activeModal === 'department' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Create Department</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Computer Science & Engineering"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE, IT, MECH"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Affiliated Stream</label>
                  <select
                    value={deptForm.streamCode}
                    onChange={(e) => setDeptForm({ ...deptForm, streamCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    {streams.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Focus Areas</label>
                <textarea
                  rows={2}
                  placeholder="Specialization description or degree program details..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Class (FE, SE, TE, BE) */}
      {activeModal === 'class' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Create Class (FE, SE, TE, BE)</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Class Code</label>
                  <select
                    value={classForm.code}
                    onChange={(e) => {
                      const code = e.target.value as any;
                      const semMap: Record<string, string> = {
                        FE: 'Sem I & II',
                        SE: 'Sem III & IV',
                        TE: 'Sem V & VI',
                        BE: 'Sem VII & VIII',
                      };
                      setClassForm({
                        ...classForm,
                        code,
                        semesterRange: semMap[code] || 'Sem I & II',
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                  >
                    {STANDARD_CLASS_CODES.map((c) => (
                      <option key={c} value={c}>
                        {c} ({c === 'FE' ? 'First Year' : c === 'SE' ? 'Second Year' : c === 'TE' ? 'Third Year' : 'Final Year'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                  <select
                    value={classForm.academicYear}
                    onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  >
                    {academicYears.map((y) => (
                      <option key={y.id} value={y.year}>
                        {y.year} {y.isCurrent ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={classForm.departmentId}
                  onChange={(e) => setClassForm({ ...classForm, departmentId: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stream</label>
                  <select
                    value={classForm.streamCode}
                    onChange={(e) => setClassForm({ ...classForm, streamCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    {streams.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester Cycle</label>
                  <input
                    type="text"
                    value={classForm.semesterRange}
                    onChange={(e) => setClassForm({ ...classForm, semesterRange: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Class Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Third Year Computer Engineering (TE-CSE)"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Division in Class */}
      {activeModal === 'division' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Create Division in Class</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDivision} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Class</label>
                <select
                  value={divisionForm.classId}
                  onChange={(e) => setDivisionForm({ ...divisionForm, classId: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name} · {c.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Division Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Division A / Div B"
                    value={divisionForm.name}
                    onChange={(e) => setDivisionForm({ ...divisionForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Division Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A, B, C"
                    value={divisionForm.code}
                    onChange={(e) => setDivisionForm({ ...divisionForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Student Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="150"
                    value={divisionForm.capacity}
                    onChange={(e) => setDivisionForm({ ...divisionForm, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Room / Lab No.</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 301 / Lab 4"
                    value={divisionForm.roomNo}
                    onChange={(e) => setDivisionForm({ ...divisionForm, roomNo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Class Teacher / Mentor</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Anjali Sharma"
                  value={divisionForm.classTeacher}
                  onChange={(e) => setDivisionForm({ ...divisionForm, classTeacher: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Add Faculty (with Designation Dropdown) */}
      {activeModal === 'faculty' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Add Faculty Member</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select designation from dropdown and assign department role
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Patil / Prof. Anjali Sharma"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. anjali.s@obe.edu"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation (Select Dropdown)
                  </label>
                  <select
                    value={facultyForm.designation}
                    onChange={(e) => {
                      const desig = e.target.value;
                      let role = 'FACULTY';
                      if (desig.includes('HOD')) role = 'HOD';
                      else if (desig.includes('Dean')) role = 'ADMIN';
                      else if (desig.includes('Coordinator')) role = 'DEPARTMENT_COORDINATOR';
                      setFacultyForm({ ...facultyForm, designation: desig, role });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                  >
                    {FACULTY_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={facultyForm.departmentId}
                    onChange={(e) => setFacultyForm({ ...facultyForm, departmentId: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">System Role</label>
                  <select
                    value={facultyForm.role}
                    onChange={(e) => setFacultyForm({ ...facultyForm, role: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  >
                    <option value="FACULTY">FACULTY (Course Teacher)</option>
                    <option value="HOD">HOD (Head of Department)</option>
                    <option value="DEPARTMENT_COORDINATOR">DEPARTMENT_COORDINATOR</option>
                    <option value="ADMIN">ADMIN / DEAN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. EMP-2025-01"
                    value={facultyForm.empId}
                    onChange={(e) => setFacultyForm({ ...facultyForm, empId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={facultyForm.status}
                    onChange={(e) => setFacultyForm({ ...facultyForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Add Program Outcome (PO) / PSO */}
      {activeModal === 'outcome' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Create Program Outcome (PO) or PSO</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add NBA graduate attributes or program specific outcomes
                </p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOutcome} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Outcome Category</label>
                  <select
                    value={outcomeForm.type}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      const nextCode = type === 'PO' ? `PO${pos.length + 1}` : `PSO${psos.length + 1}`;
                      setOutcomeForm({
                        ...outcomeForm,
                        type,
                        code: nextCode,
                        number: type === 'PO' ? pos.length + 1 : psos.length + 1,
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="PO">Program Outcome (PO)</option>
                    <option value="PSO">Program Specific Outcome (PSO)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Outcome Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO1, PO2... or PSO1"
                    value={outcomeForm.code}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, code: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Affiliated Stream</label>
                  <select
                    value={outcomeForm.streamCode}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, streamCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    {streams.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Attainment (out of 3.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="3.0"
                    value={outcomeForm.targetLevel}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, targetLevel: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Title / Heading</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering Knowledge / Problem Analysis / Cloud Architecture"
                  value={outcomeForm.title}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Statement Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Official graduate attribute statement or program specific outcome competencies..."
                  value={outcomeForm.description}
                  onChange={(e) => setOutcomeForm({ ...outcomeForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

