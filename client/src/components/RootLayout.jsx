import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import XPNotification from './XPNotification';
import SessionNotification from './SessionNotification';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const RootLayout = () => {
  const { xpNotification, clearXpNotification } = useSocket();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <Header />
      
      {/* Main Content - Outlet for child components */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* XP Notification */}
      <XPNotification 
        notification={xpNotification} 
        onClose={clearXpNotification}
      />
      
      {/* Session Invitations - Only show when user is logged in */}
      {user && <SessionNotification />}
    </div>
  );
};

export default RootLayout;