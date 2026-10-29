import type { AcademicYear, Department, ProgramOutcome, ProgramSpecificOutcome, Stream, AcademicClass, ClassDivision, CourseAllocation } from '../types';
export type { CourseAllocation };

export const FACULTY_DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Head of Department (HOD)',
  'Lab Incharge',
  'Academic Dean',
  'NBA Coordinator',
  'IQAC Coordinator',
  'Department Coordinator',
  'Visiting Faculty',
] as const;

export type FacultyDesignation = typeof FACULTY_DESIGNATIONS[number];

export const STANDARD_CLASS_CODES = ['FE', 'SE', 'TE', 'BE'] as const;

export interface FacultyMember {
  id: number;
  name: string;
  email: string;
  designation: string;
  role: string;
  departmentId: number;
  departmentName: string;
  streamCode?: string;
  empId?: string;
  phone?: string;
  password?: string;
  status: 'Active' | 'On Leave';
  createdAt?: string;
}

export interface BatchItem {
  id: number;
  name: string;
  startYear: number;
  endYear: number;
  programId?: number;
  programName?: string;
  isActive?: boolean;
}

export interface StudentItem {
  id: number;
  rollNumber: string;
  name: string;
  email?: string;
  batchId?: number;
  batchName?: string;
  isActive?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Default Seeds (DYP COEI standard structure)
// ─────────────────────────────────────────────────────────────

const DEFAULT_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 1, year: '2025-2026', yearRange: '2025-2026', startDate: '2025-07-01', endDate: '2026-06-30', isCurrent: true, isActive: true },
  { id: 2, year: '2024-2025', yearRange: '2024-2025', startDate: '2024-07-01', endDate: '2025-06-30', isCurrent: false, isActive: true },
  { id: 3, year: '2023-2024', yearRange: '2023-2024', startDate: '2023-07-01', endDate: '2024-06-30', isCurrent: false, isActive: true },
];

const DEFAULT_STREAMS: Stream[] = [
  {
    id: 1,
    code: 'ENG',
    name: 'Engineering',
    degreeLevel: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'Four-year Bachelor of Engineering & Technology programs under AICTE / NBA guidelines',
    isActive: true,
  },
  {
    id: 2,
    code: 'BCA',
    name: 'BCA (Computer Applications)',
    degreeLevel: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'Three-year Bachelor of Computer Applications program focused on software development',
    isActive: true,
  },
  {
    id: 3,
    code: 'MBA',
    name: 'MBA (Management Studies)',
    degreeLevel: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'Two-year Master of Business Administration postgraduate degree in management',
    isActive: true,
  },
];

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 1, code: 'CSE', name: 'Department of Computer Engineering', description: 'Stream: Engineering · B.E. Computer Engineering', isActive: true },
  { id: 2, code: 'AI&DS', name: 'Artificial Intelligence & Data Science', description: 'Stream: Engineering · B.Tech AI & Data Science', isActive: true },
  { id: 3, code: 'IT', name: 'Information Technology', description: 'Stream: Engineering · B.E. Information Technology', isActive: true },
  { id: 4, code: 'ENTC', name: 'Electronics & Telecommunication', description: 'Stream: Engineering · Embedded Systems & VLSI', isActive: true },
  { id: 5, code: 'MECH', name: 'Mechanical Engineering', description: 'Stream: Engineering · Robotics, Thermal & CAD/CAM', isActive: true },
  { id: 6, code: 'CIVIL', name: 'Civil Engineering', description: 'Stream: Engineering · Structural & Environmental Engg', isActive: true },
  { id: 7, code: 'BCA-DEPT', name: 'Department of Computer Applications (BCA)', description: 'Stream: BCA · BCA Degree Program', isActive: true },
  { id: 8, code: 'MBA-DEPT', name: 'Department of Management Studies (MBA)', description: 'Stream: MBA · Finance, HR & Marketing', isActive: true },
];

const DEFAULT_CLASSES: AcademicClass[] = [
  { id: 1, code: 'FE', name: 'First Year Engineering (FE)', departmentId: 1, departmentName: 'Department of Computer Engineering', streamCode: 'ENG', academicYear: '2025-2026', semesterRange: 'Sem I & II', divisionsCount: 2 },
  { id: 2, code: 'SE', name: 'Second Year Engineering (SE)', departmentId: 1, departmentName: 'Department of Computer Engineering', streamCode: 'ENG', academicYear: '2025-2026', semesterRange: 'Sem III & IV', divisionsCount: 2 },
  { id: 3, code: 'TE', name: 'Third Year Engineering (TE)', departmentId: 1, departmentName: 'Department of Computer Engineering', streamCode: 'ENG', academicYear: '2025-2026', semesterRange: 'Sem V & VI', divisionsCount: 2 },
  { id: 4, code: 'BE', name: 'Final Year Engineering (BE)', departmentId: 1, departmentName: 'Department of Computer Engineering', streamCode: 'ENG', academicYear: '2025-2026', semesterRange: 'Sem VII & VIII', divisionsCount: 1 },
  { id: 5, code: 'FE', name: 'First Year AI & DS (FE)', departmentId: 2, departmentName: 'Artificial Intelligence & Data Science', streamCode: 'ENG', academicYear: '2025-2026', semesterRange: 'Sem I & II', divisionsCount: 1 },
  { id: 6, code: 'SE', name: 'Second Year AI & DS (SE)', departmentId: 2, departmentName: 'Artificial Intelligence & Data Science', streamCode: 'ENG', academicYear: '2025-2026', semesterRange: 'Sem III & IV', divisionsCount: 1 },
  { id: 7, code: 'FE', name: 'First Year BCA (FY-BCA)', departmentId: 7, departmentName: 'Department of Computer Applications (BCA)', streamCode: 'BCA', academicYear: '2025-2026', semesterRange: 'Sem I & II', divisionsCount: 2 },
  { id: 8, code: 'FE', name: 'First Year MBA (FY-MBA)', departmentId: 8, departmentName: 'Department of Management Studies (MBA)', streamCode: 'MBA', academicYear: '2025-2026', semesterRange: 'Sem I & II', divisionsCount: 1 },
];

const DEFAULT_DIVISIONS: ClassDivision[] = [
  { id: 1, name: 'Division A', code: 'A', classId: 1, classCode: 'FE', className: 'First Year Engineering (FE)', departmentName: 'Department of Computer Engineering', capacity: 65, roomNo: 'Room 101', classTeacher: 'Prof. S. Joshi' },
  { id: 2, name: 'Division B', code: 'B', classId: 1, classCode: 'FE', className: 'First Year Engineering (FE)', departmentName: 'Department of Computer Engineering', capacity: 65, roomNo: 'Room 102', classTeacher: 'Prof. R. Jadhav' },
  { id: 3, name: 'Division A', code: 'A', classId: 2, classCode: 'SE', className: 'Second Year Engineering (SE)', departmentName: 'Department of Computer Engineering', capacity: 68, roomNo: 'Room 201', classTeacher: 'Prof. Neha Kulkarni' },
  { id: 4, name: 'Division B', code: 'B', classId: 2, classCode: 'SE', className: 'Second Year Engineering (SE)', departmentName: 'Department of Computer Engineering', capacity: 68, roomNo: 'Room 202', classTeacher: 'Prof. Priya Mehta' },
  { id: 5, name: 'Division A', code: 'A', classId: 3, classCode: 'TE', className: 'Third Year Engineering (TE)', departmentName: 'Department of Computer Engineering', capacity: 62, roomNo: 'Room 301', classTeacher: 'Prof. Anjali Sharma' },
  { id: 6, name: 'Division B', code: 'B', classId: 3, classCode: 'TE', className: 'Third Year Engineering (TE)', departmentName: 'Department of Computer Engineering', capacity: 62, roomNo: 'Room 302', classTeacher: 'Prof. Vikram Deshmukh' },
  { id: 7, name: 'Division A', code: 'A', classId: 4, classCode: 'BE', className: 'Final Year Engineering (BE)', departmentName: 'Department of Computer Engineering', capacity: 64, roomNo: 'Room 401', classTeacher: 'Dr. Ramesh Patil' },
  { id: 8, name: 'Division A', code: 'A', classId: 7, classCode: 'FE', className: 'First Year BCA (FY-BCA)', departmentName: 'Department of Computer Applications (BCA)', capacity: 60, roomNo: 'BCA Lab 1', classTeacher: 'Prof. Sunita Rao' },
];

const DEFAULT_FACULTIES: FacultyMember[] = [
  { id: 1, name: 'Dr. Suresh Kadam', email: 'dean.academic@obe.edu', designation: 'Academic Dean', role: 'ADMIN', departmentId: 1, departmentName: 'Department of Computer Engineering', empId: 'EMP-001', status: 'Active' },
  { id: 2, name: 'Dr. Ramesh Patil', email: 'hod.cse@obe.edu', designation: 'Head of Department (HOD)', role: 'HOD', departmentId: 1, departmentName: 'Department of Computer Engineering', empId: 'EMP-002', status: 'Active' },
  { id: 3, name: 'Prof. Anjali Sharma', email: 'anjali.s@obe.edu', designation: 'Professor', role: 'FACULTY', departmentId: 1, departmentName: 'Department of Computer Engineering', empId: 'EMP-003', status: 'Active' },
  { id: 4, name: 'Prof. Vikram Deshmukh', email: 'vikram.d@obe.edu', designation: 'Associate Professor', role: 'FACULTY', departmentId: 1, departmentName: 'Department of Computer Engineering', empId: 'EMP-004', status: 'Active' },
  { id: 5, name: 'Prof. Neha Kulkarni', email: 'neha.k@obe.edu', designation: 'Assistant Professor', role: 'FACULTY', departmentId: 1, departmentName: 'Department of Computer Engineering', empId: 'EMP-005', status: 'Active' },
  { id: 6, name: 'Prof. Rahul Jadhav', email: 'rahul.j@obe.edu', designation: 'Lab Incharge', role: 'FACULTY', departmentId: 1, departmentName: 'Department of Computer Engineering', empId: 'EMP-006', status: 'Active' },
  { id: 7, name: 'Prof. Priya Mehta', email: 'priya.m@obe.edu', designation: 'NBA Coordinator', role: 'DEPARTMENT_COORDINATOR', departmentId: 1, departmentName: 'Department of Computer Engineering', empId: 'EMP-007', status: 'Active' },
  { id: 8, name: 'Dr. Amit Shinde', email: 'iqac@obe.edu', designation: 'IQAC Coordinator', role: 'IQAC_ADMIN', departmentId: 1, departmentName: 'Department of Computer Engineering', empId: 'EMP-008', status: 'Active' },
  { id: 9, name: 'Prof. Sunita Rao', email: 'sunita.r@obe.edu', designation: 'Assistant Professor', role: 'FACULTY', departmentId: 7, departmentName: 'Department of Computer Applications (BCA)', empId: 'EMP-009', status: 'Active' },
  { id: 10, name: 'Dr. Manoj Verma', email: 'hod.mba@obe.edu', designation: 'Head of Department (HOD)', role: 'HOD', departmentId: 8, departmentName: 'Department of Management Studies (MBA)', empId: 'EMP-010', status: 'Active' },
];

const DEFAULT_BATCHES: BatchItem[] = [
  { id: 1, name: '2022-2026 (Final Year)', startYear: 2022, endYear: 2026, programName: 'B.E. Computer Engineering', isActive: true },
  { id: 2, name: '2023-2027 (Third Year)', startYear: 2023, endYear: 2027, programName: 'B.E. Computer Engineering', isActive: true },
  { id: 3, name: '2024-2028 (Second Year)', startYear: 2024, endYear: 2028, programName: 'B.E. Computer Engineering', isActive: true },
  { id: 4, name: '2025-2029 (First Year)', startYear: 2025, endYear: 2029, programName: 'B.E. Computer Engineering', isActive: true },
];

