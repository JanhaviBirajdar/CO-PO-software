I want you to build a complete, production-ready web application called:

"CO PO Mapping Software"

OBE = Outcome Based Education.

The application must be based on the OBE Process Manual screenshots/reference material I have provided.

IMPORTANT:
Do NOT create only a static UI or demo.
Build a fully functional software application with:
- Frontend
- Backend
- Database
- Authentication
- Role-based access
- CRUD operations
- OBE calculation engine
- PO/PSO attainment calculations
- CCA/ECA calculations
- Survey calculations
- Reports
- PDF/Excel export
- Dashboard
- Search/filtering
- Validation
- Audit/history where appropriate

The final software should allow a college/department to enter academic data and automatically generate OBE attainment reports in a format similar to the provided OBE Process Manual.

==================================================
1. TECHNOLOGY STACK
==================================================

Use the following stack:

Frontend:
- React.js
- Vite
- TypeScript
- Tailwind CSS
- Responsive design
- Recharts or another suitable chart library

Backend:
- Node.js
- Express.js
- TypeScript
- REST API

Database:
- MySQL
- Use Prisma ORM or another reliable ORM

Authentication:
- JWT authentication
- Password hashing using bcrypt
- Role-based authorization

Roles:
1. Super Admin
2. Admin
3. HOD
4. Faculty

Reports:
- PDF generation
- Excel generation

Development:
- Clean modular architecture
- Environment variables
- .env.example
- Proper error handling
- API validation
- Database migrations
- Seed/demo data

==================================================
2. MAIN OBJECTIVE
==================================================

Build software that converts OBE input data into:

1. Course Outcome (CO) attainment
2. CO-PO mapping
3. CO-PSO mapping
4. Direct attainment
5. Indirect attainment
6. Final PO attainment
7. PSO attainment
8. CCA attainment
9. ECA attainment
10. Survey attainment
11. Employer survey attainment
12. Alumni survey attainment
13. Parent survey attainment
14. Exit survey attainment
15. Overall PO/PSO reports
16. Graphical dashboard
17. PDF report
18. Excel report

The calculations must be dynamic.

DO NOT hard-code attainment values from the screenshots.

The system must calculate them from stored input data.

==================================================
3. APPLICATION STRUCTURE
==================================================

Create these modules:

AUTHENTICATION
├── Login
├── Logout
├── Forgot Password
├── Change Password
└── Role Based Access

ACADEMIC SETUP
├── Academic Year
├── Department
├── Program
├── Batch
├── Semester
├── Division
└── Section

OUTCOME MANAGEMENT
├── PO Management
├── PSO Management
├── CO Management
├── CO-PO Mapping
└── CO-PSO Mapping

COURSE MANAGEMENT
├── Course
├── Course Code
├── Course Name
├── Faculty
├── Credits
├── Semester
├── Course Type
└── Course Outcomes

ASSESSMENT MANAGEMENT
├── Internal Assessment
├── Unit Test
├── Mid Semester
├── End Semester
├── Assignment
├── Practical
├── Lab
├── Project
└── Other Assessment

ATTAINMENT
├── CO Attainment
├── Direct Attainment
├── Indirect Attainment
├── PO Attainment
└── PSO Attainment

CCA
├── Guest Lectures
├── Workshops
├── Student Competitions
├── Internships
├── Student Presentations
├── CRT
└── Custom CCA

ECA
├── ECA Clubs
├── Entrepreneurship
├── NSS
├── Sports
├── Literary Activities
├── Cultural Activities
└── Custom ECA

SURVEYS
├── Alumni Survey
├── Parent Survey
├── Exit Survey
├── Employer Survey
└── Survey Questions

REPORTS
├── Course Report
├── CO Attainment Report
├── CO-PO Matrix
├── PO Attainment
├── PSO Attainment
├── CCA Report
├── ECA Report
├── Survey Report
├── Employer Survey Report
├── Complete OBE Report
├── PDF Export
└── Excel Export

