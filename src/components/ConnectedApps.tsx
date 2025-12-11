'use client';

import React, { useState } from 'react';
import { useWalletConnect, type ConnectedApp } from '../hooks/useWalletConnect';
import { QRScanner } from './QRScanner';
import { ButtonCool } from './ui/button-cool';
import { getChainById } from '../utils/chains';

export function ConnectedApps() {
  const { connectedApps, disconnectApp, disconnectAll, connectViaURI, connecting, error, isBridgeReady } = useWalletConnect();
  const [showScanner, setShowScanner] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const handleScan = async (uri: string) => {
    await connectViaURI(uri);
    setShowScanner(false);
  };

  const handleDisconnect = async (app: ConnectedApp) => {
    setDisconnectingId(app.id);
    try {
      await disconnectApp(app.topic);
    } finally {
      setDisconnectingId(null);
    }
  };

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <div className="w-full max-w-[40em] mx-auto px-4">
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
              background: '#10b981',
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
              <ButtonCool
                onClick={() => setShowScanner(true)}
                text="Scan QR Code from dApp"
                bgColor="#2563eb"
                hoverBgColor="#1d4ed8"
                borderColor="#050505"
                textColor="#ffffff"
                size="lg"
                className="w-full"
                disabled={connecting || !isBridgeReady}
              />

              {!isBridgeReady && (
                <div className="p-3 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                  <p className="text-[0.9em] font-semibold text-[#991b1b]">
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
                <ButtonCool
                  onClick={disconnectAll}
                  text="Disconnect All"
                  bgColor="#ef4444"
                  hoverBgColor="#dc2626"
                  borderColor="#050505"
                  textColor="#ffffff"
                  size="md"
                  className="w-full"
                />
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
              <p className="text-[#050505] text-[1em] font-semibold mb-[0.5em]">No apps connected</p>
              <p className="text-[0.9em] text-[#6b7280]">
                Scan a QR code to connect to a dApp
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-[1em]">
          {connectedApps.map((app) => {
            const chain = getChainById(app.chainId);
            return (
              <div key={app.id} className="group relative">
                {/* Pattern Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity duration-[400ms] z-[1] rounded-[0.4em]"
                  style={{
                    backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
                    backgroundSize: '0.5em 0.5em'
                  }}
                />
                
                {/* Main Card */}
                <div 
                  className="relative bg-white border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] transition-all duration-[300ms] overflow-hidden z-[2] group-hover:shadow-[0.4em_0.4em_0_#000000] group-hover:-translate-x-[0.2em] group-hover:-translate-y-[0.2em]"
                  style={{ boxShadow: 'inset 0 0 0 0.1em rgba(0, 0, 0, 0.03)' }}
                >
                  <div className="px-[1.2em] py-[1em]">
                    <div className="flex items-start justify-between mb-[0.75em]">
                      <div className="flex items-start gap-[0.8em] flex-1">
                        {app.icon ? (
                          <img
                            src={app.icon}
                            alt={app.name}
                            className="w-[2.5em] h-[2.5em] rounded-[0.3em] border-[0.15em] border-[#050505] object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-[2.5em] h-[2.5em] bg-[#2563eb] rounded-[0.3em] border-[0.15em] border-[#050505] flex items-center justify-center">
                            <span className="text-white font-bold text-[1.2em]">🌐</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-[1em] font-extrabold text-[#050505] mb-[0.3em]">
                            {app.name}
                          </h3>
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.85em] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-200 break-all"
                          >
                            {app.url}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[0.6em] mb-[0.75em] text-[0.85em]">
                      <div>
                        <span className="font-semibold text-[#6b7280]">Chain: </span>
                        <span className="font-bold text-[#050505]">{chain?.name || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#6b7280]">Accounts: </span>
                        <span className="font-bold text-[#050505]">{app.accounts.length}</span>
                      </div>
                    </div>

                    <div className="pt-[0.75em] border-t-[0.15em] border-[#050505]">
                      <ButtonCool
                        onClick={() => handleDisconnect(app)}
                        text={disconnectingId === app.id ? 'Disconnecting...' : 'Disconnect'}
                        bgColor="#ef4444"
                        hoverBgColor="#dc2626"
                        borderColor="#050505"
                        textColor="#ffffff"
                        size="sm"
                        className="w-full"
                        disabled={disconnectingId === app.id}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

