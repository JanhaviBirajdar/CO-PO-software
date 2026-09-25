import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Save, Users, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export const Assessments: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [marksGrid, setMarksGrid] = useState<{ [studentId: number]: { marksObtained: number; isAbsent: boolean } }>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Form states
  const [assessmentForm, setAssessmentForm] = useState({
    name: 'Internal Test 1',
    type: 'INTERNAL_TEST_1',
    maxMarks: 50,
    weightage: 20,
    isExternal: false,
  });

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/courses');
      setCourses(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedCourseId(res.data.data[0].id);
      }
    } catch {
      // Fallback
    }
  };

  const fetchAssessments = async (courseId: number) => {
    try {
      const res = await apiClient.get(`/assessments?courseId=${courseId}`);
      setAssessments(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedAssessment(res.data.data[0]);
      } else {
        setSelectedAssessment(null);
      }
    } catch {
      setAssessments([]);
    }
  };

  const fetchMarksAndStudents = async (assessmentId: number) => {
    try {
      const [stRes, marksRes] = await Promise.all([
        apiClient.get('/academic/students'),
        apiClient.get(`/assessments/${assessmentId}/marks`),
      ]);

      const stList = stRes.data.data || [];
      setStudents(stList);

      const existingMarks = marksRes.data.data || [];
      const newGrid: { [studentId: number]: { marksObtained: number; isAbsent: boolean } } = {};

      stList.forEach((st: any) => {
        const found = existingMarks.find((m: any) => m.studentId === st.id);
        newGrid[st.id] = {
          marksObtained: found ? Number(found.marksObtained) : 0,
          isAbsent: found ? Boolean(found.isAbsent) : false,
        };
      });

      setMarksGrid(newGrid);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAssessments(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedAssessment) {
      fetchMarksAndStudents(selectedAssessment.id);
    }
  }, [selectedAssessment]);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      await apiClient.post('/assessments', {
        ...assessmentForm,
        courseId: selectedCourseId,
        academicYearId: 1,
        maxMarks: Number(assessmentForm.maxMarks),
        weightage: Number(assessmentForm.weightage),
      });
      setShowAssessmentModal(false);
      fetchAssessments(selectedCourseId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create assessment');
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedAssessment) return;
    setSavingMarks(true);

    const marksPayload = Object.entries(marksGrid).map(([studentId, data]) => ({
      studentId: Number(studentId),
      assessmentId: selectedAssessment.id,
      marksObtained: Number(data.marksObtained),
      isAbsent: Boolean(data.isAbsent),
    }));

    try {
      await apiClient.post(`/assessments/${selectedAssessment.id}/marks`, { marks: marksPayload });
      alert('Assessment Marks saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save student marks');
    } finally {
      setSavingMarks(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Assessment & Marks Entry</h1>
          <p className="text-xs text-slate-400 mt-1">Configure internal & external examinations and input student mark rosters</p>
        </div>
        <button
          onClick={() => setShowAssessmentModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assessment</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Course:</label>
            <select
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-medium"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Assessment Component:</label>
            <select
              value={selectedAssessment?.id || ''}
              onChange={(e) => {
                const found = assessments.find((a) => a.id === Number(e.target.value));
                setSelectedAssessment(found || null);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-medium"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.maxMarks} Marks, Weight: {a.weightage}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedAssessment && (
          <button
            onClick={handleSaveMarks}
            disabled={savingMarks}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingMarks ? 'Saving...' : 'Save Student Marks'}</span>
          </button>
        )}
      </div>

      {/* Marks Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
        {!selectedAssessment ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No assessment components found for this course. Click 'Create Assessment' above.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5 w-40 text-center">Marks Obtained (Max: {selectedAssessment.maxMarks})</th>
                <th className="p-3.5 w-28 text-center">Absent?</th>
                <th className="p-3.5 w-32 text-center">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {students.map((st) => {
                const current = marksGrid[st.id] || { marksObtained: 0, isAbsent: false };
                const pct = selectedAssessment.maxMarks > 0 ? (current.marksObtained / selectedAssessment.maxMarks) * 100 : 0;
                return (
                  <tr key={st.id} className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono font-bold text-sky-400">{st.rollNumber}</td>
                    <td className="p-3.5 font-medium text-white">{st.name}</td>
                    <td className="p-3.5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={selectedAssessment.maxMarks}
                        disabled={current.isAbsent}
                        value={current.marksObtained}
                        onChange={(e) =>
                          setMarksGrid({
                            ...marksGrid,
                            [st.id]: { ...current, marksObtained: Number(e.target.value) },
                          })
                        }
                        className="w-24 bg-slate-800 border border-slate-700 text-center font-bold text-sky-300 text-xs rounded-lg py-1.5 focus:outline-none focus:border-sky-500 disabled:opacity-30"
                      />
                    </td>
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={current.isAbsent}
                        onChange={(e) =>
                          setMarksGrid({
                            ...marksGrid,
                            [st.id]: { ...current, isAbsent: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-sky-500 bg-slate-800 border-slate-700 rounded"
                      />
                    </td>
                    <td className="p-3.5 text-center font-mono font-semibold">
                      <span className={pct >= 60 ? 'text-emerald-400' : 'text-amber-400'}>
                        {current.isAbsent ? 'ABSENT' : `${pct.toFixed(1)}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Create Assessment Component</h2>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Name</label>
                <input
                  type="text"
                  required
                  value={assessmentForm.name}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={assessmentForm.maxMarks}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, maxMarks: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    required
                    value={assessmentForm.weightage}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, weightage: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowAssessmentModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-500 text-white text-xs font-semibold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
