// ============================================================
// OBE SYSTEM — COMPLETE SEED FILE
// Seeds all tables with realistic demo data for testing
// all formula engine calculations end-to-end.
// ============================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting OBE System seed...');

  // ─── 1. USERS ────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@obe.edu' },
    update: {},
    create: { name: 'Super Administrator', email: 'superadmin@obe.edu', password: passwordHash, role: 'SUPER_ADMIN' },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@obe.edu' },
    update: {},
    create: { name: 'System Admin', email: 'admin@obe.edu', password: passwordHash, role: 'ADMIN' },
  });

  // ─── 2. DEPARTMENT ───────────────────────────────────────────
  const dept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: { code: 'CSE', name: 'Computer Science & Engineering', shortName: 'CSE' },
  });

  const deptME = await prisma.department.upsert({
    where: { code: 'MECH' },
    update: {},
    create: { code: 'MECH', name: 'Mechanical Engineering', shortName: 'MECH' },
  });

  await prisma.user.upsert({
    where: { email: 'hod.cse@obe.edu' },
    update: {},
    create: { name: 'Dr. Priya Sharma', email: 'hod.cse@obe.edu', password: passwordHash, role: 'HOD', departmentId: dept.id },
  });

  await prisma.user.upsert({
    where: { email: 'faculty1@obe.edu' },
    update: {},
    create: { name: 'Prof. Amit Desai', email: 'faculty1@obe.edu', password: passwordHash, role: 'FACULTY', departmentId: dept.id },
  });

  await prisma.user.upsert({
    where: { email: 'faculty2@obe.edu' },
    update: {},
    create: { name: 'Prof. Meera Joshi', email: 'faculty2@obe.edu', password: passwordHash, role: 'FACULTY', departmentId: dept.id },
  });

  // ─── 3. ACADEMIC YEAR ────────────────────────────────────────
  const ay = await prisma.academicYear.upsert({
    where: { year: '2024-25' },
    update: { isCurrent: true },
    create: {
      year: '2024-25',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-05-31'),
      isCurrent: true,
    },
  });

  const ayPrev = await prisma.academicYear.upsert({
    where: { year: '2023-24' },
    update: {},
    create: {
      year: '2023-24',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-05-31'),
      isCurrent: false,
    },
  });

  // ─── 4. PROGRAM ──────────────────────────────────────────────
  const prog = await prisma.program.upsert({
    where: { code_departmentId: { code: 'BE-CSE', departmentId: dept.id } },
    update: {},
    create: {
      code: 'BE-CSE',
      name: 'Bachelor of Engineering in Computer Science & Engineering',
      shortName: 'BE-CSE',
      duration: 4,
      totalSemesters: 8,
      departmentId: dept.id,
    },
  });

  // ─── 5. ATTAINMENT CONFIGURATION (global defaults) ───────────
  const thresholdData = [
    { level: 3, label: 'Level 3', minPercentage: 70, maxPercentage: 100, attainmentValue: 3.0 },
    { level: 2, label: 'Level 2', minPercentage: 60, maxPercentage: 69.99, attainmentValue: 2.0 },
    { level: 1, label: 'Level 1', minPercentage: 50, maxPercentage: 59.99, attainmentValue: 1.0 },
    { level: 0, label: 'Level 0', minPercentage: 0, maxPercentage: 49.99, attainmentValue: 0.0 },
  ];

  for (const t of thresholdData) {
    const existing = await prisma.attainmentThreshold.findFirst({
      where: { level: t.level, programId: null },
    });
    if (!existing) {
      await prisma.attainmentThreshold.create({ data: { ...t, programId: null } });
    }
  }

  // Program-specific thresholds for CSE (slightly stricter)
  const progThresholdData = [
    { level: 3, label: 'Level 3', minPercentage: 66, maxPercentage: 100, attainmentValue: 3.0 },
    { level: 2, label: 'Level 2', minPercentage: 55, maxPercentage: 65.99, attainmentValue: 2.0 },
    { level: 1, label: 'Level 1', minPercentage: 45, maxPercentage: 54.99, attainmentValue: 1.0 },
    { level: 0, label: 'Level 0', minPercentage: 0, maxPercentage: 44.99, attainmentValue: 0.0 },
  ];

  for (const t of progThresholdData) {
    const existing = await prisma.attainmentThreshold.findFirst({
      where: { level: t.level, programId: prog.id },
    });
    if (!existing) {
      await prisma.attainmentThreshold.create({ data: { ...t, programId: prog.id } });
    }
  }

  // Direct/Indirect weight config
  const diWeightExisting = await prisma.directIndirectWeightConfig.findFirst({
    where: { programId: prog.id },
  });
  if (!diWeightExisting) {
    await prisma.directIndirectWeightConfig.create({
      data: { directWeight: 80, indirectWeight: 20, programId: prog.id },
    });
  }

  // Global direct/indirect weight
  const globalDIExisting = await prisma.directIndirectWeightConfig.findFirst({
    where: { programId: null },
  });
  if (!globalDIExisting) {
    await prisma.directIndirectWeightConfig.create({
      data: { directWeight: 80, indirectWeight: 20, programId: null },
    });
  }

  // OBE Settings
  const obeSettings = [
    { settingKey: 'CO_PASS_THRESHOLD', settingValue: '60', description: '% marks required for a student to count as attaining the CO' },
    { settingKey: 'INSTITUTION_NAME', settingValue: 'Dr. D.Y. Patil College of Engineering & Innovation', description: 'Institution name for reports' },
    { settingKey: 'SURVEY_SCALE_MAX', settingValue: '5', description: 'Maximum value on survey response scale' },
    { settingKey: 'SURVEY_SCALE_MIN', settingValue: '1', description: 'Minimum value on survey response scale' },
    { settingKey: 'EMPLOYER_SURVEY_SCALE', settingValue: '5', description: 'Employer survey scale maximum' },
    { settingKey: 'CCA_SCALE_MAX', settingValue: '3', description: 'CCA attainment level maximum' },
    { settingKey: 'ECA_SCALE_MAX', settingValue: '3', description: 'ECA attainment level maximum' },
  ];

  for (const s of obeSettings) {
    const existing = await prisma.obeSettings.findFirst({
      where: { settingKey: s.settingKey, programId: null },
    });
    if (!existing) {
      await prisma.obeSettings.create({ data: { ...s, programId: null } });
    }
  }

  // ─── 6. PROGRAM OUTCOMES (PO1–PO12) ─────────────────────────
  const poDefinitions = [
    { number: 1, code: 'PO1', description: 'Engineering Knowledge: Apply knowledge of mathematics, science, engineering fundamentals to solve complex engineering problems.' },
    { number: 2, code: 'PO2', description: 'Problem Analysis: Identify, formulate, review research literature, and analyze complex engineering problems.' },
    { number: 3, code: 'PO3', description: 'Design/Development of Solutions: Design solutions for complex engineering problems with appropriate consideration for public health, safety, cultural, societal, and environmental considerations.' },
    { number: 4, code: 'PO4', description: 'Conduct Investigations of Complex Problems: Use research-based knowledge and research methods including design of experiments.' },
    { number: 5, code: 'PO5', description: 'Modern Tool Usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools.' },
    { number: 6, code: 'PO6', description: 'The Engineer and Society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues.' },
    { number: 7, code: 'PO7', description: 'Environment and Sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts.' },
    { number: 8, code: 'PO8', description: 'Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.' },
    { number: 9, code: 'PO9', description: 'Individual and Team Work: Function effectively as an individual, and as a member or leader in diverse teams and multidisciplinary settings.' },
    { number: 10, code: 'PO10', description: 'Communication: Communicate effectively on complex engineering activities with the engineering community and society at large.' },
    { number: 11, code: 'PO11', description: 'Project Management and Finance: Demonstrate knowledge and understanding of engineering and management principles and apply these to one\'s own work.' },
    { number: 12, code: 'PO12', description: 'Life-long Learning: Recognize the need for and have the preparation and ability to engage in independent and life-long learning.' },
  ];

  const poMap: Record<string, number> = {};
  for (const po of poDefinitions) {
    const existing = await prisma.programOutcome.findFirst({
      where: { programId: prog.id, code: po.code },
    });
    const record = existing ?? await prisma.programOutcome.create({
      data: { ...po, programId: prog.id },
    });
    poMap[po.code] = record.id;
  }

  // ─── 7. PSOs ─────────────────────────────────────────────────
  const psoDefinitions = [
    { number: 1, code: 'PSO1', description: 'Apply technical knowledge in software development using modern programming languages, frameworks, and tools to build robust applications.' },
    { number: 2, code: 'PSO2', description: 'Design and develop efficient algorithms and data structures for solving real-world computational problems.' },
    { number: 3, code: 'PSO3', description: 'Demonstrate expertise in network design, cybersecurity, and cloud computing to build secure and scalable IT infrastructure.' },
  ];

  const psoMap: Record<string, number> = {};
  for (const pso of psoDefinitions) {
    const existing = await prisma.programSpecificOutcome.findFirst({
      where: { programId: prog.id, code: pso.code },
    });
    const record = existing ?? await prisma.programSpecificOutcome.create({
      data: { ...pso, programId: prog.id },
    });
    psoMap[pso.code] = record.id;
  }

  // ─── 8. BATCH & SEMESTER ─────────────────────────────────────
  const batch = await prisma.batch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '2022-2026',
      startYear: 2022,
      endYear: 2026,
      programId: prog.id,
      departmentId: dept.id,
      academicYearId: ay.id,
    },
  }).catch(() => prisma.batch.findFirst({ where: { programId: prog.id } })) as any;

  // Semester V
  const semV = await prisma.semester.findFirst({ where: { batchId: batch.id, number: 5 } })
    ?? await prisma.semester.create({ data: { number: 5, name: 'Semester V', batchId: batch.id } });

  // ─── 9. STUDENTS (30 students) ───────────────────────────────
  const studentData = Array.from({ length: 30 }, (_, i) => ({
    rollNumber: `22CSE${String(i + 1).padStart(3, '0')}`,
    name: [
      'Aarav Mehta', 'Priya Sharma', 'Rahul Verma', 'Anjali Singh', 'Rohan Patel',
      'Sneha Joshi', 'Arjun Kumar', 'Kavya Iyer', 'Vikram Rao', 'Pooja Nair',
      'Karthik Reddy', 'Divya Gupta', 'Suresh Yadav', 'Nisha Agarwal', 'Aditya Shah',
      'Riya Mishra', 'Siddharth Jain', 'Tanvi Patil', 'Manish Dubey', 'Shreya Bose',
      'Nikhil Saxena', 'Pallavi Rao', 'Gaurav Tiwari', 'Meena Pillai', 'Akash Pandey',
      'Sunita Das', 'Vijay Sahu', 'Lalitha Nair', 'Ravi Shankar', 'Deepa Krishnan',
    ][i],
    batchId: batch.id,
  }));

  const studentIds: number[] = [];
  for (const s of studentData) {
    const existing = await prisma.student.findFirst({
      where: { rollNumber: s.rollNumber, batchId: s.batchId },
    });
    const student = existing ?? await prisma.student.create({ data: s });
    studentIds.push(student.id);
  }

  // ─── 10. COURSES ─────────────────────────────────────────────
  const courseData = [
    { code: 'CS501', name: 'Database Management Systems', maxMarks: 100, credits: '4', courseType: 'THEORY' as const },
    { code: 'CS502', name: 'Computer Networks', maxMarks: 100, credits: '4', courseType: 'THEORY' as const },
    { code: 'CS503', name: 'Operating Systems', maxMarks: 100, credits: '4', courseType: 'THEORY' as const },
    { code: 'CS504', name: 'Software Engineering', maxMarks: 100, credits: '3', courseType: 'THEORY' as const },
  ];

  const courseMap: Record<string, { id: number; name: string }> = {};
  for (const cd of courseData) {
    const existing = await prisma.course.findFirst({
      where: { code: cd.code, programId: prog.id, semesterId: semV.id },
    });
    const course = existing ?? await prisma.course.create({
      data: {
        code: cd.code,
        name: cd.name,
        credits: cd.credits,
        courseType: cd.courseType,
        semesterId: semV.id,
        programId: prog.id,
        academicYearId: ay.id,
      },
    });
    courseMap[cd.code] = { id: course.id, name: cd.name };
  }

  // Enroll all students in all courses
  for (const courseCode of Object.keys(courseMap)) {
    for (const studentId of studentIds) {
      const existing = await prisma.studentCourse.findFirst({
        where: { studentId, courseId: courseMap[courseCode].id },
      });
      if (!existing) {
        await prisma.studentCourse.create({
          data: { studentId, courseId: courseMap[courseCode].id },
        });
      }
    }
  }

  // ─── 11. COURSE OUTCOMES (5 COs per course) ──────────────────
  const coDefinitions: Record<string, { code: string; number: number; description: string; bloomsLevel: number }[]> = {
    CS501: [
      { code: 'CO1', number: 1, description: 'Understand the relational database model and ER diagrams.', bloomsLevel: 2 },
      { code: 'CO2', number: 2, description: 'Design and implement relational schemas using normalization.', bloomsLevel: 3 },
      { code: 'CO3', number: 3, description: 'Write and optimize complex SQL queries.', bloomsLevel: 3 },
      { code: 'CO4', number: 4, description: 'Apply transaction management and concurrency control techniques.', bloomsLevel: 3 },
      { code: 'CO5', number: 5, description: 'Evaluate database performance and indexing strategies.', bloomsLevel: 5 },
    ],
    CS502: [
      { code: 'CO1', number: 1, description: 'Explain the OSI and TCP/IP reference models.', bloomsLevel: 2 },
      { code: 'CO2', number: 2, description: 'Analyze data link layer protocols and error detection mechanisms.', bloomsLevel: 4 },
      { code: 'CO3', number: 3, description: 'Design IP addressing schemes and subnets.', bloomsLevel: 3 },
      { code: 'CO4', number: 4, description: 'Implement routing algorithms including RIP and OSPF.', bloomsLevel: 3 },
      { code: 'CO5', number: 5, description: 'Evaluate network security protocols and VPN configurations.', bloomsLevel: 5 },
    ],
    CS503: [
      { code: 'CO1', number: 1, description: 'Explain OS concepts: processes, threads, and scheduling.', bloomsLevel: 2 },
      { code: 'CO2', number: 2, description: 'Analyze process synchronization and deadlock handling.', bloomsLevel: 4 },
      { code: 'CO3', number: 3, description: 'Implement memory management: paging and segmentation.', bloomsLevel: 3 },
      { code: 'CO4', number: 4, description: 'Design file system structures and storage management.', bloomsLevel: 3 },
      { code: 'CO5', number: 5, description: 'Apply Linux system calls for OS-level programming.', bloomsLevel: 3 },
    ],
    CS504: [
      { code: 'CO1', number: 1, description: 'Apply SDLC models and agile methodologies.', bloomsLevel: 3 },
      { code: 'CO2', number: 2, description: 'Create UML diagrams for software design.', bloomsLevel: 3 },
      { code: 'CO3', number: 3, description: 'Design test cases and apply software testing techniques.', bloomsLevel: 3 },
      { code: 'CO4', number: 4, description: 'Estimate project cost and schedule using standard techniques.', bloomsLevel: 3 },
      { code: 'CO5', number: 5, description: 'Evaluate software quality metrics and apply CMMI guidelines.', bloomsLevel: 5 },
    ],
  };

  const coMap: Record<string, number> = {}; // "CS501_CO1" -> id
  for (const [courseCode, cos] of Object.entries(coDefinitions)) {
    for (const co of cos) {
      const existing = await prisma.courseOutcome.findFirst({
        where: { courseId: courseMap[courseCode].id, code: co.code },
      });
      const record = existing ?? await prisma.courseOutcome.create({
        data: { ...co, courseId: courseMap[courseCode].id },
      });
      coMap[`${courseCode}_${co.code}`] = record.id;
    }
  }

  // ─── 12. CO-PO MAPPING (CS501 as the primary course) ─────────
  // Based on the reference manual's typical mapping pattern
  const coPoMappings: Array<{ courseCode: string; coCode: string; poCode: string; mappingValue: number }> = [
    // CS501 - DBMS
    { courseCode: 'CS501', coCode: 'CO1', poCode: 'PO1', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO1', poCode: 'PO2', mappingValue: 2 },
    { courseCode: 'CS501', coCode: 'CO2', poCode: 'PO1', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO2', poCode: 'PO2', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO2', poCode: 'PO3', mappingValue: 2 },
    { courseCode: 'CS501', coCode: 'CO3', poCode: 'PO1', mappingValue: 2 },
    { courseCode: 'CS501', coCode: 'CO3', poCode: 'PO2', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO3', poCode: 'PO3', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO3', poCode: 'PO5', mappingValue: 2 },
    { courseCode: 'CS501', coCode: 'CO4', poCode: 'PO2', mappingValue: 2 },
    { courseCode: 'CS501', coCode: 'CO4', poCode: 'PO4', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO4', poCode: 'PO5', mappingValue: 2 },
    { courseCode: 'CS501', coCode: 'CO5', poCode: 'PO4', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO5', poCode: 'PO5', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO5', poCode: 'PO12', mappingValue: 2 },
    // CS502 - Networks
    { courseCode: 'CS502', coCode: 'CO1', poCode: 'PO1', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO1', poCode: 'PO2', mappingValue: 2 },
    { courseCode: 'CS502', coCode: 'CO2', poCode: 'PO2', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO2', poCode: 'PO4', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO3', poCode: 'PO3', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO3', poCode: 'PO5', mappingValue: 2 },
    { courseCode: 'CS502', coCode: 'CO4', poCode: 'PO3', mappingValue: 2 },
    { courseCode: 'CS502', coCode: 'CO4', poCode: 'PO5', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO5', poCode: 'PO6', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO5', poCode: 'PO7', mappingValue: 2 },
    // CS503 - OS
    { courseCode: 'CS503', coCode: 'CO1', poCode: 'PO1', mappingValue: 3 },
    { courseCode: 'CS503', coCode: 'CO2', poCode: 'PO2', mappingValue: 3 },
    { courseCode: 'CS503', coCode: 'CO2', poCode: 'PO4', mappingValue: 2 },
    { courseCode: 'CS503', coCode: 'CO3', poCode: 'PO3', mappingValue: 3 },
    { courseCode: 'CS503', coCode: 'CO4', poCode: 'PO3', mappingValue: 2 },
    { courseCode: 'CS503', coCode: 'CO5', poCode: 'PO5', mappingValue: 3 },
    { courseCode: 'CS503', coCode: 'CO5', poCode: 'PO12', mappingValue: 2 },
    // CS504 - SE
    { courseCode: 'CS504', coCode: 'CO1', poCode: 'PO3', mappingValue: 3 },
    { courseCode: 'CS504', coCode: 'CO1', poCode: 'PO9', mappingValue: 2 },
    { courseCode: 'CS504', coCode: 'CO2', poCode: 'PO3', mappingValue: 3 },
    { courseCode: 'CS504', coCode: 'CO3', poCode: 'PO4', mappingValue: 3 },
    { courseCode: 'CS504', coCode: 'CO4', poCode: 'PO11', mappingValue: 3 },
    { courseCode: 'CS504', coCode: 'CO5', poCode: 'PO8', mappingValue: 3 },
    { courseCode: 'CS504', coCode: 'CO5', poCode: 'PO12', mappingValue: 2 },
  ];

  for (const m of coPoMappings) {
    const coId = coMap[`${m.courseCode}_${m.coCode}`];
    const poId = poMap[m.poCode];
    if (!coId || !poId) continue;
    const existing = await prisma.coPOMapping.findFirst({
      where: { courseOutcomeId: coId, programOutcomeId: poId },
    });
    if (!existing) {
      await prisma.coPOMapping.create({
        data: { courseOutcomeId: coId, programOutcomeId: poId, mappingValue: m.mappingValue },
      });
    } else {
      await prisma.coPOMapping.update({
        where: { id: existing.id },
        data: { mappingValue: m.mappingValue },
      });
    }
  }

  // ─── 13. CO-PSO MAPPING ───────────────────────────────────────
  const coPsoMappings: Array<{ courseCode: string; coCode: string; psoCode: string; mappingValue: number }> = [
    { courseCode: 'CS501', coCode: 'CO1', psoCode: 'PSO1', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO2', psoCode: 'PSO1', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO2', psoCode: 'PSO2', mappingValue: 2 },
    { courseCode: 'CS501', coCode: 'CO3', psoCode: 'PSO1', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO3', psoCode: 'PSO2', mappingValue: 3 },
    { courseCode: 'CS501', coCode: 'CO4', psoCode: 'PSO2', mappingValue: 2 },
    { courseCode: 'CS501', coCode: 'CO5', psoCode: 'PSO3', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO1', psoCode: 'PSO3', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO3', psoCode: 'PSO3', mappingValue: 3 },
    { courseCode: 'CS502', coCode: 'CO5', psoCode: 'PSO3', mappingValue: 3 },
  ];

  for (const m of coPsoMappings) {
    const coId = coMap[`${m.courseCode}_${m.coCode}`];
    const psoId = psoMap[m.psoCode];
    if (!coId || !psoId) continue;
    const existing = await prisma.coPSOMapping.findFirst({
      where: { courseOutcomeId: coId, programSpecificOutcomeId: psoId },
    });
    if (!existing) {
      await prisma.coPSOMapping.create({
        data: { courseOutcomeId: coId, programSpecificOutcomeId: psoId, mappingValue: m.mappingValue },
      });
    }
  }

  // ─── 14. ASSESSMENTS ─────────────────────────────────────────
  // CS501 has 3 assessment components: UT1, UT2, End-Sem
  const assessmentDefs = [
    { name: 'Unit Test 1', type: 'UNIT_TEST' as const, maxMarks: 20, weightage: 20 },
    { name: 'Unit Test 2', type: 'UNIT_TEST' as const, maxMarks: 20, weightage: 20 },
    { name: 'End Semester Examination', type: 'END_SEMESTER' as const, maxMarks: 60, weightage: 60 },
  ];

  const assessmentIds: Record<string, number[]> = {};
  for (const courseCode of ['CS501', 'CS502', 'CS503', 'CS504']) {
    assessmentIds[courseCode] = [];
    for (const ad of assessmentDefs) {
      const existing = await prisma.assessment.findFirst({
        where: { courseId: courseMap[courseCode].id, name: ad.name },
      });
      const assessment = existing ?? await prisma.assessment.create({
        data: { ...ad, assessmentType: ad.type, courseId: courseMap[courseCode].id, conductedDate: new Date() },
      });
      assessmentIds[courseCode].push(assessment.id);

      // Map all COs to this assessment
      const cos = coDefinitions[courseCode];
      for (const co of cos) {
        const coId = coMap[`${courseCode}_${co.code}`];
        const maxPerCO = ad.maxMarks / cos.length;
        const existingACO = await prisma.assessmentCO.findFirst({
          where: { assessmentId: assessment.id, courseOutcomeId: coId },
        });
        if (!existingACO) {
          await prisma.assessmentCO.create({
            data: {
              assessmentId: assessment.id,
              courseOutcomeId: coId,
              maxMarks: parseFloat(maxPerCO.toFixed(2)),
              weightage: 100 / cos.length,
            },
          });
        }
      }
    }
  }

  // ─── 15. STUDENT MARKS ───────────────────────────────────────
  // Realistic mark distribution: most students 60-85%, some 45-60%, few 30-50%
  const rng = (seed: number, min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  for (const courseCode of ['CS501', 'CS502', 'CS503', 'CS504']) {
    const cos = coDefinitions[courseCode];
    for (let aIdx = 0; aIdx < assessmentIds[courseCode].length; aIdx++) {
      const assessmentId = assessmentIds[courseCode][aIdx];
      const assessmentDef = assessmentDefs[aIdx];
      const maxPerCO = assessmentDef.maxMarks / cos.length;

      for (let sIdx = 0; sIdx < studentIds.length; sIdx++) {
        const studentId = studentIds[sIdx];
        // Student performance profile: top 20%, middle 60%, bottom 20%
        const perf = sIdx < 6 ? 0.85 : sIdx < 24 ? 0.70 : 0.50;
        const noise = (rng(sIdx * 100 + aIdx * 10 + courseCode.charCodeAt(2), -10, 10)) / 100;

        for (const co of cos) {
          const coId = coMap[`${courseCode}_${co.code}`];
          const coPerf = Math.max(0.25, Math.min(1.0, perf + noise + (rng(sIdx + co.number, -5, 5) / 100)));
          const marks = Math.max(0, Math.min(maxPerCO, Math.round(coPerf * maxPerCO * 10) / 10));

          const existing = await prisma.studentAssessmentMark.findFirst({
            where: { studentId, assessmentId, courseOutcomeId: coId },
          });
          if (!existing) {
            await prisma.studentAssessmentMark.create({
              data: { studentId, assessmentId, courseOutcomeId: coId, marksObtained: marks, isAbsent: false },
            });
          }
        }
      }
    }
  }

  // ─── 16. CCA ACTIVITIES ───────────────────────────────────────
  const ccaActivities = [
    {
      title: 'National Level Hackathon 2024',
      activityType: 'COMPETITION',
      description: 'Students participated in 24-hour coding hackathon',
      organizer: 'Tech Council',
      attainmentLevel: 3,
      numberOfActivities: 1,
      poMappings: { PO1: 3, PO2: 3, PO3: 3, PO4: 2, PO5: 3, PO9: 3, PO10: 2 },
    },
    {
      title: 'Guest Lecture: AI & Machine Learning',
      activityType: 'GUEST_LECTURE',
      description: 'Industry expert lecture on deep learning applications',
      organizer: 'CSE Dept',
      attainmentLevel: 2,
      numberOfActivities: 3,
      poMappings: { PO1: 2, PO2: 2, PO5: 2, PO12: 3 },
    },
    {
      title: 'Advanced Database Systems Workshop',
      activityType: 'WORKSHOP',
      description: 'Hands-on MongoDB and NoSQL workshop',
      organizer: 'DBMS Club',
      attainmentLevel: 3,
      numberOfActivities: 2,
      poMappings: { PO1: 3, PO2: 2, PO5: 3, PO3: 2 },
    },
    {
      title: 'Technical Paper Presentation',
      activityType: 'PRESENTATION',
      description: 'Students presented papers on emerging technologies',
      organizer: 'CSE Dept',
      attainmentLevel: 2,
      numberOfActivities: 5,
      poMappings: { PO10: 3, PO9: 2, PO12: 2 },
    },
    {
      title: 'Internship Program 2024',
      activityType: 'INTERNSHIP',
      description: 'Students completed 4-week industry internship',
      organizer: 'Training & Placement Cell',
      attainmentLevel: 3,
      numberOfActivities: 18,
      poMappings: { PO9: 3, PO10: 3, PO11: 3, PO12: 3, PO5: 2 },
    },
  ];

  for (const act of ccaActivities) {
    const existing = await prisma.ccaActivity.findFirst({
      where: { title: act.title, academicYearId: ay.id },
    });
    const activity = existing ?? await prisma.ccaActivity.create({
      data: {
        title: act.title,
        activityType: act.activityType,
        description: act.description,
        organizer: act.organizer,
        attainmentLevel: act.attainmentLevel,
        numberOfActivities: act.numberOfActivities,
        academicYearId: ay.id,
        programId: prog.id,
      },
    });

    for (const [poCode, mappingValue] of Object.entries(act.poMappings)) {
      const poId = poMap[poCode];
      if (!poId) continue;
      const existingMapping = await prisma.ccaPOMapping.findFirst({
        where: { ccaActivityId: activity.id, programOutcomeId: poId },
      });
      if (!existingMapping) {
        await prisma.ccaPOMapping.create({
          data: { ccaActivityId: activity.id, programOutcomeId: poId, mappingValue },
        });
      }
    }
  }

  // ─── 17. ECA ACTIVITIES ───────────────────────────────────────
  const ecaActivities = [
    {
      title: 'Intercollegiate Cultural Festival — Pravah',
      activityType: 'CULTURAL',
      description: 'Annual cultural festival with performances and competitions',
      organizer: 'Cultural Committee',
      attainmentLevel: 2,
      numberOfActivities: 1,
      poMappings: { PO9: 3, PO10: 2, PO8: 2 },
    },
    {
      title: 'NSS Annual Camp 2024',
      activityType: 'NSS',
      description: '7-day NSS camp at adopted village',
      organizer: 'NSS Unit',
      attainmentLevel: 3,
      numberOfActivities: 1,
      poMappings: { PO6: 3, PO7: 3, PO8: 3, PO9: 2, PO10: 2 },
    },
    {
      title: 'Sports Meet — District Level',
      activityType: 'SPORTS',
      description: 'Students represented college in district sports',
      organizer: 'Sports Committee',
      attainmentLevel: 2,
      numberOfActivities: 3,
      poMappings: { PO9: 3, PO8: 2 },
    },
    {
      title: 'Entrepreneurship Summit 2024',
      activityType: 'ENTREPRENEURSHIP',
      description: 'Business plan competition and startup showcase',
      organizer: 'E-Cell',
      attainmentLevel: 3,
      numberOfActivities: 1,
      poMappings: { PO11: 3, PO9: 2, PO10: 2, PO12: 3 },
    },
  ];

  for (const act of ecaActivities) {
    const existing = await prisma.ecaActivity.findFirst({
      where: { title: act.title, academicYearId: ay.id },
    });
    const activity = existing ?? await prisma.ecaActivity.create({
      data: {
        title: act.title,
        activityType: act.activityType,
        description: act.description,
        organizer: act.organizer,
        attainmentLevel: act.attainmentLevel,
        numberOfActivities: act.numberOfActivities,
        academicYearId: ay.id,
        programId: prog.id,
      },
    });

    for (const [poCode, mappingValue] of Object.entries(act.poMappings)) {
      const poId = poMap[poCode];
      if (!poId) continue;
      const existingMapping = await prisma.ecaPOMapping.findFirst({
        where: { ecaActivityId: activity.id, programOutcomeId: poId },
      });
      if (!existingMapping) {
        await prisma.ecaPOMapping.create({
          data: { ecaActivityId: activity.id, programOutcomeId: poId, mappingValue },
        });
      }
    }
  }

  // ─── 18. SURVEYS ─────────────────────────────────────────────
  // Exit Survey
  const exitSurvey = await prisma.survey.findFirst({
    where: { surveyType: 'EXIT', academicYearId: ay.id },
  }) ?? await prisma.survey.create({
    data: {
      title: 'Program Exit Survey 2024-25',
      surveyType: 'EXIT',
      academicYearId: ay.id,
      scaleMin: 1,
      scaleMax: 5,
      programId: prog.id,
      isActive: true,
    },
  });

  // Survey Questions mapped to POs
  const exitSurveyQuestions = [
    { text: 'The program provided strong technical knowledge in CS fundamentals.', poMappings: ['PO1', 'PO2'] },
    { text: 'The program enhanced my problem-solving and analytical abilities.', poMappings: ['PO2', 'PO4'] },
    { text: 'The program developed my ability to design software systems.', poMappings: ['PO3', 'PO5'] },
    { text: 'The program improved my communication and teamwork skills.', poMappings: ['PO9', 'PO10'] },
    { text: 'The program promoted awareness of professional ethics.', poMappings: ['PO8', 'PO6'] },
    { text: 'The program prepared me for lifelong learning.', poMappings: ['PO12'] },
  ];

  const exitSurveyQIds: number[] = [];
  for (const q of exitSurveyQuestions) {
    const existing = await prisma.surveyQuestion.findFirst({
      where: { surveyId: exitSurvey.id, questionText: q.text },
    });
    const question = existing ?? await prisma.surveyQuestion.create({
      data: { questionText: q.text, surveyId: exitSurvey.id, orderIndex: exitSurveyQIds.length + 1 },
    });
    exitSurveyQIds.push(question.id);

    for (const poCode of q.poMappings) {
      const poId = poMap[poCode];
      if (!poId) continue;
      const existingMap = await prisma.surveyQuestionPOMap.findFirst({
        where: { surveyQuestionId: question.id, programOutcomeId: poId },
      });
      if (!existingMap) {
        await prisma.surveyQuestionPOMap.create({
          data: { surveyQuestionId: question.id, programOutcomeId: poId },
        });
      }
    }
  }

  // Survey Responses from 25 graduating students
  for (let respIdx = 0; respIdx < 25; respIdx++) {
    let response = await prisma.surveyResponse.findFirst({
      where: { surveyId: exitSurvey.id, respondentId: studentIds[respIdx] },
    });
    if (!response) {
      response = await prisma.surveyResponse.create({
        data: {
          surveyId: exitSurvey.id,
          respondentId: studentIds[respIdx],
          submittedAt: new Date(),
        },
      });
    }

    // Response ratings: mostly 3-5, averaging ~4.2
    const ratings = [4, 5, 4, 4, 5, 4, 3, 5, 4, 3];
    for (let qIdx = 0; qIdx < exitSurveyQIds.length; qIdx++) {
      const rating = ratings[(respIdx + qIdx) % ratings.length];
      const existing = await prisma.surveyResponseDetail.findFirst({
        where: { surveyResponseId: response.id, surveyQuestionId: exitSurveyQIds[qIdx] },
      });
      if (!existing) {
        await prisma.surveyResponseDetail.create({
          data: { surveyResponseId: response.id, surveyQuestionId: exitSurveyQIds[qIdx], rating },
        });
      }
    }
  }

  // ─── 19. EMPLOYER SURVEY CATEGORIES ──────────────────────────
  const employerCategories = [
    { name: 'Job Specific Technical Skills', orderIndex: 1 },
    { name: 'Problem Solving & Critical Thinking Skills', orderIndex: 2 },
    { name: 'Individual and Team Work Skills', orderIndex: 3 },
    { name: 'Professional Ethics and Human Values', orderIndex: 4 },
    { name: 'Modern Tool Usage and IT Skills', orderIndex: 5 },
    { name: 'Verbal and Written Communication Skills', orderIndex: 6 },
    { name: 'Leadership and Management Skills', orderIndex: 7 },
    { name: 'Overall Job Performance', orderIndex: 8 },
    { name: 'Approach Towards Lifelong Learning', orderIndex: 9 },
  ];

  const empCatIds: number[] = [];
  for (const cat of employerCategories) {
    const existing = await prisma.employerSurveyCategory.findFirst({ where: { name: cat.name } });
    const record = existing ?? await prisma.employerSurveyCategory.create({ data: cat });
    empCatIds.push(record.id);
  }

  // Employer Survey responses from 10 companies
  const companies = [
    'TCS', 'Infosys', 'Wipro', 'Cognizant', 'HCL Technologies',
    'Accenture', 'Capgemini', 'Tech Mahindra', 'L&T Infotech', 'Mphasis',
  ];

  for (const company of companies) {
    const existing = await prisma.employerSurvey.findFirst({
      where: { companyName: company, academicYearId: ay.id },
    });
    const survey = existing ?? await prisma.employerSurvey.create({
      data: {
        companyName: company,
        respondentName: `HR Manager, ${company}`,
        respondentEmail: `hr@${company.toLowerCase().replace(/ /g, '')}.com`,
        academicYearId: ay.id,
      },
    });

    // Ratings: 3-5 for each category
    const catRatings = [4, 5, 5, 5, 4, 4, 3, 4, 4];
    for (let cIdx = 0; cIdx < empCatIds.length; cIdx++) {
      const existing = await prisma.employerSurveyRating.findFirst({
        where: { surveyId: survey.id, categoryId: empCatIds[cIdx] },
      });
      if (!existing) {
        await prisma.employerSurveyRating.create({
          data: { surveyId: survey.id, categoryId: empCatIds[cIdx], rating: catRatings[cIdx] },
        });
      }
    }
  }

  console.log('✅ OBE System seeded successfully!');
  console.log(`   → ${studentIds.length} students enrolled in ${Object.keys(courseMap).length} courses`);
  console.log(`   → ${poDefinitions.length} POs and ${psoDefinitions.length} PSOs seeded`);
  console.log(`   → ${Object.values(coDefinitions).flat().length} COs across all courses`);
  console.log(`   → Attainment thresholds, direct/indirect weights configured`);
  console.log(`   → ${ccaActivities.length} CCA + ${ecaActivities.length} ECA activities seeded`);
  console.log(`   → Exit survey with 25 responses, ${companies.length} employer survey responses`);
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
