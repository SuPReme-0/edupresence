import { useState } from 'react';

export const useBLEScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [foundSessions, setFoundSessions] = useState([]);
  const [error, setError] = useState(null);

  const startScanning = async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth not supported');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);

      // Simulate scanning for EduPresence advertisements
      const mockSessions = [
        { 
          id: 'session_1', 
          class_id: 'math_101',
          teacher: 'Dr. Smith',
          rssi: -65,
          timestamp: Date.now()
        }
      ];

      setTimeout(() => {
        setFoundSessions(mockSessions);
        setIsScanning(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setFoundSessions([]);
  };

  const validateSession = async (sessionToken) => {
    try {
      // In a real implementation, this would call your backend
      console.log('Validating session:', sessionToken);
      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  };

  return {
    isScanning,
    foundSessions,
    error,
    startScanning,
    stopScanning,
    validateSession
  };
};
