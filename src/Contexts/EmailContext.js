import React, { createContext, useState, useContext, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const EmailContext = createContext();

export const useEmail = () => useContext(EmailContext);

export const EmailProvider = ({ children }) => {
  const [emails, setEmails] = useState([]);

  const fetchEmails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/emails/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails);
      } else {
        console.error('Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const markEmailAsRead = async (emailId) => {
    try {
      const response = await fetch(`${API_URL}/api/mark-email-read/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1],
        },
        body: JSON.stringify({ email_id: emailId, is_read: true }),
      });
      if (response.ok) {
        setEmails(emails.map(e => e.email_id === emailId ? { ...e, is_read: true } : e));
      } else {
        console.error('Failed to mark email as read');
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <EmailContext.Provider value={{ emails, setEmails, fetchEmails, markEmailAsRead }}>
      {children}
    </EmailContext.Provider>
  );
};