const DEFAULT_STUDENTS: StudentItem[] = [
  { id: 1, rollNumber: '210201', name: 'Aarav Sharma', email: 'aarav.sharma@obe.edu', batchId: 1, batchName: '2022-2026 (Final Year)', isActive: true },
  { id: 2, rollNumber: '210202', name: 'Ananya Patel', email: 'ananya.patel@obe.edu', batchId: 1, batchName: '2022-2026 (Final Year)', isActive: true },
  { id: 3, rollNumber: '210203', name: 'Aditya Deshmukh', email: 'aditya.deshmukh@obe.edu', batchId: 1, batchName: '2022-2026 (Final Year)', isActive: true },
  { id: 4, rollNumber: '210204', name: 'Bhavna Kulkarni', email: 'bhavna.kulkarni@obe.edu', batchId: 2, batchName: '2023-2027 (Third Year)', isActive: true },
  { id: 5, rollNumber: '210205', name: 'Chaitanya Joshi', email: 'chaitanya.joshi@obe.edu', batchId: 2, batchName: '2023-2027 (Third Year)', isActive: true },
];

export interface ProgramOutcomeExtended extends ProgramOutcome {
  title?: string;
  streamCode?: string;
  targetLevel?: number;
}

export interface ProgramSpecificOutcomeExtended extends ProgramSpecificOutcome {
  title?: string;
  streamCode?: string;
  targetLevel?: number;
}

