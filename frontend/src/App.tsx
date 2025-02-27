import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './hooks/useAuth';
import { theme } from './theme';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { Layout } from './components/layout/Layout';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { EmployeeList } from './components/employees/EmployeeList';
import { WorkplaceList } from './components/workplaces/WorkplaceList';
import { CostList } from './components/costs/CostList';
import { RevenueList } from './components/revenues/RevenueList';
import { Profile } from './components/profile/Profile';
import { ScheduleList } from './components/schedule/ScheduleList';
import { ReportList } from './components/reports/ReportList';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/employees*"
              element={
                <PrivateRoute>
                  <Layout>
                    <EmployeeList />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/workplaces*"
              element={
                <PrivateRoute>
                  <Layout>
                    <WorkplaceList />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/costs*"
              element={
                <PrivateRoute>
                  <Layout>
                    <CostList />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/revenues*"
              element={
                <PrivateRoute>
                  <Layout>
                    <RevenueList />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/schedules*"
              element={
                <PrivateRoute>
                  <Layout>
                    <ScheduleList />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/reports*"
              element={
                <PrivateRoute>
                  <Layout>
                    <ReportList />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/profile*"
              element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 