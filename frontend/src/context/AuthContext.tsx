import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { apiClient } from '../api/apiClient';

export const DEMO_USERS: Record<Role, User> = {
  SUPER_ADMIN: {
    id: 1,
    name: 'Dr. Omkar (Super Admin)',
    email: 'superadmin@obe.edu',
    role: 'SUPER_ADMIN',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'Institutional Quality Cell', code: 'IQAC' },
  },
  ADMIN: {
    id: 4,
    name: 'Academic Admin',
    email: 'admin@obe.edu',
    role: 'ADMIN',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'Academic Affairs', code: 'ACAD' },
  },
  OBE_COORDINATOR: {
    id: 5,
    name: 'Prof. S. K. Verma (OBE Coordinator)',
    email: 'coordinator@obe.edu',
    role: 'OBE_COORDINATOR',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'OBE & Curriculum Cell', code: 'OBE' },
  },
  HOD: {
    id: 2,
    name: 'Dr. R. S. Sharma (HOD Comp Engg)',
    email: 'hod.cs@obe.edu',
    role: 'HOD',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'Computer Engineering', code: 'CSE' },
  },
  FACULTY: {
    id: 3,
    name: 'Prof. A. K. Patil (Faculty)',
    email: 'faculty1.cs@obe.edu',
    role: 'FACULTY',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'Computer Engineering', code: 'CSE' },
  },
  DEPARTMENT_COORDINATOR: {
    id: 6,
    name: 'Prof. M. R. Shinde (Dept Coordinator)',
    email: 'dept.coord@obe.edu',
    role: 'DEPARTMENT_COORDINATOR',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'Computer Engineering', code: 'CSE' },
  },
  IQAC_ADMIN: {
    id: 7,
    name: 'Dr. S. P. Joshi (IQAC Lead)',
    email: 'iqac@obe.edu',
    role: 'IQAC_ADMIN',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'IQAC Cell', code: 'IQAC' },
  },
  PRINCIPAL_MANAGEMENT: {
    id: 8,
    name: 'Dr. Principal / Management (Read-Only)',
    email: 'principal@obe.edu',
    role: 'PRINCIPAL_MANAGEMENT',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'Management Office', code: 'MGMT' },
  },
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('obe_user');
    const savedToken = localStorage.getItem('obe_auth_token');
    if (!savedToken || savedToken.startsWith('demo-')) {
      return null;
    }
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('obe_auth_token');
    if (!savedToken || savedToken.startsWith('demo-')) {
      return null;
    }
    return savedToken;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const savedToken = localStorage.getItem('obe_auth_token');
    return !!savedToken && !savedToken.startsWith('demo-');
  });

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('obe_auth_token');
      if (savedToken && !savedToken.startsWith('demo-')) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('obe_user', JSON.stringify(res.data.data));
          } else {
            throw new Error('Authentication failed');
          }
        } catch {
          localStorage.removeItem('obe_auth_token');
          localStorage.removeItem('obe_user');
          setUser(null);
          setToken(null);
        }
      } else {
        // Clear any lingering demo tokens
        if (savedToken?.startsWith('demo-')) {
          localStorage.removeItem('obe_auth_token');
          localStorage.removeItem('obe_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('obe_auth_token', newToken);
    localStorage.setItem('obe_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('obe_auth_token');
    localStorage.removeItem('obe_user');
    setToken(null);
    setUser(null);
  };

  // Demo mode role switching commented out / disabled
  /*
  const switchRole = (newRole: Role) => {
    const targetUser = DEMO_USERS[newRole] || DEMO_USERS.SUPER_ADMIN;
    localStorage.setItem('obe_auth_token', `demo-${newRole.toLowerCase()}-token`);
    localStorage.setItem('obe_user', JSON.stringify(targetUser));
    setToken(`demo-${newRole.toLowerCase()}-token`);
    setUser(targetUser);
  };
  */
  const switchRole = (_role: Role) => {
    console.warn('Demo mode role switching is disabled.');
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        hasRole,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