const DEFAULT_POS: ProgramOutcomeExtended[] = [
  { id: 1, code: 'PO1', number: 1, title: 'Engineering Knowledge', description: 'Apply mathematics, science, engineering fundamentals, and an engineering specialization to complex engineering problems.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 2, code: 'PO2', number: 2, title: 'Problem Analysis', description: 'Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 3, code: 'PO3', number: 3, title: 'Design & Development', description: 'Design solutions for complex engineering problems and design system components or processes that meet specified needs.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 4, code: 'PO4', number: 4, title: 'Investigations of Complex Problems', description: 'Use research-based knowledge and research methods including design of experiments, analysis and synthesis of data.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 5, code: 'PO5', number: 5, title: 'Modern Tool Usage', description: 'Create, select, and apply appropriate techniques, resources, and modern IT tools including prediction and modeling.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 6, code: 'PO6', number: 6, title: 'The Engineer and Society', description: 'Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal and cultural issues.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 7, code: 'PO7', number: 7, title: 'Environment & Sustainability', description: 'Understand the impact of engineering solutions in societal and environmental contexts, and demonstrate sustainability.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 8, code: 'PO8', number: 8, title: 'Ethics', description: 'Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 9, code: 'PO9', number: 9, title: 'Individual & Team Work', description: 'Function effectively as an individual, and as a member or leader in diverse teams and in multidisciplinary settings.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 10, code: 'PO10', number: 10, title: 'Communication', description: 'Communicate effectively on complex engineering activities with the engineering community and society at large.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 11, code: 'PO11', number: 11, title: 'Project Management & Finance', description: 'Demonstrate knowledge and understanding of engineering and management principles and apply these to projects.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
  { id: 12, code: 'PO12', number: 12, title: 'Life-long Learning', description: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in technological change.', programId: 1, streamCode: 'ENG', targetLevel: 2.4, isActive: true },
];

const DEFAULT_PSOS: ProgramSpecificOutcomeExtended[] = [
  { id: 1, code: 'PSO1', number: 1, title: 'Software Engineering Architecture', description: 'Design, construct, and evaluate robust and maintainable software systems using modern paradigms and secure cloud databases.', programId: 1, streamCode: 'ENG', targetLevel: 2.5, isActive: true },
  { id: 2, code: 'PSO2', number: 2, title: 'AI & Data-Driven Intelligence', description: 'Implement state-of-the-art machine learning, deep neural models, and big data pipelines to solve real-world enterprise automation challenges.', programId: 1, streamCode: 'ENG', targetLevel: 2.5, isActive: true },
  { id: 3, code: 'PSO3', number: 3, title: 'Industry Readiness & Innovation', description: 'Adapt rapidly to emergent cloud platforms, cybersecurity governance, DevOps automation, and collaborative entrepreneurial workflows.', programId: 1, streamCode: 'ENG', targetLevel: 2.5, isActive: true },
];

export const DEFAULT_COURSE_ALLOCATIONS: CourseAllocation[] = [
  {
    id: 1,
    facultyId: 3,
    facultyName: 'Prof. Anjali Sharma',
    facultyEmail: 'anjali.s@obe.edu',
    employeeId: 'EMP-003',
    designation: 'Professor',
    courseId: 1,
    courseCode: 'CS501',
    courseName: 'Database Management Systems',
    credits: 4,
    courseType: 'THEORY',
    classCode: 'TE',
    className: 'Third Year Engineering (TE)',
    division: 'Division A',
    academicYear: '2025-2026',
    semester: 'Semester V',
    departmentId: 1,
    departmentName: 'Department of Computer Engineering',
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    facultyId: 4,
    facultyName: 'Prof. Vikram Deshmukh',
    facultyEmail: 'vikram.d@obe.edu',
    employeeId: 'EMP-004',
    designation: 'Associate Professor',
    courseId: 2,
    courseCode: 'CS502',
    courseName: 'Computer Networks',
    credits: 4,
    courseType: 'THEORY',
    classCode: 'TE',
    className: 'Third Year Engineering (TE)',
    division: 'Division B',
    academicYear: '2025-2026',
    semester: 'Semester V',
    departmentId: 1,
    departmentName: 'Department of Computer Engineering',
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    facultyId: 5,
    facultyName: 'Prof. Neha Kulkarni',
    facultyEmail: 'neha.k@obe.edu',
    employeeId: 'EMP-005',
    designation: 'Assistant Professor',
    courseId: 3,
    courseCode: 'CS503',
    courseName: 'Operating Systems',
    credits: 3,
    courseType: 'THEORY',
    classCode: 'SE',
    className: 'Second Year Engineering (SE)',
    division: 'Division A',
    academicYear: '2025-2026',
    semester: 'Semester III',
    departmentId: 1,
    departmentName: 'Department of Computer Engineering',
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    facultyId: 7,
    facultyName: 'Prof. Priya Mehta',
    facultyEmail: 'priya.m@obe.edu',
    employeeId: 'EMP-007',
    designation: 'NBA Coordinator',
    courseId: 4,
    courseCode: 'CS504',
    courseName: 'Software Engineering',
    credits: 3,
    courseType: 'THEORY',
    classCode: 'BE',
    className: 'Final Year Engineering (BE)',
    division: 'Division A',
    academicYear: '2025-2026',
    semester: 'Semester VII',
    departmentId: 1,
    departmentName: 'Department of Computer Engineering',
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    facultyId: 3,
    facultyName: 'Prof. Amit Desai',
    facultyEmail: 'faculty1.cs@obe.edu',
    employeeId: 'EMP-CSE-001',
    designation: 'Assistant Professor',
    courseId: 1,
    courseCode: 'CS501',
    courseName: 'Database Management Systems',
    credits: 4,
    courseType: 'THEORY',
    classCode: 'TE',
    className: 'Third Year Engineering (TE)',
    division: 'Division A',
    academicYear: '2025-2026',
    semester: 'Semester V',
    departmentId: 1,
    departmentName: 'Department of Computer Engineering',
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────
// Storage Access Helpers
// ─────────────────────────────────────────────────────────────

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

/**
 * Automatically generates a department-wise Employee ID
 * Format: EMP-<DEPT_CODE>-<001> (e.g. EMP-CSE-001, EMP-AIDS-002, EMP-IT-001)
 */
export function generateDepartmentEmployeeId(departmentId?: number | string): string {
  const departments = superAdminStorage.getDepartments();
  const dept = departments.find((d) => d.id === Number(departmentId));
  const raw = dept?.code || dept?.name || 'GEN';
  const cleanCode = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
  const prefix = `EMP-${cleanCode}-`;

  const faculties = superAdminStorage.getFaculties();
  let maxSeq = 0;
  for (const f of faculties) {
    if (f.empId && f.empId.startsWith(prefix)) {
      const numPart = f.empId.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

/**
 * Automatically generates a secure password complying with policy requirements
 */
export function generateSecurePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$%&*!';

  let password = '';
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const allChars = upper + lower + digits + special;
  for (let i = 0; i < 6; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

export const superAdminStorage = {
  // Academic Years
  getAcademicYears: (): AcademicYear[] => getFromStorage('obe_academic_years', DEFAULT_ACADEMIC_YEARS),
  saveAcademicYear: (year: Omit<AcademicYear, 'id'> & { id?: number }): AcademicYear => {
    const list = superAdminStorage.getAcademicYears();
    let updated: AcademicYear;
    if (year.id) {
      updated = { ...year, id: year.id } as AcademicYear;
      const index = list.findIndex((y) => y.id === year.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, y) => Math.max(max, y.id || 0), 0) + 1;
      updated = { ...year, id: nextId, yearRange: year.yearRange || year.year, isActive: true } as AcademicYear;
      list.unshift(updated);
    }
    if (updated.isCurrent) {
      list.forEach((y) => {
        if (y.id !== updated.id) y.isCurrent = false;
      });
    }
    setToStorage('obe_academic_years', list);
    return updated;
  },
  deleteAcademicYear: (id: number): void => {
    const list = superAdminStorage.getAcademicYears().filter((y) => y.id !== id);
    setToStorage('obe_academic_years', list);
  },

  // Streams (Engineering / BCA / MBA)
  getStreams: (): Stream[] => getFromStorage('obe_streams', DEFAULT_STREAMS),
  saveStream: (stream: Omit<Stream, 'id'> & { id?: number }): Stream => {
    const list = superAdminStorage.getStreams();
    let updated: Stream;
    if (stream.id) {
      updated = { ...stream, id: stream.id } as Stream;
      const index = list.findIndex((s) => s.id === stream.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, s) => Math.max(max, s.id || 0), 0) + 1;
      updated = { ...stream, id: nextId, isActive: true } as Stream;
      list.push(updated);
    }
    setToStorage('obe_streams', list);
    return updated;
  },
  deleteStream: (id: number): void => {
    const list = superAdminStorage.getStreams().filter((s) => s.id !== id);
    setToStorage('obe_streams', list);
  },

  // Departments
  getDepartments: (): Department[] => getFromStorage('obe_departments', DEFAULT_DEPARTMENTS),
  saveDepartment: (dept: Omit<Department, 'id'> & { id?: number }): Department => {
    const list = superAdminStorage.getDepartments();
    let updated: Department;
    if (dept.id) {
      updated = { ...dept, id: dept.id } as Department;
      const index = list.findIndex((d) => d.id === dept.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, d) => Math.max(max, d.id || 0), 0) + 1;
      updated = { ...dept, id: nextId, isActive: true } as Department;
      list.push(updated);
    }
    setToStorage('obe_departments', list);
    return updated;
  },
  deleteDepartment: (id: number): void => {
    const list = superAdminStorage.getDepartments().filter((d) => d.id !== id);
    setToStorage('obe_departments', list);
  },

  // Classes (FE, SE, TE, BE)
  getClasses: (): AcademicClass[] => getFromStorage('obe_classes', DEFAULT_CLASSES),
  saveClass: (cls: Omit<AcademicClass, 'id'> & { id?: number }): AcademicClass => {
    const list = superAdminStorage.getClasses();
    let updated: AcademicClass;
    if (cls.id) {
      updated = { ...cls, id: cls.id } as AcademicClass;
      const index = list.findIndex((c) => c.id === cls.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
      updated = { ...cls, id: nextId, divisionsCount: cls.divisionsCount ?? 1 } as AcademicClass;
      list.push(updated);
    }
    setToStorage('obe_classes', list);
    return updated;
  },
  deleteClass: (id: number): void => {
    const list = superAdminStorage.getClasses().filter((c) => c.id !== id);
    setToStorage('obe_classes', list);
  },

  // Divisions in Classes
  getDivisions: (): ClassDivision[] => getFromStorage('obe_divisions', DEFAULT_DIVISIONS),
  saveDivision: (division: Omit<ClassDivision, 'id'> & { id?: number }): ClassDivision => {
    const list = superAdminStorage.getDivisions();
    let updated: ClassDivision;
    if (division.id) {
      updated = { ...division, id: division.id } as ClassDivision;
      const index = list.findIndex((d) => d.id === division.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, d) => Math.max(max, d.id || 0), 0) + 1;
      updated = { ...division, id: nextId } as ClassDivision;
      list.push(updated);
    }
    setToStorage('obe_divisions', list);

    const classes = superAdminStorage.getClasses();
    const parentClass = classes.find((c) => c.id === updated.classId);
    if (parentClass) {
      parentClass.divisionsCount = list.filter((d) => d.classId === parentClass.id).length;
      setToStorage('obe_classes', classes);
    }

    return updated;
  },
  deleteDivision: (id: number): void => {
    const list = superAdminStorage.getDivisions().filter((d) => d.id !== id);
    setToStorage('obe_divisions', list);
  },

  // Faculty with Designations
  getFaculties: (): FacultyMember[] => getFromStorage('obe_faculties', DEFAULT_FACULTIES),
  saveFaculty: (faculty: Omit<FacultyMember, 'id'> & { id?: number }): FacultyMember => {
    const list = superAdminStorage.getFaculties();
    let updated: FacultyMember;
    if (faculty.id) {
      updated = { ...faculty, id: faculty.id } as FacultyMember;
      const index = list.findIndex((f) => f.id === faculty.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, f) => Math.max(max, f.id || 0), 0) + 1;
      const assignedEmpId = faculty.empId && faculty.empId.trim().length > 0
        ? faculty.empId.trim()
        : generateDepartmentEmployeeId(faculty.departmentId);

      updated = {
        ...faculty,
        id: nextId,
        empId: assignedEmpId,
        createdAt: new Date().toISOString(),
        status: faculty.status || 'Active',
      } as FacultyMember;
      list.unshift(updated);
      console.log(`[OBE Email Notification] Sent faculty login credentials to ${updated.email}: Employee ID: ${updated.empId}, Password: ${updated.password || 'Temporary password sent'}`);
    }
    setToStorage('obe_faculties', list);
    return updated;
  },
  deleteFaculty: (id: number): void => {
    const list = superAdminStorage.getFaculties().filter((f) => f.id !== id);
    setToStorage('obe_faculties', list);
  },

  // Batches
  getBatches: (): BatchItem[] => getFromStorage('obe_batches', DEFAULT_BATCHES),
  saveBatch: (batch: Omit<BatchItem, 'id'> & { id?: number }): BatchItem => {
    const list = superAdminStorage.getBatches();
    let updated: BatchItem;
    if (batch.id) {
      updated = { ...batch, id: batch.id } as BatchItem;
      const index = list.findIndex((b) => b.id === batch.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, b) => Math.max(max, b.id || 0), 0) + 1;
      updated = { ...batch, id: nextId, isActive: true } as BatchItem;
      list.push(updated);
    }
    setToStorage('obe_batches', list);
    return updated;
  },
  deleteBatch: (id: number): void => {
    const list = superAdminStorage.getBatches().filter((b) => b.id !== id);
    setToStorage('obe_batches', list);
  },

  // Students
  getStudents: (): StudentItem[] => getFromStorage('obe_students', DEFAULT_STUDENTS),
  saveStudent: (student: Omit<StudentItem, 'id'> & { id?: number }): StudentItem => {
    const list = superAdminStorage.getStudents();
    let updated: StudentItem;
    if (student.id) {
      updated = { ...student, id: student.id } as StudentItem;
      const index = list.findIndex((s) => s.id === student.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, s) => Math.max(max, s.id || 0), 0) + 1;
      updated = { ...student, id: nextId, isActive: true } as StudentItem;
      list.push(updated);
    }
    setToStorage('obe_students', list);
    return updated;
  },
  deleteStudent: (id: number): void => {
    const list = superAdminStorage.getStudents().filter((s) => s.id !== id);
    setToStorage('obe_students', list);
  },

  // Program Outcomes (PO)
  getPOs: (): ProgramOutcomeExtended[] => getFromStorage('obe_pos', DEFAULT_POS),
  savePO: (po: Omit<ProgramOutcomeExtended, 'id'> & { id?: number }): ProgramOutcomeExtended => {
    const list = superAdminStorage.getPOs();
    let updated: ProgramOutcomeExtended;
    if (po.id) {
      updated = { ...po, id: po.id } as ProgramOutcomeExtended;
      const index = list.findIndex((p) => p.id === po.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
      updated = { ...po, id: nextId, isActive: true, targetLevel: po.targetLevel ?? 2.4 } as ProgramOutcomeExtended;
      list.push(updated);
    }
    setToStorage('obe_pos', list);
    return updated;
  },
  deletePO: (id: number): void => {
    const list = superAdminStorage.getPOs().filter((p) => p.id !== id);
    setToStorage('obe_pos', list);
  },

  // Program Specific Outcomes (PSO)
  getPSOs: (): ProgramSpecificOutcomeExtended[] => getFromStorage('obe_psos', DEFAULT_PSOS),
  savePSO: (pso: Omit<ProgramSpecificOutcomeExtended, 'id'> & { id?: number }): ProgramSpecificOutcomeExtended => {
    const list = superAdminStorage.getPSOs();
    let updated: ProgramSpecificOutcomeExtended;
    if (pso.id) {
      updated = { ...pso, id: pso.id } as ProgramSpecificOutcomeExtended;
      const index = list.findIndex((p) => p.id === pso.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
      updated = { ...pso, id: nextId, isActive: true, targetLevel: pso.targetLevel ?? 2.5 } as ProgramSpecificOutcomeExtended;
      list.push(updated);
    }
    setToStorage('obe_psos', list);
    return updated;
  },
  deletePSO: (id: number): void => {
    const list = superAdminStorage.getPSOs().filter((p) => p.id !== id);
    setToStorage('obe_psos', list);
  },

  // Course Allocations (Subject, Class, Division to Faculty)
  getAllocations: (): CourseAllocation[] => getFromStorage('obe_course_allocations', DEFAULT_COURSE_ALLOCATIONS),
  saveAllocation: (alloc: Omit<CourseAllocation, 'id'> & { id?: number }): CourseAllocation => {
    const list = superAdminStorage.getAllocations();
    let updated: CourseAllocation;
    if (alloc.id) {
      updated = { ...alloc, id: alloc.id } as CourseAllocation;
      const index = list.findIndex((a) => a.id === alloc.id);
      if (index >= 0) list[index] = updated;
      else list.push(updated);
    } else {
      const nextId = list.reduce((max, a) => Math.max(max, a.id || 0), 0) + 1;
      updated = { ...alloc, id: nextId, status: alloc.status || 'Active', createdAt: new Date().toISOString() } as CourseAllocation;
      list.push(updated);
    }
    setToStorage('obe_course_allocations', list);
    return updated;
  },
  deleteAllocation: (id: number): void => {
    const list = superAdminStorage.getAllocations().filter((a) => a.id !== id);
    setToStorage('obe_course_allocations', list);
  },
  getAllocationsByFaculty: (facultyIdOrEmail: number | string): CourseAllocation[] => {
    const list = superAdminStorage.getAllocations();
    const cleanStr = String(facultyIdOrEmail).toLowerCase().trim();
    return list.filter((a) => {
      if (a.status !== 'Active') return false;
      if (typeof facultyIdOrEmail === 'number' && a.facultyId === facultyIdOrEmail) return true;
      if (a.facultyEmail && a.facultyEmail.toLowerCase().trim() === cleanStr) return true;
      if (a.employeeId && a.employeeId.toLowerCase().trim() === cleanStr) return true;
      if (a.facultyName && a.facultyName.toLowerCase().includes(cleanStr)) return true;
      return false;
    });
  },
};
