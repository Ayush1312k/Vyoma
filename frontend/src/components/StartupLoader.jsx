import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StartupLoader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the loader quickly for a snappier, professional feel
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 relative mb-4 flex items-center justify-center">
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src="/logo-mark-cyan.png" 
                alt="Vyoma Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]"
              />
            </div>
            
            <div className="text-3xl font-bold tracking-[0.25em] uppercase text-white font-sans">
              VYOMA
            </div>
            
            <div className="mt-8 relative w-32 h-[1px] bg-white/10 overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartupLoader;