DASHBOARD
├── PO Charts
├── PSO Charts
├── CO Charts
├── Direct vs Indirect
├── Course Performance
└── Overall Attainment

==================================================
4. DATABASE DESIGN
==================================================

Create normalized MySQL database tables.

Required tables:

users
roles
departments
programs
academic_years
batches
semesters
divisions

program_outcomes
program_specific_outcomes
course_outcomes

courses
course_faculty

co_po_mappings
co_pso_mappings

students
student_courses

assessments
assessment_questions
student_assessment_marks

co_attainment

po_direct_attainment
pso_direct_attainment

cca_activities
cca_po_mappings

eca_activities
eca_po_mappings

survey_types
survey_questions
survey_responses
survey_response_details

po_indirect_attainment
pso_indirect_attainment

po_final_attainment
pso_final_attainment

employer_surveys

reports
audit_logs

Every important table must have:
- id
- created_at
- updated_at

Use foreign keys properly.

Add indexes where required.

Do not duplicate data unnecessarily.

==================================================
5. PO STRUCTURE
==================================================

Support:

PO1
PO2
PO3
PO4
PO5
PO6
PO7
PO8
PO9
PO10
PO11
PO12

Do NOT assume that every institution must use exactly 12 POs.

Make the PO count configurable.

However, seed the system with PO1 to PO12 because the provided OBE manual uses these.

==================================================
6. PSO STRUCTURE
==================================================

Support:

PSO1
PSO2
PSO3

Make PSO count configurable.

Seed:
PSO1
PSO2
PSO3

==================================================
7. CO MANAGEMENT
==================================================

Allow faculty/admin to create:

CO1
CO2
CO3
CO4
CO5
...

CO count should be configurable.

Each CO should have:

CO Code
CO Description
Course
Academic Year
Semester

Example:

CO1:
"Understand fundamental programming concepts."

==================================================
8. CO-PO MAPPING
==================================================

Create a matrix similar to:

          PO1 PO2 PO3 PO4 PO5 PO6 PO7 PO8 PO9 PO10 PO11 PO12

CO1        3   2   1   -   -   -   -   -   -    -    -    -
CO2        2   3   3   1   -   -   -   -   -    -    -    -
CO3        -   2   3   3   2   -   -   -   -    -    -    -

Mapping scale should support:

0 = No correlation
1 = Low
2 = Medium
3 = High

Provide a visual matrix editor.

Allow:
- Click cell
- Select 0/1/2/3
- Save
- Edit
- Reset

Show color/visual indication for mapping levels.

==================================================
9. CO-PSO MAPPING
==================================================

Create a similar matrix:

          PSO1 PSO2 PSO3

CO1         3    2    1
CO2         2    3    2
CO3         3    3    3

Support 0/1/2/3 mapping.

==================================================
10. COURSE MANAGEMENT
==================================================

Course fields:

Course Code
Course Name
Department
Program
Semester
Academic Year
Credits
Course Type
Faculty
Number of COs

Example:

PC510CS
Database Management Systems

Allow assigning faculty.

==================================================
11. ASSESSMENT MODULE
==================================================

Create an assessment system.

Assessment types:

Internal Assessment
Unit Test
Mid Semester
End Semester
Assignment
Practical
Lab
Project
Other

Faculty should be able to enter marks.

Example:

Student:
101

CO1 marks:
18/20

CO2:
16/20

CO3:
14/20

Store raw marks.

DO NOT directly store only final attainment.

Calculate attainment from raw data.

==================================================
12. CO ATTAINMENT
==================================================

Build a configurable CO attainment calculation engine.

The system should support threshold-based attainment.

Example configuration:

Level 3:
>= 70%

Level 2:
>= 60% and <70%

Level 1:
>= 50% and <60%

Level 0:
<50%

IMPORTANT:

Do not permanently hard-code these thresholds.

Create an "Attainment Configuration" screen where Admin/HOD can configure:

Level
Percentage Range
Attainment Value
Weightage

Example:

