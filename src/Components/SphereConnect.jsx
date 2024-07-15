import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { Send, Users, Hash, Plus, Search, X, ChevronDown, ChevronUp, MessageSquare, ChevronLeft, ChevronRight, Settings, UserPlus, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import useWebSocket from 'react-use-websocket';

const API_URL = process.env.REACT_APP_API_URL;

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white rounded-lg p-6 w-96 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4 text-indigo-800">{title}</h2>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ChannelSettings = ({ channel, onClose, onAddMember, onRemoveMember }) => {
  const [newMemberEmail, setNewMemberEmail] = useState('');

  return (
    <Modal isOpen={true} onClose={onClose} title={`${channel.name} Settings`}>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-indigo-700">Members</h3>
        <ul className="space-y-3 max-h-60 overflow-y-auto">
          {channel.members.map(member => (
            <li key={member.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
              <span className="font-medium">{member.name}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                onClick={() => onRemoveMember(member.id)}
              >
                <UserMinus size={16} />
              </motion.button>
            </li>
          ))}
        </ul>
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="New member email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
            onClick={() => {
              onAddMember(newMemberEmail);
              setNewMemberEmail('');
            }}
          >
            <UserPlus size={20} />
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

const SphereConnect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [csrfToken, setCsrfToken] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [socket, setSocket] = useState(null);
  const [isChannelSettingsOpen, setIsChannelSettingsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchChannels();
    fetchContacts();
    fetchPrivateChats();
    fetchCsrfToken();
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
      connectWebSocket();
    }
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [selectedChannel, selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      const handleBeforeUnload = () => {
        socket.close();
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const connectWebSocket = useCallback(() => {
    if (socket) {
      socket.close();
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newSocket = new WebSocket(`${wsProtocol}//${API_URL.replace(/^https?:\/\//, '')}/ws/chat/${selectedChannel?.id || selectedContact?.id}/`);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat.message') {
        setMessages((prevMessages) => [...prevMessages, data.message]);
        scrollToBottom();
      } else if (data.type === 'typing.status') {
        setTypingUsers((prevTypingUsers) => ({
          ...prevTypingUsers,
          [data.channel_id]: data.is_typing,
        }));
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(connectWebSocket, 5000);
    };

    setSocket(newSocket);
  }, [selectedChannel, selectedContact, API_URL]);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${API_URL}/get-csrf-token/`, {
        credentials: 'include',
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get-groups/`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setChannels(data.groups || []);
      } else {
        console.error('Error fetching channels:', await response.text());
      }
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
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      } else {
        console.error('Error fetching contacts:', await response.text());
      }
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
      if (response.ok) {
        const data = await response.json();
        setPrivateChats(data.private_chats || []);
      } else {
        console.error('Error fetching private chats:', await response.text());
      }
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
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map(message => ({
          id: message.id,
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp,
        })) || []);
      } else {
        console.error('Error fetching messages:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { 
    sendMessage, 
    lastMessage, 
    readyState 
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log('WebSocket connected'),
    onClose: () => console.log('WebSocket disconnected'),
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (selectedChannel || selectedContact) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const newSocketUrl = `${wsProtocol}//${API_URL.replace(/^https?:\/\//, '')}/ws/chat/${selectedChannel?.id || selectedContact?.id}/`;
      setSocketUrl(newSocketUrl);
    }
  }, [selectedChannel, selectedContact]);

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'chat.message') {
        setMessages((prevMessages) => [...prevMessages, data.message]);
        scrollToBottom();
      } else if (data.type === 'typing.status') {
        setTypingUsers((prevTypingUsers) => ({
          ...prevTypingUsers,
          [data.channel_id]: data.is_typing,
        }));
      }
    }
  }, [lastMessage]);

  const sendMessageHandler = () => {
    if (!newMessage.trim() || (!selectedChannel && !selectedContact)) return;
  
    const messageData = {
      type: 'chat.message',
      message: {
        content: newMessage,
        sender: user.first_name,
        timestamp: new Date().toISOString(),
      },
    };
  
    if (selectedChannel) {
      messageData.group_id = selectedChannel.id;
    } else if (selectedContact) {
      messageData.recipient_id = selectedContact.id;
    }
  
    sendMessage(JSON.stringify(messageData));
    
    // Optimistically add the message to the local state
    setMessages((prevMessages) => [...prevMessages, messageData.message]);
    scrollToBottom();
    setNewMessage('');
  };

  const handleTyping = useCallback(
    debounce(() => {
      if (selectedChannel || selectedContact) {
        sendMessage(JSON.stringify({
          type: 'typing.status',
          channel_id: selectedChannel?.id,
          contact_id: selectedContact?.id,
          is_typing: newMessage.trim().length > 0,
        }));
      }
    }, 300),
    [selectedChannel, selectedContact, newMessage, sendMessage]
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      {/* Left Sidebar */}
      <motion.div
        className={`bg-gradient-to-b from-indigo-600 to-indigo-800 text-white p-6 ${isLeftSidebarOpen ? 'w-72' : 'w-20'
          } transition-all duration-300 ease-in-out shadow-lg`}
        initial={false}
        animate={{ width: isLeftSidebarOpen ? 288 : 80 }}
      >
        <div className="flex items-center justify-between mb-6">
          {isLeftSidebarOpen && <h2 className="text-2xl font-bold">Channels</h2>}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="p-2 rounded hover:bg-indigo-500 transition-colors duration-200"
          >
            {isLeftSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </motion.button>
        </div>
        {isLeftSidebarOpen && (
          <>
            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-indigo-200">Group Chats</h3>
              <ul className="space-y-2">
                {channels.map(channel => (
                  <motion.li
                    key={channel.id}
                    whileHover={{ x: 5 }}
                    className={`cursor-pointer p-2 rounded ${selectedChannel?.id === channel.id ? 'bg-indigo-500' : 'hover:bg-indigo-700'
                      } transition-colors duration-200`}
                    onClick={() => handleChannelClick(channel)}
                  >
                    <Hash className="inline-block mr-2" size={16} />
                    {channel.name}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-indigo-200">Private Chats</h3>
              <ul className="space-y-2">
                {privateChats.map(chat => (
                  <motion.li
                    key={chat.id}
                    whileHover={{ x: 5 }}
                    className={`cursor-pointer p-2 rounded ${selectedContact?.id === chat.id
                      ? 'bg-indigo-500'
                      : 'hover:bg-indigo-700'
                      } transition-colors duration-200`}
                    onClick={() => {
                      setSelectedContact(chat);
                      setSelectedChannel(null);
                    }}
                  >
                    <MessageSquare className="inline-block mr-2" size={16} />
                    {chat.name}
                  </motion.li>
                ))}
              </ul>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 w-full p-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              onClick={() => setIsNewChannelModalOpen(true)}
            >
              <Plus size={20} />
              <span>New Channel</span>
            </motion.button>
          </>
        )}
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center shadow-sm">
          <h1 className="text-2xl font-bold text-indigo-800">
            {selectedChannel ? `#${selectedChannel.name}` : (selectedContact ? `${selectedContact.name}` : 'Select a channel or contact')}
          </h1>
          {selectedChannel && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex items-center space-x-2 shadow-md"
              onClick={() => setIsChannelSettingsOpen(true)}
            >
              <Settings size={20} />
              <span>Channel Settings</span>
            </motion.button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <AnimatePresence>
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === user.first_name ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg p-3 rounded-lg shadow-md ${message.sender === user.first_name
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      <p className="font-semibold text-sm">{message.sender}</p>
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
          {Object.entries(typingUsers)
            .filter(([id, isTyping]) => isTyping && id !== selectedChannel?.id.toString())
            .map(([id]) => {
              const typingUser = channels.find(channel => channel.id.toString() === id);
              return typingUser ? typingUser.name : '';
            })
            .join(', ')} {Object.values(typingUsers).filter(Boolean).length > 0 ? 'is typing...' : ''}
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <Send size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <motion.div
        className={`bg-white p-6 border-l border-gray-200 ${isRightSidebarOpen ? 'w-72' : 'w-20'
          } transition-all duration-300 ease-in-out shadow-lg`}
        initial={false}
        animate={{ width: isRightSidebarOpen ? 288 : 80 }}
      >
        <div className="flex items-center justify-between mb-6">
          {isRightSidebarOpen && <h2 className="text-2xl font-bold text-indigo-800">Contacts</h2>}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="p-2 rounded hover:bg-gray-200 transition-colors duration-200"
          >
            {isRightSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </motion.button>
        </div>
        {isRightSidebarOpen && (
          <>
            <div className="relative mb-4">
              <input
                type="text"
                className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200"
                    onClick={() => handleContactClick(contact)}
                  >
                    <img
                      src={contact.profile_picture || 'https://via.placeholder.com/40'}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-indigo-800">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
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
          className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Channel name"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
        />
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200"
            onClick={createChannel}
          >
            Create
          </motion.button>
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
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-bold mb-2 text-indigo-800">{selectedUser.name}</h3>
            <p className="text-gray-600 mb-4">{selectedUser.email}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 mb-2"
              onClick={startChat}
            >
              Start Chat
            </motion.button>
            {selectedChannel && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                onClick={() => handleAddMember(selectedUser.email)}
              >
                Add to Channel
              </motion.button>
            )}
          </div>
        )}
      </Modal>

      {/* Channel Settings Modal */}
      {isChannelSettingsOpen && selectedChannel && (
        <ChannelSettings
          channel={selectedChannel}
          onClose={() => setIsChannelSettingsOpen(false)}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
};

export default SphereConnect;