'use client'

import React, { useState } from 'react';
import { PlugItLanding } from '../components/PlugItLanding';
import { SwapWidget } from '../components/SwapWidget';
import { History } from '../components/History';
import { Settings } from '../components/Settings';
import { ConnectedApps } from '../components/ConnectedApps';
import { MiniAppInit } from '../components/MiniAppInit';
import { MetaTags } from '../components/MetaTags';
import { useFarcasterWallet } from '../hooks/useFarcasterWallet';
import '../App.css';

type View = 'home' | 'swap' | 'history' | 'settings' | 'apps';

export default function Home() {
  const { isConnected } = useFarcasterWallet();
  const [currentView, setCurrentView] = useState<View>('home');

  // Always show navigation when wallet is connected
  if (isConnected) {
    return (
      <div className="app">
        <MetaTags />
        <MiniAppInit />
        <nav className="nav">
          <div className="nav-brand">
            <h1>Plug It</h1>
          </div>
          <div className="nav-links">
            <button
              className={currentView === 'home' ? 'active' : ''}
              onClick={() => setCurrentView('home')}
            >
              Home
            </button>
            <button
              className={currentView === 'swap' ? 'active' : ''}
              onClick={() => setCurrentView('swap')}
            >
              Swap
            </button>
            <button
              className={currentView === 'apps' ? 'active' : ''}
              onClick={() => setCurrentView('apps')}
            >
              Apps
            </button>
            <button
              className={currentView === 'history' ? 'active' : ''}
              onClick={() => setCurrentView('history')}
            >
              History
            </button>
            <button
              className={currentView === 'settings' ? 'active' : ''}
              onClick={() => setCurrentView('settings')}
            >
              Settings
            </button>
          </div>
        </nav>

        <main className="main">
          {currentView === 'home' && <PlugItLanding />}
          {currentView === 'swap' && <SwapWidget />}
          {currentView === 'apps' && <ConnectedApps />}
          {currentView === 'history' && <History />}
          {currentView === 'settings' && <Settings />}
        </main>
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

