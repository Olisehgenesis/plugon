'use client';

import React, { useState } from 'react';
import { useWalletConnect, type ConnectedApp } from '../hooks/useWalletConnect';
import { QRScanner } from './QRScanner';
import { sdk } from '@farcaster/miniapp-sdk';
import { useToast } from '../contexts/ToastContext';

export function ConnectedApps() {
  const { connectedApps, disconnectApp, disconnectAll, connectViaURI, connecting, error, isBridgeReady } = useWalletConnect();
  const { showToast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [manualURI, setManualURI] = useState('');
  const [uriError, setUriError] = useState<string | null>(null);

  const handleScan = async (uri: string) => {
    try {
      await connectViaURI(uri);
      showToast('Successfully connected to dApp!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to connect', 'error');
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

    try {
      await connectViaURI(trimmedURI);
      setManualURI('');
      showToast('Successfully connected to dApp!', 'success');
    } catch (err: any) {
      setUriError(err.message || 'Failed to connect');
      showToast(err.message || 'Failed to connect', 'error');
    }
  };

  const handleDisconnect = async (app: ConnectedApp) => {
    setDisconnectingId(app.id);
    try {
      await disconnectApp(app.topic);
      showToast(`Disconnected from ${app.name}`, 'success');
    } catch (err: any) {
      showToast('Failed to disconnect', 'error');
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleDisconnectAll = async () => {
    try {
      await disconnectAll();
      showToast('Disconnected from all apps', 'success');
    } catch (err: any) {
      showToast('Failed to disconnect all', 'error');
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

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <div className="w-full max-w-[40em] mx-auto px-4 py-6">
      {/* Header Card */}
      <div className="group relative w-full mb-[1.5em]">
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
          <div className="absolute top-[0.4em] right-[0.4em] text-[#050505] text-[1.2em] font-bold z-[2]">🔌</div>

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
              <span className="text-[1.2em]">Bridge Gateway</span>
              {isBridgeReady && (
                <span className="bg-white text-[#050505] text-[0.6em] font-extrabold px-[0.8em] py-[0.4em] border-[0.15em] border-[#050505] rounded-[0.3em] shadow-[0.2em_0.2em_0_#000000] uppercase tracking-[0.1em] rotate-[3deg]">
                  Ready
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[1.5em] z-[2]">
            <div className="mb-[1.5em] p-[1em] bg-[#dbeafe] border-[0.2em] border-[#2563eb] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
              <p className="text-[0.9em] font-extrabold text-[#1e40af] mb-[0.3em]">
                🌉 Gateway Bridge Active
              </p>
              <p className="text-[0.85em] font-semibold text-[#1e3a8a]">
                Scan QR codes from external Web3 apps to connect them to your Farcaster wallet. All requests are bridged through Plug It.
              </p>
            </div>

            <div className="flex flex-col gap-[1em]">
              <button
                onClick={() => setShowScanner(true)}
                disabled={connecting || !isBridgeReady}
                className="w-full px-[1.5em] py-[0.8em] bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-[#6b7280] disabled:cursor-not-allowed text-white font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.9em] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                {connecting ? 'Connecting...' : '📷 Scan QR Code from dApp'}
              </button>

              {/* Manual URI Input */}
              <div className="border-t-[0.2em] border-[#050505] pt-[1em]">
                <p className="text-[0.9em] font-extrabold text-[#050505] mb-[0.8em] text-center">
                  Or Paste Connection Link
                </p>
                <textarea
                  value={manualURI}
                  onChange={(e) => {
                    setManualURI(e.target.value);
                    setUriError(null);
                  }}
                  placeholder="wc:85fa6e9c931ef08c70704c59a6dc032ed1100d4083fd1aae73ea1092f445fb52@2?..."
                  className="w-full px-[1em] py-[0.8em] border-[0.2em] border-[#050505] rounded-[0.4em] font-mono text-[0.85em] resize-none focus:outline-none focus:ring-2 focus:ring-[#2563eb] mb-[0.8em]"
                  rows={3}
                  disabled={connecting || !isBridgeReady}
                />
                {uriError && (
                  <div className="mb-[0.8em] p-2 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                    <p className="text-[0.85em] font-semibold text-[#991b1b]">{uriError}</p>
                  </div>
                )}
                <button
                  onClick={handleManualConnect}
                  disabled={connecting || !isBridgeReady || !manualURI.trim()}
                  className="w-full px-[1.5em] py-[0.8em] bg-[#10b981] hover:bg-[#059669] disabled:bg-[#6b7280] disabled:cursor-not-allowed text-white font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.85em] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  {connecting ? 'Connecting...' : 'Connect via URI'}
                </button>
              </div>

              {!isBridgeReady && (
                <div className="p-3 bg-[#fef3c7] border-[0.15em] border-[#f59e0b] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                  <p className="text-[0.9em] font-semibold text-[#92400e]">
                    Please connect your Farcaster wallet first to activate the bridge
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                  <p className="text-[0.9em] font-semibold text-[#991b1b]">{error}</p>
                </div>
              )}

              {connectedApps.length > 0 && (
                <button
                  onClick={handleDisconnectAll}
                  className="w-full px-[1.5em] py-[0.8em] bg-[#ef4444] hover:bg-[#dc2626] text-white font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.85em]"
                >
                  Disconnect All
                </button>
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute w-[2.5em] h-[2.5em] bg-[#4d61ff] border-[0.15em] border-[#050505] rounded-[0.3em] rotate-45 -bottom-[1.2em] right-[2em] z-0" />
          <div className="absolute bottom-0 left-0 w-[1.5em] h-[1.5em] bg-white border-r-[0.25em] border-t-[0.25em] border-[#050505] rounded-tl-[0.5em] z-[1]" />
        </div>
      </div>

      {/* Connected Apps List */}
      {connectedApps.length === 0 ? (
        <div className="group relative w-full">
          <div 
            className="relative bg-white border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] overflow-hidden"
            style={{ boxShadow: 'inset 0 0 0 0.1em rgba(0, 0, 0, 0.03)' }}
          >
            <div className="px-[1.5em] py-[2em] text-center">
              <div className="text-[3em] mb-[0.5em]">🔌</div>
              <p className="text-[#050505] text-[1em] font-semibold mb-[0.5em]">No apps connected</p>
              <p className="text-[0.9em] text-[#6b7280]">
                Scan a QR code to connect to a dApp
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-[1em] mb-6">
          {connectedApps.map((app) => (
            <div
              key={app.id}
              className="group relative"
            >
              <div 
                className="relative bg-white border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] overflow-hidden hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200"
                style={{ boxShadow: 'inset 0 0 0 0.1em rgba(0, 0, 0, 0.03)' }}
              >
                <div className="p-[1em]">
                  <div className="flex items-start gap-4">
                    {/* App Icon/Profile Image */}
                    {app.icon ? (
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-14 h-14 rounded-xl object-cover border-[0.15em] border-[#050505]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center border-[0.15em] border-[#050505]">
                        <span className="text-blue-600 text-2xl">🌐</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-[#050505] mb-1 truncate text-[1em]">{app.name}</h3>
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#2563eb] hover:text-[#1d4ed8] truncate block mb-2 font-semibold"
                      >
                        {app.url}
                      </a>
                      <div className="flex items-center gap-4 text-xs text-[#6b7280] mb-3 font-semibold">
                        <span>Chain: {app.chainId}</span>
                        <span>•</span>
                        <span>{app.accounts.length} account{app.accounts.length !== 1 ? 's' : ''}</span>
                      </div>
                      <button
                        onClick={() => handleDisconnect(app)}
                        disabled={disconnectingId === app.id}
                        className="text-sm text-[#ef4444] hover:text-[#dc2626] font-extrabold disabled:opacity-50 uppercase tracking-[0.05em]"
                      >
                        {disconnectingId === app.id ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Profile Button */}
      <div className="pt-4">
        <div className="group relative">
          <div 
            className="relative bg-white border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] overflow-hidden hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200"
            style={{ boxShadow: 'inset 0 0 0 0.1em rgba(0, 0, 0, 0.03)' }}
          >
            <button
              onClick={handleFollowOliseh}
              className="w-full px-[1.5em] py-[0.8em] bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#050505] font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] uppercase tracking-[0.05em] text-[0.85em] flex items-center justify-center gap-2"
            >
              <span>👤</span>
              <span>View @oliseh&apos;s Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
