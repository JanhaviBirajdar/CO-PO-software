// ============================================================
// Credential Generator — Department-wise Employee ID & Password
// ============================================================

import { prisma } from '../config/prisma';

/**
 * Automatically generates a department-wise Employee ID
 * Format: EMP-<DEPT_CODE>-<001> (e.g. EMP-CSE-001, EMP-AIDS-002, EMP-IT-001)
 */
export async function generateDepartmentEmployeeId(departmentId?: number): Promise<string> {
  let deptCode = 'GEN';

  if (departmentId) {
    const dept = await prisma.department.findUnique({
      where: { id: Number(departmentId) },
      select: { code: true, shortName: true, name: true },
    });

    if (dept) {
      const raw = dept.shortName || dept.code || dept.name;
      deptCode = raw
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase()
        .slice(0, 6);
    }
  }

  const prefix = `EMP-${deptCode}-`;

  // Fetch all existing employeeIds starting with this prefix
  const existingUsers = await prisma.user.findMany({
    where: {
      employeeId: {
        startsWith: prefix,
      },
    },
    select: { employeeId: true },
  });

  let maxNum = 0;
  for (const u of existingUsers) {
    if (u.employeeId) {
      const numPart = u.employeeId.slice(prefix.length);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }

  const nextSeq = maxNum + 1;
  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

/**
 * Automatically generates a strong, secure random password that satisfies
 * uppercase, lowercase, digit, and special character requirements.
 */
export function generateSecurePassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$%&*!';

  let password = '';
  // Guarantee one character of each class
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remainder to 10 characters
  const allChars = upper + lower + digits + special;
  for (let i = 0; i < 6; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle for randomness
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

