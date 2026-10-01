import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, ExternalLink, Code2, Heart } from 'lucide-react';
import GithubIcon from './GithubIcon';

export const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="relative z-10 w-full max-w-2xl bg-[#0a0a0d] border border-white/15 rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Privacy Policy</h2>
              <p className="text-xs text-gray-400">Last updated: October 2026 • Vyoma Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">1. Overview</h3>
            <p>
              Welcome to Vyoma (DevAssembly). We respect your privacy and are committed to protecting your personal data. 
              This policy explains how we handle technical information, code sessions, and collaboration data across our real-time platform.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">2. Information We Handle</h3>
            <ul className="list-disc list-inside space-y-1.5 text-gray-400">
              <li><strong className="text-gray-200">Public Profile Data:</strong> Display name, developer bio, social links (GitHub, LinkedIn), skills, and project credits.</li>
              <li><strong className="text-gray-200">Real-Time Workspace Sessions:</strong> Live code changes, multi-cursor positions, and ephemeral chat messages exchanged in collaboration rooms.</li>
              <li><strong className="text-gray-200">Local Device Storage:</strong> We use your browser's local storage exclusively for persisting UI preferences (e.g. view mode switcher, editor themes).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">3. Zero Payment Processing & Third-Party Sharing</h3>
            <p>
              Vyoma operates as an open collaboration ecosystem. We do not store or process payment card data, and no sensitive payment gateways are integrated. We never sell, lease, or monetize your code or personal information to third parties.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">4. WebRTC & Voice Communications</h3>
            <p>
              In-room voice chat is established peer-to-peer using WebRTC protocols. Voice streams are encrypted in transit and are not recorded or archived on our servers.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">5. Open Source & Demo Data Notice</h3>
            <p>
              Certain profiles labeled with the <span className="text-amber-400 font-bold">[DEMO]</span> tag are fictitious demonstration profiles generated solely to illustrate platform features, talent discovery, and workspace collaboration.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white mb-2">6. Contact & Data Controller</h3>
            <p>
              For privacy inquiries, questions, or data requests, please contact the developer at:
              <br />
              <span className="text-cyan-400 font-mono text-xs">kumarayush1312@gmail.com</span> • Ayush Kumar, Vadodara, India.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Footer = () => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="w-full border-t border-white/10 bg-[#050508] py-12 px-6 md:px-16 relative z-10 font-sans mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Copyright */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src="/logo-mark-cyan.png"
                  alt="Vyoma Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-lg font-bold tracking-widest text-white uppercase group-hover:text-cyan-400 transition-colors">
                VYOMA
              </span>
            </Link>
            <div className="sm:border-l sm:border-white/10 sm:pl-4">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Vyoma. Built by Ayush Kumar. All rights reserved.
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Real-Time Collaborative Coding & Developer Network • Vadodara, India
              </p>
            </div>
          </div>

          {/* Navigation & Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <Link to="/projects" className="hover:text-cyan-400 transition-colors">
              Projects
            </Link>
            <Link to="/hall-of-fame" className="hover:text-cyan-400 transition-colors">
              Hall of Fame
            </Link>
            <Link to="/hire" className="hover:text-cyan-400 transition-colors">
              Talent
            </Link>
            <Link to="/chat" className="hover:text-cyan-400 transition-colors">
              Messages
            </Link>
            <button
              onClick={() => setPrivacyOpen(true)}
              className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors underline-offset-4 hover:underline"
            >
              <Shield size={12} className="text-cyan-400" /> Privacy Policy
            </button>
            <a
              href="https://github.com/Ayush1312k"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="Ayush Kumar GitHub"
            >
              <GithubIcon size={16} />
            </a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {privacyOpen && (
          <PrivacyPolicyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Footer;
