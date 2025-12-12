'use client'

import React, { useState, useEffect } from 'react';
import { PlugItLanding } from '../components/PlugItLanding';
import { ConnectedApps } from '../components/ConnectedApps';
import { BottomNav } from '../components/BottomNav';
import { MiniAppInit } from '../components/MiniAppInit';
import { MetaTags } from '../components/MetaTags';
import { useFarcasterWallet } from '../hooks/useFarcasterWallet';
import { useWalletConnect } from '../hooks/useWalletConnect';
import '../App.css';

type View = 'home' | 'apps';

export default function Home() {
  const { isConnected } = useFarcasterWallet();
  const { connectedApps } = useWalletConnect();
  const [currentView, setCurrentView] = useState<View>('home');

  // Navigate to apps after successful connection
  useEffect(() => {
    if (isConnected && connectedApps.length > 0 && currentView === 'home') {
      // Small delay to let UI update
      setTimeout(() => {
        setCurrentView('apps');
      }, 500);
    }
  }, [isConnected, connectedApps.length, currentView]);

  // Always show navigation when wallet is connected
  if (isConnected) {
    return (
      <div className="app">
        <MetaTags />
        <MiniAppInit />
        <main className="main-with-bottom-nav">
          {currentView === 'home' && <PlugItLanding />}
          {currentView === 'apps' && <ConnectedApps />}
        </main>
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    );
  }

  // Show landing page when wallet not connected
  return (
    <div className="app">
      <MetaTags />
      <MiniAppInit />
      <PlugItLanding />
    </div>
  );
}

