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
  Edit,
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
  Key,
  Mail,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  superAdminStorage,
  FACULTY_DESIGNATIONS,
  STANDARD_CLASS_CODES,
  generateDepartmentEmployeeId,
  generateSecurePassword,
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
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Password & copy states
  const [showFacultyPassword, setShowFacultyPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Credentials confirmation modal
  const [credentialsModal, setCredentialsModal] = useState<{
    name: string;
    email: string;
    empId: string;
    password: string;
    designation: string;
    departmentName: string;
    emailSent: boolean;
  } | null>(null);

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
    password: '',
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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenAddModal = (modal: 'year' | 'stream' | 'department' | 'class' | 'division' | 'faculty' | 'outcome') => {
    setEditingItem(null);
    if (modal === 'year') {
      setYearForm({ year: '', startDate: '', endDate: '', isCurrent: false });
    } else if (modal === 'stream') {
      setStreamForm({ name: '', code: '', degreeLevel: 'UG', duration: 4, totalSemesters: 8, description: '' });
    } else if (modal === 'department') {
      setDeptForm({ name: '', code: '', streamCode: streams[0]?.code || 'ENG', description: '' });
    } else if (modal === 'class') {
      setClassForm({
        code: 'FE',
        name: '',
        departmentId: departments[0]?.id || 1,
        streamCode: 'ENG',
        academicYear: academicYears.find((y) => y.isCurrent)?.year || '2025-2026',
        semesterRange: 'Sem I & II',
      });
    } else if (modal === 'division') {
      setDivisionForm({
        name: 'Division A',
        code: 'A',
        classId: classes[0]?.id || 1,
        capacity: 60,
        roomNo: '',
        classTeacher: '',
      });
    } else if (modal === 'faculty') {
      const initialDeptId = departments[0]?.id || 1;
      const initialEmpId = generateDepartmentEmployeeId(initialDeptId);
      const initialPassword = generateSecurePassword();

      setFacultyForm({
        name: '',
        email: '',
        password: initialPassword,
        empId: initialEmpId,
        designation: 'Assistant Professor',
        role: 'FACULTY',
        departmentId: initialDeptId,
        phone: '',
        status: 'Active',
      });
    } else if (modal === 'outcome') {
      const isPO = outcomesSubTab === 'pos';
      setOutcomeForm({
        type: isPO ? 'PO' : 'PSO',
        code: isPO ? `PO${pos.length + 1}` : `PSO${psos.length + 1}`,
        number: isPO ? pos.length + 1 : psos.length + 1,
        title: '',
        description: '',
        streamCode: 'ENG',
        targetLevel: isPO ? 2.4 : 2.5,
      });
    }
    setActiveModal(modal);
  };

  // Edit open handlers
  const handleOpenEditYear = (ay: AcademicYear) => {
    setEditingItem(ay);
    setYearForm({
      year: ay.year,
      startDate: ay.startDate || '',
      endDate: ay.endDate || '',
      isCurrent: ay.isCurrent || false,
    });
    setActiveModal('year');
  };

  const handleOpenEditStream = (s: Stream) => {
    setEditingItem(s);
    setStreamForm({
      name: s.name,
      code: s.code,
      degreeLevel: (s.degreeLevel as any) || 'UG',
      duration: s.duration || 4,
      totalSemesters: s.totalSemesters || 8,
      description: s.description || '',
    });
    setActiveModal('stream');
  };

  const handleOpenEditDepartment = (d: Department) => {
    setEditingItem(d);
    const streamCode = d.description?.includes('Stream:')
      ? d.description.split('Stream:')[1].split('·')[0].trim()
      : 'ENG';
    setDeptForm({
      name: d.name,
      code: d.code,
      streamCode,
      description: d.description || '',
    });
    setActiveModal('department');
  };

  const handleOpenEditClass = (c: AcademicClass) => {
    setEditingItem(c);
    setClassForm({
      code: (c.code as any) || 'FE',
      name: c.name,
      departmentId: c.departmentId || 1,
      streamCode: c.streamCode || 'ENG',
      academicYear: c.academicYear || '2025-2026',
      semesterRange: c.semesterRange || 'Sem I & II',
    });
    setActiveModal('class');
  };

  const handleOpenEditDivision = (div: ClassDivision) => {
    setEditingItem(div);
    setDivisionForm({
      name: div.name,
      code: div.code,
      classId: div.classId,
      capacity: div.capacity || 60,
      roomNo: div.roomNo || '',
      classTeacher: div.classTeacher || '',
    });
    setActiveModal('division');
  };

  const handleOpenEditFaculty = (f: FacultyMember) => {
    setEditingItem(f);
    setFacultyForm({
      name: f.name,
      email: f.email,
      password: '',
      designation: f.designation || 'Assistant Professor',
      role: f.role || 'FACULTY',
      departmentId: f.departmentId || departments[0]?.id || 1,
      empId: f.empId || '',
      phone: f.phone || '',
      status: (f.status as any) || 'Active',
    });
    setActiveModal('faculty');
  };

  const handleRegenerateFacultyPassword = () => {
    setFacultyForm((prev) => ({ ...prev, password: generateSecurePassword() }));
  };

  const handleRegenerateFacultyEmpId = () => {
    setFacultyForm((prev) => ({ ...prev, empId: generateDepartmentEmployeeId(prev.departmentId) }));
  };

  const handleFacultyDepartmentChange = (deptId: number) => {
    const autoEmpId = generateDepartmentEmployeeId(deptId);
    setFacultyForm((prev) => ({
      ...prev,
      departmentId: deptId,
      empId: editingItem ? prev.empId : autoEmpId,
    }));
  };

  const handleOpenEditPO = (p: ProgramOutcomeExtended) => {
    setEditingItem(p);
    setOutcomeForm({
      type: 'PO',
      code: p.code,
      number: p.number,
      title: p.title || '',
      description: p.description,
      streamCode: p.streamCode || 'ENG',
      targetLevel: p.targetLevel || 2.4,
    });
    setActiveModal('outcome');
  };

  const handleOpenEditPSO = (p: ProgramSpecificOutcomeExtended) => {
    setEditingItem(p);
    setOutcomeForm({
      type: 'PSO',
      code: p.code,
      number: p.number || 1,
      title: p.title || '',
      description: p.description,
      streamCode: p.streamCode || 'ENG',
      targetLevel: p.targetLevel || 2.5,
    });
    setActiveModal('outcome');
  };

  // Delete Handlers
  const handleDeleteYear = async (id: number, year: string) => {
    if (!window.confirm(`Are you sure you want to delete Academic Year "${year}"?`)) return;
    superAdminStorage.deleteAcademicYear(id);
    try {
      await apiClient.delete(`/academic-years/${id}`);
    } catch {
      // deleted locally
    }
    loadData();
    showNotification(`Academic Year "${year}" deleted successfully.`);
  };

  const handleDeleteStream = (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete Stream "${name}"?`)) return;
    superAdminStorage.deleteStream(id);
    loadData();
    showNotification(`Stream "${name}" deleted successfully.`);
  };

  const handleDeleteDepartment = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete Department "${name}"?`)) return;
    superAdminStorage.deleteDepartment(id);
    try {
      await apiClient.delete(`/departments/${id}`);
    } catch {
      // deleted locally
    }
    loadData();
    showNotification(`Department "${name}" deleted successfully.`);
  };

  const handleDeleteClass = (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete Class "${name}"?`)) return;
    superAdminStorage.deleteClass(id);
    loadData();
    showNotification(`Class "${name}" deleted successfully.`);
  };

  const handleDeleteDivision = (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete Division "${name}"?`)) return;
    superAdminStorage.deleteDivision(id);
    loadData();
    showNotification(`Division "${name}" deleted successfully.`);
  };

  const handleDeleteFaculty = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from faculty directory?`)) return;
    superAdminStorage.deleteFaculty(id);
    try {
      await apiClient.delete(`/users/${id}`);
    } catch {
      // deleted locally
    }
    loadData();
    showNotification(`Faculty "${name}" removed successfully.`);
  };

  const handleDeletePO = (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete Program Outcome "${code}"?`)) return;
    superAdminStorage.deletePO(id);
    loadData();
    showNotification(`Outcome "${code}" deleted successfully.`);
  };

  const handleDeletePSO = (id: number, code: string) => {
    if (!window.confirm(`Are you sure you want to delete Program Specific Outcome "${code}"?`)) return;
    superAdminStorage.deletePSO(id);
    loadData();
    showNotification(`Outcome "${code}" deleted successfully.`);
  };

  // Submit Handlers
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearForm.year) return;
    try {
      if (editingItem) {
        superAdminStorage.saveAcademicYear({ ...yearForm, id: editingItem.id });
        try {
          await apiClient.put(`/academic-years/${editingItem.id}`, yearForm);
        } catch {
          // saved locally
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
          // saved locally
        }
        showNotification(`Academic Year "${yearForm.year}" created successfully.`);
      }
      setYearForm({ year: '', startDate: '', endDate: '', isCurrent: false });
      setEditingItem(null);
      setActiveModal(null);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save academic year', 'error');
    }
  };

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamForm.name || !streamForm.code) return;
    try {
      if (editingItem) {
        superAdminStorage.saveStream({ ...streamForm, id: editingItem.id });
        showNotification(`Stream "${streamForm.name}" updated successfully.`);
      } else {
        superAdminStorage.saveStream(streamForm);
        showNotification(`Stream "${streamForm.name}" created successfully.`);
      }
      setStreamForm({ name: '', code: '', degreeLevel: 'UG', duration: 4, totalSemesters: 8, description: '' });
      setEditingItem(null);
      setActiveModal(null);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save stream', 'error');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    try {
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
          // saved locally
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
          // saved locally
        }
        showNotification(`Department "${deptForm.name}" added successfully.`);
      }
      setDeptForm({ name: '', code: '', streamCode: 'ENG', description: '' });
      setEditingItem(null);
      setActiveModal(null);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save department', 'error');
    }
  };

  const handleCreateClass = (e: React.FormEvent) => {
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
    setClassForm({
      code: 'FE',
      name: '',
      departmentId: departments[0]?.id || 1,
      streamCode: 'ENG',
      academicYear: academicYears.find((y) => y.isCurrent)?.year || '2025-2026',
      semesterRange: 'Sem I & II',
    });
    setEditingItem(null);
    setActiveModal(null);
    loadData();
  };

  const handleCreateDivision = (e: React.FormEvent) => {
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
      showNotification(`Division "${divisionForm.name}" created for ${parentClass?.name || 'Class'}.`);
    }
    setDivisionForm({
      name: 'Division A',
      code: 'A',
      classId: classes[0]?.id || 1,
      capacity: 60,
      roomNo: '',
      classTeacher: '',
    });
    setEditingItem(null);
    setActiveModal(null);
    loadData();
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name || !facultyForm.email) return;
    const dept = departments.find((d) => d.id === Number(facultyForm.departmentId));
    const deptName = dept?.name || 'Department of Computer Engineering';

    try {
      if (editingItem) {
        superAdminStorage.saveFaculty({
          id: editingItem.id,
          name: facultyForm.name,
          email: facultyForm.email,
          designation: facultyForm.designation,
          role: facultyForm.role,
          departmentId: Number(facultyForm.departmentId),
          departmentName: deptName,
          empId: facultyForm.empId || editingItem.empId,
          phone: facultyForm.phone,
          status: facultyForm.status,
        });
        try {
          await apiClient.put(`/users/${editingItem.id}`, {
            name: facultyForm.name,
            email: facultyForm.email,
            role: facultyForm.role,
            departmentId: Number(facultyForm.departmentId),
            designation: facultyForm.designation,
            employeeId: facultyForm.empId,
          });
        } catch {
          // persisted locally
        }
        showNotification(`Faculty "${facultyForm.name}" updated successfully.`);
      } else {
        const autoEmpId = facultyForm.empId || generateDepartmentEmployeeId(facultyForm.departmentId);
        const autoPassword = facultyForm.password || generateSecurePassword();

        superAdminStorage.saveFaculty({
          name: facultyForm.name,
          email: facultyForm.email,
          designation: facultyForm.designation,
          role: facultyForm.role,
          departmentId: Number(facultyForm.departmentId),
          departmentName: deptName,
          empId: autoEmpId,
          password: autoPassword,
          phone: facultyForm.phone,
          status: facultyForm.status,
        });

        let emailDispatched = true;
        try {
          const res = await apiClient.post('/users', {
            name: facultyForm.name,
            email: facultyForm.email,
            password: autoPassword,
            role: facultyForm.role,
            departmentId: Number(facultyForm.departmentId),
            designation: facultyForm.designation,
            employeeId: autoEmpId,
          });
          if (res.data?.data) {
            emailDispatched = res.data.data.emailSent ?? true;
          }
        } catch {
          // persisted locally
        }

        // Show credentials confirmation dialog
        setCredentialsModal({
          name: facultyForm.name,
          email: facultyForm.email,
          empId: autoEmpId,
          password: autoPassword,
          designation: facultyForm.designation,
          departmentName: deptName,
          emailSent: emailDispatched,
        });

        showNotification(`Faculty "${facultyForm.name}" added successfully! Credentials sent to ${facultyForm.email}.`);
      }

      setFacultyForm({
        name: '',
        email: '',
        password: '',
        designation: 'Assistant Professor',
        role: 'FACULTY',
        departmentId: departments[0]?.id || 1,
        empId: '',
        phone: '',
        status: 'Active',
      });
      setEditingItem(null);
      setActiveModal(null);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save faculty', 'error');
    }
  };

  const handleCreateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeForm.code || !outcomeForm.description) return;
    try {
      if (outcomeForm.type === 'PO') {
        if (editingItem) {
          superAdminStorage.savePO({
            id: editingItem.id,
            code: outcomeForm.code.toUpperCase().trim(),
            number: Number(outcomeForm.number) || 1,
            title: outcomeForm.title || outcomeForm.code,
            description: outcomeForm.description,
            streamCode: outcomeForm.streamCode,
            targetLevel: Number(outcomeForm.targetLevel) || 2.4,
            programId: 1,
            isActive: true,
          });
          showNotification(`Program Outcome "${outcomeForm.code}" updated.`);
        } else {
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
          showNotification(`Program Outcome "${outcomeForm.code}" created.`);
        }
      } else {
        if (editingItem) {
          superAdminStorage.savePSO({
            id: editingItem.id,
            code: outcomeForm.code.toUpperCase().trim(),
            number: Number(outcomeForm.number) || 1,
            title: outcomeForm.title || outcomeForm.code,
            description: outcomeForm.description,
            streamCode: outcomeForm.streamCode,
            targetLevel: Number(outcomeForm.targetLevel) || 2.5,
            programId: 1,
            isActive: true,
          });
          showNotification(`PSO "${outcomeForm.code}" updated.`);
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
          showNotification(`PSO "${outcomeForm.code}" created.`);
        }
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
      setEditingItem(null);
      setActiveModal(null);
      loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save outcome', 'error');
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
              Create, edit, and delete academic years, streams, departments, classes, divisions, faculty appointments (with auto-generated IDs & credentials email), and NBA outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenAddModal('year')}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Academic Year</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('faculty')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Faculty (Auto ID & Email)</span>
            </button>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex border-t border-slate-200 dark:border-slate-800 mt-4 pt-4 space-x-2 overflow-x-auto pb-1 scrollbar-none">
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
                  onClick={() => handleOpenAddModal('year')}
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
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      ay.isCurrent
                        ? 'bg-sky-50/70 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div>
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
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        {!ay.isCurrent ? (
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
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditYear(ay)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Academic Year"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteYear(ay.id, ay.year)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Academic Year"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                  onClick={() => handleOpenAddModal('stream')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Stream</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {streams.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                    <div>
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
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Total Semesters: <strong className="text-slate-800 dark:text-slate-200">{s.totalSemesters || 8}</strong></span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditStream(s)}
                          className="p-1 rounded text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
                          title="Edit Stream"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStream(s.id, s.name)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete Stream"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                  onClick={() => handleOpenAddModal('department')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Department</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                          {d.code}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{d.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{d.description}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-1">
                      <button
                        onClick={() => handleOpenEditDepartment(d)}
                        className="p-1 rounded text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(d.id, d.name)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                    onClick={() => handleOpenAddModal('class')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Class</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Class Code</th>
                      <th className="p-3">Class Title</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Stream</th>
                      <th className="p-3">Semesters</th>
                      <th className="p-3">Academic Year</th>
                      <th className="p-3">Divisions</th>
                      <th className="p-3 text-right">Actions</th>
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
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenEditClass(c)}
                                className="p-1 rounded text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
                                title="Edit Class"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClass(c.id, c.name)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="Delete Class"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                  onClick={() => handleOpenAddModal('division')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Division</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {divisions.map((div) => (
                  <div key={div.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between">
                    <div>
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

                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-1">
                      <button
                        onClick={() => handleOpenEditDivision(div)}
                        className="p-1 rounded text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
                        title="Edit Division"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDivision(div.id, div.name)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Division"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FACULTY MANAGEMENT (WITH AUTO ID & CREDENTIALS EMAIL)
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'faculty' && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Faculty Directory & Appointment Governance</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically generate department-wise Employee IDs, auto-create secure passwords, and dispatch login credentials directly to faculty emails.
              </p>
            </div>
            <button
              onClick={() => handleOpenAddModal('faculty')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2 shadow-sm self-start md:self-auto cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Faculty (Auto-ID & Email)</span>
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
            <table className="w-full text-xs text-left min-w-[750px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Faculty Member</th>
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">System Role</th>
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
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{f.email}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30">
                          {f.empId || '—'}
                        </span>
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
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          {f.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEditFaculty(f)}
                            className="p-1 rounded text-slate-400 hover:text-sky-500 transition-colors cursor-pointer"
                            title="Edit Faculty"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaculty(f.id, f.name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Remove Faculty"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              onClick={() => handleOpenAddModal('outcome')}
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditPO(p)}
                        className="text-sky-500 hover:text-sky-600 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePO(p.id, p.code)}
                        className="text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenEditPSO(p)}
                        className="text-sky-500 hover:text-sky-600 font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePSO(p.id, p.code)}
                        className="text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CREATION & EDIT MODALS
      ───────────────────────────────────────────────────────────── */}

      {/* Modal 1: Academic Year */}
      {activeModal === 'year' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>{editingItem ? 'Edit' : 'Create'} Academic Year</span>
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
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
                  onClick={() => {
                    setActiveModal(null);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingItem ? 'Update Academic Year' : 'Save Academic Year'}
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
                <span>{editingItem ? 'Edit' : 'Create'} Stream (Engineering / BCA / MBA)</span>
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
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
                  onClick={() => {
                    setActiveModal(null);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingItem ? 'Update Stream' : 'Save Stream'}
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
                <span>{editingItem ? 'Edit' : 'Create'} Department</span>
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
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
                  onClick={() => {
                    setActiveModal(null);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingItem ? 'Update Department' : 'Save Department'}
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
                <span>{editingItem ? 'Edit' : 'Create'} Class (FE, SE, TE, BE)</span>
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
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
                  onClick={() => {
                    setActiveModal(null);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingItem ? 'Update Class' : 'Save Class'}
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
                <span>{editingItem ? 'Edit' : 'Create'} Division in Class</span>
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
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
                  onClick={() => {
                    setActiveModal(null);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingItem ? 'Update Division' : 'Save Division'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Add Faculty (with Designation Dropdown & Auto ID & Password) */}
      {activeModal === 'faculty' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{editingItem ? 'Edit Faculty Member' : 'Add New Faculty Member'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingItem
                    ? 'Update faculty credentials and department appointment'
                    : 'Employee ID & Password will be automatically generated and emailed to the faculty'}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
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

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Email Address (For Credentials Dispatch)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. anjali.s@obe.edu"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Login credentials (Employee ID & Password) will be emailed directly to this address upon creation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={facultyForm.departmentId}
                    onChange={(e) => handleFacultyDepartmentChange(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
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

              {/* Automatic Department-wise Employee ID & Password Section */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>Department-Wise Employee ID</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 uppercase font-bold">Auto</span>
                    </label>
                    {!editingItem && (
                      <button
                        type="button"
                        onClick={handleRegenerateFacultyEmpId}
                        className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Regenerate ID</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={facultyForm.empId}
                    onChange={(e) => setFacultyForm({ ...facultyForm, empId: e.target.value })}
                    placeholder="e.g. EMP-CSE-001"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sky-600 dark:text-sky-400 font-mono font-bold text-xs"
                  />
                </div>

                {!editingItem && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-500" />
                        <span>Auto-Generated Password</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase font-bold">Secure</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRegenerateFacultyPassword}
                        className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showFacultyPassword ? 'text' : 'password'}
                        required
                        value={facultyForm.password}
                        onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 pr-16 text-amber-600 dark:text-amber-300 font-mono text-xs"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(facultyForm.password, 'super-pwd')}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          title="Copy Password"
                        >
                          {copiedKey === 'super-pwd' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFacultyPassword(!showFacultyPassword)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          title={showFacultyPassword ? 'Hide' : 'Show'}
                        >
                          {showFacultyPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-slate-600 dark:text-slate-300 text-[11px] flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
                <span>
                  The generated <strong>Employee ID</strong> and <strong>Password</strong> will automatically be emailed to <strong>{facultyForm.email || 'the faculty email'}</strong> upon saving.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'Update Faculty Member' : 'Save & Send Credentials Email'}</span>
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
                  <span>{editingItem ? 'Edit' : 'Create'} Program Outcome (PO) or PSO</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure NBA graduate attributes or program specific outcomes
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOutcome} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Outcome Category</label>
                  <select
                    value={outcomeForm.type}
                    disabled={!!editingItem}
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold disabled:opacity-60"
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
                  onClick={() => {
                    setActiveModal(null);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  {editingItem ? 'Update Outcome' : 'Save Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Confirmation Dialog */}
      {credentialsModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Faculty Added Successfully!</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> Credentials Dispatched to Email
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCredentialsModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Faculty Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{credentialsModal.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Sent to Email:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-300 font-semibold">{credentialsModal.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Assigned Employee ID:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{credentialsModal.empId}</span>
                  <button
                    onClick={() => copyToClipboard(credentialsModal.empId, 'hub-emp')}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    title="Copy Employee ID"
                  >
                    {copiedKey === 'hub-emp' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Temporary Password:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-300">{credentialsModal.password}</span>
                  <button
                    onClick={() => copyToClipboard(credentialsModal.password, 'hub-pwd')}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    title="Copy Password"
                  >
                    {copiedKey === 'hub-pwd' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Designation & Dept:</span>
                <span className="text-slate-700 dark:text-slate-300 text-right">{credentialsModal.designation} · {credentialsModal.departmentName}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Login Portal:</span>
                <span className="text-sky-600 dark:text-sky-400 font-mono text-[11px]">http://localhost:5173/login</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const payload = `Faculty Login Credentials:
Name: ${credentialsModal.name}
Email: ${credentialsModal.email}
Employee ID: ${credentialsModal.empId}
Temporary Password: ${credentialsModal.password}
Portal: http://localhost:5173/login`;
                  copyToClipboard(payload, 'all-hub-creds');
                }}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                {copiedKey === 'all-hub-creds' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All Details</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setCredentialsModal(null)}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
