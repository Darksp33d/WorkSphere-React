import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { Send, Users, Hash, Plus, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL;

const SphereConnect = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChannels();
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setFilteredContacts(
      contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, contacts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChannels = async () => {
    const response = await fetch(`${API_URL}/api/get-groups/`, { credentials: 'include' });
    const data = await response.json();
    setChannels(data.groups || []);
  };

  const fetchContacts = async () => {
    const response = await fetch(`${API_URL}/api/get-contacts/`, { credentials: 'include' });
    const data = await response.json();
    setContacts(data.contacts || []);
  };

  const fetchMessages = async (channelId) => {
    const response = await fetch(`${API_URL}/api/get-group-messages/${channelId}/`, { credentials: 'include' });
    const data = await response.json();
    setMessages(data.messages || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const response = await fetch(`${API_URL}/api/send-group-message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify({ group_id: selectedChannel.id, content: newMessage }),
      credentials: 'include',
    });

    if (response.ok) {
      setNewMessage('');
      fetchMessages(selectedChannel.id);
    }
  };

  const createChannel = async (name) => {
    const response = await fetch(`${API_URL}/api/create-group/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      body: JSON.stringify({ name }),
      credentials: 'include',
    });

    if (response.ok) {
      fetchChannels();
    }
  };

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-indigo-700 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Channels</h2>
        <ul className="space-y-2">
          {channels.map(channel => (
            <li 
              key={channel.id}
              className={`cursor-pointer p-2 rounded ${selectedChannel?.id === channel.id ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`}
              onClick={() => setSelectedChannel(channel)}
            >
              <Hash className="inline-block mr-2" size={16} />
              {channel.name}
            </li>
          ))}
        </ul>
        <button 
          className="mt-4 w-full p-2 bg-indigo-500 rounded hover:bg-indigo-600 transition-colors duration-200"
          onClick={() => {
            const name = prompt('Enter channel name');
            if (name) createChannel(name);
          }}
        >
          <Plus className="inline-block mr-2" size={16} />
          New Channel
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold">
            {selectedChannel ? `#${selectedChannel.name}` : 'Select a channel'}
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(message => (
            <div key={message.id} className={`mb-4 ${message.sender === user.email ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${message.sender === user.email ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>
                <p className="font-semibold">{message.sender}</p>
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
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              className="px-4 py-2 bg-indigo-500 text-white rounded-r-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="w-64 bg-white p-4 border-l border-gray-200">
        <h2 className="text-xl font-bold mb-4">Contacts</h2>
        <div className="relative mb-4">
          <input 
            type="text"
            className="w-full p-2 pr-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-2 top-2 text-gray-400" size={20} />
        </div>
        <ul className="space-y-2">
          <AnimatePresence>
            {filteredContacts.map(contact => (
              <motion.li 
                key={contact.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                <img 
                  src={contact.profile_picture || 'https://via.placeholder.com/40'} 
                  alt={contact.name} 
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
};

export default SphereConnect;