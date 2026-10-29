import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Layers, Award, UserCheck, BookOpen, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { superAdminStorage, type CourseAllocation } from '../utils/superAdminData';

export const CoursesManagement: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<CourseAllocation[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [cos, setCos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCoModal, setShowCoModal] = useState(false);
  const [viewMode, setViewMode] = useState<'MY_COURSES' | 'ALL_COURSES'>('MY_COURSES');

  // Form states
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    credits: '4.00',
    courseType: 'THEORY',
    programId: 1,
    semesterId: 1,
    academicYearId: 1,
  });

  const [savingCo, setSavingCo] = useState(false);
  const [coForm, setCoForm] = useState({
    code: '',
    number: 1,
    description: '',
    bloomTaxonomyLevel: 'Apply (L3)',
    targetMarksPercentage: 60,
    targetStudentPercentage: 70,
  });

  const fetchAllocationsAndCourses = async () => {
    setLoading(true);
    let allAllocs: CourseAllocation[] = [];

    try {
      const allocRes = await apiClient.get('/courses/assignments');
      if (allocRes.data?.success && allocRes.data.data && allocRes.data.data.length > 0) {
        allAllocs = allocRes.data.data.map((a: any) => ({
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
      }
    } catch {
      // offline / fallback
    }

    if (allAllocs.length === 0) {
      allAllocs = superAdminStorage.getAllocations();
    }
    setAllocations(allAllocs);

    try {
      const res = await apiClient.get('/courses');
      const fetchedCourses = res.data.data || [];
      setCourses(fetchedCourses);

      // Check if logged-in user is a faculty member with assigned courses
      const isFaculty = user?.role === 'FACULTY';
      const myAllocs = allAllocs.filter((a) =>
        a.status === 'Active' &&
        (a.facultyId === user?.id ||
          (a.facultyEmail && a.facultyEmail.toLowerCase().trim() === user?.email?.toLowerCase().trim()) ||
          (a.facultyName && user?.name && a.facultyName.toLowerCase().includes(user.name.toLowerCase())))
      );

      if (isFaculty && myAllocs.length > 0) {
        setViewMode('MY_COURSES');
        const matched = fetchedCourses.find(
          (c: any) => c.id === myAllocs[0].courseId || c.code.toLowerCase() === myAllocs[0].courseCode.toLowerCase()
        );
        setSelectedCourse(matched || fetchedCourses[0]);
      } else {
        setViewMode('ALL_COURSES');
        if (fetchedCourses.length > 0 && !selectedCourse) {
          setSelectedCourse(fetchedCourses[0]);
        }
      }
    } catch {
      const fallbackCourses = [
        { id: 1, code: 'CS501', name: 'Database Management Systems', credits: 4, courseType: 'THEORY', program: { name: 'B.E. Computer Engineering' }, semester: { number: 5 } },
        { id: 2, code: 'CS502', name: 'Computer Networks', credits: 4, courseType: 'THEORY', program: { name: 'B.E. Computer Engineering' }, semester: { number: 5 } },
        { id: 3, code: 'CS503', name: 'Theory of Computation', credits: 3, courseType: 'THEORY', program: { name: 'B.E. Computer Engineering' }, semester: { number: 5 } },
        { id: 4, code: 'CS504', name: 'DBMS & Network Laboratory', credits: 2, courseType: 'PRACTICAL', program: { name: 'B.E. Computer Engineering' }, semester: { number: 5 } },
      ];
      setCourses(fallbackCourses);
      setSelectedCourse(fallbackCourses[0]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCOs = async (courseId: number) => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/cos`);
      const data = res.data.data || [];
      if (data.length > 0) {
        setCos(data);
        return;
      }
      throw new Error('Empty COs');
    } catch {
      if (courseId === 2) {
        // CS502: Computer Networks
        setCos([
          { id: 201, code: 'CO1', number: 1, description: 'Understand OSI & TCP/IP layered architecture and transmission media', bloomTaxonomyLevel: 'Understand (L2)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 202, code: 'CO2', number: 2, description: 'Analyze data link layer protocols, framing, and sliding window flow control', bloomTaxonomyLevel: 'Analyze (L4)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 203, code: 'CO3', number: 3, description: 'Apply IP addressing, subnetting, and distance-vector/link-state routing algorithms', bloomTaxonomyLevel: 'Apply (L3)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 204, code: 'CO4', number: 4, description: 'Evaluate transport layer TCP/UDP connection management and congestion control', bloomTaxonomyLevel: 'Evaluate (L5)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 205, code: 'CO5', number: 5, description: 'Design networked client-server applications utilizing socket APIs and DNS/HTTP', bloomTaxonomyLevel: 'Create (L6)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
        ]);
      } else if (courseId === 3) {
        // CS503: Theory of Computation
        setCos([
          { id: 301, code: 'CO1', number: 1, description: 'Construct deterministic and non-deterministic finite automata for regular languages', bloomTaxonomyLevel: 'Apply (L3)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 302, code: 'CO2', number: 2, description: 'Formulate regular expressions and establish language equivalence via Myhill-Nerode', bloomTaxonomyLevel: 'Apply (L3)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 303, code: 'CO3', number: 3, description: 'Design pushdown automata and simplify context-free grammars using Chomsky Normal Form', bloomTaxonomyLevel: 'Create (L6)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 304, code: 'CO4', number: 4, description: 'Analyze Turing machines, decidability, and the Halting Problem boundaries', bloomTaxonomyLevel: 'Analyze (L4)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 305, code: 'CO5', number: 5, description: 'Classify computational complexity classes P, NP, and NP-Complete reductions', bloomTaxonomyLevel: 'Analyze (L4)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
        ]);
      } else if (courseId === 4) {
        // CS504: DBMS & Network Laboratory
        setCos([
          { id: 401, code: 'CO1', number: 1, description: 'Implement relational database schemas with DDL, DML and integrity constraints', bloomTaxonomyLevel: 'Apply (L3)', targetMarksPercentage: 65, targetStudentPercentage: 75 },
          { id: 402, code: 'CO2', number: 2, description: 'Execute complex nested queries, joins, views, and PL/SQL procedures and triggers', bloomTaxonomyLevel: 'Apply (L3)', targetMarksPercentage: 65, targetStudentPercentage: 75 },
          { id: 403, code: 'CO3', number: 3, description: 'Configure local network topologies, static/dynamic routing and packet analyzers', bloomTaxonomyLevel: 'Apply (L3)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 404, code: 'CO4', number: 4, description: 'Simulate network protocols and capture packet flow metrics using Wireshark', bloomTaxonomyLevel: 'Analyze (L4)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 405, code: 'CO5', number: 5, description: 'Build integrated full-stack web application connecting SQL databases with socket networking', bloomTaxonomyLevel: 'Create (L6)', targetMarksPercentage: 65, targetStudentPercentage: 75 },
        ]);
      } else {
        // CS501: Database Management Systems
        setCos([
          { id: 101, code: 'CO1', number: 1, description: 'Understand concepts of relational database models and schema design', bloomTaxonomyLevel: 'Understand (L2)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 102, code: 'CO2', number: 2, description: 'Formulate SQL queries, views, constraints and stored procedures', bloomTaxonomyLevel: 'Apply (L3)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 103, code: 'CO3', number: 3, description: 'Apply normalization theory (1NF, 2NF, 3NF, BCNF) to eliminate anomalies', bloomTaxonomyLevel: 'Analyze (L4)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 104, code: 'CO4', number: 4, description: 'Analyze concurrency control, transaction management and ACID recovery', bloomTaxonomyLevel: 'Analyze (L4)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
          { id: 105, code: 'CO5', number: 5, description: 'Design enterprise database applications using modern indexing and NoSQL', bloomTaxonomyLevel: 'Create (L6)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
        ]);
      }
    }
  };

  useEffect(() => {
    fetchAllocationsAndCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCOs(selectedCourse.id);
    }
  }, [selectedCourse]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/courses', {
        ...courseForm,
        credits: parseFloat(courseForm.credits),
        programId: Number(courseForm.programId),
        semesterId: Number(courseForm.semesterId),
        academicYearId: Number(courseForm.academicYearId),
      });
      setShowCourseModal(false);
      fetchAllocationsAndCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to create course');
    }
  };

  const handleCreateCO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || savingCo) return;
    setSavingCo(true);
    try {
      await apiClient.post(`/courses/${selectedCourse.id}/cos`, {
        ...coForm,
        courseId: selectedCourse.id,
      });
      setShowCoModal(false);
      fetchCOs(selectedCourse.id);
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to create Course Outcome');
    } finally {
      setSavingCo(false);
    }
  };

  // Determine current user's assigned allocations
  const isFaculty = user?.role === 'FACULTY';
  const myAllocations = allocations.filter((a) =>
    a.status === 'Active' &&
    (a.facultyId === user?.id ||
      (a.facultyEmail && a.facultyEmail.toLowerCase().trim() === user?.email?.toLowerCase().trim()) ||
      (a.employeeId && user?.employeeId && a.employeeId.toLowerCase().trim() === user.employeeId.toLowerCase().trim()) ||
      (a.facultyName && user?.name && a.facultyName.toLowerCase().includes(user.name.toLowerCase())))
  );

  const displayedCourses = (isFaculty && viewMode === 'MY_COURSES' && myAllocations.length > 0)
    ? courses.filter((c) =>
        myAllocations.some(
          (a) => a.courseId === c.id || a.courseCode.toLowerCase() === c.code.toLowerCase()
        )
      )
    : courses;

  // Selected course's active allocation info (if any)
  const selectedCourseAlloc = selectedCourse
    ? allocations.find(
        (a) =>
          a.status === 'Active' &&
          (a.courseId === selectedCourse.id || a.courseCode.toLowerCase() === selectedCourse.code.toLowerCase()) &&
          (!isFaculty || myAllocations.some((m) => m.id === a.id) || true)
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Courses & Course Outcomes (COs)</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isFaculty && myAllocations.length > 0 ? (
              <span>
                Displaying courses assigned to you by the HOD for <span className="text-sky-400 font-semibold">AY 2025-2026</span>
              </span>
            ) : (
              'Configure academic courses, credit weightage and Course Outcomes (COs)'
            )}
          </p>
        </div>
        {user?.role !== 'FACULTY' && (
          <button
            onClick={() => setShowCourseModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Side: Course List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courses Directory</h2>
            <span className="text-[11px] font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
              {displayedCourses.length} {displayedCourses.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>

          {/* Toggle between My Assigned Courses and All Courses for Faculty */}
          {isFaculty && myAllocations.length > 0 && (
            <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
              <button
                onClick={() => {
                  setViewMode('MY_COURSES');
                  const firstMy = courses.find((c) =>
                    myAllocations.some((a) => a.courseId === c.id || a.courseCode.toLowerCase() === c.code.toLowerCase())
                  );
                  if (firstMy) setSelectedCourse(firstMy);
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  viewMode === 'MY_COURSES'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Assigned ({myAllocations.length})
              </button>
              <button
                onClick={() => setViewMode('ALL_COURSES')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  viewMode === 'ALL_COURSES'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Courses ({courses.length})
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-[280px] lg:max-h-[600px] overflow-y-auto pr-1">
            {displayedCourses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800">
                <p>No courses found.</p>
                {isFaculty && viewMode === 'MY_COURSES' && (
                  <button
                    onClick={() => setViewMode('ALL_COURSES')}
                    className="mt-2 text-sky-400 hover:underline text-xs"
                  >
                    View all departmental courses
                  </button>
                )}
              </div>
            ) : (
              displayedCourses.map((c) => {
                const alloc = allocations.find(
                  (a) =>
                    a.status === 'Active' &&
                    (a.courseId === c.id || a.courseCode.toLowerCase() === c.code.toLowerCase())
                );
                const isSelected = selectedCourse?.id === c.id;
                const isMyAssigned = alloc && myAllocations.some((m) => m.id === alloc.id);

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourse(c)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/50 text-white shadow-md shadow-sky-500/5'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sky-400 text-xs">{c.code}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 font-semibold">
                          {c.courseType}
                        </span>
                        {isMyAssigned && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Assigned
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium mt-1 text-slate-200 line-clamp-1">{c.name}</p>

                      {/* Class & Division badge */}
                      {alloc && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Class: {alloc.classCode} · {alloc.division}
                          </span>
                          {!isMyAssigned && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                              {alloc.facultyName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-600'}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Course Details & COs */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCourse ? (
            <>
              {/* Assigned Scope Banner if assigned to faculty */}
              {selectedCourseAlloc && (
                <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {isFaculty && myAllocations.some((m) => m.id === selectedCourseAlloc.id)
                            ? 'Assigned Course (Your Teaching Scope)'
                            : `Assigned Faculty: ${selectedCourseAlloc.facultyName}`}
                        </span>
                        {selectedCourseAlloc.employeeId && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {selectedCourseAlloc.employeeId}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {selectedCourseAlloc.facultyName} · {selectedCourseAlloc.designation || 'Subject In-Charge'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs">
                      Class: {selectedCourseAlloc.classCode}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-xs">
                      {selectedCourseAlloc.division}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                      AY {selectedCourseAlloc.academicYear}
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Course Header */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-base sm:text-lg font-mono font-extrabold text-sky-400">{selectedCourse.code}</span>
                    <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
                      {selectedCourse.credits} Credits
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
                      {selectedCourse.courseType || 'THEORY'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5">{selectedCourse.name}</h2>
                </div>
                <button
                  onClick={() => {
                    const nextNum = (cos && cos.length > 0)
                      ? Math.max(
                          ...cos.map((c) => Number(c.number) || 0),
                          ...cos.map((c) => {
                            const match = c.code?.match(/\d+/);
                            return match ? parseInt(match[0], 10) : 0;
                          })
                        ) + 1
                      : 1;
                    setCoForm({
                      code: `CO${nextNum}`,
                      number: nextNum,
                      description: '',
                      bloomTaxonomyLevel: 'Apply (L3)',
                      targetMarksPercentage: 60,
                      targetStudentPercentage: 70,
                    });
                    setShowCoModal(true);
                  }}
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course Outcome (CO)</span>
                </button>
              </div>

              {/* Course Outcomes List */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl backdrop-blur-md">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" /> Defined Course Outcomes ({cos.length})
                </h3>

                {cos.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-500">
                    No Course Outcomes defined for this course. Click 'Add Course Outcome' above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {cos.map((co) => (
                      <div key={co.id} className="p-3 sm:p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono font-bold text-sky-400 text-xs px-2.5 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            {co.code}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                            Bloom: {co.bloomTaxonomyLevel || 'Apply (L3)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{co.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-2xl text-center text-slate-500 text-xs">
              Select a course from the list to view and manage its Course Outcomes.
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Add New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="CS301"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="Database Management Systems"
                  value={courseForm.name}
                  onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Type</label>
                  <select
                    value={courseForm.courseType}
                    onChange={(e) => setCourseForm({ ...courseForm, courseType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  >
                    <option value="THEORY">Theory</option>
                    <option value="LAB">Practical / Lab</option>
                    <option value="PROJECT">Project</option>
                    <option value="ELECTIVE">Elective</option>
                    <option value="AUDIT">Audit</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-500 text-white text-xs font-semibold rounded-xl">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add CO Modal */}
      {showCoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">Add Course Outcome for {selectedCourse?.code}</h2>
            <form onSubmit={handleCreateCO} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CO Code</label>
                  <input
                    type="text"
                    required
                    value={coForm.code}
                    onChange={(e) => setCoForm({ ...coForm, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bloom Level</label>
                  <input
                    type="text"
                    required
                    value={coForm.bloomTaxonomyLevel}
                    onChange={(e) => setCoForm({ ...coForm, bloomTaxonomyLevel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">CO Statement / Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Understand relational database models and execute SQL queries..."
                  value={coForm.description}
                  onChange={(e) => setCoForm({ ...coForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCoModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" disabled={savingCo} className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-semibold rounded-xl">
                  {savingCo ? 'Saving...' : 'Save Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
