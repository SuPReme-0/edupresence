import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Simple loading spinner component (inline to avoid path issues)
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: 'white'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      border: '4px solid rgba(255, 255, 255, 0.3)',
      borderTop: '4px solid #4f46e5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }}></div>
    <p>{message}</p>
    
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

// Simple components for now
const LoginPage = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: 'white'
  }}>
    <h1>Login Page</h1>
  </div>
);

const AdminDashboard = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: 'white'
  }}>
    <h1>Admin Dashboard</h1>
  </div>
);

const TeacherDashboard = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    color: 'white'
  }}>
    <h1>Teacher Dashboard</h1>
  </div>
);

const StudentDashboard = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    color: 'white'
  }}>
    <h1>Student Dashboard</h1>
  </div>
);

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
