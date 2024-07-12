import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, BarChart, Clock, Mail, MessageSquare, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmail } from '../Contexts/EmailContext';
import { useAuth } from '../Contexts/AuthContext';
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

const NotificationPreview = ({ notification, onClick }) => (
  <motion.div 
    className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {notification.type === 'email' && <Mail size={18} className="text-blue-600 mr-3" />}
        {notification.type === 'slack' && <MessageSquare size={18} className="text-green-600 mr-3" />}
        {notification.type === 'sphereconnect' && <Hash size={18} className="text-purple-600 mr-3" />}
        <div>
          <p className="font-semibold text-gray-800">{notification.source}</p>
          <p className="text-sm text-gray-600 truncate">{notification.message}</p>
        </div>
      </div>
      <div className="flex items-center">
        <p className="text-xs text-gray-500 mr-2">{notification.time}</p>
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { emails } = useEmail();
  const { user } = useAuth();
  const [slackMessages, setSlackMessages] = useState([]);
  const [sphereConnectMessages, setSphereConnectMessages] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [slackResponse, sphereConnectResponse] = await Promise.all([
        fetch(`${API_URL}/api/get-unread-slack-messages/`, { credentials: 'include' }),
        fetch(`${API_URL}/api/get-recent-messages/`, { credentials: 'include' })
      ]);

      const [slackData, sphereConnectData] = await Promise.all([
        slackResponse.json(),
        sphereConnectResponse.json()
      ]);

      if (slackData.messages) {
        setSlackMessages(slackData.messages.slice(0, 3));
      }

      if (sphereConnectData.messages) {
        setSphereConnectMessages(sphereConnectData.messages.slice(0, 3));
      }
    }

    fetchData();
  }, []);

  const unreadEmails = emails.filter(email => !email.is_read).slice(0, 3);

  const allNotifications = [
    ...unreadEmails.map(email => ({
      id: email.email_id,
      type: 'email',
      source: 'Email',
      message: `${email.sender || 'Unknown'}: ${email.subject || '(No subject)'}`,
      time: new Date(email.received_date_time).toLocaleString()
    })),
    ...slackMessages.map(message => ({
      id: message.ts,
      type: 'slack',
      source: 'Slack',
      message: message.text,
      time: new Date(parseFloat(message.ts) * 1000).toLocaleString()
    })),
    ...sphereConnectMessages.map(message => ({
      id: message.id,
      type: 'sphereconnect',
      source: 'SphereConnect',
      message: `${message.sender}: ${message.content}`,
      time: new Date(message.timestamp).toLocaleString()
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'email':
        navigate('/email', { state: { selectedEmailId: notification.id } });
        break;
      case 'slack':
        window.location.href = `https://slack.com/app_redirect?channel=${notification.channel}&message=${notification.id}`;
        break;
      case 'sphereconnect':
        navigate('/messaging', { state: { selectedMessageId: notification.id } });
        break;
      default:
        break;
    }
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
            <Card title="Notifications" value={allNotifications.length} icon={Bell} color="bg-blue-100" />
            <Card title="Team Members" value="12" icon={Users} color="bg-green-100" />
            <Card title="Projects" value="7" icon={BarChart} color="bg-yellow-100" />
            <Card title="Hours Logged" value="128" icon={Clock} color="bg-purple-100" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
            {allNotifications.map((notification, index) => (
              <NotificationPreview 
                key={`${notification.type}-${notification.id}`}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
            {allNotifications.length === 0 && (
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