import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, BarChart, Clock, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmail } from '../Contexts/EmailContext';
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

const UnreadSlackMessagePreview = ({ message, onClick }) => (
  <motion.div 
    className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <MessageSquare size={18} className="text-purple-600 mr-3" />
        <div>
          <p className="font-semibold text-gray-800">{message.user || 'Unknown User'}</p>
          <p className="text-sm text-gray-600 truncate">{message.text}</p>
        </div>
      </div>
      <div className="flex items-center">
        <p className="text-xs text-gray-500 mr-2">{new Date(parseFloat(message.ts) * 1000).toLocaleString()}</p>
        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
      </div>
    </div>
  </motion.div>
);

const UnreadSphereConnectMessagePreview = ({ message, onClick }) => (
  <motion.div 
    className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <MessageSquare size={18} className="text-purple-600 mr-3" />
        <div>
          <p className="font-semibold text-gray-800">{message.sender}</p>
          <p className="text-sm text-gray-600 truncate">{message.content}</p>
        </div>
      </div>
      <div className="flex items-center">
        <p className="text-xs text-gray-500 mr-2">{new Date(message.timestamp).toLocaleString()}</p>
        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { emails } = useEmail();
  const { user } = useAuth();  // Use the useAuth hook to get the user
  const [slackMessages, setSlackMessages] = useState([]);
  const [sphereConnectMessages, setSphereConnectMessages] = useState([]);

  useEffect(() => {
    async function fetchSlackMessages() {
      const response = await fetch(`${API_URL}/api/get-unread-slack-messages/`, { credentials: 'include' });
      const data = await response.json();
      if (data.messages) {
        setSlackMessages(data.messages.slice(0, 3));
      }
    }

    async function fetchSphereConnectMessages() {
      const response = await fetch(`${API_URL}/api/get-private-messages/`, { credentials: 'include' });
      const data = await response.json();
      if (data.messages) {
        setSphereConnectMessages(data.messages.slice(0, 3));
      }
    }

    fetchSlackMessages();
    fetchSphereConnectMessages();
  }, []);

  const unreadEmails = emails.filter(email => !email.is_read).slice(0, 3);

  const handleEmailClick = (email) => {
    navigate('/email', { state: { selectedEmailId: email.email_id } });
  };

  const handleSlackMessageClick = (message) => {
    window.location.href = `https://slack.com/app_redirect?channel=${message.channel}&message=${message.ts}`;
  };

  const handleSphereConnectMessageClick = (message) => {
    navigate('/messaging', { state: { selectedMessageId: message.id } });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <motion.h1 
        className="text-3xl font-bold text-gray-800 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome back, {user?.first_name || 'User'}!
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card title="Notifications" value={unreadEmails.length + slackMessages.length + sphereConnectMessages.length} icon={Bell} color="bg-purple-100" />
            <Card title="Team Members" value="12" icon={Users} color="bg-blue-100" />
            <Card title="Projects" value="7" icon={BarChart} color="bg-green-100" />
            <Card title="Hours Logged" value="128" icon={Clock} color="bg-yellow-100" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
            {[...unreadEmails, ...slackMessages, ...sphereConnectMessages].slice(0, 5).map((notification, index) => {
              if ('email_id' in notification) {
                return <UnreadEmailPreview key={notification.email_id} email={notification} onClick={() => handleEmailClick(notification)} />;
              } else if ('ts' in notification) {
                return <UnreadSlackMessagePreview key={notification.ts} message={notification} onClick={() => handleSlackMessageClick(notification)} />;
              } else {
                return <UnreadSphereConnectMessagePreview key={notification.id} message={notification} onClick={() => handleSphereConnectMessageClick(notification)} />;
              }
            })}
            {unreadEmails.length + slackMessages.length + sphereConnectMessages.length === 0 && (
              <p className="text-center text-gray-500">No unread notifications</p>
            )}
            <motion.button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/notifications')}
            >
              View All Notifications
            </motion.button>
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