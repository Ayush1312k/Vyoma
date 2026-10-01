import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StartupLoader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center gap-3"
          >
            <div className="w-12 h-12 relative flex items-center justify-center">
              <img
                src="/logo-mark-cyan.png"
                alt="Vyoma Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-[0.3em] uppercase text-white font-sans">
                VYOMA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartupLoader;