Level 3 → 70–100
Level 2 → 60–69.99
Level 1 → 50–59.99
Level 0 → below 50

The calculation engine must read these values from the database.

==================================================
13. DIRECT ATTAINMENT
==================================================

Calculate direct CO attainment from assessment data.

The system must support configurable weightage.

Example:

Internal Assessment = 20%
End Semester = 60%
Assignment = 20%

Do NOT hard-code these percentages.

Create:

Assessment Weight Configuration

where Admin can define:

Assessment Type
Weightage
CO Contribution

Then calculate:

Direct CO Attainment

from actual assessment performance.

==================================================
14. CO TO PO ATTAINMENT
==================================================

Use the CO-PO mapping and CO attainment.

The system should calculate PO direct attainment based on the configured institution formula.

Create a configurable formula engine.

Do not hide formulas in frontend code.

Store calculation configuration in database.

Allow HOD/Admin to see:

CO attainment
+
CO-PO mapping
=
PO contribution

Then calculate PO direct attainment.

==================================================
15. INDIRECT ATTAINMENT
==================================================

Support indirect attainment from:

Alumni Survey
Parent Survey
Exit Survey
Employer Survey

The system should calculate survey attainment based on actual survey responses.

Allow survey scale configuration.

Example:

1 = Low
2 = Moderate
3 = High

But make this configurable.

==================================================
16. FINAL PO ATTAINMENT
==================================================

Create configurable weightage:

Direct Attainment Weight
Indirect Attainment Weight

Example:

Direct = 80%
Indirect = 20%

Formula:

Final PO Attainment =
(Direct Attainment × Direct Weight)
+
(Indirect Attainment × Indirect Weight)

IMPORTANT:

Do not hard-code 80/20.

Admin must be able to change the weightage.

==================================================
17. PSO ATTAINMENT
==================================================

Calculate:

Direct PSO Attainment
Indirect PSO Attainment
Final PSO Attainment

Display:

             PSO1    PSO2    PSO3

Direct       2.70    2.69    2.70
Indirect     3.00    3.00    3.00
Final        2.76    2.75    2.76

Use the configured formula.

==================================================
18. CCA MODULE
==================================================

Create CCA activities.

Examples from the provided OBE manual:

Guest Lectures
Workshops
Student Competitions
Internships
Student Presentations
CRT

Allow custom activities.

Fields:

Activity Name
Description
Date
Academic Year
Semester
Number of Activities
Attainment Level
PO1...PO12 contribution

Example UI:

Activity                 PO1 PO2 PO3 ... PO12

Guest Lectures            2   2   2  ...  3
Workshops                 2   2   2  ...  3
Competitions              3   3   3  ...  3

==================================================
19. ECA MODULE
==================================================

Support:

ECA Clubs
Entrepreneurship
NSS
Sports
Literary Activities
Cultural Activities

Allow custom ECA.

Provide PO mapping.

Generate ECA attainment tables similar to the provided manual.

==================================================
20. SURVEY MODULE
==================================================

Create a dynamic survey builder.

Survey Types:

1. Alumni
2. Parent
3. Exit
4. Employer

Admin can create questions.

Example:

"Rate the student's job-specific skills."

Response scale:

1
2
3
4
5

Allow configurable scales.

Store every response.

Calculate:

Question-wise attainment
PO-wise survey attainment
Overall survey attainment

==================================================
21. EMPLOYER SURVEY
==================================================

Support categories similar to the provided OBE manual:

Job Specific Skills
Problem Solving Skills
Individual and Team Work Skills
Human Values and Professional Ethical Values
Modern Tool Usage
Verbal & Written Capabilities
Leadership Skills
Overall Job Performance
Approach Towards Lifelong Learning Skills

Allow mapping these survey questions to PO1–PO12.

Generate employer survey attainment report.

==================================================
22. DASHBOARD
==================================================

Create a professional dashboard.

Dashboard should show:

Academic Year
Department
Program
Semester

Cards:

