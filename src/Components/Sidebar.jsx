import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Bell, Mail, CheckSquare, MessageSquare, FileText, Users, BarChart2, Book, MessageCircle, Search, Settings, X, Menu } from 'lucide-react';

const SidebarLink = ({ icon: Icon, text, to, isExpanded }) => (
  <Link to={to} className="flex items-center p-4 text-gray-700 hover:bg-indigo-100 rounded-lg transition-all duration-300">
    <Icon size={24} />
    {isExpanded && <span className="ml-4">{text}</span>}
  </Link>
);

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.div 
      className="bg-white h-screen shadow-lg overflow-y-auto"
      initial={{ width: 240 }}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center p-4">
        {isExpanded && <h1 className="text-2xl font-bold text-indigo-600">WorkSphere</h1>}
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full hover:bg-gray-200">
          {isExpanded ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <nav className="mt-8">
        <SidebarLink icon={Home} text="Dashboard" to="/dashboard" isExpanded={isExpanded} />
        <SidebarLink icon={Bell} text="Notifications" to="/notifications" isExpanded={isExpanded} />
        <SidebarLink icon={Mail} text="Email" to="/email" isExpanded={isExpanded} />
        <SidebarLink icon={CheckSquare} text="Jira Tasks" to="/tasks" isExpanded={isExpanded} />
        <SidebarLink icon={MessageSquare} text="SphereConnect" to="/messaging" isExpanded={isExpanded} />
        <SidebarLink icon={FileText} text="Documents" to="/documents" isExpanded={isExpanded} />
        <SidebarLink icon={Users} text="Contacts" to="/contacts" isExpanded={isExpanded} />
        <SidebarLink icon={BarChart2} text="Analytics" to="/analytics" isExpanded={isExpanded} />
        <SidebarLink icon={Book} text="Wiki" to="/wiki" isExpanded={isExpanded} />
        <SidebarLink icon={MessageCircle} text="Anonymous Board" to="/anonymous-board" isExpanded={isExpanded} />
        <SidebarLink icon={Search} text="Unified Search" to="/search" isExpanded={isExpanded} />
        <SidebarLink icon={Settings} text="Settings" to="/settings" isExpanded={isExpanded} />
      </nav>
    </motion.div>
  );
};

export default Sidebar;
