import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL

const Settings = () => {
  const [apiKeys, setApiKeys] = useState({
    clientId: '',
    tenantId: '',
    clientSecret: ''
  });
  const [newClientId, setNewClientId] = useState('');
  const [newTenantId, setNewTenantId] = useState('');
  const [newClientSecret, setNewClientSecret] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const getCsrfToken = () => {
    return document.cookie.split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
  }

  const fetchApiKeys = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manage-key/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const data = await response.json();
      setApiKeys({
        clientId: data.keys.client_id || '',
        tenantId: data.keys.tenant_id || '',
        clientSecret: data.keys.client_secret || ''
      });
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/manage-key/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: newClientId,
          tenantId: newTenantId,
          clientSecret: newClientSecret
        }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to save API keys');
      }
      await fetchApiKeys();
      setNewClientId('');
      setNewTenantId('');
      setNewClientSecret('');
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  };


  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/manage-key/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service: 'outlook' }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete API keys');
      }
      await fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API keys:', error);
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
            value={newClientId}
            onChange={(e) => setNewClientId(e.target.value)}
            placeholder="Enter Outlook Client ID"
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="text"
            value={newTenantId}
            onChange={(e) => setNewTenantId(e.target.value)}
            placeholder="Enter Outlook Tenant ID"
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="text"
            value={newClientSecret}
            onChange={(e) => setNewClientSecret(e.target.value)}
            placeholder="Enter Outlook Client Secret"
            className="w-full p-2 border rounded mb-4"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Save Outlook API Keys
          </button>
        </form>
        <div>
          <h3 className="text-xl font-semibold mb-2">Stored API Keys:</h3>
          <div className="mb-2">Client ID: {apiKeys.clientId ? `${apiKeys.clientId.substring(0, 10)}...` : 'Not set'}</div>
          <div className="mb-2">Tenant ID: {apiKeys.tenantId ? `${apiKeys.tenantId.substring(0, 10)}...` : 'Not set'}</div>
          <div className="mb-2">Client Secret: {apiKeys.clientSecret ? `${apiKeys.clientSecret.substring(0, 10)}...` : 'Not set'}</div>
          <button 
            onClick={handleDelete}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;