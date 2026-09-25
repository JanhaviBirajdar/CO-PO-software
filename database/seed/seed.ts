// ============================================================
// OBE Attainment Management System — Database Seed
// DEMO DATA — Based on DYP COEI OBE Process Manual
// ============================================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting OBE database seed...');
  console.log('⚠️  This is DEMO DATA based on DYP COEI OBE Process Manual');

  // ─────────────────────────────────────────────
  // 1. DEPARTMENTS
  // ─────────────────────────────────────────────
  console.log('\n📦 Seeding departments...');

  const csDept = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      code: 'CS',
      name: 'Department of Computer Engineering',
      shortName: 'CS',
    },
  });

  const itDept = await prisma.department.upsert({
    where: { code: 'IT' },
    update: {},
    create: {
      code: 'IT',
      name: 'Department of Information Technology',
      shortName: 'IT',
    },
  });

  console.log(`  ✓ Departments created: ${csDept.name}, ${itDept.name}`);

  // ─────────────────────────────────────────────
  // 2. ACADEMIC YEAR
  // ─────────────────────────────────────────────
  console.log('\n📅 Seeding academic years...');

  const ay2324 = await prisma.academicYear.upsert({
    where: { year: '2023-24' },
    update: {},
    create: {
      year: '2023-24',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-05-31'),
      isCurrent: false,
    },
  });

  const ay2425 = await prisma.academicYear.upsert({
    where: { year: '2024-25' },
    update: {},
    create: {
      year: '2024-25',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-05-31'),
      isCurrent: true,
    },
  });

  console.log(`  ✓ Academic years: ${ay2324.year}, ${ay2425.year}`);

  // ─────────────────────────────────────────────
  // 3. PROGRAM
  // ─────────────────────────────────────────────
  console.log('\n🎓 Seeding programs...');

  const beTechCS = await prisma.program.upsert({
    where: { code_departmentId: { code: 'BE-CS', departmentId: csDept.id } },
    update: {},
    create: {
      code: 'BE-CS',
      name: 'Bachelor of Engineering in Computer Engineering',
      shortName: 'BE-CS',
      duration: 4,
      totalSemesters: 8,
      departmentId: csDept.id,
    },
  });

  console.log(`  ✓ Program: ${beTechCS.name}`);

  // ─────────────────────────────────────────────
  // 4. PROGRAM OUTCOMES (PO1–PO12)
  // ─────────────────────────────────────────────
  console.log('\n🎯 Seeding Program Outcomes (PO1–PO12)...');

  const poDefinitions = [
    { code: 'PO1',  number: 1,  description: 'Engineering knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.' },
    { code: 'PO2',  number: 2,  description: 'Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.' },
    { code: 'PO3',  number: 3,  description: 'Design/development of solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for public health and safety, and cultural, societal, and environmental considerations.' },
    { code: 'PO4',  number: 4,  description: 'Conduct investigations of complex problems: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.' },
    { code: 'PO5',  number: 5,  description: 'Modern tool usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.' },
    { code: 'PO6',  number: 6,  description: 'The engineer and society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal, and cultural issues and the consequent responsibilities relevant to the professional engineering practice.' },
    { code: 'PO7',  number: 7,  description: 'Environment and sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.' },
    { code: 'PO8',  number: 8,  description: 'Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.' },
    { code: 'PO9',  number: 9,  description: 'Individual and team work: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.' },
    { code: 'PO10', number: 10, description: 'Communication: Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.' },
    { code: 'PO11', number: 11, description: 'Project management and finance: Demonstrate knowledge and understanding of the engineering and management principles and apply these to one\'s own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.' },
    { code: 'PO12', number: 12, description: 'Life-long learning: Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.' },
  ];

  const poRecords: Record<string, any> = {};
  for (const po of poDefinitions) {
    const record = await prisma.programOutcome.upsert({
      where: { programId_code: { programId: beTechCS.id, code: po.code } },
      update: {},
      create: { ...po, programId: beTechCS.id },
    });
    poRecords[po.code] = record;
    process.stdout.write(`  ✓ ${po.code} `);
  }
  console.log('');

  // ─────────────────────────────────────────────
  // 5. PROGRAM SPECIFIC OUTCOMES (PSO1–PSO3)
  // ─────────────────────────────────────────────
  console.log('\n🎯 Seeding Program Specific Outcomes (PSO1–PSO3)...');

  const psoDefinitions = [
    { code: 'PSO1', number: 1, description: 'Professional Skills: The ability to understand, analyze and develop computer programs in the areas related to algorithms, system software, multimedia, web design, big data analytics, and networking for efficient design of computer-based systems of varying complexity.' },
    { code: 'PSO2', number: 2, description: 'Problem-Solving Skills: The ability to apply standard practices and strategies in software project development using open-ended programming environments to deliver a quality product for business success.' },
    { code: 'PSO3', number: 3, description: 'Successful Career and Entrepreneurship: The ability to employ modern computer languages, environments, and platforms in creating innovative career paths to be an entrepreneur, and a zest for higher studies.' },
  ];

  const psoRecords: Record<string, any> = {};
  for (const pso of psoDefinitions) {
    const record = await prisma.programSpecificOutcome.upsert({
      where: { programId_code: { programId: beTechCS.id, code: pso.code } },
      update: {},
      create: { ...pso, programId: beTechCS.id },
    });
    psoRecords[pso.code] = record;
    console.log(`  ✓ ${pso.code}: ${pso.description.substring(0, 60)}...`);
  }

  // ─────────────────────────────────────────────
  // 6. USERS (Super Admin, Admin, HOD, Faculty)
  // ─────────────────────────────────────────────
  console.log('\n👤 Seeding users...');

  const saltRounds = 10;

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@obe.edu' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'superadmin@obe.edu',
      password: await bcrypt.hash('SuperAdmin@12345', saltRounds),
      role: 'SUPER_ADMIN',
      departmentId: null,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@obe.edu' },
    update: {},
    create: {
      name: 'OBE Administrator',
      email: 'admin@obe.edu',
      password: await bcrypt.hash('Admin@12345', saltRounds),
      role: 'ADMIN',
      departmentId: csDept.id,
    },
  });

  const hod = await prisma.user.upsert({
    where: { email: 'hod.cs@obe.edu' },
    update: {},
    create: {
      name: 'Dr. R. S. Sharma',
      email: 'hod.cs@obe.edu',
      password: await bcrypt.hash('Hod@12345', saltRounds),
      role: 'HOD',
      departmentId: csDept.id,
    },
  });

  const faculty1 = await prisma.user.upsert({
    where: { email: 'faculty1.cs@obe.edu' },
    update: {},
    create: {
      name: 'Prof. A. K. Patil',
      email: 'faculty1.cs@obe.edu',
      password: await bcrypt.hash('Faculty@12345', saltRounds),
      role: 'FACULTY',
      departmentId: csDept.id,
    },
  });

  const faculty2 = await prisma.user.upsert({
    where: { email: 'faculty2.cs@obe.edu' },
    update: {},
    create: {
      name: 'Prof. S. M. Desai',
      email: 'faculty2.cs@obe.edu',
      password: await bcrypt.hash('Faculty@12345', saltRounds),
      role: 'FACULTY',
      departmentId: csDept.id,
    },
  });

  const faculty3 = await prisma.user.upsert({
    where: { email: 'faculty3.cs@obe.edu' },
    update: {},
    create: {
      name: 'Prof. P. N. Kulkarni',
      email: 'faculty3.cs@obe.edu',
      password: await bcrypt.hash('Faculty@12345', saltRounds),
      role: 'FACULTY',
      departmentId: csDept.id,
    },
  });

  console.log('  ✓ Super Admin, Admin, HOD, Faculty (×3) created');
  console.log('  ℹ️  Credentials documented in SETUP.md');

  // ─────────────────────────────────────────────
  // 7. BATCH & SEMESTER
  // ─────────────────────────────────────────────
  console.log('\n📚 Seeding batch and semesters...');

  const batch2022 = await prisma.batch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '2022-2026',
      startYear: 2022,
      endYear: 2026,
      programId: beTechCS.id,
      departmentId: csDept.id,
      academicYearId: ay2425.id,
    },
  });

  // Semester V (SY BE Sem 5) - 2024-25
  const semesterV = await prisma.semester.upsert({
    where: { batchId_number: { batchId: batch2022.id, number: 5 } },
    update: {},
    create: {
      number: 5,
      name: 'Semester V',
      batchId: batch2022.id,
    },
  });

  const semesterVI = await prisma.semester.upsert({
    where: { batchId_number: { batchId: batch2022.id, number: 6 } },
    update: {},
    create: {
      number: 6,
      name: 'Semester VI',
      batchId: batch2022.id,
    },
  });

  console.log(`  ✓ Batch: ${batch2022.name}, Semesters V & VI`);

  // ─────────────────────────────────────────────
  // 8. COURSES (from OBE manual)
  // ─────────────────────────────────────────────
  console.log('\n📖 Seeding courses...');

  const coursesData = [
    // Sem V
    { code: 'ES110CS', name: 'Computer Programming and Problem Solving using C', credits: 3, courseType: 'THEORY' as const, semesterId: semesterV.id },
    { code: 'PC440CS', name: 'Computer Architecture', credits: 3, courseType: 'THEORY' as const, semesterId: semesterV.id },
    { code: 'PC510CS', name: 'Database Management Systems', credits: 3, courseType: 'THEORY' as const, semesterId: semesterV.id },
    { code: 'PC520CS', name: 'Microprocessors and Interfacing', credits: 3, courseType: 'THEORY' as const, semesterId: semesterV.id },
    { code: 'PC411CS', name: 'Java Lab', credits: 2, courseType: 'LAB' as const, semesterId: semesterV.id },
    { code: 'PC421CS', name: 'Operating System Lab', credits: 2, courseType: 'LAB' as const, semesterId: semesterV.id },
    { code: 'PC511CS', name: 'Database Management Systems Lab', credits: 2, courseType: 'LAB' as const, semesterId: semesterV.id },
    { code: 'PC521CS', name: 'Microprocessors and Interfacing Lab', credits: 2, courseType: 'LAB' as const, semesterId: semesterV.id },
    { code: 'PC531CS', name: 'Computer Network Lab', credits: 2, courseType: 'LAB' as const, semesterId: semesterV.id },
    { code: 'PW519CS', name: 'Mini Project', credits: 2, courseType: 'PROJECT' as const, semesterId: semesterV.id },
    // Sem VI
    { code: 'PC610CS', name: 'Web Programming & Services', credits: 3, courseType: 'THEORY' as const, semesterId: semesterVI.id },
  ];

  const courseRecords: Record<string, any> = {};
  for (const c of coursesData) {
    const { semesterId, ...rest } = c;
    const record = await prisma.course.upsert({
      where: { code_academicYearId_semesterId: { code: c.code, academicYearId: ay2425.id, semesterId } },
      update: {},
      create: {
        ...rest,
        programId: beTechCS.id,
        semesterId,
        academicYearId: ay2425.id,
      },
    });
    courseRecords[c.code] = record;
    console.log(`  ✓ ${c.code} — ${c.name}`);
  }

  // Assign faculty to courses
  await prisma.courseFaculty.createMany({
    skipDuplicates: true,
    data: [
      { courseId: courseRecords['PC510CS'].id, userId: faculty1.id },
      { courseId: courseRecords['PC520CS'].id, userId: faculty2.id },
      { courseId: courseRecords['PC511CS'].id, userId: faculty1.id },
      { courseId: courseRecords['PC521CS'].id, userId: faculty2.id },
      { courseId: courseRecords['PC531CS'].id, userId: faculty3.id },
      { courseId: courseRecords['PW519CS'].id, userId: faculty1.id },
      { courseId: courseRecords['ES110CS'].id, userId: faculty3.id },
      { courseId: courseRecords['PC440CS'].id, userId: faculty2.id },
      { courseId: courseRecords['PC411CS'].id, userId: faculty3.id },
      { courseId: courseRecords['PC421CS'].id, userId: faculty1.id },
      { courseId: courseRecords['PC610CS'].id, userId: faculty2.id },
    ],
  });
  console.log('  ✓ Faculty assigned to courses');

  // ─────────────────────────────────────────────
  // 9. COURSE OUTCOMES (per course)
  // ─────────────────────────────────────────────
  console.log('\n📋 Seeding Course Outcomes...');

  // Helper: create COs for a course
  async function createCOs(courseCode: string, outcomes: { code: string; description: string; bloomsLevel?: number }[]) {
    const course = courseRecords[courseCode];
    const coList: any[] = [];
    for (let i = 0; i < outcomes.length; i++) {
      const co = await prisma.courseOutcome.upsert({
        where: { courseId_code: { courseId: course.id, code: outcomes[i].code } },
        update: {},
        create: {
          code: outcomes[i].code,
          number: i + 1,
          description: outcomes[i].description,
          bloomsLevel: outcomes[i].bloomsLevel ?? null,
          courseId: course.id,
        },
      });
      coList.push(co);
    }
    return coList;
  }

  // PC510CS — DBMS
  const dbmsCOs = await createCOs('PC510CS', [
    { code: 'CO1', description: 'Understand fundamental concepts of database management systems, data models, and schemas.', bloomsLevel: 2 },
    { code: 'CO2', description: 'Apply normalization techniques to design an efficient relational database schema.', bloomsLevel: 3 },
    { code: 'CO3', description: 'Use SQL to create, query, and manipulate relational databases.', bloomsLevel: 3 },
    { code: 'CO4', description: 'Analyze transaction management, concurrency control, and recovery techniques.', bloomsLevel: 4 },
    { code: 'CO5', description: 'Evaluate advanced topics such as distributed databases, NoSQL, and database security.', bloomsLevel: 5 },
  ]);

  // ES110CS — C Programming
  const cProgCOs = await createCOs('ES110CS', [
    { code: 'CO1', description: 'Understand the fundamentals of C programming language and problem-solving techniques.', bloomsLevel: 2 },
    { code: 'CO2', description: 'Apply control structures, functions, arrays, and pointers in C programs.', bloomsLevel: 3 },
    { code: 'CO3', description: 'Design programs using structures, file handling, and dynamic memory allocation.', bloomsLevel: 3 },
    { code: 'CO4', description: 'Analyze and debug complex C programs for correctness and efficiency.', bloomsLevel: 4 },
    { code: 'CO5', description: 'Develop modular programs solving real-world computational problems.', bloomsLevel: 5 },
  ]);

  // PC440CS — Computer Architecture
  const cArchCOs = await createCOs('PC440CS', [
    { code: 'CO1', description: 'Explain the organization of computer hardware including CPU, memory, and I/O.', bloomsLevel: 2 },
    { code: 'CO2', description: 'Analyze instruction set architectures and assembly language programming.', bloomsLevel: 4 },
    { code: 'CO3', description: 'Apply memory hierarchy concepts including cache and virtual memory.', bloomsLevel: 3 },
    { code: 'CO4', description: 'Evaluate pipeline and parallel processing architectures.', bloomsLevel: 5 },
    { code: 'CO5', description: 'Understand I/O systems, RISC/CISC architectures, and performance metrics.', bloomsLevel: 2 },
  ]);

  // PC520CS — Microprocessors
  const mpCOs = await createCOs('PC520CS', [
    { code: 'CO1', description: 'Understand the architecture and instruction set of 8086 microprocessor.', bloomsLevel: 2 },
    { code: 'CO2', description: 'Write and execute assembly language programs for 8086.', bloomsLevel: 3 },
    { code: 'CO3', description: 'Apply interfacing techniques for memory and I/O devices.', bloomsLevel: 3 },
    { code: 'CO4', description: 'Analyze interrupt structure and DMA controller operations.', bloomsLevel: 4 },
    { code: 'CO5', description: 'Design microprocessor-based systems for practical applications.', bloomsLevel: 5 },
  ]);

  console.log('  ✓ COs created for PC510CS, ES110CS, PC440CS, PC520CS');

  // ─────────────────────────────────────────────
  // 10. CO-PO MAPPING (for PC510CS — DBMS)
  // ─────────────────────────────────────────────
  console.log('\n🗺️  Seeding CO-PO Mappings (PC510CS)...');

  // Matrix from OBE manual style for DBMS
  // CO × PO mapping values (0=none, 1=low, 2=medium, 3=high)
  const dbmsCOPOMatrix = [
    //   PO1 PO2 PO3 PO4 PO5 PO6 PO7 PO8 PO9 PO10 PO11 PO12
    [3,  2,  1,  0,  2,  0,  0,  0,  0,  0,   0,   2],  // CO1
    [2,  3,  3,  1,  2,  0,  0,  0,  0,  0,   0,   2],  // CO2
    [2,  2,  3,  3,  3,  0,  0,  0,  2,  1,   0,   2],  // CO3
    [2,  3,  2,  3,  2,  0,  0,  0,  0,  0,   0,   2],  // CO4
    [1,  2,  2,  2,  3,  1,  1,  0,  0,  0,   0,   3],  // CO5
  ];

  const poKeys = ['PO1','PO2','PO3','PO4','PO5','PO6','PO7','PO8','PO9','PO10','PO11','PO12'];

  for (let coIdx = 0; coIdx < dbmsCOs.length; coIdx++) {
    for (let poIdx = 0; poIdx < poKeys.length; poIdx++) {
      const val = dbmsCOPOMatrix[coIdx][poIdx];
      if (val > 0) {
        await prisma.coPOMapping.upsert({
          where: {
            courseOutcomeId_programOutcomeId: {
              courseOutcomeId: dbmsCOs[coIdx].id,
              programOutcomeId: poRecords[poKeys[poIdx]].id,
            }
          },
          update: { mappingValue: val },
          create: {
            courseOutcomeId: dbmsCOs[coIdx].id,
            programOutcomeId: poRecords[poKeys[poIdx]].id,
            mappingValue: val,
          },
        });
      }
    }
  }
  console.log('  ✓ CO-PO matrix seeded for DBMS (5×12)');

  // ─────────────────────────────────────────────
  // 11. CO-PSO MAPPING (for PC510CS)
  // ─────────────────────────────────────────────
  console.log('\n🗺️  Seeding CO-PSO Mappings...');

  const dbmsCOPSOMatrix = [
    // PSO1 PSO2 PSO3
    [3,   2,   1],  // CO1
    [2,   3,   2],  // CO2
    [3,   3,   3],  // CO3
    [3,   2,   2],  // CO4
    [2,   3,   3],  // CO5
  ];

  const psoKeys = ['PSO1','PSO2','PSO3'];
  for (let coIdx = 0; coIdx < dbmsCOs.length; coIdx++) {
    for (let psoIdx = 0; psoIdx < psoKeys.length; psoIdx++) {
      const val = dbmsCOPSOMatrix[coIdx][psoIdx];
      if (val > 0) {
        await prisma.coPSOMapping.upsert({
          where: {
            courseOutcomeId_programSpecificOutcomeId: {
              courseOutcomeId: dbmsCOs[coIdx].id,
              programSpecificOutcomeId: psoRecords[psoKeys[psoIdx]].id,
            }
          },
          update: { mappingValue: val },
          create: {
            courseOutcomeId: dbmsCOs[coIdx].id,
            programSpecificOutcomeId: psoRecords[psoKeys[psoIdx]].id,
            mappingValue: val,
          },
        });
      }
    }
  }
  console.log('  ✓ CO-PSO matrix seeded for DBMS (5×3)');

  // ─────────────────────────────────────────────
  // 12. ATTAINMENT CONFIGURATION
  // ─────────────────────────────────────────────
  console.log('\n⚙️  Seeding attainment configuration...');

  const thresholds = [
    { level: 3, label: 'Level 3', minPercentage: 70, maxPercentage: 100, attainmentValue: 3.00 },
    { level: 2, label: 'Level 2', minPercentage: 60, maxPercentage: 69.99, attainmentValue: 2.00 },
    { level: 1, label: 'Level 1', minPercentage: 50, maxPercentage: 59.99, attainmentValue: 1.00 },
    { level: 0, label: 'Level 0', minPercentage: 0,  maxPercentage: 49.99, attainmentValue: 0.00 },
  ];

  for (const t of thresholds) {
    await prisma.attainmentThreshold.upsert({
      where: { id: t.level + 1 },
      update: {},
      create: {
        level: t.level,
        label: t.label,
        minPercentage: t.minPercentage,
        maxPercentage: t.maxPercentage,
        attainmentValue: t.attainmentValue,
        programId: null, // global default
      },
    });
  }
  console.log('  ✓ Attainment thresholds (Level 0–3) configured');

  // Assessment weight configuration (global defaults)
  const assessmentWeights = [
    { assessmentType: 'INTERNAL' as const,     weightage: 20 },
    { assessmentType: 'MID_SEMESTER' as const, weightage: 20 },
    { assessmentType: 'END_SEMESTER' as const, weightage: 60 },
    { assessmentType: 'LAB' as const,          weightage: 50 },
    { assessmentType: 'ASSIGNMENT' as const,   weightage: 20 },
    { assessmentType: 'PROJECT' as const,      weightage: 60 },
    { assessmentType: 'PRACTICAL' as const,    weightage: 30 },
  ];

  for (const w of assessmentWeights) {
    await prisma.assessmentWeightConfig.upsert({
      where: { programId_assessmentType: { programId: null as any, assessmentType: w.assessmentType } },
      update: {},
      create: { ...w, programId: null },
    }).catch(async () => {
      // Handle null programId upsert - create if not exists
      const existing = await prisma.assessmentWeightConfig.findFirst({
        where: { assessmentType: w.assessmentType, programId: null }
      });
      if (!existing) {
        await prisma.assessmentWeightConfig.create({ data: { ...w, programId: null } });
      }
    });
  }
  console.log('  ✓ Assessment weight configs seeded');

  // Direct/Indirect weight config (global)
  const existingDIConfig = await prisma.directIndirectWeightConfig.findFirst({
    where: { programId: null }
  });
  if (!existingDIConfig) {
    await prisma.directIndirectWeightConfig.create({
      data: {
        directWeight: 80,
        indirectWeight: 20,
        programId: null,
      }
    });
  }
  console.log('  ✓ Direct/Indirect weight: 80% / 20%');

  // ─────────────────────────────────────────────
  // 13. STUDENTS (sample)
  // ─────────────────────────────────────────────
  console.log('\n🎒 Seeding sample students...');

  const studentsData = [
    { rollNumber: 'CS22001', name: 'Arjun Mehta',     email: 'arjun@student.edu' },
    { rollNumber: 'CS22002', name: 'Priya Sharma',    email: 'priya@student.edu' },
    { rollNumber: 'CS22003', name: 'Rohan Patil',     email: 'rohan@student.edu' },
    { rollNumber: 'CS22004', name: 'Sneha Desai',     email: 'sneha@student.edu' },
    { rollNumber: 'CS22005', name: 'Vikram Singh',    email: 'vikram@student.edu' },
    { rollNumber: 'CS22006', name: 'Ananya Kumar',    email: 'ananya@student.edu' },
    { rollNumber: 'CS22007', name: 'Rahul Joshi',     email: 'rahul@student.edu' },
    { rollNumber: 'CS22008', name: 'Divya Nair',      email: 'divya@student.edu' },
    { rollNumber: 'CS22009', name: 'Karan Gupta',     email: 'karan@student.edu' },
    { rollNumber: 'CS22010', name: 'Meera Pillai',    email: 'meera@student.edu' },
    { rollNumber: 'CS22011', name: 'Suresh Reddy',    email: 'suresh@student.edu' },
    { rollNumber: 'CS22012', name: 'Aishwarya Rao',   email: 'aishwarya@student.edu' },
    { rollNumber: 'CS22013', name: 'Nikhil Verma',    email: 'nikhil@student.edu' },
    { rollNumber: 'CS22014', name: 'Pooja Iyer',      email: 'pooja@student.edu' },
    { rollNumber: 'CS22015', name: 'Aditya Bhatt',    email: 'aditya@student.edu' },
    { rollNumber: 'CS22016', name: 'Kavya Shenoy',    email: 'kavya@student.edu' },
    { rollNumber: 'CS22017', name: 'Ravi Krishnan',   email: 'ravi@student.edu' },
    { rollNumber: 'CS22018', name: 'Tanvi Mishra',    email: 'tanvi@student.edu' },
    { rollNumber: 'CS22019', name: 'Siddharth Nair',  email: 'sid@student.edu' },
    { rollNumber: 'CS22020', name: 'Ayesha Khan',     email: 'ayesha@student.edu' },
  ];

  const studentRecords: any[] = [];
  for (const s of studentsData) {
    const student = await prisma.student.upsert({
      where: { rollNumber_batchId: { rollNumber: s.rollNumber, batchId: batch2022.id } },
      update: {},
      create: { ...s, batchId: batch2022.id },
    });
    studentRecords.push(student);
  }
  console.log(`  ✓ ${studentsData.length} students created`);

  // Enroll all students in PC510CS (DBMS)
  const dbmsCourse = courseRecords['PC510CS'];
  await prisma.studentCourse.createMany({
    skipDuplicates: true,
    data: studentRecords.map(s => ({ studentId: s.id, courseId: dbmsCourse.id })),
  });
  console.log(`  ✓ ${studentRecords.length} students enrolled in PC510CS`);

  // ─────────────────────────────────────────────
  // 14. ASSESSMENTS & MARKS (PC510CS)
  // ─────────────────────────────────────────────
  console.log('\n📝 Seeding assessments and marks...');

  // Create Internal Assessment for DBMS
  const internalAssessment = await prisma.assessment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Internal Assessment 1',
      assessmentType: 'INTERNAL',
      maxMarks: 20,
      weightage: 20,
      courseId: dbmsCourse.id,
      conductedDate: new Date('2024-09-15'),
    },
  });

  const endSemAssessment = await prisma.assessment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'End Semester Examination',
      assessmentType: 'END_SEMESTER',
      maxMarks: 60,
      weightage: 60,
      courseId: dbmsCourse.id,
      conductedDate: new Date('2024-11-20'),
    },
  });

  // Map assessments to COs with max marks per CO
  for (const co of dbmsCOs) {
    await prisma.assessmentCO.createMany({
      skipDuplicates: true,
      data: [
        { assessmentId: internalAssessment.id, courseOutcomeId: co.id, maxMarks: 4, weightage: 20 },
        { assessmentId: endSemAssessment.id,   courseOutcomeId: co.id, maxMarks: 12, weightage: 60 },
      ],
    });
  }
  console.log('  ✓ Assessment CO mappings created');

  // Sample marks for students in Internal Assessment
  // Each student gets marks for each CO (random but realistic)
  const internalMarksData = [
    // studentIdx → [CO1, CO2, CO3, CO4, CO5] marks out of 4
    [3.5, 3.0, 3.5, 3.0, 3.5],
    [2.5, 3.0, 3.5, 2.5, 3.0],
    [4.0, 4.0, 4.0, 3.5, 4.0],
    [3.0, 2.5, 3.0, 3.0, 2.5],
    [3.5, 3.5, 3.5, 3.5, 3.5],
    [2.0, 2.5, 2.0, 2.5, 2.0],
    [4.0, 3.5, 4.0, 4.0, 3.5],
    [3.0, 3.0, 3.5, 3.0, 3.5],
    [2.5, 2.0, 2.5, 2.0, 2.5],
    [3.5, 4.0, 3.5, 3.5, 4.0],
    [3.0, 2.5, 3.0, 2.5, 3.0],
    [4.0, 3.5, 3.5, 4.0, 3.5],
    [2.0, 2.0, 2.5, 2.0, 2.5],
    [3.5, 3.0, 3.0, 3.5, 3.0],
    [4.0, 4.0, 4.0, 4.0, 4.0],
    [3.0, 3.0, 2.5, 3.0, 2.5],
    [2.5, 3.0, 3.0, 2.5, 3.0],
    [3.5, 3.5, 4.0, 3.5, 4.0],
    [2.0, 2.5, 2.0, 2.5, 2.0],
    [4.0, 3.5, 4.0, 3.5, 4.0],
  ];

  for (let si = 0; si < studentRecords.length; si++) {
    for (let ci = 0; ci < dbmsCOs.length; ci++) {
      await prisma.studentAssessmentMark.upsert({
        where: {
          studentId_assessmentId_courseOutcomeId: {
            studentId: studentRecords[si].id,
            assessmentId: internalAssessment.id,
            courseOutcomeId: dbmsCOs[ci].id,
          }
        },
        update: {},
        create: {
          studentId: studentRecords[si].id,
          assessmentId: internalAssessment.id,
          courseOutcomeId: dbmsCOs[ci].id,
          marksObtained: internalMarksData[si][ci],
        },
      });
    }
  }
  console.log(`  ✓ Internal Assessment marks seeded for ${studentRecords.length} students × 5 COs`);

  // End Sem marks (out of 12 per CO)
  const endSemMarksData = [
    [10, 9, 10, 9, 10],
    [8,  9, 10, 8,  9],
    [12, 12, 11, 11, 12],
    [9,  8,  9,  9,  8],
    [10, 10, 11, 10, 10],
    [7,  8,  7,  8,  7],
    [12, 11, 12, 12, 11],
    [9,  9, 10,  9, 10],
    [8,  7,  8,  7,  8],
    [10, 11, 10, 10, 12],
    [9,  8,  9,  8,  9],
    [12, 11, 11, 12, 11],
    [7,  7,  8,  7,  8],
    [10, 10,  9, 11,  9],
    [12, 12, 12, 12, 12],
    [9,  9,  8,  9,  8],
    [8,  9,  9,  8,  9],
    [11, 10, 12, 11, 12],
    [7,  8,  7,  8,  7],
    [12, 11, 12, 11, 12],
  ];

  for (let si = 0; si < studentRecords.length; si++) {
    for (let ci = 0; ci < dbmsCOs.length; ci++) {
      await prisma.studentAssessmentMark.upsert({
        where: {
          studentId_assessmentId_courseOutcomeId: {
            studentId: studentRecords[si].id,
            assessmentId: endSemAssessment.id,
            courseOutcomeId: dbmsCOs[ci].id,
          }
        },
        update: {},
        create: {
          studentId: studentRecords[si].id,
          assessmentId: endSemAssessment.id,
          courseOutcomeId: dbmsCOs[ci].id,
          marksObtained: endSemMarksData[si][ci],
        },
      });
    }
  }
  console.log(`  ✓ End Semester marks seeded for ${studentRecords.length} students × 5 COs`);

  // ─────────────────────────────────────────────
  // 15. CCA ACTIVITIES
  // ─────────────────────────────────────────────
  console.log('\n🏆 Seeding CCA Activities...');

  const ccaData = [
    { name: 'Guest Lectures', attainmentLevel: 2 },
    { name: 'Workshops', attainmentLevel: 2 },
    { name: 'Student Competitions', attainmentLevel: 3 },
    { name: 'Internships', attainmentLevel: 3 },
    { name: 'Student Presentations', attainmentLevel: 2 },
    { name: 'Campus Recruitment Training (CRT)', attainmentLevel: 3 },
  ];

  const ccaRecords: any[] = [];
  for (const cca of ccaData) {
    const record = await prisma.ccaActivity.create({
      data: {
        name: cca.name,
        description: `${cca.name} conducted for AY 2024-25`,
        numberOfEvents: Math.floor(Math.random() * 5) + 1,
        attainmentLevel: cca.attainmentLevel,
        academicYearId: ay2425.id,
      },
    });
    ccaRecords.push(record);
    console.log(`  ✓ CCA: ${cca.name}`);
  }

  // CCA → PO mappings (from OBE manual)
  const ccaPOMappingMatrix = [
    // PO1 PO2 PO3 PO4 PO5 PO6 PO7 PO8 PO9 PO10 PO11 PO12
    [2,  2,  0,  0,  2,  0,  0,  0,  2,  2,   2,   3],  // Guest Lectures
    [2,  2,  2,  2,  2,  0,  0,  0,  2,  2,   2,   3],  // Workshops
    [3,  3,  3,  3,  3,  0,  0,  0,  3,  3,   3,   3],  // Competitions
    [3,  2,  2,  0,  3,  2,  0,  0,  3,  2,   3,   3],  // Internships
    [2,  2,  0,  0,  0,  0,  0,  0,  2,  3,   2,   2],  // Presentations
    [2,  2,  0,  0,  2,  0,  0,  0,  2,  2,   2,   3],  // CRT
  ];

  for (let ccaIdx = 0; ccaIdx < ccaRecords.length; ccaIdx++) {
    for (let poIdx = 0; poIdx < poKeys.length; poIdx++) {
      const val = ccaPOMappingMatrix[ccaIdx][poIdx];
      if (val > 0) {
        await prisma.ccaPOMapping.create({
          data: {
            ccaActivityId: ccaRecords[ccaIdx].id,
            programOutcomeId: poRecords[poKeys[poIdx]].id,
            mappingValue: val,
          },
        });
      }
    }
  }
  console.log('  ✓ CCA→PO mappings seeded');

  // ─────────────────────────────────────────────
  // 16. ECA ACTIVITIES
  // ─────────────────────────────────────────────
  console.log('\n🎭 Seeding ECA Activities...');

  const ecaData = [
    { name: 'ECA Clubs', category: 'CLUBS', attainmentLevel: 2 },
    { name: 'Entrepreneurship Activities', category: 'ENTREPRENEURSHIP', attainmentLevel: 3 },
    { name: 'NSS Activities', category: 'NSS', attainmentLevel: 2 },
    { name: 'Sports', category: 'SPORTS', attainmentLevel: 2 },
    { name: 'Literary Activities', category: 'LITERARY', attainmentLevel: 2 },
    { name: 'Cultural Activities', category: 'CULTURAL', attainmentLevel: 2 },
  ];

  const ecaRecords: any[] = [];
  for (const eca of ecaData) {
    const record = await prisma.ecaActivity.create({
      data: {
        name: eca.name,
        category: eca.category,
        description: `${eca.name} for AY 2024-25`,
        numberOfEvents: Math.floor(Math.random() * 3) + 1,
        attainmentLevel: eca.attainmentLevel,
        academicYearId: ay2425.id,
      },
    });
    ecaRecords.push(record);
    console.log(`  ✓ ECA: ${eca.name}`);
  }

  // ECA → PO mappings
  const ecaPOMappingMatrix = [
    // PO1 PO2 PO3 PO4 PO5 PO6 PO7 PO8 PO9 PO10 PO11 PO12
    [0,  0,  0,  0,  0,  2,  0,  2,  3,  2,   2,   2],  // ECA Clubs
    [0,  0,  3,  0,  3,  2,  0,  0,  3,  2,   3,   3],  // Entrepreneurship
    [0,  0,  0,  0,  0,  3,  3,  2,  2,  2,   2,   2],  // NSS
    [0,  0,  0,  0,  0,  0,  0,  0,  3,  0,   0,   2],  // Sports
    [0,  0,  0,  0,  0,  2,  0,  0,  2,  3,   0,   2],  // Literary
    [0,  0,  0,  0,  0,  2,  0,  2,  3,  2,   0,   2],  // Cultural
  ];

  for (let ecaIdx = 0; ecaIdx < ecaRecords.length; ecaIdx++) {
    for (let poIdx = 0; poIdx < poKeys.length; poIdx++) {
      const val = ecaPOMappingMatrix[ecaIdx][poIdx];
      if (val > 0) {
        await prisma.ecaPOMapping.create({
          data: {
            ecaActivityId: ecaRecords[ecaIdx].id,
            programOutcomeId: poRecords[poKeys[poIdx]].id,
            mappingValue: val,
          },
        });
      }
    }
  }
  console.log('  ✓ ECA→PO mappings seeded');

  // ─────────────────────────────────────────────
  // 17. SURVEYS
  // ─────────────────────────────────────────────
  console.log('\n📊 Seeding Surveys...');

  // Alumni Survey
  const alumniSurvey = await prisma.survey.create({
    data: {
      title: 'Alumni Satisfaction Survey 2024-25',
      description: 'Annual survey to assess alumni satisfaction with the program.',
      surveyType: 'ALUMNI',
      scaleMin: 1,
      scaleMax: 5,
      academicYearId: ay2425.id,
    },
  });

  const alumniQuestions = [
    'The program equipped me with strong technical knowledge relevant to my field.',
    'The curriculum helped develop my problem-solving and analytical skills.',
    'The practical sessions and labs were effective in building hands-on skills.',
    'The program prepared me well for industry expectations and work environment.',
    'I feel confident in communicating technical concepts to colleagues and clients.',
  ];

  const alumniQRecords: any[] = [];
  for (let i = 0; i < alumniQuestions.length; i++) {
    const q = await prisma.surveyQuestion.create({
      data: {
        questionNo: i + 1,
        questionText: alumniQuestions[i],
        surveyId: alumniSurvey.id,
      },
    });
    alumniQRecords.push(q);
  }
  console.log('  ✓ Alumni Survey with 5 questions created');

  // Map alumni questions to POs
  const alumniQPOMappings = [
    ['PO1', 'PO2'],        // Q1 → PO1, PO2
    ['PO2', 'PO4'],        // Q2 → PO2, PO4
    ['PO3', 'PO5'],        // Q3 → PO3, PO5
    ['PO9', 'PO11'],       // Q4 → PO9, PO11
    ['PO10'],              // Q5 → PO10
  ];

  for (let qi = 0; qi < alumniQRecords.length; qi++) {
    for (const poCode of alumniQPOMappings[qi]) {
      await prisma.surveyQuestionPOMap.create({
        data: {
          surveyQuestionId: alumniQRecords[qi].id,
          programOutcomeId: poRecords[poCode].id,
        },
      });
    }
  }

  // Create 10 alumni survey responses
  const alumniRatingsData = [
    [4, 4, 5, 4, 4],
    [5, 5, 4, 5, 5],
    [4, 3, 4, 4, 4],
    [5, 4, 5, 5, 4],
    [3, 4, 3, 4, 4],
    [4, 5, 4, 4, 5],
    [5, 4, 5, 5, 5],
    [4, 4, 4, 3, 4],
    [5, 5, 5, 5, 5],
    [4, 3, 4, 4, 3],
  ];

  for (let ri = 0; ri < alumniRatingsData.length; ri++) {
    const response = await prisma.surveyResponse.create({
      data: {
        respondentName: `Alumni ${ri + 1}`,
        respondentEmail: `alumni${ri + 1}@example.com`,
        surveyId: alumniSurvey.id,
      },
    });
    for (let qi = 0; qi < alumniQRecords.length; qi++) {
      await prisma.surveyResponseDetail.create({
        data: {
          responseId: response.id,
          surveyQuestionId: alumniQRecords[qi].id,
          rating: alumniRatingsData[ri][qi],
        },
      });
    }
  }
  console.log('  ✓ 10 Alumni survey responses seeded');

  // ─────────────────────────────────────────────
  // 18. EMPLOYER SURVEY
  // ─────────────────────────────────────────────
  console.log('\n🏢 Seeding Employer Survey...');

  const empCategories = [
    'Job Specific Skills',
    'Problem Solving Skills',
    'Individual and Team Work Skills',
    'Human Values and Professional Ethical Values',
    'Modern Tool Usage',
    'Verbal & Written Communication Capabilities',
    'Leadership Skills',
    'Overall Job Performance',
    'Approach Towards Lifelong Learning Skills',
  ];

  const empCatRecords: any[] = [];
  for (let i = 0; i < empCategories.length; i++) {
    const cat = await prisma.employerSurveyCategory.create({
      data: {
        name: empCategories[i],
        orderIndex: i + 1,
      },
    });
    empCatRecords.push(cat);
  }

  // Create 5 employer survey submissions
  const empRatingsData = [
    [4, 4, 4, 5, 4, 4, 3, 4, 4],
    [5, 4, 5, 4, 5, 4, 4, 5, 5],
    [4, 5, 4, 5, 4, 5, 4, 4, 4],
    [3, 4, 4, 4, 4, 4, 4, 4, 4],
    [5, 5, 5, 5, 4, 5, 5, 5, 5],
  ];

  const employers = [
    { companyName: 'Infosys Ltd.', respondentName: 'Mr. R. Kumar' },
    { companyName: 'TCS', respondentName: 'Ms. P. Shah' },
    { companyName: 'Wipro Technologies', respondentName: 'Mr. A. Joshi' },
    { companyName: 'HCL Technologies', respondentName: 'Ms. S. Gupta' },
    { companyName: 'Tech Mahindra', respondentName: 'Mr. V. Patel' },
  ];

  for (let ei = 0; ei < employers.length; ei++) {
    const empSurvey = await prisma.employerSurvey.create({
      data: {
        companyName: employers[ei].companyName,
        respondentName: employers[ei].respondentName,
        respondentEmail: `employer${ei + 1}@company.com`,
        academicYearId: ay2425.id,
      },
    });
    for (let ci = 0; ci < empCatRecords.length; ci++) {
      await prisma.employerSurveyRating.create({
        data: {
          surveyId: empSurvey.id,
          categoryId: empCatRecords[ci].id,
          rating: empRatingsData[ei][ci],
        },
      });
    }
  }
  console.log(`  ✓ ${employers.length} employer surveys seeded`);

  // ─────────────────────────────────────────────
  // 19. OBE SETTINGS
  // ─────────────────────────────────────────────
  console.log('\n⚙️  Seeding OBE Settings...');

  const obeSettingsList = [
    { settingKey: 'INSTITUTION_NAME', settingValue: 'Dr. D.Y. Patil College of Engineering and Innovation', description: 'Full name of the institution' },
    { settingKey: 'INSTITUTION_SHORT_NAME', settingValue: 'DYP COEI', description: 'Short name/abbreviation' },
    { settingKey: 'ACCREDITATION_BODY', settingValue: 'NBA', description: 'Accreditation body' },
    { settingKey: 'PO_COUNT', settingValue: '12', description: 'Number of Program Outcomes' },
    { settingKey: 'PSO_COUNT', settingValue: '3', description: 'Number of Program Specific Outcomes' },
    { settingKey: 'CO_PASS_THRESHOLD', settingValue: '60', description: 'Percentage of max marks a student must score to be counted as attaining a CO' },
    { settingKey: 'SURVEY_SCALE_MAX', settingValue: '5', description: 'Maximum scale value for surveys' },
    { settingKey: 'MAPPING_SCALE_MAX', settingValue: '3', description: 'Maximum CO-PO mapping scale value' },
    { settingKey: 'DECIMAL_PRECISION', settingValue: '2', description: 'Decimal places for attainment values' },
    { settingKey: 'DIRECT_WEIGHT', settingValue: '80', description: 'Direct attainment weight percentage' },
    { settingKey: 'INDIRECT_WEIGHT', settingValue: '20', description: 'Indirect attainment weight percentage' },
    { settingKey: 'DEMO_DATA_LOADED', settingValue: 'true', description: 'Flag indicating demo data has been loaded' },
  ];

  for (const s of obeSettingsList) {
    const existing = await prisma.obeSettings.findFirst({
      where: { settingKey: s.settingKey, programId: null }
    });
    if (!existing) {
      await prisma.obeSettings.create({
        data: { ...s, programId: null },
      });
    }
  }
  console.log(`  ✓ ${obeSettingsList.length} OBE settings configured`);

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('✅ SEED COMPLETED SUCCESSFULLY');
  console.log('═'.repeat(60));
  console.log('\n📌 DEMO CREDENTIALS:');
  console.log('  Super Admin : superadmin@obe.edu / SuperAdmin@12345');
  console.log('  Admin       : admin@obe.edu      / Admin@12345');
  console.log('  HOD         : hod.cs@obe.edu     / Hod@12345');
  console.log('  Faculty     : faculty1.cs@obe.edu/ Faculty@12345');
  console.log('\n⚠️  IMPORTANT: Change all passwords before production use!');
  console.log('\n📊 DATA SUMMARY:');
  console.log('  Departments : 2');
  console.log('  Programs    : 1 (BE-CS)');
  console.log('  Academic Yrs: 2 (2023-24, 2024-25)');
  console.log('  POs         : 12 (PO1–PO12)');
  console.log('  PSOs        : 3 (PSO1–PSO3)');
  console.log('  Courses     : 11');
  console.log('  COs (DBMS)  : 5');
  console.log('  Students    : 20');
  console.log('  CCA         : 6 activities');
  console.log('  ECA         : 6 activities');
  console.log('  Surveys     : Alumni + Employer');
  console.log('\n⚠️  This is DEMO DATA for demonstration purposes.');
  console.log('   All academic data is fictional and clearly marked as DEMO.');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
