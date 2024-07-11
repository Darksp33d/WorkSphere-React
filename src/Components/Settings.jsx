import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL;

const Settings = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkOutlookConnection();
  }, []);

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
  };

  const checkOutlookConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/api/check-outlook-connection/`, {
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking Outlook connection:', error);
      setIsConnected(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });
      if (response.ok) {
        setIsConnected(false);
      } else {
        console.error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const initiateAuth = async () => {
    window.location.href = `${API_URL}/api/outlook/auth/`;
  };

  return (
    <motion.div 
      className="p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Outlook Connection</h2>
        <div>
          <div className="mb-4">
            Connection Status: {isConnected ? 'Connected' : 'Not Connected'}
          </div>
          <button 
            onClick={handleDisconnect}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 mr-4"
            disabled={!isConnected}
          >
            Disconnect from Outlook
          </button>
          <button
            onClick={initiateAuth}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {isConnected ? 'Reconnect to Outlook' : 'Connect to Outlook'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
