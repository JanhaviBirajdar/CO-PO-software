import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ChevronRight, CheckCircle2, Layers, Award } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export const CoursesManagement: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [cos, setCos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCoModal, setShowCoModal] = useState(false);

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

  const [coForm, setCoForm] = useState({
    code: '',
    number: 1,
    description: '',
    bloomTaxonomyLevel: 'Apply (L3)',
    targetMarksPercentage: 60,
    targetStudentPercentage: 70,
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/courses');
      setCourses(res.data.data || []);
      if (res.data.data && res.data.data.length > 0 && !selectedCourse) {
        setSelectedCourse(res.data.data[0]);
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
      setCos(res.data.data || []);
    } catch {
      setCos([
        { id: 101, code: 'CO1', number: 1, description: 'Understand concepts of relational database models and schema design', bloomTaxonomyLevel: 'Understand (L2)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
        { id: 102, code: 'CO2', number: 2, description: 'Formulate SQL queries, views, constraints and stored procedures', bloomTaxonomyLevel: 'Apply (L3)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
        { id: 103, code: 'CO3', number: 3, description: 'Apply normalization theory (1NF, 2NF, 3NF, BCNF) to eliminate anomalies', bloomTaxonomyLevel: 'Analyze (L4)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
        { id: 104, code: 'CO4', number: 4, description: 'Analyze concurrency control, transaction management and ACID recovery', bloomTaxonomyLevel: 'Analyze (L4)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
        { id: 105, code: 'CO5', number: 5, description: 'Design enterprise database applications using modern indexing and NoSQL', bloomTaxonomyLevel: 'Create (L6)', targetMarksPercentage: 60, targetStudentPercentage: 70 },
      ]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create course');
    }
  };

  const handleCreateCO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await apiClient.post(`/courses/${selectedCourse.id}/cos`, {
        ...coForm,
        courseId: selectedCourse.id,
      });
      setShowCoModal(false);
      fetchCOs(selectedCourse.id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create Course Outcome');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Course & CO Management</h1>
          <p className="text-xs text-slate-400 mt-1">Configure academic courses, credit weightage and Course Outcomes (COs)</p>
        </div>
        <button
          onClick={() => setShowCourseModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Course List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Courses Directory</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {courses.length === 0 ? (
              <p className="p-4 text-xs text-slate-500 text-center">No courses created yet.</p>
            ) : (
              courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    selectedCourse?.id === c.id
                      ? 'bg-sky-500/15 border-sky-500/40 text-white shadow-sm'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sky-400 text-xs">{c.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 font-semibold">{c.courseType}</span>
                    </div>
                    <p className="text-xs font-medium mt-1 text-slate-200 line-clamp-1">{c.name}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${selectedCourse?.id === c.id ? 'text-sky-400' : 'text-slate-600'}`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Course Details & COs */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCourse ? (
            <>
              {/* Selected Course Header */}
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-mono font-extrabold text-sky-400">{selectedCourse.code}</span>
                    <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold">
                      {selectedCourse.credits} Credits
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedCourse.name}</h2>
                </div>
                <button
                  onClick={() => {
                    setCoForm({
                      code: `CO${cos.length + 1}`,
                      number: cos.length + 1,
                      description: '',
                      bloomTaxonomyLevel: 'Apply (L3)',
                      targetMarksPercentage: 60,
                      targetStudentPercentage: 70,
                    });
                    setShowCoModal(true);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-xl flex items-center space-x-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course Outcome (CO)</span>
                </button>
              </div>

              {/* Course Outcomes List */}
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" /> Defined Course Outcomes ({cos.length})
                </h3>

                {cos.length === 0 ? (
                  <p className="p-8 text-center text-xs text-slate-500">No Course Outcomes defined for this course. Click 'Add Course Outcome' above.</p>
                ) : (
                  <div className="space-y-3">
                    {cos.map((co) => (
                      <div key={co.id} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sky-400 text-xs px-2.5 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                            {co.code}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                            Bloom: {co.bloomTaxonomyLevel || 'Apply (L3)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200">{co.description}</p>
                        <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                          <span>Target Marks: <strong className="text-slate-200">{co.targetMarksPercentage}%</strong></span>
                          <span>Target Students: <strong className="text-slate-200">{co.targetStudentPercentage}%</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-xs">
              Select a course from the list to view and manage its Course Outcomes.
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
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
              <div className="grid grid-cols-2 gap-3">
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
                    <option value="PRACTICAL">Practical</option>
                    <option value="INTEGRATED">Integrated</option>
                    <option value="PROJECT">Project</option>
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Add Course Outcome for {selectedCourse?.code}</h2>
            <form onSubmit={handleCreateCO} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
                <button type="submit" className="px-4 py-2 bg-sky-500 text-white text-xs font-semibold rounded-xl">Save Outcome</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
