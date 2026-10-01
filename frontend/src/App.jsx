import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Room from './pages/Room';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import Chat from './pages/Chat';
import Hire from './pages/Hire';
import CompletedProjects from './pages/CompletedProjects';
import ErrorBoundary from './components/ErrorBoundary';
import StartupLoader from './components/StartupLoader';

function AppContent() {
  useEffect(() => {
    let animationFrameId;
    const handleMouseMove = (e) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--global-mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--global-mouse-y', `${e.clientY}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <StartupLoader />
      <Toaster position="bottom-right" />
      <div className="min-h-screen bg-transparent text-white flex flex-col relative overflow-hidden">
        <div className="global-torch"></div>
        <div className="bg-blobs">
          <div className="blob-1"></div>
          <div className="blob-2"></div>
          <div className="blob-3"></div>
        </div>
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<CreateProject />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/room/:id" element={<Room />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/hire" element={<Hire />} />
            <Route path="/hall-of-fame" element={<CompletedProjects />} />
            
            {/* Redirects for removed routes */}
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="/auth/callback" element={<Navigate to="/" replace />} />
            <Route path="/marketplace" element={<Navigate to="/projects" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
