import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEmail } from '../EmailContext';

const EmailListItem = ({ email, isSelected, onClick }) => (
  <motion.div
    className={`flex items-center p-4 cursor-pointer ${
      isSelected ? 'bg-purple-50' : email.is_read ? 'bg-white' : 'bg-purple-100'
    } ${email.is_read ? 'text-gray-600' : 'font-semibold text-gray-900'} border-b border-gray-200`}
    onClick={onClick}
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Mail size={18} className={`mr-4 ${email.is_read ? 'text-gray-400' : 'text-purple-600'}`} />
    <div className="flex-grow">
      <p className="text-sm truncate">{email.sender || 'Unknown Sender'}</p>
      <p className="text-xs text-gray-500 truncate">{email.subject || '(No subject)'}</p>
    </div>
    <div className="flex items-center">
      <p className="text-xs text-gray-400 mr-2">{new Date(email.received_date_time).toLocaleString()}</p>
      {!email.is_read && (
        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
      )}
    </div>
  </motion.div>
);

const EmailPreview = ({ email }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg">
    <h2 className="text-2xl font-semibold mb-6 text-purple-800">{email.subject || '(No subject)'}</h2>
    <div className="flex justify-between items-center mb-6">
      <p className="text-sm text-gray-600">From: {email.sender || 'Unknown'}</p>
      <p className="text-sm text-gray-500">{new Date(email.received_date_time).toLocaleString()}</p>
    </div>
    <div className="border-t border-b py-6 mb-6">
      <div dangerouslySetInnerHTML={{ __html: email.body || '' }} className="text-sm leading-relaxed" />
    </div>
  </div>
);

const EmailInterface = () => {
  const { emails, markEmailAsRead } = useEmail();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.selectedEmailId) {
      const email = emails.find(e => e.email_id === location.state.selectedEmailId);
      if (email) {
        handleEmailClick(email);
      }
    }
  }, [emails, location.state]);

  const handleEmailClick = async (email) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      await markEmailAsRead(email.email_id);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 bg-white shadow-sm">
          <h1 className="text-2xl font-bold text-purple-800">Email Interface</h1>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors text-purple-600"
          >
            {showSidebar ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
        <div className="flex flex-grow overflow-hidden">
          {showSidebar && (
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-white">
              {emails.map((email) => (
                <EmailListItem
                  key={email.email_id}
                  email={email}
                  isSelected={selectedEmail?.email_id === email.email_id}
                  onClick={() => handleEmailClick(email)}
                />
              ))}
            </div>
          )}
          <div className={`${showSidebar ? 'w-2/3' : 'w-full'} p-6 overflow-y-auto`}>
            {selectedEmail ? (
              <EmailPreview email={selectedEmail} />
            ) : (
              <p className="text-center text-gray-500 mt-10">Select an email to view its content</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailInterface;