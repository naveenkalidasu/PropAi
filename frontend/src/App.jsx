import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Shared Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Roadmap from './pages/Roadmap';
import InterviewHub from './pages/InterviewHub';
import MockInterview from './pages/MockInterview';
import CodingRound from './pages/CodingRound';
import ReportDetail from './pages/ReportDetail';
import PracticeArena from './pages/PracticeArena';
import AdminPanel from './pages/AdminPanel';

// Protected Route Wrapper for Candidates
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-darkbg-900">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-darkbg-900 transition-colors duration-300">
      <Navbar />
      <div class="flex flex-1">
        <Sidebar />
        <main class="flex-1 overflow-y-auto max-h-[calc(100vh-73px)]">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

// Protected Admin Route Guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-darkbg-900">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-darkbg-900 transition-colors duration-300">
      <Navbar />
      <div class="flex flex-1">
        <Sidebar />
        <main class="flex-1 overflow-y-auto max-h-[calc(100vh-73px)]">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Candidate Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewHub /></ProtectedRoute>} />
            <Route path="/interview/mock" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
            <Route path="/interview/coding" element={<ProtectedRoute><CodingRound /></ProtectedRoute>} />
            <Route path="/reports/:interviewId" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><PracticeArena /></ProtectedRoute>} />

            {/* Admin Guarded Routes */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
