import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare, CheckSquare } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

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
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/api/emails/`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const unreadEmails = data.emails.filter(email => !email.isRead).map(email => ({
            id: email.id,
            source: 'Email',
            message: `New email from ${email.from?.emailAddress?.name || 'Unknown'}: ${email.subject}`,
            time: new Date(email.receivedDateTime).toLocaleString(),
            type: 'email'
          }));
          setNotifications(unreadEmails);
        } else {
          console.error('Failed to fetch emails');
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchNotifications();
  }, []);

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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Notifications Hub</h1>
      <div className="mb-6 flex space-x-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>All</button>
        <button onClick={() => setFilter('email')} className={`px-4 py-2 rounded-full ${filter === 'email' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>Emails</button>
      </div>
      {filteredNotifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          icon={getIcon(notification.type)}
          source={notification.source}
          message={notification.message}
          time={notification.time}
        />
      ))}
    </div>
  );
};

export default NotificationsHub;