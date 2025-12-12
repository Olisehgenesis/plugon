'use client';

import React, { useState } from 'react';
import { useWalletConnect, type ConnectedApp } from '../hooks/useWalletConnect';
import { QRScanner } from './QRScanner';
import { sdk } from '@farcaster/miniapp-sdk';

export function ConnectedApps() {
  const { connectedApps, disconnectApp, disconnectAll, connectViaURI, connecting, error, isBridgeReady } = useWalletConnect();
  const [showScanner, setShowScanner] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [manualURI, setManualURI] = useState('');
  const [uriError, setUriError] = useState<string | null>(null);

  const handleScan = async (uri: string) => {
    await connectViaURI(uri);
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
    } catch (err: any) {
      setUriError(err.message || 'Failed to connect');
    }
  };

  const handleDisconnect = async (app: ConnectedApp) => {
    setDisconnectingId(app.id);
    try {
      await disconnectApp(app.topic);
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleFollowOliseh = async () => {
    try {
      await sdk.actions.viewProfile({ fid: 810782 });
    } catch (error) {
      console.error('Failed to view profile:', error);
    }
  };

  if (showScanner) {
    return <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />;
  }

  return (
    <div className="w-full max-w-[40em] mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Connected Apps</h1>
        <p className="text-sm text-gray-600">
          {connectedApps.length} {connectedApps.length === 1 ? 'app' : 'apps'} connected
        </p>
      </div>

      {/* Connect Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="space-y-4">
          <button
            onClick={() => setShowScanner(true)}
            disabled={connecting || !isBridgeReady}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {connecting ? 'Connecting...' : '📷 Scan QR Code'}
          </button>

          {/* Manual URI Input */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
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

          {!isBridgeReady && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please connect your wallet first to activate the bridge
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Connected Apps List */}
      {connectedApps.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
          <div className="text-4xl mb-3">🔌</div>
          <p className="text-gray-900 font-medium mb-1">No apps connected</p>
          <p className="text-sm text-gray-600">
            Scan a QR code to connect to a dApp
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {connectedApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* App Icon/Profile Image */}
                {app.icon ? (
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center border border-gray-200">
                    <span className="text-blue-600 text-2xl">🌐</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{app.name}</h3>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 truncate block mb-2"
                  >
                    {app.url}
                  </a>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>Chain: {app.chainId}</span>
                    <span>•</span>
                    <span>{app.accounts.length} account{app.accounts.length !== 1 ? 's' : ''}</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect(app)}
                    disabled={disconnectingId === app.id}
                    className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {disconnectingId === app.id ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {connectedApps.length > 0 && (
            <button
              onClick={disconnectAll}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm border border-red-200"
            >
              Disconnect All
            </button>
          )}
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
