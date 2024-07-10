import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <motion.main 
        className="flex-1 overflow-x-hidden overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default AuthenticatedLayout;