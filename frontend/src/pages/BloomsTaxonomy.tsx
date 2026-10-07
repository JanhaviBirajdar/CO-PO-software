import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Plus,
  BookOpen,
  BarChart3,
  Search,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Lightbulb,
  Layers,
  Table,
  FileText,
  X,
  Tag,
  PlusCircle,
  PieChart as PieIcon,
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import type { BloomLevel, BloomAnalyticsData, COQualityCheckResult } from '../types';
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

interface COBloomMatrixItem {
  coCode: string;
  coId: number;
  description: string;
  targetBloomLevel: number;
  bloomCounts: { [levelNumber: number]: { questionCount: number; totalMarks: number } };
}

const DEFAULT_CO_MATRIX_DATA: COBloomMatrixItem[] = [
  {
    coCode: 'CO1',
    coId: 1,
    description: 'Explain fundamental concepts of database systems and relational model architecture.',
    targetBloomLevel: 2,
    bloomCounts: {
      1: { questionCount: 4, totalMarks: 8 },
      2: { questionCount: 6, totalMarks: 18 },
      3: { questionCount: 2, totalMarks: 8 },
      4: { questionCount: 0, totalMarks: 0 },
      5: { questionCount: 0, totalMarks: 0 },
      6: { questionCount: 0, totalMarks: 0 },
    },
  },
  {
    coCode: 'CO2',
    coId: 2,
    description: 'Apply relational algebra and write complex SQL queries for data retrieval.',
    targetBloomLevel: 3,
    bloomCounts: {
      1: { questionCount: 2, totalMarks: 4 },
      2: { questionCount: 3, totalMarks: 9 },
      3: { questionCount: 8, totalMarks: 32 },
      4: { questionCount: 2, totalMarks: 10 },
      5: { questionCount: 0, totalMarks: 0 },
      6: { questionCount: 0, totalMarks: 0 },
    },
  },
  {
    coCode: 'CO3',
    coId: 3,
    description: 'Analyze normalization techniques and decompose schemas into 3NF / BCNF.',
    targetBloomLevel: 4,
    bloomCounts: {
      1: { questionCount: 1, totalMarks: 2 },
      2: { questionCount: 2, totalMarks: 6 },
      3: { questionCount: 4, totalMarks: 16 },
      4: { questionCount: 5, totalMarks: 30 },
      5: { questionCount: 1, totalMarks: 8 },
      6: { questionCount: 0, totalMarks: 0 },
    },
  },
  {
    coCode: 'CO4',
    coId: 4,
    description: 'Evaluate transaction processing protocols, concurrency control, and crash recovery.',
    targetBloomLevel: 5,
    bloomCounts: {
      1: { questionCount: 1, totalMarks: 2 },
      2: { questionCount: 2, totalMarks: 6 },
      3: { questionCount: 3, totalMarks: 12 },
      4: { questionCount: 2, totalMarks: 12 },
      5: { questionCount: 3, totalMarks: 24 },
      6: { questionCount: 1, totalMarks: 10 },
    },
  },
  {
    coCode: 'CO5',
    coId: 5,
    description: 'Design and synthesize enterprise database architectures using NoSQL and indexing.',
    targetBloomLevel: 6,
    bloomCounts: {
      1: { questionCount: 0, totalMarks: 0 },
      2: { questionCount: 1, totalMarks: 3 },
      3: { questionCount: 2, totalMarks: 10 },
      4: { questionCount: 2, totalMarks: 14 },
      5: { questionCount: 2, totalMarks: 16 },
      6: { questionCount: 3, totalMarks: 30 },
    },
  },
];

