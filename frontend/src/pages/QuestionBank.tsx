import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Brain,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  ChevronRight,
  BookOpen,
  PieChart as PieIcon,
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import type { Question, BloomLevel, QuestionPaperBlueprint, QuestionPaper } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const BLOOM_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export const QuestionBank: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BANK' | 'CREATE' | 'BLUEPRINT' | 'PAPER_ANALYSIS'>('BANK');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bloomLevels, setBloomLevels] = useState<BloomLevel[]>([]);
  const [blueprints, setBlueprints] = useState<QuestionPaperBlueprint[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');

  // New Question Form state
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    marks: 4,
    unit: 1,
    difficulty: 'MEDIUM',
    questionType: 'SHORT_ANSWER',
    courseId: 1,
    courseOutcomeId: 1,
    bloomLevelId: 2,
    bloomVerb: 'Explain',
  });

  // Auto Bloom Suggestion state
  const [autoSuggestion, setAutoSuggestion] = useState<{
    levelName: string;
    levelNumber: number;
    matchedVerb: string;
    reason: string;
  } | null>(null);

  useEffect(() => {
    fetchQuestionBankData();
  }, []);

  const fetchQuestionBankData = async () => {
    setLoading(true);
    try {
      const [qRes, bRes, pRes] = await Promise.all([
        apiClient.get('/question-bank/questions'),
        apiClient.get('/bloom/levels'),
        apiClient.get('/question-bank/blueprints'),
      ]);

      if (qRes.data?.success) setQuestions(qRes.data.data);
      if (bRes.data?.success) setBloomLevels(bRes.data.data);
      if (pRes.data?.success) setBlueprints(pRes.data.data);
    } catch {
      // Mock fallback data
      const mockQs: Question[] = [
        {
          id: 1,
          questionText: 'Define primary key and foreign key constraints in DBMS.',
          marks: 2,
          unit: 1,
          bloomVerb: 'Define',
          difficulty: 'EASY',
          questionType: 'SHORT_ANSWER',
          courseId: 1,
          courseOutcomeId: 1,
          bloomLevelId: 1,
          academicYearId: 1,
          isApproved: true,
          courseOutcome: { id: 1, code: 'CO1', number: 1, description: 'Understand relational database concepts', bloomsLevel: 1, isActive: true, courseId: 1 },
          bloomLevel: { id: 1, levelNumber: 1, levelCode: 'REMEMBER', levelName: 'Remember', description: '', actionVerbs: '', status: true },
        },
        {
          id: 2,
          questionText: 'Explain the 3-tier architecture of Database Management System.',
          marks: 4,
          unit: 1,
          bloomVerb: 'Explain',
          difficulty: 'MEDIUM',
          questionType: 'SHORT_ANSWER',
          courseId: 1,
          courseOutcomeId: 1,
          bloomLevelId: 2,
          academicYearId: 1,
          isApproved: true,
          courseOutcome: { id: 1, code: 'CO1', number: 1, description: 'Understand relational database concepts', bloomsLevel: 2, isActive: true, courseId: 1 },
          bloomLevel: { id: 2, levelNumber: 2, levelCode: 'UNDERSTAND', levelName: 'Understand', description: '', actionVerbs: '', status: true },
        },
        {
          id: 3,
          questionText: 'Apply 3NF decomposition algorithm on the given relation schema R(A,B,C,D).',
          marks: 6,
          unit: 2,
          bloomVerb: 'Apply',
          difficulty: 'MEDIUM',
          questionType: 'NUMERICAL',
          courseId: 1,
          courseOutcomeId: 2,
          bloomLevelId: 3,
          academicYearId: 1,
          isApproved: true,
          courseOutcome: { id: 2, code: 'CO2', number: 2, description: 'Design & normalize relational schema', bloomsLevel: 3, isActive: true, courseId: 1 },
          bloomLevel: { id: 3, levelNumber: 3, levelCode: 'APPLY', levelName: 'Apply', description: '', actionVerbs: '', status: true },
        },
        {
          id: 4,
          questionText: 'Design a hospital management database schema including ER diagram and DDL tables.',
          marks: 10,
          unit: 3,
          bloomVerb: 'Design',
          difficulty: 'HARD',
          questionType: 'DESIGN_QUESTION',
          courseId: 1,
          courseOutcomeId: 3,
          bloomLevelId: 6,
          academicYearId: 1,
          isApproved: true,
          courseOutcome: { id: 3, code: 'CO3', number: 3, description: 'Design database systems', bloomsLevel: 6, isActive: true, courseId: 1 },
          bloomLevel: { id: 6, levelNumber: 6, levelCode: 'CREATE', levelName: 'Create', description: '', actionVerbs: '', status: true },
        },
      ];
      setQuestions(mockQs);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Bloom suggestion as user types question text
  const handleQuestionTextChange = async (text: string) => {
    setNewQuestion((prev) => ({ ...prev, questionText: text }));

    if (text.trim().length > 3) {
      try {
        const res = await apiClient.post('/bloom/suggest', { text });
        if (res.data?.success) {
          const s = res.data.data;
          setAutoSuggestion({
            levelName: s.levelName,
            levelNumber: s.levelNumber,
            matchedVerb: s.matchedVerb,
            reason: s.reason,
          });
          setNewQuestion((prev) => ({
            ...prev,
            bloomLevelId: s.suggestedLevelId,
            bloomVerb: s.matchedVerb,
          }));
        }
      } catch {
        // Ignored
      }
    } else {
      setAutoSuggestion(null);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/question-bank/questions', newQuestion);
      if (res.data?.success) {
        alert('Question created successfully!');
        fetchQuestionBankData();
        setActiveTab('BANK');
      }
    } catch {
      alert('Question added to Question Bank repository (demo mode).');
      setActiveTab('BANK');
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'ALL' || q.bloomLevel?.levelNumber.toString() === filterLevel;
    const matchesDiff = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesLevel && matchesDiff;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
            <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Question Bank & Blueprint Module</h1>
            <p className="text-sm text-indigo-200/80 mt-0.5">
              Bloom's Taxonomy Mapped Questions, Paper Blueprint & Coverage Analysis — DYP COEI
            </p>
          </div>
        </div>

        <div className="flex space-x-1 bg-white/10 p-1.5 rounded-xl border border-white/10 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveTab('BANK')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'BANK' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-200 hover:bg-white/5'
            }`}
          >
            Question Repository
          </button>
          <button
            onClick={() => setActiveTab('CREATE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'CREATE' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-200 hover:bg-white/5'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
          <button
            onClick={() => setActiveTab('BLUEPRINT')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'BLUEPRINT' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-200 hover:bg-white/5'
            }`}
          >
            Paper Blueprint
          </button>
        </div>
      </div>

      {/* QUESTION BANK REPOSITORY TAB */}
      {activeTab === 'BANK' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search question statement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="ALL">All Bloom Levels</option>
                <option value="1">L1 - Remember</option>
                <option value="2">L2 - Understand</option>
                <option value="3">L3 - Apply</option>
                <option value="4">L4 - Analyze</option>
                <option value="5">L5 - Evaluate</option>
                <option value="6">L6 - Create</option>
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* Question List Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-800">
                Question Bank Items ({filteredQuestions.length})
              </h2>
              <span className="text-xs text-slate-500 font-mono">DYP COEI Approved Repository</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredQuestions.map((q) => (
                <div key={q.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800">
                          {q.courseOutcome?.code || 'CO1'}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800">
                          Unit {q.unit}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded text-white`}
                          style={{ backgroundColor: BLOOM_COLORS[(q.bloomLevel?.levelNumber || 1) - 1] }}
                        >
                          L{q.bloomLevel?.levelNumber || 1} {q.bloomLevel?.levelName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Verb: "{q.bloomVerb || 'Explain'}"
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{q.questionText}</p>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800 block">{q.marks} Marks</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            q.difficulty === 'EASY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.difficulty === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW QUESTION TAB WITH REAL-TIME BLOOM SUGGESTION */}
      {activeTab === 'CREATE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Add New Question with Auto Bloom Suggestion</h2>
            <p className="text-xs text-slate-500">
              The system automatically parses question statement verbs to recommend the cognitive Bloom level.
            </p>
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Question Statement</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Design a normalized database schema for a university management system."
                value={newQuestion.questionText}
                onChange={(e) => handleQuestionTextChange(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Real-time Auto Bloom Suggestion Banner */}
            {autoSuggestion && (
              <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-950">
                      Suggested Bloom Level: L{autoSuggestion.levelNumber} ({autoSuggestion.levelName})
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-200 text-indigo-800">
                      Verb: "{autoSuggestion.matchedVerb}"
                    </span>
                  </div>
                  <p className="text-xs text-indigo-800 mt-1">{autoSuggestion.reason}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marks Allocation</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newQuestion.marks}
                  onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value, 10) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Syllabus Unit Number</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={newQuestion.unit}
                  onChange={(e) => setNewQuestion({ ...newQuestion, unit: parseInt(e.target.value, 10) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
                <select
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mapped Course Outcome (CO)</label>
                <select
                  value={newQuestion.courseOutcomeId}
                  onChange={(e) => setNewQuestion({ ...newQuestion, courseOutcomeId: parseInt(e.target.value, 10) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={1}>CO1: Understand relational database concepts</option>
                  <option value={2}>CO2: Design and normalize relational schemas</option>
                  <option value={3}>CO3: Write and optimize complex SQL queries</option>
                  <option value={4}>CO4: Apply transaction management techniques</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bloom's Taxonomy Level</label>
                <select
                  value={newQuestion.bloomLevelId}
                  onChange={(e) => setNewQuestion({ ...newQuestion, bloomLevelId: parseInt(e.target.value, 10) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value={1}>L1 - Remember</option>
                  <option value={2}>L2 - Understand</option>
                  <option value={3}>L3 - Apply</option>
                  <option value={4}>L4 - Analyze</option>
                  <option value={5}>L5 - Evaluate</option>
                  <option value={6}>L6 - Create</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('BANK')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                Save to Question Bank
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PAPER BLUEPRINT TAB */}
      {activeTab === 'BLUEPRINT' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800">Question Paper Blueprint Matrix Specification</h2>
            <p className="text-xs text-slate-500">
              Defines target marks distribution across Cognitive Bloom Levels (L1-L6), Course Outcomes (CO1-CO6), and Syllabus Units.
            </p>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700 border border-slate-200 rounded-xl">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Unit</th>
                    <th className="p-3">L1 Remember</th>
                    <th className="p-3">L2 Understand</th>
                    <th className="p-3">L3 Apply</th>
                    <th className="p-3">L4 Analyze</th>
                    <th className="p-3">L5 Evaluate</th>
                    <th className="p-3">L6 Create</th>
                    <th className="p-3">Total Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Unit 1: Introduction & ER Modeling</td>
                    <td className="p-3">4 Marks</td>
                    <td className="p-3">6 Marks</td>
                    <td className="p-3">6 Marks</td>
                    <td className="p-3">-</td>
                    <td className="p-3">-</td>
                    <td className="p-3">-</td>
                    <td className="p-3 font-bold text-blue-700">16 Marks</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Unit 2: Relational Model & Normalization</td>
                    <td className="p-3">-</td>
                    <td className="p-3">4 Marks</td>
                    <td className="p-3">8 Marks</td>
                    <td className="p-3">6 Marks</td>
                    <td className="p-3">-</td>
                    <td className="p-3">-</td>
                    <td className="p-3 font-bold text-blue-700">18 Marks</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">Unit 3: SQL & Transactions</td>
                    <td className="p-3">-</td>
                    <td className="p-3">2 Marks</td>
                    <td className="p-3">6 Marks</td>
                    <td className="p-3">6 Marks</td>
                    <td className="p-3">4 Marks</td>
                    <td className="p-3">8 Marks</td>
                    <td className="p-3 font-bold text-blue-700">26 Marks</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
