import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Star, Trash2, Reply, Forward } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL

const getCsrfToken = () => {
    return document.cookie.split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
  };

const EmailListItem = ({ email, isSelected, onClick }) => (
  <motion.div
    className={`flex items-center p-4 cursor-pointer ${isSelected ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Mail size={20} className="text-gray-500 mr-4" />
    <div className="flex-grow">
      <p className="font-semibold">{email.sender}</p>
      <p className="text-sm text-gray-600 truncate">{email.subject}</p>
    </div>
    <p className="text-sm text-gray-500">{new Date(email.receivedDateTime).toLocaleString()}</p>
  </motion.div>
);

const EmailPreview = ({ email }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-bold mb-4">{email.subject}</h2>
    <p className="text-gray-600 mb-2">From: {email.sender}</p>
    <p className="text-gray-600 mb-4">To: me</p>
    <div className="border-t border-b py-4 mb-4">
      <p>{email.body}</p>
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

const ComposeEmail = ({ onClose }) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = async () => {
    const response = await fetch(`${API_URL}/api/send-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify({ to, subject, body }),
      credentials: 'include',
    });
    if (response.ok) {
      onClose();
    } else {
      // Handle error
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <h2 className="text-2xl font-bold mb-4">Compose Email</h2>
        <input
          type="text"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <textarea
          placeholder="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-2 mb-4 border rounded h-40"
        ></textarea>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EmailInterface = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    const response = await fetch(`${API_URL}/api/emails/`, {
      credentials: 'include',
    });
    const data = await response.json();
    setEmails(data.emails);
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b">
          <button
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => setIsComposing(true)}
          >
            Compose
          </button>
        </div>
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
      {isComposing && <ComposeEmail onClose={() => setIsComposing(false)} />}
    </div>
  );
};

export default EmailInterface;