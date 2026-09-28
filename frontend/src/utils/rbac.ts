import type { Role } from '../types';

export type AccessLevel = 'FULL' | 'READ_ONLY' | 'NONE';

export type FeatureKey =
  | 'dashboard'
  | 'academic-setup'
  | 'outcomes'
  | 'courses'
  | 'mappings'
  | 'assessments'
  | 'attainment'
  | 'activities'
  | 'surveys'
  | 'reports'
  | 'users';

export interface FeatureMeta {
  key: FeatureKey;
  name: string;
  path: string;
  section: string;
}

export const FEATURES: FeatureMeta[] = [
  { key: 'dashboard', name: 'Dashboard', path: '/dashboard', section: 'MAIN' },
  { key: 'academic-setup', name: 'Academic Setup', path: '/academic-setup', section: 'ACADEMICS & OUTCOMES' },
  { key: 'outcomes', name: 'PO & PSO', path: '/outcomes', section: 'ACADEMICS & OUTCOMES' },
  { key: 'courses', name: 'Courses & COs', path: '/courses', section: 'ACADEMICS & OUTCOMES' },
  { key: 'mappings', name: 'CO-PO Mappings', path: '/mappings', section: 'ACADEMICS & OUTCOMES' },
  { key: 'assessments', name: 'Assessments & Marks', path: '/assessments', section: 'ASSESSMENTS & ATTAINMENT' },
  { key: 'attainment', name: 'Attainment Engine', path: '/attainment', section: 'ASSESSMENTS & ATTAINMENT' },
  { key: 'activities', name: 'CCA & ECA', path: '/activities', section: 'ASSESSMENTS & ATTAINMENT' },
  { key: 'surveys', name: 'Surveys & Feedback', path: '/surveys', section: 'ASSESSMENTS & ATTAINMENT' },
  { key: 'reports', name: 'Reports & Export', path: '/reports', section: 'REPORTS & ADMIN' },
  { key: 'users', name: 'User Management', path: '/users', section: 'REPORTS & ADMIN' },
];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Administrator',
  ADMIN: 'System Admin',
  HOD: 'Head of Department (HOD)',
  OBE_COORDINATOR: 'OBE Coordinator',
  FACULTY: 'Faculty',
  DEPARTMENT_COORDINATOR: 'Department Coordinator',
  IQAC_ADMIN: 'IQAC / Admin',
  PRINCIPAL_MANAGEMENT: 'Principal / Management',
};

/**
 * RBAC Matrix matching DYP COEI OBE Responsibility Assignment Matrix
 * Features x Roles -> AccessLevel ('FULL' | 'READ_ONLY' | 'NONE')
 */
export const RBAC_MATRIX: Record<FeatureKey, Record<Role, AccessLevel>> = {
  dashboard: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'FULL',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'FULL',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'FULL',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  'academic-setup': {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'READ_ONLY',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'NONE',
    DEPARTMENT_COORDINATOR: 'READ_ONLY',
    IQAC_ADMIN: 'FULL',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  outcomes: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'FULL',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'READ_ONLY',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'READ_ONLY',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  courses: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'FULL',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'FULL',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'READ_ONLY',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  mappings: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'FULL',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'FULL',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'READ_ONLY',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  assessments: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'READ_ONLY',
    OBE_COORDINATOR: 'READ_ONLY',
    FACULTY: 'FULL',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'READ_ONLY',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  attainment: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'FULL',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'READ_ONLY',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'READ_ONLY',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  activities: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'READ_ONLY',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'FULL',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'READ_ONLY',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  surveys: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'READ_ONLY',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'READ_ONLY',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'READ_ONLY',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  reports: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'FULL',
    OBE_COORDINATOR: 'FULL',
    FACULTY: 'READ_ONLY',
    DEPARTMENT_COORDINATOR: 'FULL',
    IQAC_ADMIN: 'FULL',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
  users: {
    SUPER_ADMIN: 'FULL',
    ADMIN: 'FULL',
    HOD: 'NONE',
    OBE_COORDINATOR: 'NONE',
    FACULTY: 'NONE',
    DEPARTMENT_COORDINATOR: 'NONE',
    IQAC_ADMIN: 'READ_ONLY',
    PRINCIPAL_MANAGEMENT: 'READ_ONLY',
  },
};

/**
 * Get the AccessLevel ('FULL' | 'READ_ONLY' | 'NONE') for a given feature and role
 */
export function getAccessLevel(feature: FeatureKey, role?: Role | string): AccessLevel {
  if (!role) return 'NONE';

  // SUPER_ADMIN gets FULL access across all modules as system administrator
  if (role === 'SUPER_ADMIN') {
    return RBAC_MATRIX[feature]?.SUPER_ADMIN || 'FULL';
  }

  const validRole = role as Role;
  if (!RBAC_MATRIX[feature] || !RBAC_MATRIX[feature][validRole]) {
    return 'NONE';
  }

  return RBAC_MATRIX[feature][validRole];
}

export function canEdit(feature: FeatureKey, role?: Role | string): boolean {
  return getAccessLevel(feature, role) === 'FULL';
}

export function canView(feature: FeatureKey, role?: Role | string): boolean {
  return getAccessLevel(feature, role) !== 'NONE';
}

export function isReadOnly(feature: FeatureKey, role?: Role | string): boolean {
  return getAccessLevel(feature, role) === 'READ_ONLY';
}

export function isFeatureHidden(feature: FeatureKey, role?: Role | string): boolean {
  return getAccessLevel(feature, role) === 'NONE';
}
