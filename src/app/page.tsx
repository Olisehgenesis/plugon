'use client'

import React, { useState } from 'react';
import { PlugItLanding } from '../components/PlugItLanding';
import { ScanPage } from '../components/ScanPage';
import { Help } from '../components/Help';
import { BottomNav } from '../components/BottomNav';
import { MiniAppInit } from '../components/MiniAppInit';
import { MetaTags } from '../components/MetaTags';
import { useFarcasterWallet } from '../hooks/useFarcasterWallet';
import '../App.css';

type View = 'home' | 'scan' | 'help';

export default function Home() {
  const { isConnected } = useFarcasterWallet();
  const [currentView, setCurrentView] = useState<View>('home');

  // Always show navigation when wallet is connected
  if (isConnected) {
    return (
      <div className="app">
        <MetaTags />
        <MiniAppInit />
        <main className="main-with-bottom-nav">
          {currentView === 'home' && <PlugItLanding />}
          {currentView === 'scan' && <ScanPage />}
          {currentView === 'help' && <Help />}
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

