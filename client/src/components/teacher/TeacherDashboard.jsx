import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useBLEScanner } from '../../hooks/useBLEScanner';
import { useBLEAdvertiser } from '../../hooks/useBLEAdvertiser';

function ClassOrb3D({ classData, position, isSelected, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const scale = isSelected ? 1.3 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const color = isSelected ? '#f59e0b' : '#3b82f6';

  return (
    <group 
      position={position}
      onClick={onClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[isSelected ? 1.2 : 1, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, 0, 1.1]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {classData.name}
      </Text>
      <Text
        position={[0, -0.3, 1.1]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {classData.time}
      </Text>
    </group>
  );
}

function AttendanceList({ className, students, onStudentClick }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '10px',
      padding: '1rem',
      margin: '1rem 0',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: '1rem' }}>{className} Attendance</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {students.map((student) => (
          <li 
            key={student.id} 
            style={{ 
              padding: '0.5rem', 
              margin: '0.5rem 0',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => onStudentClick(student)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{student.name}</span>
              <span style={{ color: student.status ? '#10b981' : '#f59e0b' }}>
                {student.status ? 'Present' : 'Absent'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBLEStatus, setShowBLEStatus] = useState(false);
  const { user } = useAuth();
  const { isScanning, foundSessions, startScanning, stopScanning } = useBLEScanner();
  const { isAdvertising, startAdvertising, stopAdvertising } = useBLEAdvertiser();
  const [advertisingState, setAdvertisingState] = useState('idle');

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', user.id);
        
        if (error) throw error;
        
        // Add mock time data for display
        const classesWithTime = (data || []).map(cls => ({
          ...cls,
          time: '10:00 AM' // In a real app, this would come from schedule
        }));
        
        setClasses(classesWithTime);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClasses();
  }, [user]);

  const handleStartAttendance = async () => {
    if (!selectedClass) return;
    
    try {
      // Start BLE advertising
      await startAdvertising(selectedClass.id, user.id);
      setAdvertisingState('advertising');
      
      // Start scanning for students
      await startScanning();
      
      // Show status
      setShowBLEStatus(true);
      
      // Simulate successful attendance session
      setTimeout(() => {
        setAdvertisingState('complete');
        setShowBLEStatus(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to start attendance:', error);
    }
  };

  const handleStopAttendance = async () => {
    try {
      await stopAdvertising();
      await stopScanning();
      setAdvertisingState('idle');
      setShowBLEStatus(false);
    } catch (error) {
      console.error('Failed to stop attendance:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
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
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
    }}>
      {/* 3D Classes Visualization */}
      <div style={{ width: '60%', position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {classes.map((cls, index) => (
            <ClassOrb3D
              key={cls.id}
              classData={cls}
              position={[0, 3 - index * 3, 0]}
              isSelected={selectedClass?.id === cls.id}
              onClick={() => setSelectedClass(cls)}
            />
          ))}
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={true}
            minDistance={5}
            maxDistance={20}
          />
        </Canvas>
      </div>

      {/* Class Details Panel */}
      <div style={{
        width: '40%',
        background: 'rgba(30, 58, 138, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        color: 'white',
        overflowY: 'auto'
      }}>
        {selectedClass ? (
          <>
            <h2 style={{ marginBottom: '1.5rem' }}>{selectedClass.name}</h2>
            <p>Time: {selectedClass.time}</p>
            <p>Students: {selectedClass.students || 25}</p>
            
            <div style={{ marginTop: '2rem' }}>
              <h3>Student List</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {Array.from({ length: selectedClass.students || 25 }, (_, i) => (
                  <li 
                    key={i} 
                    style={{ 
                      padding: '0.5rem', 
                      margin: '0.5rem 0',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '5px'
                    }}
                  >
                    Student {i + 1}
                  </li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={handleStartAttendance}
              disabled={advertisingState === 'advertising'}
              style={{
                marginTop: '2rem',
                padding: '1rem 2rem',
                background: advertisingState === 'advertising' ? '#4f46e5' : '#f59e0b',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: advertisingState === 'advertising' ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              {advertisingState === 'advertising' ? 'Attendance in Progress' : 'Start Attendance'}
            </button>
            
            {advertisingState === 'advertising' && (
              <button
                onClick={handleStopAttendance}
                style={{
                  marginTop: '1rem',
                  padding: '0.8rem 1.5rem',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Stop Attendance
              </button>
            )}
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%' 
          }}>
            <p>Select a class to view details</p>
          </div>
        )}
        
        {/* BLE Status */}
        {showBLEStatus && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h4>BLE Status</h4>
            <p>Advertising: {advertisingState === 'advertising' ? 'Active' : 'Idle'}</p>
            <p>Scanning: {isScanning ? 'Active' : 'Idle'}</p>
            {foundSessions.length > 0 && (
              <p>Found {foundSessions.length} student devices</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
