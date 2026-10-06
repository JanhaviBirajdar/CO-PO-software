import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AcademicSetup } from './pages/AcademicSetup';
import { OutcomesManagement } from './pages/OutcomesManagement';
import { CoursesManagement } from './pages/CoursesManagement';
import { BloomsTaxonomy } from './pages/BloomsTaxonomy';
import { QuestionBank } from './pages/QuestionBank';
import { MappingsManagement } from './pages/MappingsManagement';
import { Assessments } from './pages/Assessments';
import { AttainmentEngine } from './pages/AttainmentEngine';
import { ActivitiesManagement } from './pages/ActivitiesManagement';
import { SurveysManagement } from './pages/SurveysManagement';
import { Reports } from './pages/Reports';
import { UsersManagement } from './pages/UsersManagement';
import { AccessDenied } from './components/common/AccessDenied';
import { getAccessLevel, type FeatureKey } from './utils/rbac';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500 mr-3"></div>
        Loading OBE Application Context...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RbacFeatureGuard: React.FC<{ featureKey: FeatureKey; children: React.ReactNode }> = ({
  featureKey,
  children,
}) => {
  const { user } = useAuth();
  const accessLevel = getAccessLevel(featureKey, user?.role);

  if (accessLevel === 'NONE') {
    return <AccessDenied featureKey={featureKey} />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
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
              <Route
                path="dashboard"
                element={
                  <RbacFeatureGuard featureKey="dashboard">
                    <Dashboard />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="academic-setup"
                element={
                  <RbacFeatureGuard featureKey="academic-setup">
                    <AcademicSetup />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="outcomes"
                element={
                  <RbacFeatureGuard featureKey="outcomes">
                    <OutcomesManagement />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="courses"
                element={
                  <RbacFeatureGuard featureKey="courses">
                    <CoursesManagement />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="blooms"
                element={
                  <RbacFeatureGuard featureKey="blooms">
                    <BloomsTaxonomy />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="question-bank"
                element={
                  <RbacFeatureGuard featureKey="question-bank">
                    <QuestionBank />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="mappings"
                element={
                  <RbacFeatureGuard featureKey="mappings">
                    <MappingsManagement />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="assessments"
                element={
                  <RbacFeatureGuard featureKey="assessments">
                    <Assessments />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="attainment"
                element={
                  <RbacFeatureGuard featureKey="attainment">
                    <AttainmentEngine />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="activities"
                element={
                  <RbacFeatureGuard featureKey="activities">
                    <ActivitiesManagement />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="surveys"
                element={
                  <RbacFeatureGuard featureKey="surveys">
                    <SurveysManagement />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="reports"
                element={
                  <RbacFeatureGuard featureKey="reports">
                    <Reports />
                  </RbacFeatureGuard>
                }
              />
              <Route
                path="users"
                element={
                  <RbacFeatureGuard featureKey="users">
                    <UsersManagement />
                  </RbacFeatureGuard>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
