import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const getCsrfToken = () => {
  return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
};

const EmailListItem = ({ email, isSelected, onClick }) => (
  <motion.div
    className={`flex items-center p-4 cursor-pointer ${
      isSelected ? 'bg-blue-50' : email.isRead ? 'bg-white' : 'bg-purple-100'
    } ${email.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}
    onClick={onClick}
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Mail size={18} className={`mr-4 ${email.isRead ? 'text-gray-400' : 'text-purple-600'}`} />
    <div className="flex-grow">
      <p className="text-sm">{email.from?.emailAddress?.name || 'Unknown Sender'}</p>
      <p className="text-xs text-gray-500 truncate">{email.subject || '(No subject)'}</p>
    </div>
    <div className="flex items-center">
      <p className="text-xs text-gray-400 mr-2">{new Date(email.receivedDateTime).toLocaleString()}</p>
      {!email.isRead && (
        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
      )}
    </div>
  </motion.div>
);

const EmailPreview = ({ email }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">{email.subject || '(No subject)'}</h2>
    <p className="text-sm text-gray-600 mb-2">From: {email.from?.emailAddress?.name || 'Unknown'} ({email.from?.emailAddress?.address})</p>
    <p className="text-sm text-gray-600 mb-4">To: {email.toRecipients.map(r => r.emailAddress.address).join(', ')}</p>
    <div className="border-t border-b py-4 mb-4">
      <div dangerouslySetInnerHTML={{ __html: email.body?.content || '' }} className="text-sm" />
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
      console.log('Checking connection to the email server...');
      const response = await fetch(`${API_URL}/api/emails/`, {
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });
      if (response.ok) {
        console.log('Successfully connected to the email server.');
        setIsConnected(true);
        const data = await response.json();
        if (data.emails && Array.isArray(data.emails)) {
          setEmails(data.emails);
        } else {
          console.error('Unexpected data format received from the server');
          setError('Unexpected data format received from the server');
        }
      } else if (response.status === 401) {
        console.warn('User is not authenticated.');
        setIsConnected(false);
      } else {
        const errorData = await response.json();
        console.error(`Failed to connect: ${errorData.error || 'An unknown error occurred'}`);
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
      console.log('Initiating Outlook authentication...');
      const response = await fetch(`${API_URL}/api/outlook/auth/`, {
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Redirecting to Outlook authentication URL...');
        window.location.href = data.auth_url;
      } else {
        const errorData = await response.json();
        console.error(`Failed to initiate authentication: ${errorData.error}`);
        setError(errorData.error || 'Failed to initiate authentication');
      }
    } catch (error) {
      console.error('Error initiating auth:', error);
      setError('Failed to connect to the server');
    }
  };

  const handleEmailClick = async (email) => {
    setSelectedEmail(email);
    try {
      const response = await fetch(`${API_URL}/api/mark-email-read/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ email_id: email.id, is_read: true }),
      });
      if (response.ok) {
        setEmails(emails.map(e => e.id === email.id ? { ...e, isRead: true } : e));
      } else {
        const errorData = await response.json();
        console.error(`Failed to mark email as read: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => { setError(null); checkConnection(); }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {!isConnected && (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold shadow-lg"
          >
            Connect to Outlook
          </button>
        </div>
      )}
      {isConnected && (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 bg-white shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800">Email Interface</h1>
          </div>
          <div className="flex flex-grow overflow-hidden">
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-white">
              {emails.map((email) => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  isSelected={selectedEmail?.id === email.id}
                  onClick={() => handleEmailClick(email)}
                />
              ))}
            </div>
            <div className="w-2/3 p-6 overflow-y-auto">
              {selectedEmail ? (
                <EmailPreview email={selectedEmail} />
              ) : (
                <p className="text-center text-gray-500 mt-10">Select an email to view its content</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInterface;
