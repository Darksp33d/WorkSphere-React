import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmail } from '../Contexts/EmailContext';
const NotificationItem = ({ icon: Icon, source, message, time, onClick }) => (
  <motion.div 
    className="flex items-center p-4 bg-white rounded-lg shadow-md mb-4 cursor-pointer"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
    onClick={onClick}
  >
    <Icon className="text-purple-600 mr-4" size={24} />
    <div className="flex-grow">
      <p className="font-semibold text-gray-800">{source}</p>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
    <div className="flex items-center">
      <span className="text-sm text-gray-500 mr-2">{time}</span>
      <div className="w-2 h-2 rounded-full bg-purple-600"></div>
    </div>
  </motion.div>
);

const NotificationsHub = () => {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { emails } = useEmail();

  const notifications = emails
    .filter(email => !email.is_read)
    .map(email => ({
      id: email.email_id,
      source: 'Email',
      message: `New email from ${email.sender || 'Unknown'}: ${email.subject}`,
      time: new Date(email.received_date_time).toLocaleString(),
      type: 'email'
    }));

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

  const getIcon = (type) => {
    switch(type) {
      case 'email': return Mail;
      case 'message': return MessageSquare;
      case 'task': return CheckSquare;
      default: return Bell;
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'email') {
      navigate('/email', { state: { selectedEmailId: notification.id } });
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Notifications Hub</h1>
      <div className="mb-6 flex space-x-4">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 rounded-full transition-colors ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 hover:bg-purple-100'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('email')} 
          className={`px-4 py-2 rounded-full transition-colors ${filter === 'email' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 hover:bg-purple-100'}`}
        >
          Emails
        </button>
      </div>
      {filteredNotifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          icon={getIcon(notification.type)}
          source={notification.source}
          message={notification.message}
          time={notification.time}
          onClick={() => handleNotificationClick(notification)}
        />
      ))}
      {filteredNotifications.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No new notifications</p>
      )}
    </div>
  );
};

export default NotificationsHub;