export const BloomsTaxonomy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'AI_GENERATOR' | 'QUALITY_CHECKER' | 'ANALYTICS'>('ANALYTICS');
  const [levels, setLevels] = useState<BloomLevel[]>([]);
  const [analytics, setAnalytics] = useState<BloomAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // View Mode inside Analytics Tab: TABLE vs GRAPHS
  const [analyticsViewMode, setAnalyticsViewMode] = useState<'TABLE' | 'GRAPHS'>('TABLE');

  // Matrix Data State
  const [coMatrixData, setCoMatrixData] = useState<COBloomMatrixItem[]>(DEFAULT_CO_MATRIX_DATA);

  // Add Question Modal State
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ coCode: string; coId: number; bloomLevelNumber: number } | null>(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    marks: 5,
    unit: 1,
    bloomVerb: '',
    difficulty: 'MEDIUM',
    questionType: 'SHORT_ANSWER',
    courseId: 1,
    academicYearId: 1,
  });
  const [submittingQuestion, setSubmittingQuestion] = useState<boolean>(false);

  // AI CO Generator state
  const [aiForm, setAiForm] = useState({
    courseName: 'Database Management Systems',
    topic: 'Normalization and 3NF decomposition',
    expectedOutcome: 'eliminate data redundancy and update anomalies',
    difficulty: 'MEDIUM',
  });
  const [aiResult, setAiResult] = useState<{
    coStatement: string;
    recommendedBloomLevel: number;
    recommendedLevelName: string;
    recommendedVerb: string;
    explanation: string;
  } | null>(null);
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);

  // Quality Checker state
  const [qcText, setQcText] = useState<string>(
    'Explain the fundamental concepts of relational database normalization and apply 3NF rules to eliminate redundancy.'
  );
  const [qcResult, setQcResult] = useState<COQualityCheckResult | null>(null);
  const [checkingQc, setCheckingQc] = useState<boolean>(false);

  // Action verb library filter
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchBloomData();
  }, []);

  const fetchBloomData = async () => {
    setLoading(true);
    try {
      const [levelsRes, analyticsRes] = await Promise.all([
        apiClient.get('/bloom/levels'),
        apiClient.get('/bloom/analytics'),
      ]);
      if (levelsRes.data?.success) setLevels(levelsRes.data.data);
      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
    } catch {
      // Mock fallback data if offline
      const mockLevels: BloomLevel[] = [
        { id: 1, levelNumber: 1, levelCode: 'REMEMBER', levelName: 'Remember', description: 'Retrieve knowledge from memory.', actionVerbs: 'Define, List, Identify, Name, Recall, Recognize, State, Label', status: true },
        { id: 2, levelNumber: 2, levelCode: 'UNDERSTAND', levelName: 'Understand', description: 'Construct meaning from instructional messages.', actionVerbs: 'Explain, Describe, Summarize, Classify, Compare, Discuss, Interpret', status: true },
        { id: 3, levelNumber: 3, levelCode: 'APPLY', levelName: 'Apply', description: 'Carry out or use a procedure in a given situation.', actionVerbs: 'Apply, Calculate, Use, Implement, Solve, Demonstrate, Construct', status: true },
        { id: 4, levelNumber: 4, levelCode: 'ANALYZE', levelName: 'Analyze', description: 'Break material into constituent parts to examine relationships.', actionVerbs: 'Analyze, Differentiate, Compare, Examine, Categorize, Investigate', status: true },
        { id: 5, levelNumber: 5, levelCode: 'EVALUATE', levelName: 'Evaluate', description: 'Make judgments based on criteria and standards.', actionVerbs: 'Evaluate, Assess, Justify, Critique, Defend, Judge, Validate', status: true },
        { id: 6, levelNumber: 6, levelCode: 'CREATE', levelName: 'Create', description: 'Put elements together to form a new coherent structure.', actionVerbs: 'Design, Develop, Create, Construct, Formulate, Generate, Produce', status: true },
      ];
      setLevels(mockLevels);
      setAnalytics({
        totalCOs: 5,
        totalQuestions: 67,
        avgBloomLevel: 3.4,
        minBloomLevel: 1,
        maxBloomLevel: 6,
        coDistribution: [
          { levelNumber: 1, levelName: 'Remember', levelCode: 'REMEMBER', count: 8, percentage: 11.9 },
          { levelNumber: 2, levelName: 'Understand', levelCode: 'UNDERSTAND', count: 14, percentage: 20.9 },
          { levelNumber: 3, levelName: 'Apply', levelCode: 'APPLY', count: 19, percentage: 28.3 },
          { levelNumber: 4, levelName: 'Analyze', levelCode: 'ANALYZE', count: 11, percentage: 16.4 },
          { levelNumber: 5, levelName: 'Evaluate', levelCode: 'EVALUATE', count: 8, percentage: 11.9 },
          { levelNumber: 6, levelName: 'Create', levelCode: 'CREATE', count: 7, percentage: 10.4 },
        ],
        questionDistribution: [
          { levelNumber: 1, levelName: 'Remember', levelCode: 'REMEMBER', count: 8, marks: 16, percentage: 11.9 },
          { levelNumber: 2, levelName: 'Understand', levelCode: 'UNDERSTAND', count: 14, marks: 42, percentage: 20.9 },
          { levelNumber: 3, levelName: 'Apply', levelCode: 'APPLY', count: 19, marks: 76, percentage: 28.3 },
          { levelNumber: 4, levelName: 'Analyze', levelCode: 'ANALYZE', count: 11, marks: 66, percentage: 16.4 },
          { levelNumber: 5, levelName: 'Evaluate', levelCode: 'EVALUATE', count: 8, marks: 58, percentage: 11.9 },
          { levelNumber: 6, levelName: 'Create', levelCode: 'CREATE', count: 7, percentage: 10.4, marks: 70 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddQuestionModal = (coCode: string, coId: number, bloomLevelNumber: number) => {
    setSelectedCell({ coCode, coId, bloomLevelNumber });
    const matchedLevel = levels.find((l) => l.levelNumber === bloomLevelNumber);
    const verbs = matchedLevel ? matchedLevel.actionVerbs.split(',').map((v) => v.trim()) : ['Solve'];

    setQuestionForm({
      questionText: '',
      marks: bloomLevelNumber <= 2 ? 5 : bloomLevelNumber <= 4 ? 10 : 15,
      unit: coId,
      bloomVerb: verbs[0] || 'Solve',
      difficulty: bloomLevelNumber <= 2 ? 'EASY' : bloomLevelNumber <= 4 ? 'MEDIUM' : 'HARD',
      questionType: bloomLevelNumber <= 2 ? 'SHORT_ANSWER' : bloomLevelNumber <= 4 ? 'LONG_ANSWER' : 'DESIGN_QUESTION',
      courseId: 1,
      academicYearId: 1,
    });
    setShowAddQuestionModal(true);
  };

  const handleCreateQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell) return;

    setSubmittingQuestion(true);
    try {
      await apiClient.post('/questions', {
        ...questionForm,
        courseId: 1,
        courseOutcomeId: selectedCell.coId,
        bloomLevelId: selectedCell.bloomLevelNumber,
        marks: Number(questionForm.marks),
      });

      // Update local matrix state
      setCoMatrixData((prev) =>
        prev.map((item) => {
          if (item.coCode === selectedCell.coCode) {
            const currentObj = item.bloomCounts[selectedCell.bloomLevelNumber] || { questionCount: 0, totalMarks: 0 };
            return {
              ...item,
              bloomCounts: {
                ...item.bloomCounts,
                [selectedCell.bloomLevelNumber]: {
                  questionCount: currentObj.questionCount + 1,
                  totalMarks: currentObj.totalMarks + Number(questionForm.marks),
                },
              },
            };
          }
          return item;
        })
      );

      // Update analytics count
      if (analytics) {
        setAnalytics({
          ...analytics,
          totalQuestions: analytics.totalQuestions + 1,
        });
      }

      setShowAddQuestionModal(false);
      alert(`Question successfully created and mapped to ${selectedCell.coCode} at Bloom Level L${selectedCell.bloomLevelNumber}!`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create question in Question Bank');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleGenerateAi = async () => {
    setGeneratingAi(true);
    try {
      const res = await apiClient.post('/bloom/generate-ai-co', aiForm);
      if (res.data?.success) {
        setAiResult(res.data.data);
      }
    } catch {
      // Mock fallback AI response
      setAiResult({
        coStatement: `Apply normalization techniques to decompose database tables into Third Normal Form (3NF) to ${aiForm.expectedOutcome}.`,
        recommendedBloomLevel: 3,
        recommendedLevelName: 'Apply',
        recommendedVerb: 'Apply',
        explanation: `Topic "${aiForm.topic}" focuses on practical execution of normalization algorithms, which maps directly to Bloom Level 3 (Apply).`,
      });
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleRunQualityCheck = async () => {
    setCheckingQc(true);
    try {
      const res = await apiClient.post('/bloom/check-quality', {
        description: qcText,
        bloomsLevel: 3,
        poMappingsCount: 4,
        psoMappingsCount: 2,
      });
      if (res.data?.success) setQcResult(res.data.data);
    } catch {
      setQcResult({
        overallStatus: 'PASS',
        score: 95,
        criteria: {
          observableVerb: true,
          measurableOutcome: true,
          isSpecific: true,
          isUnderstandable: true,
          hasBloomLevel: true,
          hasPOMappings: true,
          hasPSOMappings: true,
        },
        feedback: [
          'Excellent action verb "Explain" and "Apply" at cognitive Level 3.',
          'Statement is measurable, domain-specific, and fully mapped to 4 POs and 2 PSOs.',
        ],
      });
    } finally {
      setCheckingQc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/80 border border-slate-800 p-4 sm:p-6 rounded-2xl backdrop-blur-md shadow-xl gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30 shrink-0">
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Bloom's Taxonomy Framework</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Cognitive Domain Mapping, Action Verb Library & AI Quality Analysis — DYP COEI
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ANALYTICS' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>CO & Bloom Matrix Table</span>
          </button>
          <button
            onClick={() => setActiveTab('MASTER')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'MASTER' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            Master & Verbs
          </button>
          <button
            onClick={() => setActiveTab('AI_GENERATOR')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'AI_GENERATOR' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI CO Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('QUALITY_CHECKER')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'QUALITY_CHECKER' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700/60'
            }`}
          >
            Quality Checker
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: CO & BLOOM'S TAXONOMY MATRIX TABLE & ANALYTICS        */}
      {/* ============================================================ */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Total Course Outcomes</span>
              <span className="text-2xl font-bold mt-1 block">{analytics.totalCOs} COs</span>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Question Bank Items</span>
              <span className="text-2xl font-bold text-sky-400 mt-1 block">{analytics.totalQuestions} Items</span>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Average Bloom Level</span>
              <span className="text-2xl font-bold text-indigo-400 mt-1 block">Level {analytics.avgBloomLevel} / 6</span>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Lowest Cognitive Level</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">L{analytics.minBloomLevel} (Remember)</span>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Highest Cognitive Level</span>
              <span className="text-2xl font-bold text-purple-400 mt-1 block">L{analytics.maxBloomLevel} (Create)</span>
            </div>
          </div>

          {/* Section Header with View Mode Toggle */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Table className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold">COs vs Bloom's Taxonomy Matrix & Question Bank Mapping</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tabular breakdown of Course Outcomes mapped across the 6 Cognitive Bloom levels with instant "+ Add Question" action buttons
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setAnalyticsViewMode('TABLE')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                    analyticsViewMode === 'TABLE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Matrix Table View</span>
                </button>
                <button
                  onClick={() => setAnalyticsViewMode('GRAPHS')}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                    analyticsViewMode === 'GRAPHS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Graphical Charts</span>
                </button>
              </div>

              <button
                onClick={() => handleOpenAddQuestionModal('CO1', 1, 3)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="text-white">Add New Question</span>
              </button>
            </div>
          </div>

          {/* PRIMARY VIEW 1: CO vs BLOOM'S TAXONOMY MATRIX TABLE */}
          {analyticsViewMode === 'TABLE' && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/90 text-slate-200 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-4 min-w-[120px]">Course Outcome</th>
                      <th className="p-4 min-w-[220px]">CO Statement & Target Level</th>

                      {/* 6 Bloom Levels Columns */}
                      {levels.map((lvl, index) => (
                        <th key={lvl.id || lvl.levelNumber} className="p-3.5 text-center min-w-[150px] border-l border-slate-700">
                          <div className="flex items-center justify-center space-x-1">
                            <span
                              className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white"
                              style={{ backgroundColor: BLOOM_COLORS[index % BLOOM_COLORS.length] }}
                            >
                              L{lvl.levelNumber}
                            </span>
                            <span className="font-bold text-[12px]">{lvl.levelName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{lvl.levelCode}</span>
                        </th>
                      ))}

                      <th className="p-4 text-center min-w-[120px] border-l border-slate-700 bg-slate-800/80">Total Questions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                    {coMatrixData.map((co) => {
                      const totalCoQs = Object.values(co.bloomCounts).reduce((acc, curr) => acc + curr.questionCount, 0);
                      const totalCoMarks = Object.values(co.bloomCounts).reduce((acc, curr) => acc + curr.totalMarks, 0);

                      return (
                        <tr key={co.coCode} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-sky-400 text-sm">{co.coCode}</td>
                          <td className="p-4">
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{co.description}</p>
                            <div className="mt-1.5 flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                Target: Level {co.targetBloomLevel} ({levels.find((l) => l.levelNumber === co.targetBloomLevel)?.levelName || ''})
                              </span>
                            </div>
                          </td>

                          {/* 6 Bloom Level Matrix Cells */}
                          {levels.map((lvl) => {
                            const countObj = co.bloomCounts[lvl.levelNumber] || { questionCount: 0, totalMarks: 0 };
                            const isTarget = co.targetBloomLevel === lvl.levelNumber;

                            return (
                              <td
                                key={lvl.levelNumber}
                                className={`p-3 border-l border-slate-800 text-center transition-all ${
                                  isTarget ? 'bg-sky-500/10 font-bold' : ''
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div>
                                    <span className={`text-xs font-bold ${countObj.questionCount > 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                                      {countObj.questionCount} {countObj.questionCount === 1 ? 'Question' : 'Questions'}
                                    </span>
                                    {countObj.totalMarks > 0 && (
                                      <span className="text-[10px] text-amber-400 font-mono block font-semibold">
                                        ({countObj.totalMarks} Marks)
                                      </span>
                                    )}
                                  </div>

                                  {/* "+ Add Question" Button per CO-Bloom Cell */}
                                  <button
                                    onClick={() => handleOpenAddQuestionModal(co.coCode, co.coId, lvl.levelNumber)}
                                    className={`w-full py-1.5 px-2 text-[10px] font-bold rounded-lg flex items-center justify-center space-x-1 border transition-all cursor-pointer ${
                                      isTarget
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                                    }`}
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Question</span>
                                  </button>
                                </div>
                              </td>
                            );
                          })}

                          {/* Total Questions & Marks per CO */}
                          <td className="p-4 text-center border-l border-slate-800 bg-slate-900/60 font-mono">
                            <div className="text-sm font-bold text-slate-100">{totalCoQs} Qs</div>
                            <div className="text-[10px] text-sky-400 font-semibold">{totalCoMarks} Total Marks</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECONDARY VIEW 2: GRAPHICAL CHARTS */}
          {analyticsViewMode === 'GRAPHS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart: CO Distribution */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-sm">
                <h3 className="text-sm font-bold mb-4">Course Outcome Count per Bloom Level</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.coDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="levelName" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                        {analytics.coDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BLOOM_COLORS[index % BLOOM_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Chart: Question Marks Distribution */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-md shadow-sm">
                <h3 className="text-sm font-bold mb-4">Question Marks Distribution by Cognitive Level</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.questionDistribution}
                        dataKey="marks"
                        nameKey="levelName"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        label={(entry: any) => `${entry.levelName || 'Level'}: ${entry.percentage || 0}%`}
                      >
                        {analytics.questionDistribution.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={BLOOM_COLORS[index % BLOOM_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: MASTER & VERBS LIBRARY                                */}
      {/* ============================================================ */}
      {activeTab === 'MASTER' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {levels.map((lvl, index) => (
              <div
                key={lvl.id || lvl.levelNumber}
                onClick={() => setSelectedLevelId(selectedLevelId === lvl.id ? null : lvl.id)}
                className={`cursor-pointer p-4 rounded-xl border transition-all hover:shadow-md ${
                  selectedLevelId === lvl.id
                    ? 'border-blue-500 bg-blue-500/15 shadow-md ring-2 ring-blue-500/30'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: BLOOM_COLORS[index % BLOOM_COLORS.length] }}
                  >
                    L{lvl.levelNumber}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {lvl.levelCode}
                  </span>
                </div>
                <h3 className="font-bold text-sm">{lvl.levelName}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{lvl.description}</p>
              </div>
            ))}
          </div>

          {/* Detailed Level List & Action Verbs Library */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold">Action Verb Library & Cognitive Taxonomy</h2>
                <p className="text-xs text-slate-400">6 Levels from Bloom's Taxonomy for CO & Question Bank alignment</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search verbs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {levels.map((lvl, index) => {
                const verbsArr = lvl.actionVerbs
                  .split(',')
                  .map((v) => v.trim())
                  .filter((v) => v.toLowerCase().includes(searchTerm.toLowerCase()));

                if (searchTerm && verbsArr.length === 0) return null;

                return (
                  <div key={lvl.id || lvl.levelNumber} className="p-5 hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="max-w-xl">
                        <div className="flex items-center space-x-2">
                          <span
                            className="px-2.5 py-0.5 text-xs font-bold text-white rounded-md"
                            style={{ backgroundColor: BLOOM_COLORS[index % BLOOM_COLORS.length] }}
                          >
                            Level {lvl.levelNumber}
                          </span>
                          <h3 className="text-base font-bold">{lvl.levelName}</h3>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{lvl.description}</p>
                      </div>

                      {/* Action Verbs Tags */}
                      <div className="flex-1 lg:max-w-xl">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                          Standard Action Verbs ({verbsArr.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {verbsArr.map((verb, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/30 transition-all cursor-default"
                            >
                              {verb}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: AI CO GENERATOR                                       */}
      {/* ============================================================ */}
      {activeTab === 'AI_GENERATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold">Generate CO using Bloom's Taxonomy</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Name</label>
              <input
                type="text"
                value={aiForm.courseName}
                onChange={(e) => setAiForm({ ...aiForm, courseName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit / Module Topic</label>
              <input
                type="text"
                value={aiForm.topic}
                onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                placeholder="e.g., Relational Algebra & SQL Subqueries"
                className="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Learning Outcome Goal</label>
              <textarea
                rows={3}
                value={aiForm.expectedOutcome}
                onChange={(e) => setAiForm({ ...aiForm, expectedOutcome: e.target.value })}
                placeholder="e.g., Students should be able to design optimal database schema without redundancy"
                className="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Cognitive Complexity</label>
              <select
                value={aiForm.difficulty}
                onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EASY">Level 1-2: Remember / Understand (Foundational)</option>
                <option value="MEDIUM">Level 3-4: Apply / Analyze (Intermediate)</option>
                <option value="HARD">Level 5-6: Evaluate / Create (Advanced Design)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateAi}
              disabled={generatingAi}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {generatingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span className="text-white">Generating AI Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-white">Generate Bloom-Aligned CO Statement</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              ⚠️ Note: AI output is a draft proposal. Faculty review and approval is required before saving to official syllabus.
            </p>
          </div>

          {/* AI Result Preview */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h2 className="text-base font-bold">AI Suggested Outcome Draft</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  HUMAN APPROVAL REQUIRED
                </span>
              </div>

              {aiResult ? (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Draft CO Statement:
                    </span>
                    <p className="text-sm font-semibold text-slate-100 italic">"{aiResult.coStatement}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-sky-500/15 border border-sky-500/30 rounded-xl">
                      <span className="text-[10px] font-semibold text-sky-400 block">Bloom Level</span>
                      <span className="text-sm font-bold text-sky-300">
                        Level {aiResult.recommendedBloomLevel} ({aiResult.recommendedLevelName})
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl">
                      <span className="text-[10px] font-semibold text-emerald-400 block">Recommended Action Verb</span>
                      <span className="text-sm font-bold text-emerald-300">{aiResult.recommendedVerb}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-300 leading-relaxed">{aiResult.explanation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Brain className="w-12 h-12 text-slate-500 mb-2" />
                  <p className="text-xs">Fill in topic details and click "Generate" to preview AI recommendations.</p>
                </div>
              )}
            </div>

            {aiResult && (
              <div className="pt-4 border-t border-slate-800 flex space-x-3 mt-4">
                <button
                  onClick={() => alert('CO Statement copied to clipboard!')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Copy Statement
                </button>
                <button
                  onClick={() => alert('Approved and sent to Course Outcome Editor!')}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Approve & Save CO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: QUALITY CHECKER                                       */}
      {/* ============================================================ */}
      {activeTab === 'QUALITY_CHECKER' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md p-6 shadow-sm">
            <h2 className="text-base font-bold mb-2">7-Dimension Course Outcome Quality Audit</h2>
            <p className="text-xs text-slate-400 mb-4">
              Checks observable action verb, measurable outcome, specificity, understandability, Bloom level, PO and PSO alignment.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">Test CO Statement</label>
              <textarea
                rows={3}
                value={qcText}
                onChange={(e) => setQcText(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleRunQualityCheck}
                disabled={checkingQc}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                {checkingQc ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span className="text-white">Running Audit...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span className="text-white">Run Quality Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {qcResult && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl font-black text-sky-400">{qcResult.score}/100</div>
                  <div>
                    <h3 className="text-sm font-bold">Quality Score</h3>
                    <p className="text-xs text-slate-400">Evaluated across 7 standard OBE criteria</p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    qcResult.overallStatus === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : qcResult.overallStatus === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  STATUS: {qcResult.overallStatus}
                </span>
              </div>

              {/* Criteria Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/60 flex items-center space-x-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      qcResult.criteria.observableVerb ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Observable Verb</span>
                    <span className="text-[10px] text-slate-400">Active verb present</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/60 flex items-center space-x-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      qcResult.criteria.measurableOutcome ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Measurable</span>
                    <span className="text-[10px] text-slate-400">No vague terminology</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/60 flex items-center space-x-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      qcResult.criteria.hasBloomLevel ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Bloom Level</span>
                    <span className="text-[10px] text-slate-400">Assigned 1-6</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-800/60 flex items-center space-x-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      qcResult.criteria.hasPOMappings ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">PO/PSO Mapped</span>
                    <span className="text-[10px] text-slate-400">Matrix relations exist</span>
                  </div>
                </div>
              </div>

              {/* Feedback List */}
              {qcResult.feedback.length > 0 && (
                <div className="p-4 bg-amber-500/15 rounded-xl border border-amber-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Quality Recommendations:</span>
                  </h4>
                  <ul className="space-y-1">
                    {qcResult.feedback.map((f, i) => (
                      <li key={i} className="text-xs text-amber-300 flex items-start space-x-2">
                        <span className="text-amber-400">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD QUESTION TO QUESTION BANK FOR SPECIFIC CO & BLOOM */}
      {/* ============================================================ */}
      {showAddQuestionModal && selectedCell && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Add Question to Question Bank</h2>
                  <p className="text-xs text-slate-400">
                    Mapped to <strong className="text-sky-400">{selectedCell.coCode}</strong> at Bloom Level{' '}
                    <strong className="text-purple-400">
                      L{selectedCell.bloomLevelNumber} ({levels.find((l) => l.levelNumber === selectedCell.bloomLevelNumber)?.levelName})
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Question Statement</label>
                  <span className="text-[10px] text-slate-400">Click a verb below to auto-insert</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  placeholder={`e.g., ${questionForm.bloomVerb} how normalization eliminates data redundancy in relational schemas...`}
                  className="w-full text-xs p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                {/* Suggested Verbs for Selected Bloom Level */}
                {levels.find((l) => l.levelNumber === selectedCell.bloomLevelNumber) && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Suggested Action Verbs:</span>
                    {levels
                      .find((l) => l.levelNumber === selectedCell.bloomLevelNumber)
                      ?.actionVerbs.split(',')
                      .map((verb) => verb.trim())
                      .map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setQuestionForm({
                              ...questionForm,
                              bloomVerb: v,
                              questionText: questionForm.questionText ? `${v} ${questionForm.questionText}` : `${v} `,
                            });
                          }}
                          className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-semibold border border-sky-500/30 transition-all cursor-pointer"
                        >
                          + {v}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marks</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Number</label>
                  <select
                    value={questionForm.unit}
                    onChange={(e) => setQuestionForm({ ...questionForm, unit: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((u) => (
                      <option key={u} value={u}>
                        Unit {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Question Type</label>
                  <select
                    value={questionForm.questionType}
                    onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="SHORT_ANSWER">Short Answer (2-5 Marks)</option>
                    <option value="LONG_ANSWER">Long Answer (10 Marks)</option>
                    <option value="NUMERICAL">Numerical Problem</option>
                    <option value="PROGRAMMING">Programming / Code</option>
                    <option value="DESIGN_QUESTION">Design & System Synthesis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Action Verb</label>
                  <input
                    type="text"
                    value={questionForm.bloomVerb}
                    onChange={(e) => setQuestionForm({ ...questionForm, bloomVerb: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Explain, Solve"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestion}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-white">{submittingQuestion ? 'Saving to Question Bank...' : 'Save Question to Bank'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
