const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const api = {
  // BLE Session Management
  createBLESession: async (classId, teacherId) => {
    const response = await fetch(`${API_BASE_URL}/api/ble/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ class_id: classId, teacher_id: teacherId })
    });
    return response.json();
  },

  validateBLESession: async (sessionToken) => {
    const response = await fetch(`${API_BASE_URL}/api/ble/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_token: sessionToken })
    });
    return response.json();
  },

  // Attendance Management
  markAttendance: async (attendanceData) => {
    const response = await fetch(`${API_BASE_URL}/api/attendance/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(attendanceData)
    });
    return response.json();
  },

  // User Management
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users`);
    return response.json();
  },

  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
};
