import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { supabase } from '../../utils/supabaseClient';

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'teacher');
        
        if (teachersError) throw teachersError;
        
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
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
          {teachers.map((teacher, index) => (
            <TeacherCard3D
              key={teacher.id}
              teacher={teacher}
              position={[-4, 2 - index * 2.5, 0]}
              onClick={() => console.log('Teacher clicked:', teacher.name)}
            />
          ))}
          
          {/* Students Column */}
          {students.map((student, index) => (
            <StudentCard3D
              key={student.id}
              student={student}
              position={[4, 2 - index * 2.5, 0]}
              onClick={() => console.log('Student clicked:', student.name)}
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
        <h2 style={{ marginBottom: '2rem' }}>Admin Dashboard</h2>
        <div>
          <h3>Statistics</h3>
          <p>Total Teachers: {teachers.length}</p>
          <p>Total Students: {students.length}</p>
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
    </div>
  );
}