import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthFlow from './components/Auth/AuthFlow';
import Dashboard from './components/Dashboard/Dashboard';
import Supermarkets from './components/Management/Supermarkets';
import Branches from './components/Management/Branches';
import Users from './components/Management/Users';
import Feedback from './components/Management/Feedback';
import AuditLogs from './components/Management/AuditLogs';
import Network from './components/Management/Network';
import Finance from './components/Management/Finance';
import Settings from './components/Management/Settings';
import BusinessTypes from './components/Management/BusinessTypes';
import Ads from './components/Management/Ads';
import AppFeedback from './components/Management/AppFeedback';
import Layout from './components/Layout/Layout';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>('bezaw-terminal');
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const updateTheme = (newTheme: string) => setTheme(newTheme);
  const updateMode = (newMode: 'light' | 'dark') => setMode(newMode);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-mode', mode);
  }, [theme, mode]);

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<AuthFlow onLoginSuccess={handleLogin} />} />
        ) : (
          <Route element={<Layout onLogout={handleLogout} theme={theme} mode={mode} onModeToggle={() => updateMode(mode === 'light' ? 'dark' : 'light')} />}>
            <Route path="/dashboard" element={<Dashboard theme={mode} />} />
            <Route path="/supermarkets" element={<Supermarkets theme={mode} />} />
            <Route path="/branches" element={<Branches theme={mode} />} />
            <Route path="/network" element={<Network theme={mode} />} />
            <Route path="/finance" element={<Finance theme={mode} />} />
            <Route path="/business-types" element={<BusinessTypes theme={mode} />} />
            <Route path="/users" element={<Users theme={mode} />} />
            <Route path="/feedback" element={<Feedback theme={mode} />} />
            <Route path="/app-feedback" element={<AppFeedback theme={mode} />} />
            <Route path="/audit" element={<AuditLogs theme={mode} />} />
            <Route path="/ads" element={<Ads isDarkMode={mode === 'dark'} />} />
            <Route path="/settings" element={<Settings theme={theme} mode={mode} onThemeChange={updateTheme} onModeChange={updateMode} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default App;
