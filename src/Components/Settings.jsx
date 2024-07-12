import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../Contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const Settings = () => {
  const { user, setUser } = useAuth();
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [isSlackConnected, setIsSlackConnected] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    checkOutlookConnection();
    checkSlackConnection();
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

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
        setIsOutlookConnected(data.connected);
      } else {
        setIsOutlookConnected(false);
      }
    } catch (error) {
      console.error('Error checking Outlook connection:', error);
      setIsOutlookConnected(false);
    }
  };

  const checkSlackConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/api/check-slack-connection/`, {
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsSlackConnected(data.connected);
      } else {
        setIsSlackConnected(false);
      }
    } catch (error) {
      console.error('Error checking Slack connection:', error);
      setIsSlackConnected(false);
    }
  };

  const handleOutlookDisconnect = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });
      if (response.ok) {
        setIsOutlookConnected(false);
      } else {
        console.error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const initiateOutlookAuth = async () => {
    window.location.href = `${API_URL}/api/outlook/auth/`;
  };

  const initiateSlackAuth = async () => {
    window.location.href = `${API_URL}/api/slack/auth/`;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    if (password) {
      formData.append('password', password);
    }
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }

    try {
      const response = await fetch(`${API_URL}/api/update-profile/`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        alert('Profile updated successfully');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  return (
    <motion.div 
      className="p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Profile Update Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              id="profilePicture"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="mt-1 block w-full"
              accept="image/*"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Profile
          </button>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Outlook Connection</h2>
        <div>
          <div className="mb-4">
            Connection Status: {isOutlookConnected ? 'Connected' : 'Not Connected'}
          </div>
          <button 
            onClick={handleOutlookDisconnect}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 mr-4"
            disabled={!isOutlookConnected}
          >
            Disconnect from Outlook
          </button>
          <button
            onClick={initiateOutlookAuth}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {isOutlookConnected ? 'Reconnect to Outlook' : 'Connect to Outlook'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Slack Connection</h2>
        <div>
          <div className="mb-4">
            Connection Status: {isSlackConnected ? 'Connected' : 'Not Connected'}
          </div>
          <button
            onClick={initiateSlackAuth}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {isSlackConnected ? 'Reconnect to Slack' : 'Connect to Slack'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
