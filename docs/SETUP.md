# OBE Attainment Management System — Setup Guide

## Prerequisites

- Node.js ≥ 18
- MySQL ≥ 8.0
- npm ≥ 9

---

## 1. Clone and Configure

```bash
# Navigate to project root
cd CO-PO-software

# Copy backend environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your MySQL credentials
```

---

## 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE obe_attainment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

Update `backend/.env`:
```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/obe_attainment_db"
```

---

## 3. Backend Setup

```bash
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Run seed data
npx ts-node ../../database/seed/seed.ts
```

---

## 4. Verify Database

```bash
# Open Prisma Studio to inspect DB
npx prisma studio
```

---

## 5. Demo Login Credentials

> ⚠️ **DEMO DATA** — Change all passwords before production!

| Role        | Email                     | Password         |
|-------------|---------------------------|------------------|
| Super Admin | superadmin@obe.edu        | SuperAdmin@12345 |
| Admin       | admin@obe.edu             | Admin@12345      |
| HOD         | hod.cs@obe.edu            | Hod@12345        |
| Faculty     | faculty1.cs@obe.edu       | Faculty@12345    |
| Faculty     | faculty2.cs@obe.edu       | Faculty@12345    |
| Faculty     | faculty3.cs@obe.edu       | Faculty@12345    |

---

## 6. What's in Demo Data

- **Institution**: Dr. D.Y. Patil College of Engineering and Innovation (DYP COEI)
- **Department**: Computer Engineering
- **Program**: BE Computer Engineering
- **Academic Year**: 2024-25 (current), 2023-24
- **POs**: PO1–PO12 (NBA standard descriptions)
- **PSOs**: PSO1–PSO3
- **Courses**: 11 courses (theory + lab + project)
- **Students**: 20 demo students in batch 2022-2026
- **COs**: 5 COs for PC510CS (DBMS) with full assessment marks
- **CO-PO**: 5×12 mapping matrix
- **CO-PSO**: 5×3 mapping matrix
- **CCA**: 6 activities with PO mappings
- **ECA**: 6 activities with PO mappings
- **Surveys**: Alumni survey (10 responses), Employer survey (5 companies)

---

## Phase Roadmap

| Phase | Module | Status |
|-------|--------|--------|
| 1 | Database Schema + Seed | ✅ Complete |
| 2 | Authentication API | 🔜 Next |
| 3 | Dashboard + Academic Setup API | 🔜 |
| 4 | CO/PO/PSO Management API | 🔜 |
| 5 | Course + Assessment API | 🔜 |
| 6 | Formula Engine + Attainment | 🔜 |
| 7 | CCA/ECA/Survey API | 🔜 |
| 8 | Reports + PDF/Excel | 🔜 |
| 9 | Frontend (React + Vite) | 🔜 |
| 10 | Testing | 🔜 |
