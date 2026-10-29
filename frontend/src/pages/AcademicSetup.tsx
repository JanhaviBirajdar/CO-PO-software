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
  Edit,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { isReadOnly } from '../utils/rbac';
import { ReadOnlyNotice } from '../components/common/ReadOnlyNotice';
import {
  superAdminStorage,
  STANDARD_CLASS_CODES,
  type BatchItem,
  type StudentItem,
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
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Notification state
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Modal and Edit states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form states
  const [yearForm, setYearForm] = useState({ year: '', startDate: '', endDate: '', isCurrent: false });
  const [streamForm, setStreamForm] = useState({
    name: '',
    code: '',
    degreeLevel: 'UG' as 'UG' | 'PG' | 'Diploma',
    duration: 4,
    totalSemesters: 8,
    description: '',
  });
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '', streamCode: 'ENG' });
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
  const [batchForm, setBatchForm] = useState({
    name: '',
    startYear: 2024,
    endYear: 2028,
    programName: 'B.E. Computer Engineering',
  });
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    batchName: '2022-2026 (Final Year)',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'departments') {
        const res = await apiClient.get('/departments');
        if (res.data.data && res.data.data.length > 0) {
          setDepartments(res.data.data);
        }
      } else if (activeTab === 'years') {
        const res = await apiClient.get('/academic-years');
        if (res.data.data && res.data.data.length > 0) {
          setAcademicYears(res.data.data);
        }
      } else if (activeTab === 'batches') {
        const res = await apiClient.get('/batches');
        if (res.data.data && res.data.data.length > 0) {
          setBatches(res.data.data);
        }
      } else if (activeTab === 'students') {
        const res = await apiClient.get('/students');
        if (res.data.data && res.data.data.length > 0) {
          setStudents(res.data.data);
        }
      }
    } catch {
      // Fallback to local storage
    } finally {
      setAcademicYears(superAdminStorage.getAcademicYears());
      setStreams(superAdminStorage.getStreams());
      setDepartments(superAdminStorage.getDepartments());
      setClasses(superAdminStorage.getClasses());
      setDivisions(superAdminStorage.getDivisions());
      setBatches(superAdminStorage.getBatches());
      setStudents(superAdminStorage.getStudents());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const getTabSingularLabel = (tab: string) => {
    switch (tab) {
      case 'years':
        return 'Academic Year';
      case 'streams':
        return 'Stream';
      case 'departments':
        return 'Department';
      case 'classes':
        return 'Class';
      case 'divisions':
        return 'Division';
      case 'batches':
        return 'Batch';
      case 'students':
        return 'Student';
      default:
        return 'Item';
    }
  };

  // Open Add modal with clean forms
  const handleOpenAddModal = () => {
    setEditingItem(null);
    if (activeTab === 'years') {
      setYearForm({ year: '', startDate: '', endDate: '', isCurrent: false });
    } else if (activeTab === 'streams') {
      setStreamForm({ name: '', code: '', degreeLevel: 'UG', duration: 4, totalSemesters: 8, description: '' });
    } else if (activeTab === 'departments') {
      setDeptForm({ code: '', name: '', description: '', streamCode: 'ENG' });
    } else if (activeTab === 'classes') {
      setClassForm({
        code: 'FE',
        name: '',
        departmentId: departments[0]?.id || 1,
        streamCode: 'ENG',
        academicYear: academicYears.find((y) => y.isCurrent)?.year || '2025-2026',
        semesterRange: 'Sem I & II',
      });
    } else if (activeTab === 'divisions') {
      setDivisionForm({
        name: 'Division A',
        code: 'A',
        classId: classes[0]?.id || 1,
        capacity: 60,
        roomNo: '',
        classTeacher: '',
      });
    } else if (activeTab === 'batches') {
      setBatchForm({
        name: '',
        startYear: 2024,
        endYear: 2028,
        programName: 'B.E. Computer Engineering',
      });
    } else if (activeTab === 'students') {
      setStudentForm({
        name: '',
        rollNumber: '',
        email: '',
        batchName: batches[0]?.name || '2022-2026 (Final Year)',
      });
    }
    setShowModal(true);
  };

  // Edit Handlers
  const handleEditYear = (ay: AcademicYear) => {
    setEditingItem(ay);
    setYearForm({
      year: ay.year,
      startDate: ay.startDate || '',
      endDate: ay.endDate || '',
      isCurrent: ay.isCurrent || false,
    });
    setShowModal(true);
  };

  const handleEditStream = (s: Stream) => {
    setEditingItem(s);
    setStreamForm({
      name: s.name,
      code: s.code,
      degreeLevel: (s.degreeLevel as any) || 'UG',
      duration: s.duration || 4,
      totalSemesters: s.totalSemesters || 8,
      description: s.description || '',
    });
    setShowModal(true);
  };

  const handleEditDept = (dept: Department) => {
    setEditingItem(dept);
    const streamCode = dept.description?.includes('Stream:')
      ? dept.description.split('Stream:')[1].split('·')[0].trim()
      : 'ENG';
    setDeptForm({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
      streamCode,
    });
    setShowModal(true);
  };

  const handleEditClass = (cls: AcademicClass) => {
    setEditingItem(cls);
    setClassForm({
      code: (cls.code as any) || 'FE',
      name: cls.name,
      departmentId: cls.departmentId || 1,
      streamCode: cls.streamCode || 'ENG',
      academicYear: cls.academicYear || '2025-2026',
      semesterRange: cls.semesterRange || 'Sem I & II',
    });
    setShowModal(true);
  };

  const handleEditDivision = (div: ClassDivision) => {
    setEditingItem(div);
    setDivisionForm({
      name: div.name,
      code: div.code,
      classId: div.classId,
      capacity: div.capacity || 60,
      roomNo: div.roomNo || '',
      classTeacher: div.classTeacher || '',
    });
    setShowModal(true);
  };

  const handleEditBatch = (b: BatchItem) => {
    setEditingItem(b);
    setBatchForm({
      name: b.name,
      startYear: b.startYear,
      endYear: b.endYear,
      programName: b.programName || 'B.E. Computer Engineering',
    });
    setShowModal(true);
  };

  const handleEditStudent = (st: StudentItem) => {
    setEditingItem(st);
    setStudentForm({
      name: st.name,
      rollNumber: st.rollNumber,
      email: st.email || '',
      batchName: st.batchName || '2022-2026 (Final Year)',
    });
    setShowModal(true);
  };

  // Delete Handlers
  const handleDeleteYear = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this academic year?')) return;
    superAdminStorage.deleteAcademicYear(id);
    try {
      await apiClient.delete(`/academic-years/${id}`);
    } catch {
      // deleted locally
    }
    fetchData();
    showNotification('Academic Year deleted successfully.');
  };

  const handleDeleteStream = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this stream?')) return;
    superAdminStorage.deleteStream(id);
    fetchData();
    showNotification('Stream deleted successfully.');
  };

  const handleDeleteDept = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    superAdminStorage.deleteDepartment(id);
    try {
      await apiClient.delete(`/departments/${id}`);
    } catch {
      // deleted locally
    }
    fetchData();
    showNotification('Department deleted successfully.');
  };

  const handleDeleteClass = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    superAdminStorage.deleteClass(id);
    fetchData();
    showNotification('Class deleted successfully.');
  };

  const handleDeleteDivision = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this division?')) return;
    superAdminStorage.deleteDivision(id);
    fetchData();
    showNotification('Division deleted successfully.');
  };

  const handleDeleteBatch = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    superAdminStorage.deleteBatch(id);
    try {
      await apiClient.delete(`/batches/${id}`);
    } catch {
      // deleted locally
    }
    fetchData();
    showNotification('Batch deleted successfully.');
  };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    superAdminStorage.deleteStudent(id);
    try {
      await apiClient.delete(`/students/${id}`);
    } catch {
      // deleted locally
    }
    fetchData();
    showNotification('Student deleted successfully.');
  };

  // Save / Update Handlers
  const handleSaveYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearForm.year) return;
    if (editingItem) {
      superAdminStorage.saveAcademicYear({
        ...yearForm,
        id: editingItem.id,
      });
      try {
        await apiClient.put(`/academic-years/${editingItem.id}`, yearForm);
      } catch {
        // persisted locally
      }
      showNotification(`Academic Year "${yearForm.year}" updated successfully.`);
    } else {
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
      showNotification(`Academic Year "${yearForm.year}" created successfully.`);
    }
    setShowModal(false);
    setEditingItem(null);
    setYearForm({ year: '', startDate: '', endDate: '', isCurrent: false });
    fetchData();
  };

  const handleSaveStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamForm.name || !streamForm.code) return;
    if (editingItem) {
      superAdminStorage.saveStream({
        ...streamForm,
        id: editingItem.id,
      });
      showNotification(`Stream "${streamForm.name}" updated successfully.`);
    } else {
      superAdminStorage.saveStream(streamForm);
      showNotification(`Stream "${streamForm.name}" created successfully.`);
    }
    setShowModal(false);
    setEditingItem(null);
    setStreamForm({ name: '', code: '', degreeLevel: 'UG', duration: 4, totalSemesters: 8, description: '' });
    fetchData();
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    const formattedDesc = deptForm.description?.startsWith('Stream:')
      ? deptForm.description
      : `Stream: ${deptForm.streamCode} · ${deptForm.description || deptForm.name}`;

    if (editingItem) {
      superAdminStorage.saveDepartment({
        id: editingItem.id,
        name: deptForm.name,
        code: deptForm.code,
        description: formattedDesc,
        isActive: true,
      });
      try {
        await apiClient.put(`/departments/${editingItem.id}`, {
          name: deptForm.name,
          code: deptForm.code,
          shortName: deptForm.code,
        });
      } catch {
        // persisted locally
      }
      showNotification(`Department "${deptForm.name}" updated successfully.`);
    } else {
      superAdminStorage.saveDepartment({
        name: deptForm.name,
        code: deptForm.code,
        description: formattedDesc,
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
      showNotification(`Department "${deptForm.name}" created successfully.`);
    }
    setShowModal(false);
    setEditingItem(null);
    setDeptForm({ code: '', name: '', description: '', streamCode: 'ENG' });
    fetchData();
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === Number(classForm.departmentId));
    const autoName = classForm.name || `${classForm.code} - ${dept?.name || 'Department'}`;

    if (editingItem) {
      superAdminStorage.saveClass({
        id: editingItem.id,
        code: classForm.code,
        name: autoName,
        departmentId: Number(classForm.departmentId),
        departmentName: dept?.name || 'Department',
        streamCode: classForm.streamCode,
        academicYear: classForm.academicYear,
        semesterRange: classForm.semesterRange,
      });
      showNotification(`Class "${autoName}" updated successfully.`);
    } else {
      superAdminStorage.saveClass({
        code: classForm.code,
        name: autoName,
        departmentId: Number(classForm.departmentId),
        departmentName: dept?.name || 'Department',
        streamCode: classForm.streamCode,
        academicYear: classForm.academicYear,
        semesterRange: classForm.semesterRange,
      });
      showNotification(`Class "${autoName}" created successfully.`);
    }
    setShowModal(false);
    setEditingItem(null);
    setClassForm({
      code: 'FE',
      name: '',
      departmentId: departments[0]?.id || 1,
      streamCode: 'ENG',
      academicYear: academicYears.find((y) => y.isCurrent)?.year || '2025-2026',
      semesterRange: 'Sem I & II',
    });
    fetchData();
  };

  const handleSaveDivision = (e: React.FormEvent) => {
    e.preventDefault();
    const parentClass = classes.find((c) => c.id === Number(divisionForm.classId));

    if (editingItem) {
      superAdminStorage.saveDivision({
        id: editingItem.id,
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
      showNotification(`Division "${divisionForm.name}" updated successfully.`);
    } else {
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
      showNotification(`Division "${divisionForm.name}" created successfully.`);
    }
    setShowModal(false);
    setEditingItem(null);
    setDivisionForm({ name: 'Division A', code: 'A', classId: classes[0]?.id || 1, capacity: 60, roomNo: '', classTeacher: '' });
    fetchData();
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.name) return;

    if (editingItem) {
      superAdminStorage.saveBatch({
        id: editingItem.id,
        name: batchForm.name,
        startYear: Number(batchForm.startYear),
        endYear: Number(batchForm.endYear),
        programName: batchForm.programName,
        isActive: true,
      });
      try {
        await apiClient.put(`/batches/${editingItem.id}`, batchForm);
      } catch {
        // persisted locally
      }
      showNotification(`Batch "${batchForm.name}" updated successfully.`);
    } else {
      superAdminStorage.saveBatch({
        name: batchForm.name,
        startYear: Number(batchForm.startYear),
        endYear: Number(batchForm.endYear),
        programName: batchForm.programName,
        isActive: true,
      });
      try {
        await apiClient.post('/batches', batchForm);
      } catch {
        // persisted locally
      }
      showNotification(`Batch "${batchForm.name}" created successfully.`);
    }
    setShowModal(false);
    setEditingItem(null);
    setBatchForm({ name: '', startYear: 2024, endYear: 2028, programName: 'B.E. Computer Engineering' });
    fetchData();
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.rollNumber) return;

    if (editingItem) {
      superAdminStorage.saveStudent({
        id: editingItem.id,
        name: studentForm.name,
        rollNumber: studentForm.rollNumber,
        email: studentForm.email,
        batchName: studentForm.batchName,
        isActive: true,
      });
      try {
        await apiClient.put(`/students/${editingItem.id}`, studentForm);
      } catch {
        // persisted locally
      }
      showNotification(`Student "${studentForm.name}" updated successfully.`);
    } else {
      superAdminStorage.saveStudent({
        name: studentForm.name,
        rollNumber: studentForm.rollNumber,
        email: studentForm.email,
        batchName: studentForm.batchName,
        isActive: true,
      });
      try {
        await apiClient.post('/students', studentForm);
      } catch {
        // persisted locally
      }
      showNotification(`Student "${studentForm.name}" added successfully.`);
    }
    setShowModal(false);
    setEditingItem(null);
    setStudentForm({ name: '', rollNumber: '', email: '', batchName: batches[0]?.name || '2022-2026 (Final Year)' });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {readOnly && <ReadOnlyNotice featureName="Academic Setup" />}

      {/* Notification */}
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Academic Hierarchy & Setup</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure, edit, and manage academic years, streams, departments, classes (FE, SE, TE, BE), divisions, batches, and students
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add {getTabSingularLabel(activeTab)}</span>
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
        {/* TAB 1: Academic Years */}
        {activeTab === 'years' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {academicYears.map((ay) => (
              <div
                key={ay.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  ay.isCurrent
                    ? 'bg-sky-500/10 border-sky-500/30'
                    : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{ay.year}</span>
                    <div className="flex items-center space-x-1.5">
                      {ay.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                          Current Active
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {ay.startDate || 'Jul 1'} → {ay.endDate || 'Jun 30'}
                  </p>
                </div>

                {!readOnly && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    {!ay.isCurrent ? (
                      <button
                        onClick={() => {
                          superAdminStorage.saveAcademicYear({ ...ay, isCurrent: true });
                          fetchData();
                          showNotification(`${ay.year} set as Current Active Year`);
                        }}
                        className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                      >
                        Set as Current
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium">Default Year</span>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditYear(ay)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Academic Year"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteYear(ay.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Academic Year"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Streams */}
        {activeTab === 'streams' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {streams.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {s.code}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{s.degreeLevel} · {s.duration} Years</span>
                  </div>
                  <h4 className="font-bold text-white mt-2 text-sm">{s.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Total Semesters: <strong className="text-slate-300">{s.totalSemesters || 8}</strong></span>
                  {!readOnly && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditStream(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Stream"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStream(s.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Stream"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: Departments */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 font-bold font-mono text-xs rounded bg-purple-500/20 text-purple-300">
                      {dept.code}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400">Active</span>
                  </div>
                  <h4 className="font-bold text-white mt-2 text-sm">{dept.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{dept.description}</p>
                </div>

                {!readOnly && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end space-x-1">
                    <button
                      onClick={() => handleEditDept(dept)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Department"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(dept.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Classes */}
        {activeTab === 'classes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="p-3">Class</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Stream</th>
                  <th className="p-3">Academic Year</th>
                  <th className="p-3">Semesters</th>
                  {!readOnly && <th className="p-3 text-right">Actions</th>}
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
                    {!readOnly && (
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleEditClass(c)}
                            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Class"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(c.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: Divisions */}
        {activeTab === 'divisions' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {divisions.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 flex flex-col justify-between">
                <div>
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
                    {d.roomNo && <div className="text-[10px] text-slate-400">Room: {d.roomNo}</div>}
                  </div>
                </div>

                {!readOnly && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-end space-x-1">
                    <button
                      onClick={() => handleEditDivision(d)}
                      className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Division"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDivision(d.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Division"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: Batches */}
        {activeTab === 'batches' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Program</th>
                  <th className="p-4">Years</th>
                  {!readOnly && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-sky-400">{b.name}</td>
                    <td className="p-4 font-medium text-white">{b.programName || 'Computer Engineering'}</td>
                    <td className="p-4 text-slate-300">{b.startYear} – {b.endYear}</td>
                    {!readOnly && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleEditBatch(b)}
                            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Batch"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(b.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 7: Students */}
        {activeTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Email</th>
                  {!readOnly && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-sky-400">{st.rollNumber}</td>
                    <td className="p-4 font-medium text-white">{st.name}</td>
                    <td className="p-4 text-slate-300">{st.batchName || '2022-2026'}</td>
                    <td className="p-4 text-slate-400">{st.email || '—'}</td>
                    {!readOnly && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleEditStudent(st)}
                            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unified Creation & Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                {editingItem ? 'Edit' : 'Add'} {getTabSingularLabel(activeTab)}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal: Academic Year Form */}
            {activeTab === 'years' && (
              <form onSubmit={handleSaveYear} className="space-y-4 text-xs">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={yearForm.startDate}
                      onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">End Date</label>
                    <input
                      type="date"
                      value={yearForm.endDate}
                      onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={yearForm.isCurrent}
                    onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })}
                    className="rounded border-slate-700 text-sky-500 focus:ring-sky-500"
                  />
                  <label htmlFor="isCurrent" className="text-slate-300 cursor-pointer">Set as Current Active Year</label>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-sky-500 hover:bg-sky-400 font-bold text-white rounded-xl">
                    {editingItem ? 'Update Year' : 'Save Year'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Stream Form */}
            {activeTab === 'streams' && (
              <form onSubmit={handleSaveStream} className="space-y-4 text-xs">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={streamForm.duration}
                      onChange={(e) => setStreamForm({ ...streamForm, duration: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Total Semesters</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={streamForm.totalSemesters}
                      onChange={(e) => setStreamForm({ ...streamForm, totalSemesters: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of stream curriculum"
                    value={streamForm.description}
                    onChange={(e) => setStreamForm({ ...streamForm, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 font-bold text-white rounded-xl">
                    {editingItem ? 'Update Stream' : 'Save Stream'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Department Form */}
            {activeTab === 'departments' && (
              <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Stream</label>
                  <select
                    value={deptForm.streamCode}
                    onChange={(e) => setDeptForm({ ...deptForm, streamCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    {streams.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE"
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
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
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Short description"
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-purple-500 hover:bg-purple-400 font-bold text-white rounded-xl">
                    {editingItem ? 'Update Department' : 'Save Department'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Class Form */}
            {activeTab === 'classes' && (
              <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Stream</label>
                    <select
                      value={classForm.streamCode}
                      onChange={(e) => setClassForm({ ...classForm, streamCode: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      {streams.map((s) => (
                        <option key={s.id} value={s.code}>
                          {s.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Semesters</label>
                    <input
                      type="text"
                      placeholder="e.g. Sem I & II"
                      value={classForm.semesterRange}
                      onChange={(e) => setClassForm({ ...classForm, semesterRange: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Display Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if left blank"
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 font-bold text-white rounded-xl">
                    {editingItem ? 'Update Class' : 'Save Class'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Division Form */}
            {activeTab === 'divisions' && (
              <form onSubmit={handleSaveDivision} className="space-y-4 text-xs">
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Room No</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 201"
                      value={divisionForm.roomNo}
                      onChange={(e) => setDivisionForm({ ...divisionForm, roomNo: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Class Teacher</label>
                    <input
                      type="text"
                      placeholder="e.g. Prof. Anjali Sharma"
                      value={divisionForm.classTeacher}
                      onChange={(e) => setDivisionForm({ ...divisionForm, classTeacher: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-teal-500 hover:bg-teal-400 font-bold text-white rounded-xl">
                    {editingItem ? 'Update Division' : 'Save Division'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Batch Form */}
            {activeTab === 'batches' && (
              <form onSubmit={handleSaveBatch} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Batch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024-2028 (First Year)"
                    value={batchForm.name}
                    onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Program / Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.E. Computer Engineering"
                    value={batchForm.programName}
                    onChange={(e) => setBatchForm({ ...batchForm, programName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Start Year</label>
                    <input
                      type="number"
                      required
                      value={batchForm.startYear}
                      onChange={(e) => setBatchForm({ ...batchForm, startYear: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">End Year</label>
                    <input
                      type="number"
                      required
                      value={batchForm.endYear}
                      onChange={(e) => setBatchForm({ ...batchForm, endYear: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-sky-500 hover:bg-sky-400 font-bold text-white rounded-xl">
                    {editingItem ? 'Update Batch' : 'Save Batch'}
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Student Form */}
            {activeTab === 'students' && (
              <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 210201"
                      value={studentForm.rollNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Batch</label>
                    <select
                      value={studentForm.batchName}
                      onChange={(e) => setStudentForm({ ...studentForm, batchName: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="e.g. aarav.sharma@obe.edu"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-sky-500 hover:bg-sky-400 font-bold text-white rounded-xl">
                    {editingItem ? 'Update Student' : 'Save Student'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
