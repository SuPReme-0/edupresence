import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '../../hooks/useAuth';

function FloatingOrbs() {
  const meshRef = useRef();
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const orbs = Array.from({ length: 12 }, (_, i) => ({
    position: [
      Math.sin(i * 0.5) * 3,
      Math.cos(i * 0.7) * 2,
      Math.cos(i * 0.3) * 3
    ],
    color: new THREE.Color().setHSL(i / 12, 0.8, 0.6),
    scale: 0.3 + Math.sin(i) * 0.1
  }));

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <Sphere
          key={i}
          ref={meshRef}
          position={orb.position}
          args={[orb.scale, 32, 32]}
        >
          <meshStandardMaterial 
            color={orb.color} 
            emissive={orb.color.clone().multiplyScalar(0.3)}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}
    </group>
  );
}

function AnimatedTitle() {
  const textRef = useRef();
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      textRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, 2, 0]}
      fontSize={1.5}
      color="#4f46e5"
      anchorX="center"
      anchorY="middle"
    >
      EduPresence
    </Text>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await signIn(email, password);

      if (error) throw error;

      const role = data.user?.user_metadata?.role;
      switch (role) {
        case 'admin': navigate('/admin'); break;
        case 'teacher': navigate('/teacher'); break;
        case 'student': navigate('/student'); break;
        default: setError('Unknown role');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      {/* 3D Background */}
      <div style={{ width: '60%', position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <FloatingOrbs />
          <AnimatedTitle />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Login Form */}
      <div style={{
        width: '40%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <form 
          onSubmit={handleSubmit}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            width: '350px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <h2 style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '2rem',
            fontWeight: '300'
          }}>Welcome Back</h2>
          
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fecaca',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '10px',
              border: 'none',
              background: isLoading ? '#4f46e5' : '#6366f1',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}