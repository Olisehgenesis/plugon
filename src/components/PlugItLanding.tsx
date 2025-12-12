'use client';

import React, { useState } from 'react';
import { useFarcasterWallet } from '../hooks/useFarcasterWallet';
import { useWalletConnect } from '../hooks/useWalletConnect';
import { QRScanner } from './QRScanner';
import { sdk } from '@farcaster/miniapp-sdk';

export function PlugItLanding() {
  const { address, isConnected: farcasterConnected, connect: connectFarcaster } = useFarcasterWallet();
  const { connectedApps, connectViaURI, isBridgeReady, connecting } = useWalletConnect();
  const [showScanner, setShowScanner] = useState(false);
  const [manualURI, setManualURI] = useState('');
  const [uriError, setUriError] = useState<string | null>(null);

  const handleScan = async (uri: string) => {
    if (farcasterConnected && isBridgeReady) {
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
        setManualURI('');
      } catch (err: any) {
        setUriError(err.message || 'Failed to connect');
      }
    }
  };

  const handleFollowOliseh = async () => {
    try {
      await sdk.actions.viewProfile({ fid: 810782 });
    } catch (error) {
      console.error('Failed to view profile:', error);
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
        <div className="w-full max-w-[28em]">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Plug It</h1>
              <p className="text-gray-600">
                Use your Farcaster wallet outside of Farcaster
              </p>
            </div>
            
            <button
              onClick={connectFarcaster}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Connect Farcaster Wallet
            </button>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-green-500">✓</span>
                <span>Connect to any dApp</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-blue-500">💱</span>
                <span>Swap tokens across chains</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-purple-500">🔐</span>
                <span>Non-custodial & secure</span>
              </div>
            </div>

            {/* View Profile Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleFollowOliseh}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <span>👤</span>
                <span>View @oliseh's Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If Farcaster wallet connected, show minimal interface
  return (
    <div className="w-full max-w-[40em] mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Plug It</h1>
        <p className="text-sm text-gray-600 font-mono break-all">{address}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">{connectedApps.length}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Connected Apps</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600 mb-1">✓</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Ready</div>
        </div>
      </div>

      {/* Quick Actions */}
      {isBridgeReady && (
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setShowScanner(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            📷 Scan QR Code
          </button>

          {/* Manual URI Input */}
          <div className="space-y-2">
            <textarea
              value={manualURI}
              onChange={(e) => {
                setManualURI(e.target.value);
                setUriError(null);
              }}
              placeholder="Paste WalletConnect URI (wc:...)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              disabled={connecting || !isBridgeReady}
            />
            {uriError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{uriError}</p>
              </div>
            )}
            <button
              onClick={handleManualConnect}
              disabled={connecting || !isBridgeReady || !manualURI.trim()}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {connecting ? 'Connecting...' : 'Connect via URI'}
            </button>
          </div>
        </div>
      )}

      {/* Connected Apps Preview */}
      {connectedApps.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Connected Apps</h2>
          <div className="space-y-2">
            {connectedApps.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {app.icon ? (
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🌐</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{app.name}</div>
                  <div className="text-xs text-gray-500 truncate">{app.url}</div>
                </div>
              </div>
            ))}
            {connectedApps.length > 3 && (
              <p className="text-xs text-gray-500 text-center py-2">
                +{connectedApps.length - 3} more apps
              </p>
            )}
          </div>
        </div>
      )}

      {/* View Profile Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleFollowOliseh}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
        >
          <span>👤</span>
          <span>View @oliseh's Profile</span>
        </button>
      </div>
    </div>
  );
}
