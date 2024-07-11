import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './Components/HomePage';
import Dashboard from './Components/Dashboard';
import AuthenticatedLayout from './Components/AuthenticatedLayout';
import NotificationsHub from './Components/NotificationsHub';
import DailyBriefing from './Components/DailyBriefing';
import EmailInterface from './Components/EmailInterface';
import Settings from './Components/Settings';
import { EmailProvider } from './Contexts/EmailContext';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // Replace with actual auth check
  return isAuthenticated ? <AuthenticatedLayout>{children}</AuthenticatedLayout> : <Navigate to="/" />;
};

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch(`${API_URL}/get-csrf-token/`, {
          credentials: 'include',
        });
        const data = await response.json();
        document.cookie = `csrftoken=${data.csrfToken}; path=/; Secure; SameSite=None`;
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    fetchCsrfToken();
  }, []);
  
  return (
    <EmailProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsHub /></PrivateRoute>} />
          <Route path="/daily-briefing" element={<PrivateRoute><DailyBriefing /></PrivateRoute>} />
          <Route path="/email" element={<PrivateRoute><EmailInterface /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
      </Router>
    </EmailProvider>
  );
}

export default App;