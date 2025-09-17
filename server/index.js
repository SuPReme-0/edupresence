const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Utility functions
async function validateTeacherClass(teacher_id, class_id) {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id')
      .eq('id', class_id)
      .eq('teacher_id', teacher_id)
      .single();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    return false;
  }
}

async function validateStudentEnrollment(student_id, class_id) {
  try {
    const { data, error } = await supabase
      .from('class_students')
      .select('class_id')
      .eq('class_id', class_id)
      .eq('student_id', student_id)
      .single();
    
    if (error) throw error;
    return !!data;
  } catch (error) {
    return false;
  }
}

// ===== API ROUTES =====

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'EduPresence Backend'
  });
});

// Generate BLE session token
app.post('/api/ble/session', async (req, res) => {
  try {
    const { class_id, teacher_id } = req.body;
    
    if (!class_id || !teacher_id) {
      return res.status(400).json({ error: 'Missing class_id or teacher_id' });
    }
    
    const isValid = await validateTeacherClass(teacher_id, class_id);
    if (!isValid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const {  classData, error: classError } = await supabase
      .from('classes')
      .select('name')
      .eq('id', class_id)
      .single();
    
    if (classError) throw classError;
    
    const sessionToken = jwt.sign(
      { 
        class_id, 
        teacher_id, 
        timestamp: Date.now(),
        expires_at: Date.now() + 300000
      },
      JWT_SECRET
    );
    
    io.emit('attendance_session_started', {
      class_id,
      class_name: classData.name,
      teacher_id,
      session_token: sessionToken,
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      success: true,
      session_token: sessionToken,
      message: 'Attendance session started'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Validate BLE session
app.post('/api/ble/validate', async (req, res) => {
  try {
    const { session_token } = req.body;
    
    if (!session_token) {
      return res.status(400).json({ error: 'Missing session_token' });
    }
    
    const decoded = jwt.verify(session_token, JWT_SECRET);
    
    if (decoded.expires_at < Date.now()) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    const {  classData, error: classError } = await supabase
      .from('classes')
      .select('name')
      .eq('id', decoded.class_id)
      .single();
    
    if (classError) throw classError;
    
    res.json({ 
      valid: true, 
      class_id: decoded.class_id,
      class_name: classData.name,
      teacher_id: decoded.teacher_id
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid session token' });
    }
    res.status(500).json({ error: 'Failed to validate session' });
  }
});

// Mark attendance
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { class_id, student_id, rssi, face_scan_data } = req.body;
    
    if (!class_id || !student_id) {
      return res.status(400).json({ error: 'Missing class_id or student_id' });
    }
    
    const isEnrolled = await validateStudentEnrollment(student_id, class_id);
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Student not enrolled' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const {  existingAttendance, error: existingError } = await supabase
      .from('attendance')
      .select('id')
      .eq('class_id', class_id)
      .eq('student_id', student_id)
      .eq('date', today)
      .maybeSingle();
    
    if (existingError) throw existingError;
    
    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance already marked' });
    }
    
    const { data, error } = await supabase
      .from('attendance')
      .insert([
        {
          class_id,
          student_id,
          date: today,
          status: true,
          rssi: rssi || null,
          face_scan_ face_scan_data || null
        }
      ])
      .select('*');
    
    if (error) throw error;
    
    io.emit('attendance_marked', {
      class_id,
      student_id,
      attendance: data[0],
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      attendance: data[0],
      message: 'Attendance marked'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_class', (classId) => {
    if (classId) {
      socket.join(`class_${classId}`);
      console.log(`User ${socket.id} joined class ${classId}`);
    }
  });
  
  socket.on('leave_class', (classId) => {
    if (classId) {
      socket.leave(`class_${classId}`);
      console.log(`User ${socket.id} left class ${classId}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`EduPresence Server running on port ${PORT}`);
});