'use client';

import { motion } from 'framer-motion';

export const Preloader = () => {
  return (    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center z-[100]"
    >
      <div className="flex flex-col items-center space-y-6">        <motion.img 
          src="/ak-autoshow-logo-new.png" 
          alt="AK Autoshow" 
          className="h-32 w-auto object-contain"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse delay-150"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full animate-pulse delay-300"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};
