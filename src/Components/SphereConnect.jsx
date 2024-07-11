import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { Send, Users } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

const SphereConnect = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [contacts, setContacts] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrivateMessages();
    fetchGroups();
    fetchContacts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchPrivateMessages = async () => {
    const response = await fetch(`${API_URL}/api/get-private-messages/`, { credentials: 'include' });
    const data = await response.json();
    setMessages(data.messages || []);
  };

  const fetchGroups = async () => {
    const response = await fetch(`${API_URL}/api/get-groups/`, { credentials: 'include' });
    const data = await response.json();
    setGroups(data.groups || []);
  };

  const fetchContacts = async () => {
    const response = await fetch(`${API_URL}/api/get-contacts/`, { credentials: 'include' });
    const data = await response.json();
    setContacts(data.contacts || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const payload = selectedGroup 
      ? { group_id: selectedGroup.id, content: newMessage } 
      : { recipient_id: selectedRecipient.id, content: newMessage };
    const endpoint = selectedGroup 
      ? `${API_URL}/api/send-group-message/` 
      : `${API_URL}/api/send-private-message/`;
    
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    setNewMessage('');
    fetchPrivateMessages();
    fetchGroups();
  };

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white p-4 border-r border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Contacts</h2>
        <ul>
          {contacts.map(contact => (
            <li 
              key={contact.id}
              className="cursor-pointer p-2 hover:bg-gray-100 rounded"
              onClick={() => setSelectedRecipient(contact)}
            >
              {contact.name}
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-4">Groups</h2>
        <ul>
          {groups.map(group => (
            <li 
              key={group.id}
              className="cursor-pointer p-2 hover:bg-gray-100 rounded"
              onClick={() => setSelectedGroup(group)}
            >
              {group.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold">
            {selectedGroup ? selectedGroup.name : (selectedRecipient ? selectedRecipient.name : 'SphereConnect')}
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(message => (
            <div key={message.id} className={`mb-4 ${message.sender === user.email ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${message.sender === user.email ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="bg-white p-4 border-t border-gray-200">
          <div className="flex">
            <input 
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SphereConnect;