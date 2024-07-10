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
      <p className="font-semibold">{email.sender}</p>
      <p className="text-sm text-gray-600 truncate">{email.subject}</p>
    </div>
    <p className="text-sm text-gray-500">{new Date(email.receivedDateTime).toLocaleString()}</p>
  </motion.div>
);

const EmailPreview = ({ email, onMarkAsRead }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold mb-4">{email.subject}</h2>
    <p className="text-gray-600 mb-2">From: {email.sender}</p>
    <p className="text-gray-600 mb-4">To: me</p>
    <div className="border-t border-b py-4 mb-4">
      <p dangerouslySetInnerHTML={{ __html: email.body }}></p>
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
      {!email.isRead && (
        <button
          className="flex items-center text-green-600 hover:text-green-800"
          onClick={() => onMarkAsRead(email.id)}
        >
          Mark as Read
        </button>
      )}
    </div>
  </div>
);

const EmailInterface = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetchCsrfToken();
    fetchEmails();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${API_URL}/get-csrf-token/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } else {
        console.error('Failed to fetch CSRF token');
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  const fetchEmails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/emails/`, {
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched emails:', data);
        setEmails(data.emails);
      } else {
        console.error('Failed to fetch emails');
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const handleMarkAsRead = async (emailId) => {
    try {
      const response = await fetch(`${API_URL}/api/mark-as-read/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ emailId }),
      });
      if (response.ok) {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, isRead: true } : email
        ));
        if (selectedEmail && selectedEmail.id === emailId) {
          setSelectedEmail({ ...selectedEmail, isRead: true });
        }
      } else {
        console.error('Failed to mark email as read');
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const initiateAuth = async () => {
    window.location.href = `${API_URL}/start_auth/`;
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={initiateAuth}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Connect to Outlook
      </button>
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
            <EmailPreview email={selectedEmail} onMarkAsRead={handleMarkAsRead} />
          ) : (
            <p className="text-center text-gray-500 mt-10">Select an email to view</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailInterface;