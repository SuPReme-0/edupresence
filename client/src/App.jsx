import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/common/LoadingSpinner';
import LoginPage from './components/auth/LoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import './styles/globals.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={user?.user_metadata?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/teacher" element={user?.user_metadata?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />} />
        <Route path="/student" element={user?.user_metadata?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? `/${user.user_metadata.role}` : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;