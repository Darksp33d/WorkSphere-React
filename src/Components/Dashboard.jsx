import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, BarChart, Clock } from 'lucide-react';
import NotificationsHub from './NotificationsHub';
import DailyBriefing from './DailyBriefing';

const Card = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    className={`bg-white p-6 rounded-lg shadow-lg ${color}`}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <Icon size={32} className="text-gray-400" />
    </div>
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="p-8">
      <motion.h1 
        className="text-3xl font-bold text-gray-800 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome back, User!
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card title="Notifications" value="5" icon={Bell} color="bg-blue-100" />
            <Card title="Team Members" value="12" icon={Users} color="bg-green-100" />
            <Card title="Projects" value="7" icon={BarChart} color="bg-yellow-100" />
            <Card title="Hours Logged" value="128" icon={Clock} color="bg-purple-100" />
          </div>
          <NotificationsHub />
        </div>
        <div>
          <DailyBriefing />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;