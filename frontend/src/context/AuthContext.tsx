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
    name: 'Dr. Ramesh Patil (HOD CSE)',
    email: 'hod.cse@obe.edu',
    role: 'HOD',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'Computer Engineering', code: 'CSE' },
  },
  FACULTY: {
    id: 3,
    name: 'Prof. Anjali Sharma (Faculty)',
    email: 'faculty1@obe.edu',
    role: 'FACULTY',
    isActive: true,
    departmentId: 1,
    department: { id: 1, name: 'Computer Engineering', code: 'CSE' },
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
    return saved ? JSON.parse(saved) : DEMO_USERS.SUPER_ADMIN;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('obe_auth_token') || 'demo-bypass-token';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('obe_auth_token');
      if (savedToken && savedToken !== 'demo-bypass-token') {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('obe_user', JSON.stringify(res.data.data));
          }
        } catch {
          // Keep mock user when offline
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

  const switchRole = (newRole: Role) => {
    const targetUser = DEMO_USERS[newRole] || DEMO_USERS.SUPER_ADMIN;
    localStorage.setItem('obe_auth_token', `demo-${newRole.toLowerCase()}-token`);
    localStorage.setItem('obe_user', JSON.stringify(targetUser));
    setToken(`demo-${newRole.toLowerCase()}-token`);
    setUser(targetUser);
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
        isAuthenticated: !!user,
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
