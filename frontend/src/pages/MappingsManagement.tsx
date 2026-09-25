import React, { useState, useEffect } from 'react';
import { FileCheck, Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export const MappingsManagement: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [cos, setCos] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [coursesRes, posRes] = await Promise.all([
        apiClient.get('/courses'),
        apiClient.get('/courses/pos'),
      ]);
      setCourses(coursesRes.data.data || []);
      setPos(posRes.data.data || []);
      if (coursesRes.data.data?.length > 0) {
        setSelectedCourseId(coursesRes.data.data[0].id);
      }
    } catch {
      const fallbackCourses = [
        { id: 1, code: 'CS501', name: 'Database Management Systems' },
        { id: 2, code: 'CS502', name: 'Computer Networks' },
        { id: 3, code: 'CS503', name: 'Theory of Computation' },
      ];
      const fallbackPOs = [
        { id: 1, code: 'PO1', number: 1 },
        { id: 2, code: 'PO2', number: 2 },
        { id: 3, code: 'PO3', number: 3 },
        { id: 4, code: 'PO4', number: 4 },
        { id: 5, code: 'PO5', number: 5 },
        { id: 6, code: 'PO6', number: 6 },
        { id: 7, code: 'PO7', number: 7 },
        { id: 8, code: 'PO8', number: 8 },
        { id: 9, code: 'PO9', number: 9 },
        { id: 10, code: 'PO10', number: 10 },
        { id: 11, code: 'PO11', number: 11 },
        { id: 12, code: 'PO12', number: 12 },
      ];
      setCourses(fallbackCourses);
      setPos(fallbackPOs);
      setSelectedCourseId(1);
    }
  };

  const fetchCourseMapping = async (courseId: number) => {
    setLoading(true);
    try {
      const cosRes = await apiClient.get(`/courses/${courseId}/cos`);
      const mappingRes = await apiClient.get(`/courses/${courseId}/co-po-matrix`);
      
      setCos(cosRes.data.data || []);

      const newMatrix: { [key: string]: number } = {};
      if (mappingRes.data.data?.matrix) {
        mappingRes.data.data.matrix.forEach((item: any) => {
          newMatrix[`${item.courseOutcomeId}_${item.programOutcomeId}`] = item.correlationLevel;
        });
      }
      setMatrix(newMatrix);
    } catch {
      const fallbackCos = [
        { id: 101, code: 'CO1', number: 1, description: 'Relational data model and SQL' },
        { id: 102, code: 'CO2', number: 2, description: 'Normalization and Schema Design' },
        { id: 103, code: 'CO3', number: 3, description: 'Transaction Management & ACID' },
        { id: 104, code: 'CO4', number: 4, description: 'Concurrency Control & Recovery' },
        { id: 105, code: 'CO5', number: 5, description: 'Indexing and Storage Management' },
      ];
      setCos(fallbackCos);
      const fallbackMatrix: { [key: string]: number } = {
        '101_1': 3, '101_2': 3, '101_3': 2, '101_4': 2, '101_5': 3,
        '102_1': 2, '102_2': 3, '102_3': 3, '102_4': 2,
        '103_1': 2, '103_2': 2, '103_3': 3, '103_4': 3, '103_8': 2,
        '104_1': 2, '104_2': 3, '104_3': 2, '104_4': 3, '104_12': 2,
        '105_1': 3, '105_2': 2, '105_3': 3, '105_5': 3, '105_12': 3,
      };
      setMatrix(fallbackMatrix);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseMapping(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleLevelChange = (coId: number, poId: number, level: number) => {
    setMatrix((prev) => ({
      ...prev,
      [`${coId}_${poId}`]: level,
    }));
  };

  const handleSaveMatrix = async () => {
    if (!selectedCourseId) return;
    setSaving(true);
    setSaveSuccess(false);

    const mappingsToSave: any[] = [];
    cos.forEach((co) => {
      pos.forEach((po) => {
        const level = matrix[`${co.id}_${po.id}`] ?? 0;
        mappingsToSave.push({
          courseOutcomeId: co.id,
          programOutcomeId: po.id,
          correlationLevel: Number(level),
        });
      });
    });

    try {
      await apiClient.post('/courses/co-po-mappings/bulk', { mappings: mappingsToSave });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save CO-PO mapping matrix');
    } finally {
      setSaving(false);
    }
  };

  const calculateCoAvg = (coId: number) => {
    const levels = pos.map((po) => matrix[`${coId}_${po.id}`] || 0).filter((lvl) => lvl > 0);
    if (levels.length === 0) return '—';
    const sum = levels.reduce((acc, curr) => acc + curr, 0);
    return (sum / levels.length).toFixed(2);
  };

  const calculatePoAvg = (poId: number) => {
    const levels = cos.map((co) => matrix[`${co.id}_${poId}`] || 0).filter((lvl) => lvl > 0);
    if (levels.length === 0) return '—';
    const sum = levels.reduce((acc, curr) => acc + curr, 0);
    return (sum / levels.length).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CO-PO Mapping Matrix</h1>
          <p className="text-xs text-slate-400 mt-1">Map Course Outcomes (COs) to NBA Program Outcomes (POs) with correlation levels 1 (Low), 2 (Medium), 3 (High)</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Matrix Saved!
            </span>
          )}
          <button
            onClick={handleSaveMatrix}
            disabled={saving || !selectedCourseId}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Mapping Matrix'}</span>
          </button>
        </div>
      </div>

      {/* Course Selector Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-300">Select Target Course:</label>
          <select
            value={selectedCourseId || ''}
            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-sky-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> 3: High</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> 2: Medium</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> 1: Low</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span> 0: None</span>
        </div>
      </div>

      {/* Mapping Grid Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto backdrop-blur-md">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading course mapping matrix...</div>
        ) : cos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No Course Outcomes (COs) found for this course. Please define COs first under 'Courses & COs'.
          </div>
        ) : (
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-800/80 text-slate-200 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3 text-left w-24">CO Code</th>
                <th className="p-3 text-left">Course Outcome Statement</th>
                {pos.map((po) => (
                  <th key={po.id} className="p-3 font-mono text-sky-400 font-bold w-14" title={po.description}>
                    {po.code}
                  </th>
                ))}
                <th className="p-3 text-emerald-400 font-bold w-16">CO Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {cos.map((co) => (
                <tr key={co.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono font-bold text-sky-400 text-left">{co.code}</td>
                  <td className="p-3 text-left text-slate-300 text-[11px] max-w-xs truncate" title={co.description}>
                    {co.description}
                  </td>
                  {pos.map((po) => {
                    const currentLevel = matrix[`${co.id}_${po.id}`] ?? 0;
                    return (
                      <td key={po.id} className="p-2">
                        <select
                          value={currentLevel}
                          onChange={(e) => handleLevelChange(co.id, po.id, Number(e.target.value))}
                          className={`w-11 h-8 rounded-lg text-center font-bold text-xs focus:outline-none transition-all cursor-pointer ${
                            currentLevel === 3
                              ? 'bg-sky-500 text-white font-black'
                              : currentLevel === 2
                              ? 'bg-indigo-500/80 text-white font-bold'
                              : currentLevel === 1
                              ? 'bg-slate-700 text-slate-200 font-semibold'
                              : 'bg-slate-800/60 text-slate-500 border border-slate-700/50'
                          }`}
                        >
                          <option value={0}>-</option>
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                        </select>
                      </td>
                    );
                  })}
                  <td className="p-3 font-mono font-bold text-emerald-400">{calculateCoAvg(co.id)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-800/60 font-bold border-t border-slate-700">
              <tr>
                <td colSpan={2} className="p-3 text-left text-slate-300 text-xs uppercase tracking-wider">
                  PO Attainment Average Matrix
                </td>
                {pos.map((po) => (
                  <td key={po.id} className="p-3 font-mono text-sky-400 text-xs">
                    {calculatePoAvg(po.id)}
                  </td>
                ))}
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};
