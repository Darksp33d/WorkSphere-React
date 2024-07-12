import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { Send, Users, Hash, Plus, Search, X, ChevronDown, ChevronUp, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL;

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white rounded-lg p-6 w-96"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SphereConnect = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);
  const [isContactsOpen, setIsContactsOpen] = useState(true);
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [privateChats, setPrivateChats] = useState([]);
  const [userCardOpen, setUserCardOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchChannels();
    fetchContacts();
    fetchPrivateChats();
  }, []);

  useEffect(() => {
    if (location.state?.selectedMessageId) {
      const channelId = channels.find(channel =>
        channel.messages?.some(message => message.id === location.state.selectedMessageId)
      )?.id;
      if (channelId) {
        setSelectedChannel(channels.find(channel => channel.id === channelId));
      }
    }
  }, [location, channels]);

  useEffect(() => {
    if (selectedChannel || selectedContact) {
      fetchMessages();
    }
  }, [selectedChannel, selectedContact]);

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
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get-groups/`, { credentials: 'include' });
      const data = await response.json();
      console.log('Fetched channels:', data);  // Add this line
      setChannels(data.groups || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get-contacts/`, { credentials: 'include' });
      const data = await response.json();
      console.log('Fetched contacts:', data);  // Add this line
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrivateChats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get-private-chats/`, { credentials: 'include' });
      const data = await response.json();
      console.log('Fetched private chats:', data);  // Add this line
      setPrivateChats(data.private_chats || []);
    } catch (error) {
      console.error('Error fetching private chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChannel && !selectedContact) return;

    setIsLoading(true);
    try {
      const endpoint = selectedContact
        ? `${API_URL}/api/get-private-messages/?user_id=${selectedContact.id}`
        : `${API_URL}/api/get-group-messages/${selectedChannel.id}/`;

      const response = await fetch(endpoint, { credentials: 'include' });
      const data = await response.json();
      console.log('Fetched messages:', data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || (!selectedChannel && !selectedContact)) return;

    const endpoint = selectedChannel
      ? `${API_URL}/api/send-group-message/`
      : `${API_URL}/api/send-private-message/`;

    const body = selectedChannel
      ? { group_id: selectedChannel.id, content: newMessage }
      : { recipient_id: selectedContact.id, content: newMessage };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createChannel = async () => {
    try {
      const response = await fetch(`${API_URL}/api/create-group/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ name: newChannelName }),
        credentials: 'include',
      });

      if (response.ok) {
        fetchChannels();
        setIsNewChannelModalOpen(false);
        setNewChannelName('');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
  };

  const handleContactClick = (contact) => {
    setSelectedUser(contact);
    setUserCardOpen(true);
  };

  const startChat = () => {
    setSelectedContact(selectedUser || {});  // Provide a default empty object
    setSelectedChannel(null);
    setUserCardOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <motion.div
        className={`bg-indigo-700 text-white p-4 ${isLeftSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}
        initial={false}
        animate={{ width: isLeftSidebarOpen ? 256 : 64 }}
      >
        <div className="flex items-center justify-between mb-4">
          {isLeftSidebarOpen && <h2 className="text-xl font-bold">Channels</h2>}
          <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="p-2 rounded hover:bg-indigo-600">
            {isLeftSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        {isLeftSidebarOpen && (
          <>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Group Chats</h3>
              <ul className="space-y-2">
                {channels.map(channel => (
                  <li
                    key={channel.id}
                    className={`cursor-pointer p-2 rounded ${selectedChannel?.id === channel.id ? 'bg-indigo-600' : 'hover:bg-indigo-600'} transition-colors duration-200`}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setSelectedContact(null);
                    }}
                  >
                    <Hash className="inline-block mr-2" size={16} />
                    {channel.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Private Chats</h3>
              <ul className="space-y-2">
                {privateChats.map(chat => (
                  <li
                    key={typeof chat === 'object' ? chat.id : chat}
                    className={`cursor-pointer p-2 rounded ${selectedContact?.email === (typeof chat === 'object' ? chat.email : chat) ? 'bg-indigo-600' : 'hover:bg-indigo-600'} transition-colors duration-200`}
                    onClick={() => {
                      const contact = contacts.find(c => c.email === (typeof chat === 'object' ? chat.email : chat));
                      setSelectedContact(contact || {});
                      setSelectedChannel(null);
                    }}
                  >
                    <MessageSquare className="inline-block mr-2" size={16} />
                    {typeof chat === 'object' ? chat.email : chat}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="mt-4 w-full p-2 bg-indigo-500 rounded hover:bg-indigo-600 transition-colors duration-200"
              onClick={() => setIsNewChannelModalOpen(true)}
            >
              <Plus className="inline-block mr-2" size={16} />
              New Channel
            </button>
          </>
        )}
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold">
            {selectedChannel ? `#${selectedChannel.name}` : (selectedContact ? `${selectedContact.name}` : 'Select a channel or contact')}
          </h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex flex-col-reverse">
              <AnimatePresence>
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-4 ${message.sender?.email === user?.email ? 'self-end' : 'self-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-lg ${message.sender?.email === user?.email ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>
                      <p className="font-semibold text-sm">{message.sender?.name || 'Unknown'}</p>
                      <p className="mt-1">{message.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
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
              className="px-4 py-2 bg-indigo-500 text-white rounded-r-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <motion.div
        className={`bg-white p-4 border-l border-gray-200 ${isRightSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}
        initial={false}
        animate={{ width: isRightSidebarOpen ? 256 : 64 }}
      >
        <div className="flex items-center justify-between mb-4">
          {isRightSidebarOpen && <h2 className="text-xl font-bold">Contacts</h2>}
          <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="p-2 rounded hover:bg-gray-200">
            {isRightSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        {isRightSidebarOpen && (
          <>
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
            <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
              <AnimatePresence>
                {filteredContacts.map(contact => (
                  <motion.li
                    key={contact.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200"
                    onClick={() => handleContactClick(contact)}
                  >
                    <img
                      src={contact.profile_picture || 'https://via.placeholder.com/40'}
                      alt={contact.name || 'Contact'}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <p className="font-semibold">{contact.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{contact.email || 'No email'}</p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </motion.div>

      {/* New Channel Modal */}
      <Modal
        isOpen={isNewChannelModalOpen}
        onClose={() => setIsNewChannelModalOpen(false)}
        title="Create New Channel"
      >
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Channel name"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors duration-200"
            onClick={createChannel}
          >
            Create
          </button>
        </div>
      </Modal>

      {/* User Card Modal */}
      <Modal
        isOpen={userCardOpen}
        onClose={() => setUserCardOpen(false)}
        title="User Information"
      >
        {selectedUser && (
          <div className="text-center">
            <img
              src={selectedUser.profile_picture || 'https://via.placeholder.com/100'}
              alt={selectedUser.name}
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{selectedUser.name}</h3>
            <p className="text-gray-600 mb-4">{selectedUser.email}</p>
            <button
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors duration-200"
              onClick={startChat}
            >
              Start Chat
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SphereConnect;
