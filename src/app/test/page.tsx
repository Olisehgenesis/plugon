'use client';

import React, { useState } from 'react';
import { QRScanner } from '../../components/QRScanner';
import { useWalletConnect } from '../../hooks/useWalletConnect';
import { useFarcasterWallet } from '../../hooks/useFarcasterWallet';
import './test.css';

export default function TestPage() {
  const [scannedURI, setScannedURI] = useState<string | null>(null);
  const { connectViaURI, isBridgeReady, connecting, error: wcError, connectedApps } = useWalletConnect();
  const { isConnected: farcasterConnected, address } = useFarcasterWallet();

  const handleScan = async (uri: string) => {
    console.log('Scanned URI:', uri);
    setScannedURI(uri);
    
    // Auto-connect if Farcaster wallet is connected and bridge is ready
    if (farcasterConnected && isBridgeReady) {
      console.log('Attempting to connect via scanned URI...');
      await connectViaURI(uri);
    }
  };

  const handleManualConnect = async () => {
    if (scannedURI && scannedURI.startsWith('wc:')) {
      if (farcasterConnected && isBridgeReady) {
        await connectViaURI(scannedURI);
      } else {
        alert('Please connect Farcaster wallet first to connect to dApps');
      }
    }
  };

  return (
    <div className="test-page">
      <div className="test-container">
        {/* Main Test Card */}
        <div className="test-card">
          <div className="test-header">
            <h1 className="test-title">📷 Camera & Wallet Test Page</h1>
            <p className="test-subtitle">
              Test the QR scanner camera - works with or without Farcaster wallet
            </p>
          </div>
          
          <div className="test-content">
            {/* Farcaster Wallet Status */}
            <div className={`test-status ${farcasterConnected ? 'test-status-success' : 'test-status-warning'}`}>
              <p className="test-status-text">
                Farcaster Wallet: {farcasterConnected ? `✅ Connected (${address?.slice(0, 6)}...${address?.slice(-4)})` : '❌ Not Connected (Scanner works without wallet)'}
              </p>
              {farcasterConnected && (
                <p className="test-status-subtext">
                  Bridge Status: {isBridgeReady ? '✅ Ready' : '⏳ Initializing...'}
                </p>
              )}
            </div>

            {/* Scanner Component - Always Visible */}
            <div className="test-scanner-wrapper">
              <QRScanner 
                onScan={handleScan} 
                onClose={() => {}} 
              />
            </div>

            {/* Scanned URI Display */}
            {scannedURI && (
              <div className="test-result">
                <h2 className="test-result-title">✅ Scanned URI:</h2>
                <code className="test-result-code">{scannedURI}</code>
                <div className="test-result-actions">
                  {farcasterConnected && isBridgeReady && (
                    <button
                      onClick={handleManualConnect}
                      disabled={connecting}
                      className="test-button test-button-primary"
                    >
                      {connecting ? 'Connecting...' : 'Connect via URI'}
                    </button>
                  )}
                  {!farcasterConnected && (
                    <p className="test-result-hint">
                      Connect Farcaster wallet to connect to dApps
                    </p>
                  )}
                  <button
                    onClick={() => setScannedURI(null)}
                    className="test-button test-button-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* WalletConnect Error */}
            {wcError && (
              <div className="test-error">
                <p className="test-error-text">Error: {wcError}</p>
              </div>
            )}

            {/* Connected Apps */}
            {connectedApps.length > 0 && (
              <div className="test-apps">
                <h2 className="test-apps-title">Connected Apps ({connectedApps.length}):</h2>
                <ul className="test-apps-list">
                  {connectedApps.map((app) => (
                    <li key={app.id} className="test-apps-item">
                      • {app.name} ({app.url})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Test Instructions */}
            <div className="test-instructions">
              <h2 className="test-instructions-title">Test Instructions:</h2>
              <ul className="test-instructions-list">
                <li>Scanner works independently - no wallet needed to test camera</li>
                <li>Grant camera permissions when prompted</li>
                <li>Point camera at a WalletConnect QR code (starts with &quot;wc:&quot;)</li>
                <li>The scanned URI will appear above</li>
                <li>Connect Farcaster wallet to enable dApp connections</li>
                <li>If wallet is connected, it will auto-connect or click &quot;Connect via URI&quot;</li>
                <li>Check browser console for detailed logs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

