import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import { useBLEScanner } from '../../hooks/useBLEScanner';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

function ClassCard3D({ classData, position, onClick }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
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
        <boxGeometry args={[2.5, 1, 0.2]} />
        <meshStandardMaterial 
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, 0.2, 0.11]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {classData.name}
      </Text>
      <Text
        position={[0, -0.2, 0.11]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {classData.teacher}
      </Text>
    </group>
  );
}

function AttendancePopup({ classData, onClose, onConfirm }) {
  const [step, setStep] = useState('ble');
  const [bleStatus, setBleStatus] = useState('scanning');
  const [faceScanResult, setFaceScanResult] = useState(null);
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setBleStatus('found');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleProceed = () => {
    if (step === 'ble' && bleStatus === 'found') {
      setStep('face');
    } else if (step === 'face') {
      onConfirm();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        width: '400px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>
          {step === 'ble' ? 'Bluetooth Verification' : 'Face Scan'}
        </h2>
        
        {step === 'ble' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              {bleStatus === 'scanning' && (
                <>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                  }}></div>
                  <p>Scanning for teacher device...</p>
                </>
              )}
              
              {bleStatus === 'found' && (
                <>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#10b981',
                    borderRadius: '50%',
                    margin: '0 auto 1rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '2rem' }}>✓</span>
                  </div>
                  <p>Teacher device found!</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    RSSI: -65dB (Good signal)
                  </p>
                </>
              )}
            </div>
            
            <button
              onClick={handleProceed}
              disabled={bleStatus !== 'found'}
              style={{
                padding: '0.8rem 2rem',
                background: bleStatus === 'found' ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: bleStatus === 'found' ? 'pointer' : 'not-allowed',
                width: '100%',
                marginBottom: '1rem'
              }}
            >
              Proceed to Face Scan
            </button>
          </>
        )}
        
        {step === 'face' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                width: '200px',
                height: '200px',
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                margin: '0 auto 1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '150px',
                  height: '150px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '50%',
                  position: 'relative'
                }}>
                  {/* Simulated face mesh */}
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i}
                      style={{
                        position: 'absolute',
                        width: '4px',
                        height: '4px',
                        background: '#f59e0b',
                        borderRadius: '50%',
                        top: `${50 + 40 * Math.sin(i * Math.PI/6)}%`,
                        left: `${50 + 40 * Math.cos(i * Math.PI/6)}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))}
                </div>
              </div>
              <p>Position your face in the frame</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Scanning... 2 seconds
              </p>
            </div>
            
            <button
              onClick={handleProceed}
              style={{
                padding: '0.8rem 2rem',
                background: '#10b981',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                width: '100%',
                marginBottom: '1rem'
              }}
            >
              Mark Attendance
            </button>
          </>
        )}
        
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [classes] = useState([
    { id: 1, name: 'Math 101', teacher: 'Dr. Smith', time: '10:00 AM' },
    { id: 2, name: 'Physics 201', teacher: 'Prof. Johnson', time: '2:00 PM' },
    { id: 3, name: 'Chemistry 301', teacher: 'Ms. Davis', time: '4:00 PM' }
  ]);

  const { isScanning, foundSessions, error, startScanning } = useBLEScanner();
  const [foundSession, setFoundSession] = useState(null);
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Simulate finding a session
  useEffect(() => {
    if (foundSessions.length > 0) {
      setFoundSession(foundSessions[0]);
    }
  }, [foundSessions]);

  const handleJoinClass = (classId) => {
    setSelectedClass(classId);
    setShowAttendancePopup(true);
  };

  const handleConfirmAttendance = () => {
    // In a real implementation, this would call your backend API
    console.log('Attendance confirmed for class:', selectedClass);
    setShowAttendancePopup(false);
  };

  if (showAttendancePopup) {
    return (
      <AttendancePopup
        classData={classes.find(c => c.id === selectedClass)}
        onClose={() => setShowAttendancePopup(false)}
        onConfirm={handleConfirmAttendance}
      />
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex',
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
    }}>
      {/* 3D Classes List */}
      <div style={{ width: '60%', position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          {classes.map((cls, index) => (
            <ClassCard3D
              key={cls.id}
              classData={cls}
              position={[0, 2 - index * 2, 0]}
              onClick={() => handleJoinClass(cls.id)}
            />
          ))}
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
          />
        </Canvas>
      </div>

      {/* Attendance Panel */}
      <div style={{
        width: '40%',
        background: 'rgba(109, 40, 217, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!isScanning && !foundSession && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '2rem' }}>Ready for Attendance</h2>
            <button
              onClick={startScanning}
              style={{
                padding: '1.2rem 2.5rem',
                background: '#f59e0b',
                border: 'none',
                borderRadius: '15px',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Scan for Classes
            </button>
            <p style={{ marginTop: '1rem', opacity: 0.8 }}>
              Make sure Bluetooth is enabled
            </p>
          </div>
        )}

        {isScanning && !foundSession && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid #f59e0b',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 2rem'
            }}></div>
            <h3>Scanning for classes...</h3>
            <p>Please ensure you're near your teacher</p>
          </div>
        )}

        {foundSession && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', color: '#f59e0b' }}>
              Class Found!
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
              {foundSession.class_id} - {foundSession.teacher}
            </p>
            <button
              style={{
                padding: '1.2rem 2.5rem',
                background: '#10b981',
                border: 'none',
                borderRadius: '15px',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Proceed to Face Scan
            </button>
            <button
              onClick={() => {
                setFoundSession(null);
              }}
              style={{
                padding: '0.8rem 2rem',
                background: 'transparent',
                border: '1px solid white',
                borderRadius: '15px',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
