import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Users, BarChart, Clock } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Notifications" value="5" icon={Bell} color="bg-blue-100" />
        <Card title="Team Members" value="12" icon={Users} color="bg-green-100" />
        <Card title="Projects" value="7" icon={BarChart} color="bg-yellow-100" />
        <Card title="Hours Logged" value="128" icon={Clock} color="bg-purple-100" />
      </div>
      <motion.div 
        className="mt-12 bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <ul className="space-y-4">
          <li className="flex items-center text-gray-700">
            <span className="w-32 text-gray-500">2 hours ago</span>
            <span>You completed the "Q2 Report" task</span>
          </li>
          <li className="flex items-center text-gray-700">
            <span className="w-32 text-gray-500">Yesterday</span>
            <span>Team meeting for "Project X" scheduled</span>
          </li>
          <li className="flex items-center text-gray-700">
            <span className="w-32 text-gray-500">2 days ago</span>
            <span>New team member John Doe joined</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Dashboard;