Total Courses
Total COs
Total POs
Total PSOs
Average CO Attainment
Average PO Attainment
Average PSO Attainment

Charts:

1. PO Attainment Bar Chart
2. PSO Attainment Bar Chart
3. CO Attainment Chart
4. Direct vs Indirect Attainment
5. Course-wise Attainment
6. CCA/ECA Contribution

Add filters:

Academic Year
Department
Program
Semester
Course

==================================================
23. REPORT FORMAT
==================================================

The report output is extremely important.

Generate tables visually similar to the provided DYP COEI OBE Process Manual.

Report sections:

SECTION 1
Program Outcomes

PO1 to PO12

SECTION 2
PSO1 to PSO3

SECTION 3
Course-wise CO attainment

SECTION 4
CO-PO Matrix

SECTION 5
Direct Attainment

SECTION 6
Indirect Attainment

SECTION 7
Final PO Attainment

SECTION 8
CCA Activities

SECTION 9
ECA Activities

SECTION 10
Survey Attainment

SECTION 11
Employer Satisfaction Survey

SECTION 12
PSO Attainment

SECTION 13
Overall OBE Summary

==================================================
24. REPORT TABLE STYLE
==================================================

Use professional academic-report styling.

Header:
Dark/light blue similar to the reference manual.

Tables:
- Borders
- Proper alignment
- Rotated PO headings where appropriate
- PO1...PO12
- PSO1...PSO3
- Numeric values to 2 decimal places
- Blank cells where no mapping exists
- Proper row/column spacing

Example:

DIRECT ATTAINMENT

|              | PO1 | PO2 | PO3 | PO4 | ... |
|--------------|-----|-----|-----|-----|-----|
| Direct       | 2.65| 2.62| 2.64| 2.65| ... |
| Indirect     | 3.00| 3.00| 3.00| 3.00| ... |
| PO Attainment| 2.72| 2.69| 2.71| 2.72| ... |

==================================================
25. PDF GENERATION
==================================================

Generate a complete PDF report.

PDF should contain:

College Name
Department
Program
Academic Year
Semester

OBE ATTAINMENT REPORT

Then all required tables.

Include:

Page number
Header
Footer
Generated date
Department
Academic year

Do not create screenshots of tables.

Generate real selectable PDF text/tables.

==================================================
26. EXCEL EXPORT
==================================================

Generate an Excel workbook.

Sheets:

1. Dashboard
2. PO
3. PSO
4. CO
5. CO-PO Mapping
6. CO-PSO Mapping
7. Direct Attainment
8. Indirect Attainment
9. CCA
10. ECA
11. Alumni Survey
12. Parent Survey
13. Exit Survey
14. Employer Survey
15. Final Report

Use formatting:

- Headers
- Borders
- Freeze panes
- Filters
- Proper column widths
- Decimal formatting

==================================================
27. UI SCREENS
==================================================

Create these screens:

LOGIN

DASHBOARD

ACADEMIC SETUP

DEPARTMENT MANAGEMENT

PROGRAM MANAGEMENT

PO MANAGEMENT

PSO MANAGEMENT

CO MANAGEMENT

COURSE MANAGEMENT

FACULTY MANAGEMENT

CO-PO MAPPING

CO-PSO MAPPING

ASSESSMENT CONFIGURATION

MARK ENTRY

CO ATTAINMENT

CCA MANAGEMENT

ECA MANAGEMENT

SURVEY BUILDER

SURVEY RESPONSES

EMPLOYER SURVEY

ATTAINMENT CONFIGURATION

PO ATTAINMENT

PSO ATTAINMENT

REPORT GENERATION

PDF PREVIEW

EXCEL EXPORT

USER MANAGEMENT

SETTINGS

AUDIT LOG

==================================================
28. UI DESIGN
==================================================

Use a modern college ERP style.

Sidebar:

Dashboard
Academic Setup
Courses
CO/PO/PSO
Mappings
Assessments
CCA
ECA
Surveys
Attainment
Reports
Users
Settings

Top bar:

College Name
Academic Year
Department
Logged-in User
Notifications
Profile

Use responsive design.

The application must work on:

Desktop
Laptop
Tablet
Mobile

==================================================
29. ROLE PERMISSIONS
==================================================

SUPER ADMIN:

Everything.

ADMIN:

Manage academic setup
Users
Courses
PO/PSO
Reports
Settings

HOD:

View department data
Approve data
View attainment
Generate reports
Configure department-level settings

FACULTY:

Manage assigned courses
COs
Assessments
Marks
CO attainment
View reports for assigned courses

Faculty must NOT modify global PO definitions unless permission is granted.

==================================================
30. DATA VALIDATION
==================================================

Add strong validation.

Examples:

PO mapping must be 0–3.

PSO mapping must be 0–3.

Marks cannot exceed maximum marks.

Weightage must be between 0 and 100.

Total assessment weightage should equal 100%.

Survey rating must be within configured range.

Academic year must be valid.

Course code must be unique within appropriate scope.

==================================================
31. AUDIT TRAIL
==================================================

Record:

Who created data
Who modified data
What changed
Date/time

Example:

Faculty A
Changed CO2 attainment
Old: 2.45
New: 2.65
Date: 2026-09-24

==================================================
32. FORMULA ENGINE
==================================================

Create a separate backend service:

FormulaEngine

It should contain functions such as:

calculateCOAttainment()

calculateDirectAttainment()

calculateIndirectAttainment()

calculatePODirectAttainment()

calculatePOIndirectAttainment()

calculateFinalPOAttainment()

calculatePSODirectAttainment()

calculatePSOIndirectAttainment()

calculateFinalPSOAttainment()

calculateCCAAttainment()

calculateECAAttainment()

calculateSurveyAttainment()

Do not put complex formulas directly inside React components.

All calculations must happen in backend/service layer.

==================================================
33. CONFIGURATION
==================================================

Create an OBE Settings page.

Settings:

PO Count
PSO Count
CO Count

CO Attainment Thresholds

Assessment Weightage

Direct Attainment Weight

Indirect Attainment Weight

Survey Scale

CCA Configuration

ECA Configuration

Decimal Precision

Mapping Scale

Allow institution-specific formulas.

==================================================
34. SAMPLE DATA
==================================================

Create demo data based on the provided screenshots.

Use:

PO1 to PO12

PSO1 to PSO3

Example courses:

ES110CS
Computer Programming and Problem Solving using C

PC440CS
Computer Architecture

PC411CS
Java Lab

PC421CS
Operating System Lab

PC510CS
Database Management Systems

PC520CS
Microprocessors and Interfacing

PC511CS
Database Management Systems Lab

PC521CS
Microprocessors and Interfacing Lab

PC531CS
Computer Network Lab

PW519CS
Mini Project

PC610CS
Web Programming & Services

Also create sample CCA/ECA/survey data.

IMPORTANT:
Clearly mark this as DEMO DATA.

==================================================
35. SECURITY
==================================================

Implement:

JWT authentication
Password hashing
Role-based authorization
Protected routes
Input validation
SQL injection protection through ORM
CORS configuration
Environment variables
Secure error handling

Never expose passwords.

==================================================
36. API STRUCTURE
==================================================

Create REST APIs such as:

POST /api/auth/login

GET /api/courses

POST /api/courses

PUT /api/courses/:id

DELETE /api/courses/:id

GET /api/cos

POST /api/cos

GET /api/po

GET /api/pso

GET /api/mappings/co-po

POST /api/mappings/co-po

GET /api/attainment/co

GET /api/attainment/po

GET /api/attainment/pso

GET /api/cca

GET /api/eca

GET /api/surveys

POST /api/surveys

GET /api/reports/po

GET /api/reports/pso

GET /api/reports/complete

POST /api/reports/pdf

POST /api/reports/excel

Use proper controllers/services/repositories.

==================================================
37. PROJECT STRUCTURE
==================================================

Create:

