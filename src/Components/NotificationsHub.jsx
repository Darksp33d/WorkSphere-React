import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, MessageSquare, Slack, Hash, X } from 'lucide-react';
import { useEmail } from '../Contexts/EmailContext';

const API_URL = process.env.REACT_APP_API_URL;

const NotificationItem = ({ notification, onDismiss, onClick }) => (
  <motion.div 
    className="flex items-center p-4 bg-white rounded-lg shadow-md mb-4 cursor-pointer"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    onClick={onClick}
  >
{notification.type === 'email' && <Mail className="text-blue-600 mr-4 flex-shrink-0" size={24} />}
    {notification.type === 'slack' && <Slack className="text-green-600 mr-4 flex-shrink-0" size={24} />}
    {notification.type === 'sphereconnect' && <Hash className="text-purple-600 mr-4 flex-shrink-0" size={24} />}
    <div className="flex-grow">
      <p className="font-semibold text-gray-800">{notification.source}</p>
      <p className="text-gray-600 text-sm">{notification.message}</p>
      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
    </div>
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onDismiss(notification.id, notification.type);
      }}
      className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
    >
      <X size={16} className="text-gray-500" />
    </button>
  </motion.div>
);

const NotificationsHub = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { emails } = useEmail();

  useEffect(() => {
    fetchNotifications();
  }, [emails]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const [slackResponse, sphereConnectResponse] = await Promise.all([
        fetch(`${API_URL}/api/get-unread-slack-messages/`, { credentials: 'include' }),
        fetch(`${API_URL}/api/get-unread-sphereconnect-messages/`, { credentials: 'include' })
      ]);

      const [slackData, sphereConnectData] = await Promise.all([
        slackResponse.json(),
        sphereConnectResponse.json()
      ]);

      const emailNotifications = emails
        .filter(email => !email.is_read)
        .map(email => ({
          id: email.email_id,
          type: 'email',
          source: 'Email',
          message: `New email from ${email.sender || 'Unknown'}: ${email.subject}`,
          time: new Date(email.received_date_time).toLocaleString()
        }));

      const slackNotifications = slackData.messages ? slackData.messages.map(msg => ({
        id: msg.ts,
        type: 'slack',
        source: 'Slack',
        message: msg.text,
        time: new Date(parseFloat(msg.ts) * 1000).toLocaleString()
      })) : [];

      const sphereConnectNotifications = sphereConnectData.messages ? sphereConnectData.messages.map(msg => ({
        id: msg.id,
        type: 'sphereconnect',
        source: 'SphereConnect',
        message: `New message in ${msg.channel_name}: ${msg.content}`,
        time: new Date(msg.timestamp).toLocaleString(),
        groupId: msg.group_id
      })) : [];

      setNotifications([...emailNotifications, ...slackNotifications, ...sphereConnectNotifications]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    switch (notification.type) {
      case 'email':
        navigate('/email', { state: { selectedEmailId: notification.id } });
        break;
      case 'slack':
        window.location.href = `https://slack.com/app_redirect?channel=${notification.channel}&message=${notification.id}`;
        break;
      case 'sphereconnect':
        await fetch(`${API_URL}/api/mark-sphereconnect-message-read/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
          body: JSON.stringify({ message_id: notification.id }),
          credentials: 'include',
        });
        navigate('/messaging', { state: { selectedMessageId: notification.id, groupId: notification.groupId } });
        break;
      default:
        break;
    }
    handleDismiss(notification.id, notification.type);
  };

  const handleDismiss = async (notificationId, notificationType) => {
    let endpoint;
    switch (notificationType) {
      case 'email':
        endpoint = `${API_URL}/api/mark-email-read/`;
        break;
      case 'slack':
        // Implement Slack message marking as read if applicable
        break;
      case 'sphereconnect':
        endpoint = `${API_URL}/api/mark-sphereconnect-message-read/`;
        break;
      default:
        return;
    }

    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
          },
          body: JSON.stringify({ message_id: notificationId }),
          credentials: 'include',
        });
        setNotifications(notifications.filter(n => n.id !== notificationId));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    return notification.type === activeFilter;
  });

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <motion.h1 
        className="text-3xl font-bold text-gray-800 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Notifications Hub
      </motion.h1>
      
      <div className="mb-6 flex space-x-4">
        {['all', 'email', 'slack', 'sphereconnect'].map((filter) => (
          <motion.button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full ${activeFilter === filter ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </motion.button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <AnimatePresence>
          {filteredNotifications.map(notification => (
            <NotificationItem 
              key={`${notification.type}-${notification.id}`}
              notification={notification}
              onDismiss={handleDismiss}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </AnimatePresence>
      )}

      {!isLoading && filteredNotifications.length === 0 && (
        <motion.p 
          className="text-center text-gray-500 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          No new notifications
        </motion.p>
      )}
    </div>
  );
};

export default NotificationsHub;