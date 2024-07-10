import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Settings = () => {
  const [apiKeys, setApiKeys] = useState({});
  const [newKey, setNewKey] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    const response = await fetch('/api/manage-key/', {
      credentials: 'include',
    });
    const data = await response.json();
    const keysObject = {};
    data.keys.forEach(key => {
      keysObject[key.service] = key.key;
    });
    setApiKeys(keysObject);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/manage-key/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ service: 'outlook', key: newKey }),
      credentials: 'include',
    });
    if (response.ok) {
      fetchApiKeys();
      setNewKey('');
    }
  };

  const handleDelete = async (service) => {
    const response = await fetch('/api/manage-key/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ service }),
      credentials: 'include',
    });
    if (response.ok) {
      fetchApiKeys();
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
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">API Keys</h2>
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Enter Outlook API Key"
            className="w-full p-2 border rounded mb-4"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Save Outlook API Key
          </button>
        </form>
        <div>
          <h3 className="text-xl font-semibold mb-2">Stored API Keys:</h3>
          {Object.entries(apiKeys).map(([service, key]) => (
            <div key={service} className="flex justify-between items-center mb-2">
              <span>{service}: {key.substring(0, 10)}...</span>
              <button 
                onClick={() => handleDelete(service)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;