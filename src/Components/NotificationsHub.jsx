import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageSquare } from 'lucide-react';
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
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { emails } = useEmail();

  useEffect(() => {
    async function fetchNotifications() {
      const slackResponse = await fetch('/api/get-unread-slack-messages/', { credentials: 'include' });
      const slackData = await slackResponse.json();

      const emailNotifications = emails
        .filter(email => !email.is_read)
        .map(email => ({
          id: email.email_id,
          source: 'Email',
          message: `New email from ${email.sender || 'Unknown'}: ${email.subject}`,
          time: new Date(email.received_date_time).toLocaleString(),
          type: 'email'
        }));

      const slackNotifications = slackData.messages ? slackData.messages.map(msg => ({
        id: msg.ts,
        source: 'Slack',
        message: msg.text,
        time: new Date(parseFloat(msg.ts) * 1000).toLocaleString(),
        type: 'slack'
      })) : [];

      setNotifications([...emailNotifications, ...slackNotifications]);
    }
    fetchNotifications();
  }, [emails]);

  const handleNotificationClick = (notification) => {
    if (notification.type === 'email') {
      navigate('/email', { state: { selectedEmailId: notification.id } });
    } else if (notification.type === 'slack') {
      window.location.href = `https://slack.com/app_redirect?channel=${notification.channel}&message=${notification.id}`;
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Notifications Hub</h1>
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          icon={notification.type === 'email' ? Mail : MessageSquare}
          source={notification.source}
          message={notification.message}
          time={notification.time}
          onClick={() => handleNotificationClick(notification)}
        />
      ))}
      {notifications.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No new notifications</p>
      )}
    </div>
  );
};

export default NotificationsHub;
