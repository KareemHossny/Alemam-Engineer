import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EngineerLogin from './components/EngineerLogin';
import EngineerDashboard from './components/EngineerDashboard';
import { checkServerStatus, engineerAPI } from './utils/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [engineerInfo, setEngineerInfo] = useState(null);

  // التحقق من حالة السيرفر والمصادقة
  useEffect(() => {
    let isMounted = true;

    const initApp = async () => {
      const isOnline = await checkServerStatus();

      if (!isMounted) {
        return;
      }

      setServerOnline(isOnline);

      if (isOnline) {
        try {
          const response = await engineerAPI.getCurrentUser();
          if (isMounted && response.data?.user) {
            setIsAuthenticated(true);
            setEngineerInfo(response.data.user);
          }
        } catch (error) {
          if (error.response?.status !== 401) {
            console.error('Error restoring engineer session:', error);
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initApp();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = (userInfo) => {
    setIsAuthenticated(true);
    setEngineerInfo(userInfo);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEngineerInfo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading Engineer Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <EngineerLogin 
                  onLogin={handleLogin} 
                  serverOnline={serverOnline}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              isAuthenticated ? (
                <EngineerDashboard onLogout={handleLogout} engineerInfo={engineerInfo} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
