import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import AddUserPopup from './AddUserPopup';

function TeacherCard3D({ teacher, position, onClick }) {
  const meshRef = useRef();
  const groupRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <mesh ref={meshRef}>
        <boxGeometry args={[1.5, 2, 0.2]} />
        <meshStandardMaterial 
          color="#4f46e5" 
          transparent
          opacity={0.9}
        />
      </mesh>
      <Text
        position={[0, 0.5, 0.11]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {teacher.name}
      </Text>
      <Text
        position={[0, -0.2, 0.11]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {teacher.classes} classes
      </Text>
    </group>
  );
}

function StudentCard3D({ student, position, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[1]) * 0.1;
    }
  });

  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial 
          color="#10b981" 
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {student.name}
      </Text>
    </group>
  );
}

export default function AdminDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addType, setAddType] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch teachers
        const {  teachersData, error: teachersError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'teacher');
        
        if (teachersError) throw teachersError;
        
        // Fetch students
        const {  studentsData, error: studentsError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'student');
        
        if (studentsError) throw studentsError;
        
        setTeachers(teachersData || []);
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleAddUser = (type) => {
    setAddType(type);
    setShowAddUser(true);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white'
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      {/* 3D Visualization Area */}
      <div style={{ width: '70%', position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Teachers Column */}
          {filteredTeachers.map((teacher, index) => (
            <TeacherCard3D
              key={teacher.id}
              teacher={teacher}
              position={[-4, 2 - index * 2.5, 0]}
              onClick={() => setSelectedTeacher(teacher)}
            />
          ))}
          
          {/* Students Column */}
          {filteredStudents.map((student, index) => (
            <StudentCard3D
              key={student.id}
              student={student}
              position={[4, 2 - index * 2.5, 0]}
              onClick={() => setSelectedStudent(student)}
            />
          ))}
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={true}
            minDistance={5}
            maxDistance={30}
          />
        </Canvas>
      </div>

      {/* Sidebar */}
      <div style={{
        width: '30%',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        overflowY: 'auto',
        color: 'white'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Admin Dashboard</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => handleAddUser('student')}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Add Student
            </button>
            <button
              onClick={() => handleAddUser('teacher')}
              style={{
                padding: '0.5rem 1rem',
                background: '#4f46e5',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Add Teacher
            </button>
          </div>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3>Search Users</h3>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '5px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Recent Activity</h3>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '1rem', 
            borderRadius: '10px',
            marginBottom: '1rem'
          }}>
            <h4>Attendance Session Started</h4>
            <p>Math 101 - Dr. Smith</p>
            <small>2 minutes ago</small>
          </div>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '1rem', 
            borderRadius: '10px',
            marginBottom: '1rem'
          }}>
            <h4>New Student Registered</h4>
            <p>Alex Chen - Computer Science</p>
            <small>5 minutes ago</small>
          </div>
        </div>
      </div>
      
      {/* Add User Popup */}
      {showAddUser && (
        <AddUserPopup
          onClose={() => setShowAddUser(false)}
          type={addType}
          onSuccess={() => {
            setShowAddUser(false);
            // Refresh user list
          }}
        />
      )}
    </div>
  );
}
