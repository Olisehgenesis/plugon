'use client';

import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore - html5-qrcode doesn't have types
import { Html5Qrcode } from 'html5-qrcode';
import { ButtonCool } from './ui/button-cool';

interface QRScannerProps {
  onScan: (uri: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [manualURI, setManualURI] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = 'qr-reader';

  useEffect(() => {
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [scanning]);

  const startScanning = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          if (decodedText.startsWith('wc:')) {
            onScan(decodedText);
            stopScanning();
          }
        },
        (_errorMessage: string) => {
          // Ignore scanning errors, just keep trying
        }
      );

      setScanning(true);
    } catch (err: any) {
      setError('Camera access denied. Please enter URI manually.');
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Ignore stop errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleManualConnect = () => {
    if (manualURI.trim()) {
      if (manualURI.startsWith('wc:')) {
        onScan(manualURI);
        setManualURI('');
      } else {
        setError('Invalid WalletConnect URI. Must start with "wc:"');
      }
    }
  };

  return (
    <div className="w-full max-w-[32em] mx-auto px-4">
      <div className="group relative w-full">
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
          <div className="absolute top-[0.4em] right-[0.4em] text-white text-[1.2em] font-bold z-[2]">📷</div>

          {/* Title Area */}
          <div 
            className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              background: '#2563eb',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <span className="text-[1.2em]">Scan QR Code</span>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[1.5em] z-[2]">
            {/* QR Code Scanner */}
            <div className="mb-[1.5em]">
              <div
                id={qrCodeRegionId}
                className={`w-full aspect-square bg-[#050505] rounded-[0.4em] overflow-hidden border-[0.2em] border-[#050505] ${scanning ? '' : 'hidden'}`}
              />
              {!scanning && (
                <div className="w-full aspect-square bg-[#f5f5f5] border-[0.2em] border-[#050505] rounded-[0.4em] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[3em] mb-[0.5em]">📱</div>
                    <p className="text-[0.9em] font-semibold text-[#6b7280]">
                      Camera ready
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Manual URI Input */}
            <div className="mb-[1.5em]">
              <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                Or Enter URI Manually
              </label>
              <input
                type="text"
                value={manualURI}
                onChange={(e) => {
                  setManualURI(e.target.value);
                  setError(null);
                }}
                placeholder="wc:..."
                className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-mono text-[0.85em] text-[#050505] focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all duration-200"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-[1.5em] p-3 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                <p className="text-[0.9em] font-semibold text-[#991b1b]">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-[0.8em]">
              {!scanning ? (
                <ButtonCool
                  onClick={startScanning}
                  text="Start Camera Scan"
                  bgColor="#2563eb"
                  hoverBgColor="#1d4ed8"
                  borderColor="#050505"
                  textColor="#ffffff"
                  size="md"
                  className="w-full"
                />
              ) : (
                <ButtonCool
                  onClick={stopScanning}
                  text="Stop Scanning"
                  bgColor="#6b7280"
                  hoverBgColor="#4b5563"
                  borderColor="#050505"
                  textColor="#ffffff"
                  size="md"
                  className="w-full"
                />
              )}

              {manualURI && (
                <ButtonCool
                  onClick={handleManualConnect}
                  text="Connect via URI"
                  bgColor="#10b981"
                  hoverBgColor="#059669"
                  borderColor="#050505"
                  textColor="#ffffff"
                  size="md"
                  className="w-full"
                />
              )}

              <ButtonCool
                onClick={onClose}
                text="Cancel"
                bgColor="#6b7280"
                hoverBgColor="#4b5563"
                borderColor="#050505"
                textColor="#ffffff"
                size="md"
                className="w-full"
              />
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
