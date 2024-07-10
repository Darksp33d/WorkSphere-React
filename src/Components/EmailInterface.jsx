import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Star, Trash2, Reply, Forward } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const EmailListItem = ({ email, isSelected, onClick }) => (
  <motion.div
    className={`flex items-center p-4 cursor-pointer ${isSelected ? 'bg-indigo-100' : 'hover:bg-gray-100'} ${email.isRead ? '' : 'font-bold'}`}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Mail size={20} className={`mr-4 ${email.isRead ? 'text-gray-500' : 'text-blue-500'}`} />
    <div className="flex-grow">
      <p className="font-semibold">{email.from?.emailAddress?.name || 'Unknown Sender'}</p>
      <p className="text-sm text-gray-600 truncate">{email.subject || '(No subject)'}</p>
    </div>
    <p className="text-sm text-gray-500">{new Date(email.receivedDateTime).toLocaleString()}</p>
  </motion.div>
);

const EmailPreview = ({ email }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold mb-4">{email.subject || '(No subject)'}</h2>
    <p className="text-gray-600 mb-2">From: {email.from?.emailAddress?.name || 'Unknown'} ({email.from?.emailAddress?.address})</p>
    <p className="text-gray-600 mb-4">To: {email.toRecipients.map(r => r.emailAddress.address).join(', ')}</p>
    <div className="border-t border-b py-4 mb-4">
      <div dangerouslySetInnerHTML={{ __html: email.body?.content || '' }}></div>
    </div>
    <div className="flex space-x-4">
      <button className="flex items-center text-indigo-600 hover:text-indigo-800">
        <Reply size={20} className="mr-2" /> Reply
      </button>
      <button className="flex items-center text-indigo-600 hover:text-indigo-800">
        <Forward size={20} className="mr-2" /> Forward
      </button>
      <button className="flex items-center text-red-600 hover:text-red-800">
        <Trash2 size={20} className="mr-2" /> Delete
      </button>
    </div>
  </div>
);

const EmailInterface = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/api/emails/`, {
        credentials: 'include',
      });
      if (response.ok) {
        setIsConnected(true);
        const data = await response.json();
        console.log('Fetched emails:', data);
        if (data.emails && Array.isArray(data.emails)) {
          setEmails(data.emails);
        } else {
          setError('Unexpected data format received from the server');
        }
      } else if (response.status === 401) {
        setIsConnected(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'An unknown error occurred');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
      setError('Failed to connect to the server');
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch(`${API_URL}/api/outlook/auth/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.auth_url;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to initiate authentication');
      }
    } catch (error) {
      console.error('Error initiating auth:', error);
      setError('Failed to connect to the server');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => { setError(null); checkConnection(); }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {!isConnected && (
        <button
          onClick={handleConnect}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect to Outlook
        </button>
      )}
      {isConnected && (
        <div className="flex flex-grow">
          <div className="w-1/3 border-r overflow-y-auto">
            {emails.map((email) => (
              <EmailListItem
                key={email.id}
                email={email}
                isSelected={selectedEmail?.id === email.id}
                onClick={() => setSelectedEmail(email)}
              />
            ))}
          </div>
          <div className="w-2/3 p-6 overflow-y-auto">
            {selectedEmail ? (
              <EmailPreview email={selectedEmail} />
            ) : (
              <p className="text-center text-gray-500 mt-10">Select an email to view</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInterface;