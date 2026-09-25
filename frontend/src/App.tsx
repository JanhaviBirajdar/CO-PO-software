import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AcademicSetup } from './pages/AcademicSetup';
import { OutcomesManagement } from './pages/OutcomesManagement';
import { CoursesManagement } from './pages/CoursesManagement';
import { MappingsManagement } from './pages/MappingsManagement';
import { Assessments } from './pages/Assessments';
import { AttainmentEngine } from './pages/AttainmentEngine';
import { ActivitiesManagement } from './pages/ActivitiesManagement';
import { SurveysManagement } from './pages/SurveysManagement';
import { Reports } from './pages/Reports';
import { UsersManagement } from './pages/UsersManagement';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication check currently bypassed for direct inspection without login/DB
  /*
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading OBE Application Context...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  */

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="academic-setup" element={<AcademicSetup />} />
            <Route path="outcomes" element={<OutcomesManagement />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="mappings" element={<MappingsManagement />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="attainment" element={<AttainmentEngine />} />
            <Route path="activities" element={<ActivitiesManagement />} />
            <Route path="surveys" element={<SurveysManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UsersManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
