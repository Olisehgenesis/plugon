'use client';

import React, { useState } from 'react';
import { useFarcasterWallet } from '../hooks/useFarcasterWallet';
import { useWalletConnect } from '../hooks/useWalletConnect';
import { QRScanner } from './QRScanner';
import { sdk } from '@farcaster/miniapp-sdk';
import { useToast } from '../contexts/ToastContext';

export function PlugItLanding() {
  const { address, isConnected: farcasterConnected, connect: connectFarcaster } = useFarcasterWallet();
  const { connectedApps, connectViaURI, isBridgeReady, connecting } = useWalletConnect();
  const { showToast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [manualURI, setManualURI] = useState('');
  const [uriError, setUriError] = useState<string | null>(null);

  const handleScan = async (uri: string) => {
    if (farcasterConnected && isBridgeReady) {
      try {
        await connectViaURI(uri);
        showToast('Successfully connected to dApp!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to connect', 'error');
      }
    }
  };

  const handleManualConnect = async () => {
    setUriError(null);
    
    if (!manualURI.trim()) {
      setUriError('Please enter a WalletConnect URI');
      return;
    }

    const trimmedURI = manualURI.trim();
    if (!trimmedURI.startsWith('wc:')) {
      setUriError('Invalid WalletConnect URI. Must start with "wc:"');
      return;
    }

    if (farcasterConnected && isBridgeReady) {
      try {
        await connectViaURI(trimmedURI);
        setManualURI('');
        showToast('Successfully connected to dApp!', 'success');
      } catch (err: any) {
        setUriError(err.message || 'Failed to connect');
        showToast(err.message || 'Failed to connect', 'error');
      }
    }
  };

  const handleFollowOliseh = async () => {
    try {
      await sdk.actions.viewProfile({ fid: 810782 });
    } catch (error) {
      console.error('Failed to view profile:', error);
      showToast('Failed to open profile', 'error');
    }
  };

  // Show scanner if active
  if (showScanner && farcasterConnected) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  // If Farcaster wallet not connected, show connect screen
  if (!farcasterConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="group relative w-full max-w-[28em]">
          {/* Pattern Overlays */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity duration-[400ms] z-[1]"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
              backgroundSize: '0.5em 0.5em'
            }}
          />
          
          {/* Main Card */}
          <div 
            className="relative bg-white border-[0.35em] border-[#050505] rounded-[0.6em] shadow-[0.7em_0.7em_0_#000000] transition-all duration-[400ms] overflow-hidden z-[2] group-hover:shadow-[1em_1em_0_#000000] group-hover:-translate-x-[0.4em] group-hover:-translate-y-[0.4em] group-hover:scale-[1.02]"
            style={{ boxShadow: 'inset 0 0 0 0.15em rgba(0, 0, 0, 0.05)' }}
          >
            {/* Accent Corner */}
            <div className="absolute -top-[1em] -right-[1em] w-[4em] h-[4em] bg-[#2563eb] rotate-45 z-[1]" />
            <div className="absolute top-[0.4em] right-[0.4em] text-white text-[1.2em] font-bold z-[2]">⚡</div>

            {/* Title Area */}
            <div 
              className="relative px-[1.4em] py-[1.4em] text-white font-extrabold text-center border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              backgroundColor: '#2563eb',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
            >
              <span className="text-[1.8em]">Plug It</span>
            </div>

            {/* Body */}
            <div className="relative px-[1.5em] py-[2em] z-[2] text-center">
              <div className="mb-[1.5em]">
                <div className="text-[4em] mb-[0.5em]">🔌</div>
                <h2 className="text-[1.5em] font-extrabold text-[#050505] mb-[0.8em]">
                  Plug Your Farcaster Wallet
                </h2>
                <p className="text-[#050505] text-[1.1em] font-semibold mb-[0.5em] leading-relaxed">
                  Use your Farcaster wallet <span className="font-extrabold text-[#2563eb]">OUTSIDE</span> of Farcaster!
                </p>
                <p className="text-[0.95em] text-[#6b7280] font-medium leading-relaxed">
                  Connect to any dApp via WalletConnect and swap tokens across chains. Your Farcaster wallet, everywhere.
                </p>
              </div>
              
              <button
                onClick={connectFarcaster}
                className="w-full px-[1.5em] py-[0.8em] bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.9em]"
              >
                Connect Farcaster Wallet
              </button>

              {/* Features */}
              <div className="mt-[2em] grid grid-cols-1 gap-[0.8em] text-left">
                <div className="flex items-center gap-[0.8em] p-[0.8em] bg-[#f5f5f5] border-[0.15em] border-[#050505] rounded-[0.4em]">
                  <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#10b981] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-[0.9em] font-semibold text-[#050505]">Connect to any dApp</span>
                </div>
                <div className="flex items-center gap-[0.8em] p-[0.8em] bg-[#f5f5f5] border-[0.15em] border-[#050505] rounded-[0.4em]">
                  <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#2563eb] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                    <span className="text-white font-bold">💱</span>
                  </div>
                  <span className="text-[0.9em] font-semibold text-[#050505]">Swap tokens across chains</span>
                </div>
                <div className="flex items-center gap-[0.8em] p-[0.8em] bg-[#f5f5f5] border-[0.15em] border-[#050505] rounded-[0.4em]">
                  <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#a855f7] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                    <span className="text-white font-bold">🔐</span>
                  </div>
                  <span className="text-[0.9em] font-semibold text-[#050505]">Non-custodial & secure</span>
                </div>
              </div>

              {/* View Profile Button */}
              <div className="mt-[2em] pt-[1.5em] border-t-[0.2em] border-[#050505]">
                <button
                  onClick={handleFollowOliseh}
                  className="w-full px-[1.5em] py-[0.8em] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#050505] font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000] hover:shadow-[0.3em_0.3em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.85em] flex items-center justify-center gap-2"
                >
                  <span>👤</span>
                  <span>View @oliseh&apos;s Profile</span>
                </button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute w-[2.5em] h-[2.5em] bg-[#4d61ff] border-[0.15em] border-[#050505] rounded-[0.3em] rotate-45 -bottom-[1.2em] right-[2em] z-0" />
            <div className="absolute bottom-0 left-0 w-[1.5em] h-[1.5em] bg-white border-r-[0.25em] border-t-[0.25em] border-[#050505] rounded-tl-[0.5em] z-[1]" />
          </div>
        </div>
      </div>
    );
  }

  // If Farcaster wallet connected, show retro interface
  return (
    <div className="w-full max-w-[50em] mx-auto px-4 py-6">
      {/* Hero Section */}
      <div className="group relative w-full mb-[2em]">
        {/* Pattern Overlays */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity duration-[400ms] z-[1]"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
            backgroundSize: '0.5em 0.5em'
          }}
        />
        
        {/* Main Card */}
        <div 
          className="relative bg-white border-[0.35em] border-[#050505] rounded-[0.6em] shadow-[0.7em_0.7em_0_#000000] transition-all duration-[400ms] overflow-hidden z-[2] group-hover:shadow-[1em_1em_0_#000000] group-hover:-translate-x-[0.4em] group-hover:-translate-y-[0.4em] group-hover:scale-[1.02]"
          style={{ boxShadow: 'inset 0 0 0 0.15em rgba(0, 0, 0, 0.05)' }}
        >
          {/* Accent Corner */}
          <div className="absolute -top-[1em] -right-[1em] w-[4em] h-[4em] bg-[#10b981] rotate-45 z-[1]" />
          <div className="absolute top-[0.4em] right-[0.4em] text-[#050505] text-[1.2em] font-bold z-[2]">✓</div>

          {/* Title Area */}
          <div 
            className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              backgroundColor: '#10b981',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[1.2em]">Farcaster Wallet Connected!</span>
              <span className="bg-white text-[#050505] text-[0.6em] font-extrabold px-[0.8em] py-[0.4em] border-[0.15em] border-[#050505] rounded-[0.3em] shadow-[0.2em_0.2em_0_#000000] uppercase tracking-[0.1em] rotate-[3deg]">
                GOOF! 🔥
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[1.5em] z-[2]">
            <div className="mb-[1.5em]">
              <p className="text-[1.1em] font-extrabold text-[#050505] mb-[0.5em]">
                Your wallet: <span className="font-mono text-[0.9em] break-all">{address}</span>
              </p>
              <p className="text-[0.95em] font-semibold text-[#6b7280]">
                Now plug it into any dApp outside of Farcaster!
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-[1em] mb-[1.5em]">
              <div className="p-[1em] bg-[#f5f5f5] border-[0.2em] border-[#050505] rounded-[0.4em]">
                <div className="text-[1.5em] font-extrabold text-[#2563eb] mb-[0.3em]">
                  {connectedApps.length}
                </div>
                <div className="text-[0.85em] font-semibold text-[#050505] uppercase tracking-[0.05em]">
                  Connected Apps
                </div>
              </div>
              <div className="p-[1em] bg-[#f5f5f5] border-[0.2em] border-[#050505] rounded-[0.4em]">
                <div className="text-[1.5em] font-extrabold text-[#10b981] mb-[0.3em]">
                  ✓
                </div>
                <div className="text-[0.85em] font-semibold text-[#050505] uppercase tracking-[0.05em]">
                  Ready to Plug
                </div>
              </div>
            </div>

            {/* Action Message */}
            <div className="p-[1em] bg-[#dbeafe] border-[0.2em] border-[#2563eb] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
              <p className="text-[0.95em] font-extrabold text-[#1e40af] mb-[0.3em]">
                🌉 Gateway Bridge Active!
              </p>
              <p className="text-[0.85em] font-semibold text-[#1e3a8a] mb-[0.5em]">
                Plug It acts as a bridge between external Web3 apps and your Farcaster wallet.
              </p>
              <div className="text-[0.8em] font-medium text-[#1e3a8a] space-y-[0.3em]">
                <p>• <span className="font-extrabold">Apps</span> - Scan QR codes from dApps to connect</p>
                <p>• <span className="font-extrabold">Swap</span> - Trade tokens across chains</p>
                <p>• All requests are bridged through Plug It to Farcaster</p>
              </div>
            </div>

            {/* Quick Scan Button */}
            {isBridgeReady && (
              <div className="mt-[1em] space-y-[1em]">
                <button
                  onClick={() => setShowScanner(true)}
                  className="w-full px-[1.5em] py-[0.8em] bg-[#10b981] hover:bg-[#059669] text-white font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.9em]"
                >
                  📷 Scan QR Code
                </button>

                {/* Manual URI Input */}
                <div className="space-y-2 pt-[1em] border-t-[0.2em] border-[#050505]">
                  <textarea
                    value={manualURI}
                    onChange={(e) => {
                      setManualURI(e.target.value);
                      setUriError(null);
                    }}
                    placeholder="Paste WalletConnect URI (wc:...)"
                    className="w-full px-[1em] py-[0.8em] border-[0.2em] border-[#050505] rounded-[0.4em] font-mono text-[0.85em] resize-none focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                    rows={2}
                    disabled={connecting || !isBridgeReady}
                  />
                  {uriError && (
                    <div className="p-3 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                      <p className="text-[0.85em] font-semibold text-[#991b1b]">{uriError}</p>
                    </div>
                  )}
                  <button
                    onClick={handleManualConnect}
                    disabled={connecting || !isBridgeReady || !manualURI.trim()}
                    className="w-full px-[1.5em] py-[0.8em] bg-[#f5f5f5] hover:bg-[#e5e5e5] disabled:bg-[#d1d5db] disabled:text-[#6b7280] text-[#050505] font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000] hover:shadow-[0.3em_0.3em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.85em] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                  >
                    {connecting ? 'Connecting...' : 'Connect via URI'}
                  </button>
                </div>
              </div>
            )}

            {/* Connected Apps Preview */}
            {connectedApps.length > 0 && (
              <div className="mt-[1.5em] pt-[1.5em] border-t-[0.2em] border-[#050505]">
                <h2 className="text-[1em] font-extrabold text-[#050505] mb-[1em] uppercase tracking-[0.05em]">Connected Apps</h2>
                <div className="space-y-2">
                  {connectedApps.slice(0, 3).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-[0.8em] bg-[#f5f5f5] border-[0.15em] border-[#050505] rounded-[0.4em] hover:border-[#2563eb] transition-colors"
                    >
                      {app.icon ? (
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-10 h-10 rounded-lg object-cover border-[0.15em] border-[#050505]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border-[0.15em] border-[#050505]">
                          <span className="text-blue-600 text-lg">🌐</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#050505] truncate text-[0.9em]">{app.name}</div>
                        <div className="text-xs text-[#6b7280] truncate">{app.url}</div>
                      </div>
                    </div>
                  ))}
                  {connectedApps.length > 3 && (
                    <p className="text-xs text-[#6b7280] text-center py-2">
                      +{connectedApps.length - 3} more apps
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* View Profile Button */}
            <div className="mt-[1.5em] pt-[1.5em] border-t-[0.2em] border-[#050505]">
              <button
                onClick={handleFollowOliseh}
                className="w-full px-[1.5em] py-[0.8em] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#050505] font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000] hover:shadow-[0.3em_0.3em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.85em] flex items-center justify-center gap-2"
              >
                <span>👤</span>
                <span>View @oliseh&apos;s Profile</span>
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute w-[2.5em] h-[2.5em] bg-[#4d61ff] border-[0.15em] border-[#050505] rounded-[0.3em] rotate-45 -bottom-[1.2em] right-[2em] z-0" />
          <div className="absolute bottom-0 left-0 w-[1.5em] h-[1.5em] bg-white border-r-[0.25em] border-t-[0.25em] border-[#050505] rounded-tl-[0.5em] z-[1]" />
        </div>
      </div>
    </div>
  );
}
