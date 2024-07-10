import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, CheckSquare } from 'lucide-react';

const NotificationItem = ({ icon: Icon, source, message, time }) => (
  <motion.div 
    className="flex items-center p-4 bg-white rounded-lg shadow-md mb-4"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Icon className="text-gray-500 mr-4" size={24} />
    <div className="flex-grow">
      <p className="font-semibold text-gray-800">{source}</p>
      <p className="text-gray-600">{message}</p>
    </div>
    <span className="text-sm text-gray-500">{time}</span>
  </motion.div>
);

const NotificationsHub = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // TODO: Fetch notifications from API
    const dummyNotifications = [
      { id: 1, source: 'Email', message: 'New email from John Doe', time: '5m ago', type: 'email' },
      { id: 2, source: 'Slack', message: 'Mention in #general channel', time: '10m ago', type: 'message' },
      { id: 3, source: 'Jira', message: 'Task "Implement login" assigned to you', time: '1h ago', type: 'task' },
      // ... more dummy notifications
    ];
    setNotifications(dummyNotifications);
  }, []);

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Notifications Hub</h1>
      <div className="mb-6 flex space-x-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>All</button>
        <button onClick={() => setFilter('email')} className={`px-4 py-2 rounded-full ${filter === 'email' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Emails</button>
        <button onClick={() => setFilter('message')} className={`px-4 py-2 rounded-full ${filter === 'message' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Messages</button>
        <button onClick={() => setFilter('task')} className={`px-4 py-2 rounded-full ${filter === 'task' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Tasks</button>
      </div>
      {filteredNotifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          icon={notification.type === 'email' ? Mail : notification.type === 'message' ? MessageSquare : CheckSquare}
          source={notification.source}
          message={notification.message}
          time={notification.time}
        />
      ))}
    </div>
  );
};

export default NotificationsHub;