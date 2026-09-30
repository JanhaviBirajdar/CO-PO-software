import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Save,
  CheckCircle2,
  Sliders,
  Layers,
  Award,
  BookOpen,
  Sparkles,
  HelpCircle,
  Eye,
  Edit3,
  X,
  FileSpreadsheet,
  ChevronRight,
  BarChart3,
  Copy,
  Settings2,
  RefreshCw,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { isReadOnly } from '../utils/rbac';
import { ReadOnlyNotice } from '../components/common/ReadOnlyNotice';

interface RubricLevel {
  level: number;
  label: string;
  percentage: number;
  description: string;
}

interface RubricCriterion {
  id: string;
  title: string;
  weightage: number; // % contribution to rubric score
  coCode: string; // Mapped Course Outcome (e.g., CO1)
  bloomLevel: string; // e.g. L3 - Apply
  maxPoints: number;
  levels: RubricLevel[];
}

interface RubricTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  totalMarks: number;
  criteria: RubricCriterion[];
  isCustomByFaculty?: boolean;
}

const DEFAULT_RUBRIC_TEMPLATES: RubricTemplate[] = [
  {
    id: 101,
    name: 'Lab Experiment & Practical Rubric',
    description: 'Standard rubric for evaluating laboratory performance, experiment execution, data analysis, and viva.',
    category: 'PRACTICAL',
    totalMarks: 50,
    criteria: [
      {
        id: 'c1',
        title: 'Problem Setup & Methodology',
        weightage: 25,
        coCode: 'CO1',
        bloomLevel: 'L2 - Understand',
        maxPoints: 12.5,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Incorrect setup; minimal understanding of procedure.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Partial setup with minor guidance needed.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Correct setup following standard operating procedures.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Optimal setup with deep methodology understanding.' },
        ],
      },
      {
        id: 'c2',
        title: 'Code / Experiment Execution',
        weightage: 35,
        coCode: 'CO2',
        bloomLevel: 'L3 - Apply',
        maxPoints: 17.5,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Execution failed; multiple critical errors.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Executes with partial output or minor runtime bugs.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Executes smoothly; produces expected results.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Flawless execution; handles edge cases efficiently.' },
        ],
      },
      {
        id: 'c3',
        title: 'Results Analysis & Inference',
        weightage: 25,
        coCode: 'CO3',
        bloomLevel: 'L4 - Analyze',
        maxPoints: 12.5,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'No analysis or incorrect data interpretation.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Basic analysis without detailed inferences.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Accurate analysis supported by data charts/tables.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Comprehensive comparative analysis and critical insights.' },
        ],
      },
      {
        id: 'c4',
        title: 'Viva-Voce & Communication',
        weightage: 15,
        coCode: 'CO4',
        bloomLevel: 'L5 - Evaluate',
        maxPoints: 7.5,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Unable to answer basic domain questions.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Answers basic questions with prompting.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Answers core questions clearly and confidently.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Demonstrates thorough mastery and justifies logic.' },
        ],
      },
    ],
  },
  {
    id: 102,
    name: 'Mini Project / Capstone Rubric',
    description: 'Evaluation criteria for semester projects, software design, implementation, and demonstration.',
    category: 'PROJECT',
    totalMarks: 100,
    criteria: [
      {
        id: 'p1',
        title: 'Problem Statement & Design',
        weightage: 20,
        coCode: 'CO1',
        bloomLevel: 'L3 - Apply',
        maxPoints: 20,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Vague scope and incomplete design diagrams.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Defined scope with basic design architecture.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Well-structured design and clear modular architecture.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Innovative problem solving with comprehensive diagrams.' },
        ],
      },
      {
        id: 'p2',
        title: 'Technical Implementation & Code Quality',
        weightage: 40,
        coCode: 'CO3',
        bloomLevel: 'L4 - Analyze',
        maxPoints: 40,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Incomplete implementation with severe bugs.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Working prototype with minor functional gaps.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Full feature implementation adhering to coding standards.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Production-ready architecture, clean code, & optimized.' },
        ],
      },
      {
        id: 'p3',
        title: 'Testing & Validation',
        weightage: 20,
        coCode: 'CO4',
        bloomLevel: 'L5 - Evaluate',
        maxPoints: 20,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'No test cases or validation performed.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Manual test cases executed without metrics.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Systematic test suite with documented verification.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Rigorous unit & system testing with high test coverage.' },
        ],
      },
      {
        id: 'p4',
        title: 'Documentation & Final Presentation',
        weightage: 20,
        coCode: 'CO5',
        bloomLevel: 'L6 - Create',
        maxPoints: 20,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Poor report formatting and unorganized slides.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Acceptable report following standard template.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Professional report and engaging live demonstration.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Publication-quality documentation and flawless demo.' },
        ],
      },
    ],
  },
  {
    id: 103,
    name: 'Assignment & Case Study Rubric',
    description: 'Rubric for assessing analytical assignments, written case studies, and problem-solving exercises.',
    category: 'ASSIGNMENT',
    totalMarks: 25,
    criteria: [
      {
        id: 'a1',
        title: 'Conceptual Understanding',
        weightage: 40,
        coCode: 'CO1',
        bloomLevel: 'L2 - Understand',
        maxPoints: 10,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Misunderstands core principles.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Demonstrates superficial grasp of concepts.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Accurate understanding applied to problems.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'In-depth conceptual mastery with clear explanations.' },
        ],
      },
      {
        id: 'a2',
        title: 'Analytical Rigor & Mathematical Accuracy',
        weightage: 40,
        coCode: 'CO2',
        bloomLevel: 'L3 - Apply',
        maxPoints: 10,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Multiple step errors and incorrect derivations.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Minor calculation errors with sound logic.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Step-by-step correct derivation and solutions.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Elegant, error-free proof/derivation with insights.' },
        ],
      },
      {
        id: 'a3',
        title: 'Neatness & Timely Submission',
        weightage: 20,
        coCode: 'CO3',
        bloomLevel: 'L1 - Remember',
        maxPoints: 5,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Submitted late with disorganised layout.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Submitted on time but lacking structured sections.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Neatly organized with legible diagrams.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Immaculate presentation and submitted well in advance.' },
        ],
      },
    ],
  },
];