/frontend
/backend
/database
/docs

Frontend:

src/
  components/
  pages/
  layouts/
  hooks/
  services/
  types/
  utils/
  charts/

/backend:

src/
  controllers/
  services/
  repositories/
  routes/
  middleware/
  validators/
  utils/
  config/

/database:

schema
migrations
seed

/docs:

README
DATABASE.md
FORMULAS.md
API.md
SETUP.md

==================================================
38. IMPORTANT FORMULA REQUIREMENT
==================================================

The screenshots show final numerical results, but the exact institutional calculation rules may depend on the complete OBE manual.

Therefore:

DO NOT invent undocumented formulas.

Where the provided reference material does not specify an exact formula:

1. Build the calculation as configurable.
2. Display the formula/configuration used.
3. Allow Admin/HOD to define the formula or weightage.
4. Clearly label default/demo configuration.

Never silently assume a formula.

==================================================
39. REPORT PREVIEW
==================================================

Before downloading:

Show:

"Report Preview"

with:

[Generate Report]

[Download PDF]

[Download Excel]

The preview must look like the OBE manual tables.

==================================================
40. ERROR HANDLING
==================================================

Display useful errors:

"Marks cannot exceed maximum marks."

"Assessment weightage must total 100%."

"PO mapping must be between 0 and 3."

"Please configure CO-PO mapping before calculating PO attainment."

"Survey data is insufficient for calculation."

Do not display raw backend errors to users.

==================================================
41. TESTING
==================================================

Create tests for:

Authentication
Course CRUD
CO CRUD
PO CRUD
PSO CRUD
CO-PO mapping
CO-PSO mapping
Marks calculation
CO attainment
Direct attainment
Indirect attainment
PO attainment
PSO attainment
CCA
ECA
Survey
PDF generation
Excel generation

Also test edge cases:

No students
No marks
Missing mapping
Zero mapping
Partial mapping
Invalid weightage
Missing survey data

==================================================
42. FINAL REQUIREMENT
==================================================

Build the application incrementally.

FIRST:

1. Create project
2. Create database
3. Create authentication
4. Create dashboard
5. Create academic setup
6. Create PO/PSO/CO management
7. Create course management
8. Create mapping module
9. Create assessment module
10. Create calculation engine
11. Create CCA/ECA
12. Create surveys
13. Create reports
14. Create PDF/Excel export
15. Add testing
16. Add documentation

After each major module:

- Run the application
- Check for errors
- Fix errors
- Test API
- Test database
- Verify UI
- Continue to next module

Do not stop after creating the frontend.

The application must be fully connected:

UI
↓
API
↓
Backend Services
↓
Database
↓
Calculation Engine
↓
Reports

==================================================
43. MOST IMPORTANT DESIGN PRINCIPLE
==================================================

The screenshots I provided are the TARGET REPORT STYLE.

The software should reproduce the STRUCTURE and INFORMATION shown in those reports.

It should NOT simply copy the screenshot as an image.

All tables must be generated dynamically from database data.

Example:

Database data
       ↓
CO-PO Mapping
       ↓
Assessment Data
       ↓
Calculation Engine
       ↓
PO Attainment
       ↓
Report Generator
       ↓
PDF/Excel
       ↓
OBE Report

==================================================
44. START NOW
==================================================

Start by:

1. Creating the complete project structure.
2. Creating the MySQL schema.
3. Creating Prisma models/migrations.
4. Creating seed/demo data.
5. Building authentication.
6. Building the dashboard.
7. Building PO/PSO/CO management.
8. Building CO-PO and CO-PSO mapping.
9. Building the calculation engine.
10. Building the report system.

Do not just explain how to build it.

Actually create the code/files required for the application.

If you need to make a design decision that is not specified, choose a scalable, maintainable implementation and document that decision in /docs/DECISIONS.md.

Keep the architecture modular so that the OBE calculation rules can be changed later without rewriting the entire application.

The final result should be a working OBE ERP/Attainment Management System suitable for a college department.