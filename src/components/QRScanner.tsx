'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { sdk } from '@farcaster/miniapp-sdk';

interface QRScannerProps {
  onScan: (uri: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const scannerContainerRef = useRef<HTMLDivElement | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // Check camera permission status on mount
  useEffect(() => {
    const checkContext = async () => {
      try {
        const context = await sdk.context;
        if (context && context.features && context.features.cameraAndMicrophoneAccess) {
          setCameraPermissionGranted(true);
        }
      } catch (error) {
        // Context might not be available in all environments (e.g., web browser)
        // This is expected and not an error
        if (process.env.NODE_ENV === 'development') {
          console.log('SDK context not available (expected in web browser):', error);
        }
      }
    };
    checkContext();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      setRequestingPermission(true);
      setError(null);
      await sdk.actions.requestCameraAndMicrophoneAccess();
      setCameraPermissionGranted(true);
      setRequestingPermission(false);
      return true;
    } catch (error: any) {
      console.error('Camera permission denied:', error);
      setError('Camera access is required to scan QR codes.');
      setRequestingPermission(false);
      return false;
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      setScanning(true); // Set scanning state early so placeholder hides

      // Request camera permission if not already granted (for Farcaster SDK)
      if (!cameraPermissionGranted) {
        try {
          await requestCameraPermission();
        } catch (permErr) {
          // If Farcaster SDK permission fails, we'll still try browser permissions
          console.log('Farcaster SDK permission not available, trying browser permissions');
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Clean up any existing scanner
      if (qrScannerRef.current) {
        try {
          await qrScannerRef.current.stop();
          await qrScannerRef.current.clear();
        } catch (err) {
          console.log('Error cleaning up previous scanner:', err);
        }
        qrScannerRef.current = null;
      }

      if (!scannerContainerRef.current) {
        throw new Error('Scanner container element not found');
      }

      // Check if HTTPS is required (for production)
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        throw new Error('Camera access requires HTTPS. Please use https:// or test on localhost.');
      }

      // Ensure the container has an ID
      const containerId = scannerContainerRef.current.id || 'html5-qrcode-scanner';
      if (!scannerContainerRef.current.id) {
        scannerContainerRef.current.id = containerId;
      }

      // Create HTML5 QR Code scanner instance
      const qrScanner = new Html5Qrcode(containerId);

      qrScannerRef.current = qrScanner;

      // Start scanning with camera
      // Try environment camera first (back camera on mobile), fallback to any camera
      try {
        await qrScanner.start(
          { facingMode: 'environment' }, // Use back camera on mobile
          {
            fps: 10, // Frames per second
            qrbox: { width: 250, height: 250 }, // Scanning area size
            aspectRatio: 1.0, // Square aspect ratio
            disableFlip: false, // Allow horizontal flip
          },
          async (decodedText, decodedResult) => {
            // Success callback
            console.log('QR Code scanned:', decodedText);
            if (decodedText.startsWith('wc:')) {
              // Immediately stop scanning and close camera
              await stopScanning();
              
              // Call onScan to initiate connection
              onScan(decodedText);
              
              // Close the scanner component after a brief delay to allow connection to start
              setTimeout(() => {
                onClose();
              }, 300);
            }
          },
          (errorMessage) => {
            // Error callback - we can ignore most errors as they're just "no QR code found" messages
            // Only log if it's a real error
            if (errorMessage && !errorMessage.includes('NotFoundException')) {
              console.log('Scan error:', errorMessage);
            }
          }
        );
      } catch (cameraError: any) {
        // If environment camera fails, try user camera (front camera)
        console.log('Environment camera failed, trying user camera:', cameraError);
        await qrScanner.start(
          { facingMode: 'user' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          async (decodedText, decodedResult) => {
            console.log('QR Code scanned:', decodedText);
            if (decodedText.startsWith('wc:')) {
              // Immediately stop scanning and close camera
              await stopScanning();
              
              // Call onScan to initiate connection
              onScan(decodedText);
              
              // Close the scanner component after a brief delay to allow connection to start
              setTimeout(() => {
                onClose();
              }, 300);
            }
          },
          (errorMessage) => {
            if (errorMessage && !errorMessage.includes('NotFoundException')) {
              console.log('Scan error:', errorMessage);
            }
          }
        );
      }

      console.log('Camera started successfully');
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setError(`Camera error: ${err.message || 'Could not access camera'}`);
      setScanning(false);
      
      if (qrScannerRef.current) {
        try {
          await qrScannerRef.current.stop();
          await qrScannerRef.current.clear();
        } catch (cleanupErr) {
          console.log('Error during cleanup:', cleanupErr);
        }
        qrScannerRef.current = null;
      }
    }
  };

  const stopScanning = async () => {
    if (qrScannerRef.current) {
      try {
        const scanner = qrScannerRef.current;
        const state = scanner.getState();
        
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scanner.stop();
        }
        await scanner.clear();
      } catch (err) {
        console.log('Error stopping scanner:', err);
      }
      qrScannerRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="qr-scanner-container">
      <div className="qr-scanner-card">
        <div className="qr-scanner-header">
          <h2>📷 Scan QR Code</h2>
        </div>

        <div className="qr-scanner-body">
          {/* Scanner View */}
          <div className="qr-scanner-view">
            <div
              ref={scannerContainerRef}
              id="html5-qrcode-scanner"
              className="qr-scanner-inner"
            />
            {!scanning && (
              <div className="qr-reader-placeholder">
                <div className="qr-reader-icon">📷</div>
                <p className="qr-reader-text">
                  {cameraPermissionGranted ? 'Click to start scanning' : 'Request camera access to scan'}
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="qr-scanner-error">
              <p>{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="qr-scanner-controls">
            {!scanning ? (
              <button
                onClick={startScanning}
                disabled={requestingPermission}
                className="qr-scanner-button qr-scanner-button-primary"
              >
                {requestingPermission ? 'Requesting Permission...' : cameraPermissionGranted ? 'Start Camera' : 'Request Camera Access'}
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="qr-scanner-button qr-scanner-button-secondary"
              >
                Stop Scanning
              </button>
            )}
            <button
              onClick={async () => {
                await stopScanning();
                onClose();
              }}
              className="qr-scanner-button qr-scanner-button-cancel"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .qr-scanner-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }

        .qr-scanner-card {
          background: white;
          border: 3px solid #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 8px 8px 0 #000;
        }

        .qr-scanner-header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 1.5rem;
          text-align: center;
          border-bottom: 3px solid #000;
        }

        .qr-scanner-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .qr-scanner-body {
          padding: 1.5rem;
        }

        .qr-scanner-view {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          border: 2px solid #000;
        }

        .qr-scanner-inner {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
        }

        /* html5-qrcode library styles */
        :global(#html5-qrcode-scanner) {
          width: 100%;
          height: 100%;
          position: relative;
        }

        :global(#html5-qrcode-scanner video) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        :global(#html5-qrcode-scanner canvas) {
          display: none;
        }

        /* Style the scanning region indicator */
        :global(#html5-qrcode-scanner #qr-shaded-region) {
          border: 2px solid #2563eb;
          border-radius: 8px;
        }

        /* Ensure video is visible when scanning */
        .qr-scanner-inner :global(video) {
          display: block !important;
        }

        .qr-reader-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #1a1a1a;
          color: white;
          z-index: 2;
          pointer-events: none;
        }

        .qr-reader-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .qr-reader-text {
          font-size: 1rem;
          text-align: center;
          padding: 0 1rem;
          color: #ccc;
        }

        .qr-scanner-error {
          background: #fee2e2;
          border: 2px solid #ef4444;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .qr-scanner-error p {
          margin: 0;
          color: #991b1b;
          font-weight: 600;
        }

        .qr-scanner-controls {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .qr-scanner-button {
          padding: 0.875rem 1.5rem;
          border: 2px solid #000;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 4px 4px 0 #000;
        }

        .qr-scanner-button:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #000;
        }

        .qr-scanner-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .qr-scanner-button-primary {
          background: #2563eb;
          color: white;
        }

        .qr-scanner-button-primary:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .qr-scanner-button-secondary {
          background: #6b7280;
          color: white;
        }

        .qr-scanner-button-secondary:hover {
          background: #4b5563;
        }

        .qr-scanner-button-cancel {
          background: #ef4444;
          color: white;
        }

        .qr-scanner-button-cancel:hover {
          background: #dc2626;
        }

        /* qr-scanner library highlight styles */
        :global(.qr-scanner-view video) {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
