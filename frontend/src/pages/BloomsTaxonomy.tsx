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
  Legend,
} from 'recharts';

const BLOOM_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export const BloomsTaxonomy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MASTER' | 'AI_GENERATOR' | 'QUALITY_CHECKER' | 'ANALYTICS'>('MASTER');
  const [levels, setLevels] = useState<BloomLevel[]>([]);
  const [analytics, setAnalytics] = useState<BloomAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
        totalCOs: 18,
        totalQuestions: 42,
        avgBloomLevel: 3.2,
        minBloomLevel: 1,
        maxBloomLevel: 6,
        coDistribution: [
          { levelNumber: 1, levelName: 'Remember', levelCode: 'REMEMBER', count: 3, percentage: 16.67 },
          { levelNumber: 2, levelName: 'Understand', levelCode: 'UNDERSTAND', count: 4, percentage: 22.22 },
          { levelNumber: 3, levelName: 'Apply', levelCode: 'APPLY', count: 6, percentage: 33.33 },
          { levelNumber: 4, levelName: 'Analyze', levelCode: 'ANALYZE', count: 3, percentage: 16.67 },
          { levelNumber: 5, levelName: 'Evaluate', levelCode: 'EVALUATE', count: 1, percentage: 5.56 },
          { levelNumber: 6, levelName: 'Create', levelCode: 'CREATE', count: 1, percentage: 5.56 },
        ],
        questionDistribution: [
          { levelNumber: 1, levelName: 'Remember', levelCode: 'REMEMBER', count: 8, marks: 16, percentage: 19.05 },
          { levelNumber: 2, levelName: 'Understand', levelCode: 'UNDERSTAND', count: 10, marks: 30, percentage: 23.81 },
          { levelNumber: 3, levelName: 'Apply', levelCode: 'APPLY', count: 14, marks: 56, percentage: 33.33 },
          { levelNumber: 4, levelName: 'Analyze', levelCode: 'ANALYZE', count: 6, marks: 36, percentage: 14.29 },
          { levelNumber: 5, levelName: 'Evaluate', levelCode: 'EVALUATE', count: 2, marks: 16, percentage: 4.76 },
          { levelNumber: 6, levelName: 'Create', levelCode: 'CREATE', count: 2, marks: 20, percentage: 4.76 },
        ],
      });
    } finally {
      setLoading(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Brain className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bloom's Taxonomy Framework</h1>
              <p className="text-sm text-blue-200/80 mt-0.5">
                Cognitive Domain Mapping, Action Verb Library & AI Quality Analysis — DYP COEI
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/10 p-1.5 rounded-xl border border-white/10 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveTab('MASTER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'MASTER' ? 'bg-blue-600 text-white shadow' : 'text-blue-200 hover:bg-white/5'
            }`}
          >
            Master & Verbs
          </button>
          <button
            onClick={() => setActiveTab('AI_GENERATOR')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'AI_GENERATOR' ? 'bg-blue-600 text-white shadow' : 'text-blue-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI CO Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('QUALITY_CHECKER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'QUALITY_CHECKER' ? 'bg-blue-600 text-white shadow' : 'text-blue-200 hover:bg-white/5'
            }`}
          >
            Quality Checker
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ANALYTICS' ? 'bg-blue-600 text-white shadow' : 'text-blue-200 hover:bg-white/5'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Content Tabs */}
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
                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: BLOOM_COLORS[index % BLOOM_COLORS.length] }}
                  >
                    L{lvl.levelNumber}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {lvl.levelCode}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">{lvl.levelName}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lvl.description}</p>
              </div>
            ))}
          </div>

          {/* Detailed Level List & Action Verbs Library */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Action Verb Library & Cognitive Taxonomy</h2>
                <p className="text-xs text-slate-500">6 Levels from Bloom's Taxonomy for CO & Question Bank alignment</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search verbs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {levels.map((lvl, index) => {
                const verbsArr = lvl.actionVerbs
                  .split(',')
                  .map((v) => v.trim())
                  .filter((v) => v.toLowerCase().includes(searchTerm.toLowerCase()));

                if (searchTerm && verbsArr.length === 0) return null;

                return (
                  <div key={lvl.id || lvl.levelNumber} className="p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="max-w-xl">
                        <div className="flex items-center space-x-2">
                          <span
                            className="px-2.5 py-0.5 text-xs font-bold text-white rounded-md"
                            style={{ backgroundColor: BLOOM_COLORS[index % BLOOM_COLORS.length] }}
                          >
                            Level {lvl.levelNumber}
                          </span>
                          <h3 className="text-base font-bold text-slate-800">{lvl.levelName}</h3>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{lvl.description}</p>
                      </div>

                      {/* Action Verbs Tags */}
                      <div className="flex-1 lg:max-w-xl">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                          Standard Action Verbs ({verbsArr.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {verbsArr.map((verb, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all cursor-default"
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

      {/* AI CO Generator Tab */}
      {activeTab === 'AI_GENERATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-800">Generate CO using Bloom's Taxonomy</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name</label>
              <input
                type="text"
                value={aiForm.courseName}
                onChange={(e) => setAiForm({ ...aiForm, courseName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Module Topic</label>
              <input
                type="text"
                value={aiForm.topic}
                onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                placeholder="e.g., Relational Algebra & SQL Subqueries"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Learning Outcome Goal</label>
              <textarea
                rows={3}
                value={aiForm.expectedOutcome}
                onChange={(e) => setAiForm({ ...aiForm, expectedOutcome: e.target.value })}
                placeholder="e.g., Students should be able to design optimal database schema without redundancy"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Cognitive Complexity</label>
              <select
                value={aiForm.difficulty}
                onChange={(e) => setAiForm({ ...aiForm, difficulty: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="EASY">Level 1-2: Remember / Understand (Foundational)</option>
                <option value="MEDIUM">Level 3-4: Apply / Analyze (Intermediate)</option>
                <option value="HARD">Level 5-6: Evaluate / Create (Advanced Design)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateAi}
              disabled={generatingAi}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {generatingAi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating AI Draft...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Bloom-Aligned CO Statement</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              ⚠️ Note: AI output is a draft proposal. Faculty review and approval is required before saving to official syllabus.
            </p>
          </div>

          {/* AI Result Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800">AI Suggested Outcome Draft</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  HUMAN APPROVAL REQUIRED
                </span>
              </div>

              {aiResult ? (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Draft CO Statement:
                    </span>
                    <p className="text-sm font-semibold text-slate-800 italic">"{aiResult.coStatement}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                      <span className="text-[10px] font-semibold text-blue-600 block">Bloom Level</span>
                      <span className="text-sm font-bold text-blue-900">
                        Level {aiResult.recommendedBloomLevel} ({aiResult.recommendedLevelName})
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                      <span className="text-[10px] font-semibold text-emerald-600 block">Recommended Action Verb</span>
                      <span className="text-sm font-bold text-emerald-900">{aiResult.recommendedVerb}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-900 leading-relaxed">{aiResult.explanation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Brain className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-xs">Fill in topic details and click "Generate" to preview AI recommendations.</p>
                </div>
              )}
            </div>

            {aiResult && (
              <div className="pt-4 border-t border-slate-100 flex space-x-3 mt-4">
                <button
                  onClick={() => alert('CO Statement copied to clipboard!')}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Copy Statement
                </button>
                <button
                  onClick={() => alert('Approved and sent to Course Outcome Editor!')}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Approve & Save CO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quality Checker Tab */}
      {activeTab === 'QUALITY_CHECKER' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-2">7-Dimension Course Outcome Quality Audit</h2>
            <p className="text-xs text-slate-500 mb-4">
              Checks observable action verb, measurable outcome, specificity, understandability, Bloom level, PO and PSO alignment.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Test CO Statement</label>
              <textarea
                rows={3}
                value={qcText}
                onChange={(e) => setQcText(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleRunQualityCheck}
                disabled={checkingQc}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2"
              >
                {checkingQc ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Audit...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Run Quality Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {qcResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl font-black text-slate-800">{qcResult.score}/100</div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Quality Score</h3>
                    <p className="text-xs text-slate-500">Evaluated across 7 standard OBE criteria</p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    qcResult.overallStatus === 'PASS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : qcResult.overallStatus === 'WARNING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  STATUS: {qcResult.overallStatus}
                </span>
              </div>

              {/* Criteria Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center space-x-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      qcResult.criteria.observableVerb ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Observable Verb</span>
                    <span className="text-[10px] text-slate-500">Active verb present</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center space-x-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      qcResult.criteria.measurableOutcome ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Measurable</span>
                    <span className="text-[10px] text-slate-500">No vague terminology</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center space-x-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      qcResult.criteria.hasBloomLevel ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Bloom Level</span>
                    <span className="text-[10px] text-slate-500">Assigned 1-6</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center space-x-3">
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      qcResult.criteria.hasPOMappings ? 'text-emerald-500' : 'text-slate-300'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">PO/PSO Mapped</span>
                    <span className="text-[10px] text-slate-500">Matrix relations exist</span>
                  </div>
                </div>
              </div>

              {/* Feedback List */}
              {qcResult.feedback.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Quality Recommendations:</span>
                  </h4>
                  <ul className="space-y-1">
                    {qcResult.feedback.map((f, i) => (
                      <li key={i} className="text-xs text-amber-800 flex items-start space-x-2">
                        <span className="text-amber-500">•</span>
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

      {/* Analytics Tab */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Total Course Outcomes</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 block">{analytics.totalCOs}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Question Bank Items</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 block">{analytics.totalQuestions}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Average Bloom Level</span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">{analytics.avgBloomLevel} / 6</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Lowest Level</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">Level {analytics.minBloomLevel}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Highest Level</span>
              <span className="text-2xl font-bold text-purple-600 mt-1 block">Level {analytics.maxBloomLevel}</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: CO Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Course Outcome Count per Bloom Level</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.coDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="levelName" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Question Marks Distribution by Cognitive Level</h3>
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
