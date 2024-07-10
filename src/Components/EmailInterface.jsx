import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Edit, Trash2, Reply, Forward, Check, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1, cookie.length);
    }
  }
  return null;
};

const EmailListItem = ({ email, isSelected, onClick }) => (
  <motion.div
    className={`flex items-center p-4 cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} ${email.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}
    onClick={onClick}
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Mail size={18} className={`mr-4 ${email.isRead ? 'text-gray-400' : 'text-blue-500'}`} />
    <div className="flex-grow">
      <p className="text-sm">{email.from?.emailAddress?.name || 'Unknown Sender'}</p>
      <p className="text-xs text-gray-500 truncate">{email.subject || '(No subject)'}</p>
    </div>
    <p className="text-xs text-gray-400">{new Date(email.receivedDateTime).toLocaleString()}</p>
  </motion.div>
);

const EmailPreview = ({ email, onReply, onForward, onDelete, onMarkRead }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">{email.subject || '(No subject)'}</h2>
    <p className="text-sm text-gray-600 mb-2">From: {email.from?.emailAddress?.name || 'Unknown'} ({email.from?.emailAddress?.address})</p>
    <p className="text-sm text-gray-600 mb-4">To: {email.toRecipients.map(r => r.emailAddress.address).join(', ')}</p>
    <div className="border-t border-b py-4 mb-4">
      <div dangerouslySetInnerHTML={{ __html: email.body?.content || '' }} className="text-sm" />
    </div>
    <div className="flex space-x-4">
      <button onClick={() => onReply(email)} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
        <Reply size={16} className="mr-1" /> Reply
      </button>
      <button onClick={() => onForward(email)} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
        <Forward size={16} className="mr-1" /> Forward
      </button>
      <button onClick={() => onDelete(email.id)} className="text-red-600 hover:text-red-800 text-sm flex items-center">
        <Trash2 size={16} className="mr-1" /> Delete
      </button>
      <button onClick={() => onMarkRead(email.id, !email.isRead)} className="text-green-600 hover:text-green-800 text-sm flex items-center">
        {email.isRead ? <X size={16} className="mr-1" /> : <Check size={16} className="mr-1" />}
        {email.isRead ? 'Mark as Unread' : 'Mark as Read'}
      </button>
    </div>
  </div>
);

const ComposeEmail = ({ onSend, onCancel }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    onSend({ to, subject, body });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <input
        type="text"
        placeholder="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full mb-4 p-2 border border-gray-300 rounded h-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex justify-end space-x-4">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Cancel</button>
        <button onClick={handleSend} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Send</button>
      </div>
    </div>
  );
};

const EmailInterface = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isComposing, setIsComposing] = useState(false);

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

  const handleSendEmail = async (emailData) => {
    try {
      console.log('Sending email...');
      const response = await fetch(`${API_URL}/api/send-email/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify(emailData),
      });
      if (response.ok) {
        console.log('Email sent successfully.');
        setIsComposing(false);
        checkConnection(); // Refresh the email list
      } else {
        const errorData = await response.json();
        console.error(`Failed to send email: ${errorData.error}`);
        setError(errorData.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send email');
    }
  };

  const handleDeleteEmail = async (emailId) => {
    try {
      console.log(`Deleting email with ID: ${emailId}`);
      const response = await fetch(`${API_URL}/api/delete-email/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ email_id: emailId }),
      });
      if (response.ok) {
        console.log('Email deleted successfully.');
        setEmails(emails.filter(email => email.id !== emailId));
        setSelectedEmail(null);
      } else {
        const errorData = await response.json();
        console.error(`Failed to delete email: ${errorData.error}`);
        setError(errorData.error || 'Failed to delete email');
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      setError('Failed to delete email');
    }
  };

  const handleMarkRead = async (emailId, isRead) => {
    try {
      console.log(`Marking email with ID: ${emailId} as ${isRead ? 'read' : 'unread'}`);
      const response = await fetch(`${API_URL}/api/mark-email-read/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ email_id: emailId, is_read: isRead }),
      });
      if (response.ok) {
        console.log('Email marked as read/unread successfully.');
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, isRead: isRead } : email
        ));
        if (selectedEmail && selectedEmail.id === emailId) {
          setSelectedEmail({ ...selectedEmail, isRead: isRead });
        }
      } else {
        const errorData = await response.json();
        console.error(`Failed to mark email as read/unread: ${errorData.error}`);
        setError(errorData.error || 'Failed to mark email as read/unread');
      }
    } catch (error) {
      console.error('Error marking email as read/unread:', error);
      setError('Failed to mark email as read/unread');
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
            <button
              onClick={() => setIsComposing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <Edit size={18} className="mr-2" />
              Compose
            </button>
          </div>
          <div className="flex flex-grow overflow-hidden">
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-white">
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
              {isComposing ? (
                <ComposeEmail
                  onSend={handleSendEmail}
                  onCancel={() => setIsComposing(false)}
                />
              ) : selectedEmail ? (
                <EmailPreview
                  email={selectedEmail}
                  onReply={(email) => {
                    setIsComposing(true);
                    // Pre-fill reply details
                  }}
                  onForward={(email) => {
                    setIsComposing(true);
                    // Pre-fill forward details
                  }}
                  onDelete={handleDeleteEmail}
                  onMarkRead={handleMarkRead}
                />
              ) : (
                <p className="text-center text-gray-500 mt-10">Select an email to view or compose a new one</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailInterface;
