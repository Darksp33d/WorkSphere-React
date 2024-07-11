import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, BarChart, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationsHub from './NotificationsHub';
import DailyBriefing from './DailyBriefing';

const API_URL = process.env.REACT_APP_API_URL;

const Card = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    className={`bg-white p-6 rounded-lg shadow-lg ${color}`}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <Icon size={32} className="text-gray-400" />
    </div>
  </motion.div>
);

const UnreadEmailPreview = ({ email, onClick }) => (
  <motion.div 
    className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Mail size={18} className="text-purple-600 mr-3" />
        <div>
          <p className="font-semibold text-gray-800">{email.sender || 'Unknown Sender'}</p>
          <p className="text-sm text-gray-600 truncate">{email.subject || '(No subject)'}</p>
        </div>
      </div>
      <div className="flex items-center">
        <p className="text-xs text-gray-500 mr-2">{new Date(email.received_date_time).toLocaleString()}</p>
        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [unreadEmails, setUnreadEmails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/emails/`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const unread = data.emails.filter(email => !email.is_read).slice(0, 3);
          setUnreadEmails(unread);
        } else {
          console.error('Failed to fetch emails');
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchEmails();
  }, []);

  const handleEmailClick = (email) => {
    navigate('/email', { state: { selectedEmailId: email.email_id } });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <motion.h1 
        className="text-3xl font-bold text-gray-800 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome back, User!
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card title="Notifications" value={unreadEmails.length} icon={Bell} color="bg-purple-100" />
            <Card title="Team Members" value="12" icon={Users} color="bg-blue-100" />
            <Card title="Projects" value="7" icon={BarChart} color="bg-green-100" />
            <Card title="Hours Logged" value="128" icon={Clock} color="bg-yellow-100" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Unread Emails</h2>
            {unreadEmails.map(email => (
              <UnreadEmailPreview key={email.email_id} email={email} onClick={() => handleEmailClick(email)} />
            ))}
            {unreadEmails.length === 0 && (
              <p className="text-center text-gray-500">No unread emails</p>
            )}
          </div>
        </div>
        <div>
          <DailyBriefing />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;