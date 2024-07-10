import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './Components/HomePage';
import Dashboard from './Components/Dashboard';
import AuthenticatedLayout from './Components/AuthenticatedLayout';
import NotificationsHub from './Components/NotificationsHub';
import DailyBriefing from './Components/DailyBriefing';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // Replace with actual auth check
  return isAuthenticated ? <AuthenticatedLayout>{children}</AuthenticatedLayout> : <Navigate to="/" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsHub /></PrivateRoute>} />
        <Route path ="/daily-briefing" element={<PrivateRoute><DailyBriefing /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default App;