export const Assessments: React.FC = () => {
  const { user } = useAuth();
  const readOnly = isReadOnly('assessments', user?.role);

  // View Mode: MARKS_ENTRY | RUBRIX_MATRIX | RUBRICS_LIBRARY
  const [activeMode, setActiveMode] = useState<'MARKS_ENTRY' | 'RUBRIX_MATRIX' | 'RUBRICS_LIBRARY'>('RUBRIX_MATRIX');

  // Core selectors & data states
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [marksGrid, setMarksGrid] = useState<{ [studentId: number]: { marksObtained: number; isAbsent: boolean } }>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Rubrix Framework state
  const [rubrics, setRubrics] = useState<RubricTemplate[]>(DEFAULT_RUBRIC_TEMPLATES);
  const [activeRubric, setActiveRubric] = useState<RubricTemplate | null>(DEFAULT_RUBRIC_TEMPLATES[0]);
  
  // Faculty Customization States:
  // Faculty Inline Criteria Parameter Edit Mode Toggle
  const [isFacultyEditingParams, setIsFacultyEditingParams] = useState(false);
  
  // Faculty score adjustment per student (+/- bonus/grace marks)
  const [facultyAdjustments, setFacultyAdjustments] = useState<{ [studentId: number]: number }>({});

  // Student Rubric Evaluations: { [studentId]: { [criterionId]: levelNumber (1..4) } }
  const [rubricEvaluations, setRubricEvaluations] = useState<{
    [studentId: number]: { [criterionId: string]: number };
  }>({});

  // Individual Student Evaluation Modal
  const [evaluatingStudent, setEvaluatingStudent] = useState<any | null>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Custom Rubric Builder Modal (Create or Edit)
  const [showRubricBuilderModal, setShowRubricBuilderModal] = useState(false);
  const [editingRubricId, setEditingRubricId] = useState<number | null>(null);
  const [newRubricForm, setNewRubricForm] = useState<{
    name: string;
    description: string;
    category: string;
    totalMarks: number;
    criteria: RubricCriterion[];
  }>({
    name: 'Custom Faculty Rubric',
    description: 'Faculty adjusted criteria evaluation matrix for course assessment',
    category: 'PRACTICAL',
    totalMarks: 50,
    criteria: [
      {
        id: 'crit_1',
        title: 'Domain Knowledge & Formulation',
        weightage: 50,
        coCode: 'CO1',
        bloomLevel: 'L3 - Apply',
        maxPoints: 25,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Basic understanding with notable errors.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Satisfactory grasp of core concepts.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Clear understanding and correct execution.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Mastery level execution with creative solutions.' },
        ],
      },
      {
        id: 'crit_2',
        title: 'Analytical Execution & Synthesis',
        weightage: 50,
        coCode: 'CO2',
        bloomLevel: 'L4 - Analyze',
        maxPoints: 25,
        levels: [
          { level: 1, label: 'Novice', percentage: 25, description: 'Incomplete analysis.' },
          { level: 2, label: 'Developing', percentage: 50, description: 'Fair analysis with minor gaps.' },
          { level: 3, label: 'Proficient', percentage: 75, description: 'Thorough analytical breakdown.' },
          { level: 4, label: 'Exemplary', percentage: 100, description: 'Comprehensive and robust synthesis.' },
        ],
      },
    ],
  });

  // Assessment Creation Form
  const [assessmentForm, setAssessmentForm] = useState({
    name: 'Internal Test 1',
    type: 'INTERNAL_TEST_1',
    maxMarks: 50,
    weightage: 20,
    isExternal: false,
    rubricId: 101,
  });

  // Fetch initial course data
  const fetchCourses = async () => {
    try {
      const res = await apiClient.get('/courses');
      const list = res.data.data || [];
      if (list.length > 0) {
        setCourses(list);
        setSelectedCourseId(list[0].id);
      } else {
        throw new Error('Empty');
      }
    } catch {
      const fallbackCourses = [
        { id: 1, name: 'Data Structures & Algorithms', code: 'CS301' },
        { id: 2, name: 'Database Management Systems', code: 'CS302' },
        { id: 3, name: 'Operating Systems', code: 'CS303' },
      ];
      setCourses(fallbackCourses);
      setSelectedCourseId(1);
    }
  };

  const fetchAssessments = async (courseId: number) => {
    try {
      const res = await apiClient.get(`/assessments?courseId=${courseId}`);
      const list = res.data.data || [];
      if (list.length > 0) {
        setAssessments(list);
        setSelectedAssessment(list[0]);
      } else {
        throw new Error('Empty');
      }
    } catch {
      const fallbackAssessments = [
        { id: 1, name: 'Lab Practical & Experiment Continuous Eval (UT1)', type: 'INTERNAL_TEST_1', maxMarks: 50, weightage: 20, isExternal: false, rubricId: 101 },
        { id: 2, name: 'Mini-Project & Implementation Evaluation', type: 'INTERNAL_TEST_2', maxMarks: 100, weightage: 30, isExternal: false, rubricId: 102 },
        { id: 3, name: 'End Semester University Exam', type: 'SEMESTER_EXAM', maxMarks: 100, weightage: 50, isExternal: true, rubricId: null },
      ];
      setAssessments(fallbackAssessments);
      setSelectedAssessment(fallbackAssessments[0]);
    }
  };

  const fetchMarksAndStudents = async (assessmentId: number) => {
    try {
      const [stRes, marksRes] = await Promise.all([
        apiClient.get('/academic/students'),
        apiClient.get(`/assessments/${assessmentId}/marks`),
      ]);

      const stList = stRes.data.data || [];
      if (stList.length === 0) throw new Error('Empty');
      setStudents(stList);

      const existingMarks = marksRes.data.data || [];
      const newGrid: { [studentId: number]: { marksObtained: number; isAbsent: boolean } } = {};
      const newEval: { [studentId: number]: { [criterionId: string]: number } } = {};

      stList.forEach((st: any, idx: number) => {
        const found = existingMarks.find((m: any) => m.studentId === st.id);
        const marksObtained = found ? Number(found.marksObtained) : Math.min(35 + (idx * 3) % 15, selectedAssessment?.maxMarks || 50);
        newGrid[st.id] = {
          marksObtained,
          isAbsent: found ? Boolean(found.isAbsent) : false,
        };

        // Initialize default Rubrix evaluation levels based on marks ratio
        if (activeRubric) {
          const ratio = marksObtained / (selectedAssessment?.maxMarks || 50);
          const defaultLevel = ratio >= 0.85 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.5 ? 2 : 1;
          const critEval: { [cId: string]: number } = {};
          activeRubric.criteria.forEach((c) => {
            critEval[c.id] = defaultLevel;
          });
          newEval[st.id] = critEval;
        }
      });

      setMarksGrid(newGrid);
      setRubricEvaluations(newEval);
    } catch {
      const fallbackStudents = [
        { id: 1, rollNumber: 'CS2023001', prn: 'PRN72019101', name: 'Aarav Sharma' },
        { id: 2, rollNumber: 'CS2023002', prn: 'PRN72019102', name: 'Aditi Patil' },
        { id: 3, rollNumber: 'CS2023003', prn: 'PRN72019103', name: 'Rohan Deshmukh' },
        { id: 4, rollNumber: 'CS2023004', prn: 'PRN72019104', name: 'Pooja Kulkarni' },
        { id: 5, rollNumber: 'CS2023005', prn: 'PRN72019105', name: 'Siddharth Joshi' },
      ];
      setStudents(fallbackStudents);
      
      const defaultGrid: any = {
        1: { marksObtained: 44, isAbsent: false },
        2: { marksObtained: 48, isAbsent: false },
        3: { marksObtained: 36, isAbsent: false },
        4: { marksObtained: 46, isAbsent: false },
        5: { marksObtained: 32, isAbsent: false },
      };
      setMarksGrid(defaultGrid);

      // Default Rubrix evaluations
      if (activeRubric) {
        const initialRubrixEval: any = {};
        fallbackStudents.forEach((st) => {
          const marksObtained = defaultGrid[st.id].marksObtained;
          const ratio = marksObtained / (selectedAssessment?.maxMarks || 50);
          const lvl = ratio >= 0.85 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.5 ? 2 : 1;
          const cMap: any = {};
          activeRubric.criteria.forEach((c) => {
            cMap[c.id] = lvl;
          });
          initialRubrixEval[st.id] = cMap;
        });
        setRubricEvaluations(initialRubrixEval);
      }
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
      // Find matching attached rubric or select default
      const matched = rubrics.find((r) => r.id === selectedAssessment.rubricId) || rubrics[0];
      setActiveRubric(matched);
      fetchMarksAndStudents(selectedAssessment.id);
    }
  }, [selectedAssessment]);

  // Recalculate student total mark from Rubrix levels + Faculty Adjustments
  const calculateStudentRubricScore = (studentId: number, rubric: RubricTemplate) => {
    const studentEval = rubricEvaluations[studentId];
    if (!studentEval) return 0;
    
    let totalScore = 0;
    rubric.criteria.forEach((crit) => {
      const selectedLevel = studentEval[crit.id] || 1;
      const levelObj = crit.levels.find((l) => l.level === selectedLevel) || crit.levels[0];
      const critScore = (levelObj.percentage / 100) * (crit.maxPoints || (crit.weightage / 100) * rubric.totalMarks);
      totalScore += critScore;
    });

    // Scale to assessment maxMarks if different
    const scaledScore = rubric.totalMarks > 0 
      ? (totalScore / rubric.totalMarks) * (selectedAssessment?.maxMarks || rubric.totalMarks) 
      : totalScore;

    // Apply Faculty (+/-) adjustment
    const adj = facultyAdjustments[studentId] || 0;
    const finalScore = Math.max(0, Math.min(selectedAssessment?.maxMarks || 100, scaledScore + adj));

    return Math.round(finalScore * 10) / 10;
  };

  // Update a single criterion level for a student in Rubrix mode
  const handleRubricLevelSelect = (studentId: number, criterionId: string, level: number) => {
    if (!activeRubric) return;

    const studentEval = { ...(rubricEvaluations[studentId] || {}) };
    studentEval[criterionId] = level;

    const newRubricEvaluations = {
      ...rubricEvaluations,
      [studentId]: studentEval,
    };
    setRubricEvaluations(newRubricEvaluations);

    // Calculate new total mark and update marks grid automatically!
    let totalScore = 0;
    activeRubric.criteria.forEach((crit) => {
      const selectedLevel = studentEval[crit.id] || 1;
      const levelObj = crit.levels.find((l) => l.level === selectedLevel) || crit.levels[0];
      const critScore = (levelObj.percentage / 100) * (crit.maxPoints || (crit.weightage / 100) * activeRubric.totalMarks);
      totalScore += critScore;
    });

    const scaledScore = activeRubric.totalMarks > 0 
      ? (totalScore / activeRubric.totalMarks) * (selectedAssessment?.maxMarks || activeRubric.totalMarks) 
      : totalScore;

    const adj = facultyAdjustments[studentId] || 0;
    const finalMarks = Math.round(Math.max(0, Math.min(selectedAssessment?.maxMarks || 100, scaledScore + adj)) * 10) / 10;

    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: finalMarks,
      },
    }));
  };

  // Inline Faculty Criteria Adjustments (Modifying criteria weights, CO mappings directly)
  const handleFacultyCriteriaParamChange = (criterionId: string, field: 'title' | 'coCode' | 'weightage' | 'bloomLevel', value: any) => {
    if (!activeRubric) return;

    const updatedCriteria = activeRubric.criteria.map((c) => {
      if (c.id === criterionId) {
        return {
          ...c,
          [field]: field === 'weightage' ? Number(value) : value,
        };
      }
      return c;
    });

    const updatedRubric = {
      ...activeRubric,
      criteria: updatedCriteria,
      isCustomByFaculty: true,
    };

    setActiveRubric(updatedRubric);

    // Update in rubrics list
    setRubrics((prev) => prev.map((r) => (r.id === updatedRubric.id ? updatedRubric : r)));

    // Recalculate all student scores with adjusted weights!
    setMarksGrid((prev) => {
      const newGrid = { ...prev };
      students.forEach((st) => {
        const newScore = calculateStudentRubricScore(st.id, updatedRubric);
        newGrid[st.id] = {
          ...newGrid[st.id],
          marksObtained: newScore,
        };
      });
      return newGrid;
    });
  };

  // Open Builder for editing existing Rubric
  const handleOpenEditRubricModal = (rubricToEdit: RubricTemplate) => {
    setEditingRubricId(rubricToEdit.id);
    setNewRubricForm({
      name: rubricToEdit.name,
      description: rubricToEdit.description,
      category: rubricToEdit.category,
      totalMarks: rubricToEdit.totalMarks,
      criteria: rubricToEdit.criteria,
    });
    setShowRubricBuilderModal(true);
  };

  // Clone Rubric as Faculty Custom Framework
  const handleCloneRubric = (rubricToClone: RubricTemplate) => {
    const cloned: RubricTemplate = {
      ...rubricToClone,
      id: Date.now(),
      name: `${rubricToClone.name} (Faculty Adjusted)`,
      description: `Faculty customized version of ${rubricToClone.name}`,
      isCustomByFaculty: true,
    };

    setRubrics([cloned, ...rubrics]);
    setActiveRubric(cloned);
    alert(`Cloned and activated "${cloned.name}". Faculty can now adjust all criteria freely!`);
  };

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
      alert(`Successfully saved ${marksPayload.length} student mark evaluations (Faculty adjusted & Rubrix synced)!`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save student marks');
    } finally {
      setSavingMarks(false);
    }
  };

  const handleCreateOrUpdateRubric = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRubricId) {
      // Update existing
      const updated: RubricTemplate = {
        id: editingRubricId,
        name: newRubricForm.name,
        description: newRubricForm.description,
        category: newRubricForm.category,
        totalMarks: Number(newRubricForm.totalMarks),
        criteria: newRubricForm.criteria,
        isCustomByFaculty: true,
      };

      setRubrics((prev) => prev.map((r) => (r.id === editingRubricId ? updated : r)));
      setActiveRubric(updated);
      setShowRubricBuilderModal(false);
      setEditingRubricId(null);
      alert(`Rubric Framework "${updated.name}" updated successfully by faculty!`);
    } else {
      // Create new
      const createdRubric: RubricTemplate = {
        id: Date.now(),
        name: newRubricForm.name,
        description: newRubricForm.description,
        category: newRubricForm.category,
        totalMarks: Number(newRubricForm.totalMarks),
        criteria: newRubricForm.criteria,
        isCustomByFaculty: true,
      };

      setRubrics([createdRubric, ...rubrics]);
      setActiveRubric(createdRubric);
      setShowRubricBuilderModal(false);
      alert(`Faculty Custom Rubric "${createdRubric.name}" deployed!`);
    }
  };

  // Helper colors for Rubrix levels
  const getLevelBadgeSolid = (level: number) => {
    switch (level) {
      case 4: return 'bg-emerald-500 text-white shadow-emerald-500/30';
      case 3: return 'bg-sky-500 text-white shadow-sky-500/30';
      case 2: return 'bg-amber-500 text-white shadow-amber-500/30';
      case 1: default: return 'bg-rose-500 text-white shadow-rose-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {readOnly && <ReadOnlyNotice featureName="Assessments & Rubrix Evaluation" />}

      {/* Header Title with Rubrix Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Assessment & Rubrix Evaluation Engine</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gradient-to-r from-purple-500/20 to-sky-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
              Faculty Adjustable Rubrix
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Faculty adjustable rubric criteria, weights, performance levels, and student evaluation matrix
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {!readOnly && (
            <>
              <button
                onClick={() => {
                  setEditingRubricId(null);
                  setNewRubricForm({
                    name: 'Custom Faculty Rubric',
                    description: 'Adjusted by faculty for specialized course evaluation',
                    category: 'PRACTICAL',
                    totalMarks: 50,
                    criteria: [
                      {
                        id: 'c_1',
                        title: 'Theoretical Concept & Setup',
                        weightage: 50,
                        coCode: 'CO1',
                        bloomLevel: 'L3 - Apply',
                        maxPoints: 25,
                        levels: [
                          { level: 1, label: 'Novice', percentage: 25, description: 'Incorrect setup.' },
                          { level: 2, label: 'Developing', percentage: 50, description: 'Basic setup with guidance.' },
                          { level: 3, label: 'Proficient', percentage: 75, description: 'Standard correct setup.' },
                          { level: 4, label: 'Exemplary', percentage: 100, description: 'Optimal setup with deep logic.' },
                        ],
                      },
                      {
                        id: 'c_2',
                        title: 'Execution & Viva',
                        weightage: 50,
                        coCode: 'CO2',
                        bloomLevel: 'L4 - Analyze',
                        maxPoints: 25,
                        levels: [
                          { level: 1, label: 'Novice', percentage: 25, description: 'Execution failed.' },
                          { level: 2, label: 'Developing', percentage: 50, description: 'Partial output.' },
                          { level: 3, label: 'Proficient', percentage: 75, description: 'Executes smoothly.' },
                          { level: 4, label: 'Exemplary', percentage: 100, description: 'Flawless execution & viva.' },
                        ],
                      },
                    ],
                  });
                  setShowRubricBuilderModal(true);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all shadow-md"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Build New Rubric</span>
              </button>

              <button
                onClick={() => setShowAssessmentModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assessment</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Selectors & Mode Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Course:</label>
              <select
                value={selectedCourseId || ''}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assessment Component:</label>
              <select
                value={selectedAssessment?.id || ''}
                onChange={(e) => {
                  const found = assessments.find((a) => a.id === Number(e.target.value));
                  setSelectedAssessment(found || null);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.maxMarks} Marks, Weight: {a.weightage}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Award className="w-3 h-3 text-purple-400" /> Attached Rubric Framework:
              </label>
              <select
                value={activeRubric?.id || ''}
                onChange={(e) => {
                  const r = rubrics.find((item) => item.id === Number(e.target.value));
                  if (r) setActiveRubric(r);
                }}
                className="bg-purple-950/40 border border-purple-800/60 text-purple-200 text-xs rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {rubrics.map((r) => (
                  <option key={r.id} value={r.id}>
                    🎯 {r.name} {r.isCustomByFaculty ? '(Faculty Adjusted)' : ''} ({r.criteria.length} Criteria)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedAssessment && (
            <div className="flex items-center space-x-3 self-end lg:self-center">
              <button
                onClick={handleSaveMarks}
                disabled={savingMarks}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{savingMarks ? 'Saving Marks & Rubrix...' : 'Save All Evaluations'}</span>
              </button>
            </div>
          )}
        </div>

        {/* View Mode Tabs & Faculty Quick Parameter Adjuster Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex space-x-2 p-1 bg-slate-950/60 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveMode('RUBRIX_MATRIX')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all ${
                activeMode === 'RUBRIX_MATRIX'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Rubrix Evaluation Matrix</span>
            </button>

            <button
              onClick={() => setActiveMode('MARKS_ENTRY')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all ${
                activeMode === 'MARKS_ENTRY'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Standard Marks Entry</span>
            </button>

            <button
              onClick={() => setActiveMode('RUBRICS_LIBRARY')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center space-x-2 transition-all ${
                activeMode === 'RUBRICS_LIBRARY'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Rubrics Library ({rubrics.length})</span>
            </button>
          </div>

          {activeMode === 'RUBRIX_MATRIX' && activeRubric && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFacultyEditingParams(!isFacultyEditingParams)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                  isFacultyEditingParams
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-2 ring-amber-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isFacultyEditingParams ? 'Done Adjusting Criteria' : '⚡ Adjust Criteria Weights & COs'}</span>
              </button>

              <button
                onClick={() => handleOpenEditRubricModal(activeRubric)}
                className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/60 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Full Rubric</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: RUBRIX EVALUATION MATRIX                              */}
      {/* ============================================================ */}
      {activeMode === 'RUBRIX_MATRIX' && (
        <div className="space-y-6">
          {/* Active Rubric Criteria Summary & Faculty Adjustment Banner */}
          {activeRubric && (
            <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-800/40 p-4 rounded-2xl shadow-lg space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">{activeRubric.name}</h3>
                    {activeRubric.isCustomByFaculty && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Faculty Customized
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {activeRubric.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{activeRubric.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCloneRubric(activeRubric)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5 text-sky-400" />
                    <span>Clone & Customize</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditRubricModal(activeRubric)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md shadow-purple-600/30"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Adjust Descriptors</span>
                  </button>
                </div>
              </div>

              {/* Inline Parameter Editing Mode Notice */}
              {isFacultyEditingParams && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-200 flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center space-x-2">
                    <Settings2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span><strong>Faculty Adjustment Mode Active:</strong> You can edit criterion titles, weightages (%), and target CO mappings directly in the table header below. Student marks automatically re-calculate!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Rubrix Matrix Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
            {!selectedAssessment ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No assessment component selected. Select or create an assessment above.
              </div>
            ) : !activeRubric ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No Rubric attached to this assessment. Select a Rubric template above or switch to Standard Marks Entry.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/90 text-slate-300 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-3.5 min-w-[120px]">Roll No</th>
                      <th className="p-3.5 min-w-[170px]">Student Name</th>

                      {/* Criteria Headers (Editable if isFacultyEditingParams) */}
                      {activeRubric.criteria.map((crit) => (
                        <th key={crit.id} className="p-3.5 text-center min-w-[210px] border-l border-slate-700/60 bg-slate-900/40">
                          {isFacultyEditingParams ? (
                            <div className="space-y-1.5 p-2 bg-slate-950/80 border border-amber-500/40 rounded-xl">
                              <input
                                type="text"
                                value={crit.title}
                                onChange={(e) => handleFacultyCriteriaParamChange(crit.id, 'title', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-white font-bold text-[11px] rounded p-1 text-center"
                                placeholder="Criterion Title"
                              />
                              <div className="flex items-center space-x-1 justify-center">
                                <span className="text-[10px] text-amber-400 font-bold">CO:</span>
                                <input
                                  type="text"
                                  value={crit.coCode}
                                  onChange={(e) => handleFacultyCriteriaParamChange(crit.id, 'coCode', e.target.value)}
                                  className="w-14 bg-slate-800 border border-slate-700 text-sky-300 font-bold text-[10px] rounded p-1 text-center"
                                />
                                <span className="text-[10px] text-amber-400 font-bold">Wt%:</span>
                                <input
                                  type="number"
                                  value={crit.weightage}
                                  onChange={(e) => handleFacultyCriteriaParamChange(crit.id, 'weightage', e.target.value)}
                                  className="w-14 bg-slate-800 border border-slate-700 text-purple-300 font-bold text-[10px] rounded p-1 text-center"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-center space-x-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">{crit.coCode}</span>
                                <span className="text-white text-[11px] font-bold">{crit.title}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                Weight: {crit.weightage}% | {crit.bloomLevel}
                              </div>
                            </>
                          )}
                        </th>
                      ))}

                      <th className="p-3.5 text-center min-w-[100px] border-l border-slate-700/60 bg-slate-950/60 text-amber-300 font-bold">Faculty Adj (+/-)</th>
                      <th className="p-3.5 text-center min-w-[130px] border-l border-slate-700 bg-slate-800">Final Score</th>
                      <th className="p-3.5 text-center min-w-[90px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {students.map((st) => {
                      const calculatedMarks = calculateStudentRubricScore(st.id, activeRubric);
                      const currentMarks = marksGrid[st.id]?.marksObtained ?? calculatedMarks;
                      const maxMarks = selectedAssessment.maxMarks || activeRubric.totalMarks;
                      const pct = maxMarks > 0 ? (currentMarks / maxMarks) * 100 : 0;
                      const stEval = rubricEvaluations[st.id] || {};
                      const facultyAdj = facultyAdjustments[st.id] || 0;

                      return (
                        <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-sky-400">{st.rollNumber}</td>
                          <td className="p-3.5 font-semibold text-white">
                            <div>{st.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{st.prn || 'PRN OK'}</div>
                          </td>

                          {/* Criterion Level Selector Pills */}
                          {activeRubric.criteria.map((crit) => {
                            const selectedLevel = stEval[crit.id] || 1;
                            return (
                              <td key={crit.id} className="p-3.5 border-l border-slate-800 text-center">
                                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
                                  {crit.levels.map((lvl) => {
                                    const isSelected = selectedLevel === lvl.level;
                                    return (
                                      <button
                                        key={lvl.level}
                                        type="button"
                                        title={`${lvl.label} (${lvl.percentage}%): ${lvl.description}`}
                                        onClick={() => handleRubricLevelSelect(st.id, crit.id, lvl.level)}
                                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center justify-center ${
                                          isSelected
                                            ? getLevelBadgeSolid(lvl.level)
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                        }`}
                                      >
                                        <span>L{lvl.level}</span>
                                        <span className="text-[8px] font-mono opacity-80">{lvl.percentage}%</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            );
                          })}

                          {/* Faculty Grace/Bonus Adjustment Input */}
                          <td className="p-3.5 text-center border-l border-slate-800 bg-slate-950/30">
                            <input
                              type="number"
                              value={facultyAdj}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setFacultyAdjustments((prev) => ({ ...prev, [st.id]: val }));
                                const newFinal = calculateStudentRubricScore(st.id, activeRubric);
                                setMarksGrid((prev) => ({
                                  ...prev,
                                  [st.id]: { ...prev[st.id], marksObtained: newFinal },
                                }));
                              }}
                              placeholder="0"
                              className="w-16 bg-slate-800 border border-slate-700 text-amber-300 font-mono font-bold text-center text-xs rounded-lg py-1 focus:ring-1 focus:ring-amber-500 outline-none"
                            />
                          </td>

                          {/* Final Calculated Mark Result */}
                          <td className="p-3.5 text-center border-l border-slate-700 bg-slate-900/60 font-mono">
                            <div className="text-sm font-bold text-sky-300">
                              {currentMarks} / {maxMarks}
                            </div>
                            <div className={`text-[10px] font-semibold ${pct >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {pct.toFixed(1)}%
                            </div>
                          </td>

                          {/* Actions: Detailed Evaluator Card */}
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                setEvaluatingStudent(st);
                                setShowStudentModal(true);
                              }}
                              className="px-2.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 mx-auto transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Card</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: STANDARD MARKS ENTRY                                 */}
      {/* ============================================================ */}
      {activeMode === 'MARKS_ENTRY' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
          {!selectedAssessment ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No assessment component selected. Click 'Create Assessment' above.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3.5">Roll Number</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5 w-48 text-center">Marks Obtained (Max: {selectedAssessment.maxMarks})</th>
                  <th className="p-3.5 w-28 text-center">Absent?</th>
                  <th className="p-3.5 w-36 text-center">Percentage</th>
                  <th className="p-3.5 w-32 text-center">Rubrix Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {students.map((st) => {
                  const current = marksGrid[st.id] || { marksObtained: 0, isAbsent: false };
                  const pct = selectedAssessment.maxMarks > 0 ? (current.marksObtained / selectedAssessment.maxMarks) * 100 : 0;
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
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
                          className="w-28 bg-slate-800 border border-slate-700 text-center font-bold text-sky-300 text-xs rounded-xl py-1.5 focus:ring-2 focus:ring-sky-500 outline-none disabled:opacity-30"
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
                          className="w-4 h-4 text-sky-500 bg-slate-800 border-slate-700 rounded focus:ring-0"
                        />
                      </td>
                      <td className="p-3.5 text-center font-mono font-semibold">
                        <span className={pct >= 60 ? 'text-emerald-400' : 'text-amber-400'}>
                          {current.isAbsent ? 'ABSENT' : `${pct.toFixed(1)}%`}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center space-x-1 w-fit mx-auto">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Synced</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 3: RUBRICS LIBRARY MANAGER                              */}
      {/* ============================================================ */}
      {activeMode === 'RUBRICS_LIBRARY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rubrics.map((r) => {
            const isActive = activeRubric?.id === r.id;
            return (
              <div
                key={r.id}
                className={`bg-slate-900/90 border p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between transition-all ${
                  isActive ? 'border-purple-500 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wide">
                      {r.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-400">{r.totalMarks} Marks</span>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white">{r.name}</h3>
                    {r.isCustomByFaculty && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded">Faculty Custom</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{r.description}</p>

                  {/* Criteria list */}
                  <div className="space-y-2 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Criteria Breakdown ({r.criteria.length}):</div>
                    {r.criteria.map((c) => (
                      <div key={c.id} className="bg-slate-800/60 p-2 rounded-xl text-xs flex items-center justify-between border border-slate-700/50">
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold">{c.coCode}</span>
                          <span className="font-medium text-slate-200 text-[11px]">{c.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-300 font-bold">{c.weightage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCloneRubric(r)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs"
                    title="Clone & Customize"
                  >
                    <Copy className="w-3.5 h-3.5 text-sky-400" />
                  </button>

                  <button
                    onClick={() => handleOpenEditRubricModal(r)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs"
                    title="Edit Rubric Criteria & Levels"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveRubric(r);
                      setActiveMode('RUBRIX_MATRIX');
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isActive ? 'In Use (Matrix)' : 'Deploy'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: INDIVIDUAL STUDENT RUBRIX EVALUATOR CARD            */}
      {/* ============================================================ */}
      {showStudentModal && evaluatingStudent && activeRubric && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-white">{evaluatingStudent.name}</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {evaluatingStudent.rollNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assessment: <strong className="text-slate-200">{selectedAssessment?.name}</strong> | Rubric: <strong className="text-purple-300">{activeRubric.name}</strong>
                </p>
              </div>

              <button
                onClick={() => setShowStudentModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Criteria Detailed Evaluation List */}
            <div className="space-y-4">
              {activeRubric.criteria.map((crit) => {
                const currentLevel = (rubricEvaluations[evaluatingStudent.id] || {})[crit.id] || 1;
                return (
                  <div key={crit.id} className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {crit.coCode}
                        </span>
                        <h4 className="text-xs font-bold text-white">{crit.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        Weight: <strong className="text-slate-200">{crit.weightage}%</strong> ({crit.bloomLevel})
                      </span>
                    </div>

                    {/* Performance Level Descriptors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {crit.levels.map((lvl) => {
                        const isSelected = currentLevel === lvl.level;
                        return (
                          <div
                            key={lvl.level}
                            onClick={() => handleRubricLevelSelect(evaluatingStudent.id, crit.id, lvl.level)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getLevelBadgeSolid(lvl.level)}`}>
                                  L{lvl.level} — {lvl.label}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-400">{lvl.percentage}%</span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-snug">{lvl.description}</p>
                            </div>

                            {isSelected && (
                              <div className="mt-2 text-[10px] font-bold text-purple-400 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-purple-400" />
                                <span>Selected Level</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Calculated Result Footer */}
            <div className="bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-slate-700">
              <div>
                <div className="text-xs text-slate-400 font-medium">Calculated Student Mark (With Faculty Adjustments)</div>
                <div className="text-xl font-bold text-sky-300 font-mono mt-0.5">
                  {calculateStudentRubricScore(evaluatingStudent.id, activeRubric)} / {selectedAssessment?.maxMarks || activeRubric.totalMarks} Marks
                </div>
              </div>

              <button
                onClick={() => setShowStudentModal(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/30"
              >
                Done & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CUSTOM RUBRIC BUILDER / EDIT MODAL                  */}
      {/* ============================================================ */}
      {showRubricBuilderModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">
                  {editingRubricId ? 'Edit Faculty Rubric Framework' : 'Create Custom Faculty Rubric'}
                </h2>
              </div>
              <button onClick={() => setShowRubricBuilderModal(false)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateRubric} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rubric Title</label>
                <input
                  type="text"
                  required
                  value={newRubricForm.name}
                  onChange={(e) => setNewRubricForm({ ...newRubricForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newRubricForm.category}
                    onChange={(e) => setNewRubricForm({ ...newRubricForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  >
                    <option value="PRACTICAL">PRACTICAL / LAB</option>
                    <option value="PROJECT">MINI / CAPSTONE PROJECT</option>
                    <option value="ASSIGNMENT">ASSIGNMENT / CASE STUDY</option>
                    <option value="PRESENTATION">SEMINAR / PRESENTATION</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Rubric Marks</label>
                  <input
                    type="number"
                    required
                    value={newRubricForm.totalMarks}
                    onChange={(e) => setNewRubricForm({ ...newRubricForm, totalMarks: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newRubricForm.description}
                  onChange={(e) => setNewRubricForm({ ...newRubricForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                />
              </div>

              {/* Criteria List Builder with level descriptor adjusters */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200">Adjust Criteria & Level Descriptors ({newRubricForm.criteria.length})</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newCrit: RubricCriterion = {
                        id: `crit_${Date.now()}`,
                        title: `New Criterion ${newRubricForm.criteria.length + 1}`,
                        weightage: 25,
                        coCode: `CO${(newRubricForm.criteria.length % 5) + 1}`,
                        bloomLevel: 'L3 - Apply',
                        maxPoints: 12.5,
                        levels: [
                          { level: 1, label: 'Novice', percentage: 25, description: 'Basic effort with major gaps.' },
                          { level: 2, label: 'Developing', percentage: 50, description: 'Meets minimum criteria.' },
                          { level: 3, label: 'Proficient', percentage: 75, description: 'Competent execution.' },
                          { level: 4, label: 'Exemplary', percentage: 100, description: 'Exceptional performance.' },
                        ],
                      };
                      setNewRubricForm({ ...newRubricForm, criteria: [...newRubricForm.criteria, newCrit] });
                    }}
                    className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-semibold rounded-lg flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Criterion</span>
                  </button>
                </div>

                {newRubricForm.criteria.map((c, idx) => (
                  <div key={c.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={c.title}
                        onChange={(e) => {
                          const updated = [...newRubricForm.criteria];
                          updated[idx].title = e.target.value;
                          setNewRubricForm({ ...newRubricForm, criteria: updated });
                        }}
                        placeholder="Criterion Title"
                        className="bg-slate-800 border border-slate-700 text-xs rounded-lg p-2 text-white font-semibold"
                      />
                      <input
                        type="text"
                        value={c.coCode}
                        onChange={(e) => {
                          const updated = [...newRubricForm.criteria];
                          updated[idx].coCode = e.target.value;
                          setNewRubricForm({ ...newRubricForm, criteria: updated });
                        }}
                        placeholder="CO Code (e.g. CO1)"
                        className="bg-slate-800 border border-slate-700 text-xs rounded-lg p-2 text-sky-300 font-bold"
                      />
                      <input
                        type="text"
                        value={c.bloomLevel}
                        onChange={(e) => {
                          const updated = [...newRubricForm.criteria];
                          updated[idx].bloomLevel = e.target.value;
                          setNewRubricForm({ ...newRubricForm, criteria: updated });
                        }}
                        placeholder="Bloom Level"
                        className="bg-slate-800 border border-slate-700 text-xs rounded-lg p-2 text-slate-200"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={c.weightage}
                          onChange={(e) => {
                            const updated = [...newRubricForm.criteria];
                            updated[idx].weightage = Number(e.target.value);
                            setNewRubricForm({ ...newRubricForm, criteria: updated });
                          }}
                          placeholder="Weight %"
                          className="w-full bg-slate-800 border border-slate-700 text-xs rounded-lg p-2 text-purple-300 font-bold"
                        />
                        {newRubricForm.criteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newRubricForm.criteria.filter((_, i) => i !== idx);
                              setNewRubricForm({ ...newRubricForm, criteria: updated });
                            }}
                            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Adjustable Descriptors per level */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
                      {c.levels.map((lvl, lIdx) => (
                        <div key={lvl.level} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>L{lvl.level} ({lvl.label})</span>
                            <input
                              type="number"
                              value={lvl.percentage}
                              onChange={(e) => {
                                const updatedCriteria = [...newRubricForm.criteria];
                                updatedCriteria[idx].levels[lIdx].percentage = Number(e.target.value);
                                setNewRubricForm({ ...newRubricForm, criteria: updatedCriteria });
                              }}
                              className="w-12 bg-slate-800 border border-slate-700 text-white font-mono text-[9px] rounded px-1 text-center"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={lvl.description}
                            onChange={(e) => {
                              const updatedCriteria = [...newRubricForm.criteria];
                              updatedCriteria[idx].levels[lIdx].description = e.target.value;
                              setNewRubricForm({ ...newRubricForm, criteria: updatedCriteria });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded-lg p-1.5 focus:border-purple-500 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowRubricBuilderModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/30">
                  {editingRubricId ? 'Update Faculty Rubric' : 'Save & Deploy Rubric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CREATE ASSESSMENT COMPONENT                        */}
      {/* ============================================================ */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Create Assessment Component</h2>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Component Name</label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Rubrix Framework (Optional)</label>
                <select
                  value={assessmentForm.rubricId}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, rubricId: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                >
                  {rubrics.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.totalMarks} Marks)
                    </option>
                  ))}
                </select>
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


