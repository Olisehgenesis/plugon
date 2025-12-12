'use client';

import React, { useState } from 'react';
import { QRScanner } from './QRScanner';
import { useWalletConnect } from '../hooks/useWalletConnect';
import { useFarcasterWallet } from '../hooks/useFarcasterWallet';

export function ScanPage() {
  const { connectViaURI, isBridgeReady, connecting, error } = useWalletConnect();
  const { isConnected: farcasterConnected } = useFarcasterWallet();
  const [showScanner, setShowScanner] = useState(false);
  const [manualURI, setManualURI] = useState('');
  const [uriError, setUriError] = useState<string | null>(null);

  const handleScan = async (uri: string) => {
    if (farcasterConnected && isBridgeReady) {
      // Scanner will close itself after scanning
      await connectViaURI(uri);
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
        setManualURI(''); // Clear input on success
      } catch (err: any) {
        setUriError(err.message || 'Failed to connect');
      }
    }
  };

  // If scanner is active, show it
  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  // If Farcaster wallet not connected, show message
  if (!farcasterConnected) {
    return (
      <div className="w-full max-w-[32em] mx-auto px-4 pb-24">
        <div className="group relative w-full">
          <div 
            className="relative bg-white border-[0.35em] border-[#050505] rounded-[0.6em] shadow-[0.7em_0.7em_0_#000000] transition-all duration-[400ms] overflow-hidden z-[2]"
            style={{ boxShadow: 'inset 0 0 0 0.15em rgba(0, 0, 0, 0.05)' }}
          >
            <div 
              className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
              style={{ 
                backgroundColor: '#ef4444',
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
                backgroundBlendMode: 'overlay'
              }}
            >
              <span className="text-[1.2em]">Connect Wallet First</span>
            </div>
            <div className="relative px-[1.5em] py-[2em] z-[2] text-center">
              <div className="text-[3em] mb-[0.5em]">🔌</div>
              <p className="text-[1em] font-extrabold text-[#050505] mb-[0.5em]">
                Farcaster Wallet Required
              </p>
              <p className="text-[0.9em] font-semibold text-[#6b7280]">
                Please connect your Farcaster wallet from the Home screen first to activate the bridge.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main scan page
  return (
    <div className="w-full max-w-[32em] mx-auto px-4 pb-24">
      <div className="group relative w-full mb-[2em]">
        <div 
          className="relative bg-white border-[0.35em] border-[#050505] rounded-[0.6em] shadow-[0.7em_0.7em_0_#000000] transition-all duration-[400ms] overflow-hidden z-[2]"
          style={{ boxShadow: 'inset 0 0 0 0.15em rgba(0, 0, 0, 0.05)' }}
        >
          <div 
            className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              backgroundColor: '#2563eb',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <span className="text-[1.2em]">Scan dApp QR Code</span>
          </div>
          <div className="relative px-[1.5em] py-[2em] z-[2] text-center">
            <div className="text-[4em] mb-[0.8em]">📱</div>
            <p className="text-[1.1em] font-extrabold text-[#050505] mb-[0.5em]">
              Ready to Scan
            </p>
            <p className="text-[0.9em] font-semibold text-[#6b7280] mb-[1.5em]">
              Scan the WalletConnect QR code from any dApp to connect it to your Farcaster wallet.
            </p>
            {!isBridgeReady && (
              <div className="mb-[1.5em] p-3 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                <p className="text-[0.9em] font-semibold text-[#991b1b]">
                  Bridge is initializing. Please wait...
                </p>
              </div>
            )}
            {error && (
              <div className="mb-[1.5em] p-3 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                <p className="text-[0.9em] font-semibold text-[#991b1b]">{error}</p>
              </div>
            )}
            <button
              onClick={() => setShowScanner(true)}
              disabled={connecting || !isBridgeReady}
              className="w-full px-[1.5em] py-[0.8em] bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-[#6b7280] disabled:cursor-not-allowed text-white font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.9em] mb-[1.5em]"
            >
              {connecting ? 'Connecting...' : 'Start Scanner'}
            </button>

            {/* Manual URI Input */}
            <div className="border-t-[0.2em] border-[#050505] pt-[1.5em] mt-[1.5em]">
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
                <div className="mb-[0.8em] p-2 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em]">
                  <p className="text-[0.85em] font-semibold text-[#991b1b]">{uriError}</p>
                </div>
              )}
              <button
                onClick={handleManualConnect}
                disabled={connecting || !isBridgeReady || !manualURI.trim()}
                className="w-full px-[1.5em] py-[0.8em] bg-[#10b981] hover:bg-[#059669] disabled:bg-[#6b7280] disabled:cursor-not-allowed text-white font-extrabold border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] hover:shadow-[0.4em_0.4em_0_#000000] hover:-translate-x-[0.1em] hover:-translate-y-[0.1em] transition-all duration-200 uppercase tracking-[0.05em] text-[0.9em]"
              >
                {connecting ? 'Connecting...' : 'Connect via URI'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

