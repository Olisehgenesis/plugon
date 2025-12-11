import React from 'react';
import { useFarcasterWallet } from '../hooks/useFarcasterWallet';
import { ButtonCool } from './ui/button-cool';

export function WalletConnect() {
  const { address, isConnected, error, connect, disconnect } =
    useFarcasterWallet();

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="group relative w-full max-w-[22em]">
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
              className="relative px-[1.4em] py-[1.4em] text-white font-extrabold flex justify-between items-center border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
              style={{ 
                background: '#10b981',
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
                backgroundBlendMode: 'overlay'
              }}
            >
              <span className="flex-1">Wallet Connected</span>
            </div>

            {/* Body */}
            <div className="relative px-[1.5em] py-[1.5em] z-[2]">
              <div className="mb-[1.5em]">
                <p className="text-[0.85em] font-semibold text-[#6b7280] mb-[0.5em] uppercase tracking-[0.05em]">
                  Address
                </p>
                <p className="font-mono text-[0.95em] font-bold text-[#050505] break-all">
                  {address}
                </p>
              </div>
              
              <ButtonCool
                onClick={disconnect}
                text="Disconnect"
                bgColor="#ef4444"
                hoverBgColor="#dc2626"
                borderColor="#050505"
                textColor="#ffffff"
                size="md"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              background: '#2563eb',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <span className="text-[1.8em]">Plug It</span>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[2em] z-[2] text-center">
            <p className="text-[#050505] text-[1.1em] font-semibold mb-[1.5em] leading-relaxed">
              Connect your Farcaster wallet to start swapping tokens across chains
            </p>
            
            <ButtonCool
              onClick={connect}
              text="Connect Wallet"
              bgColor="#2563eb"
              hoverBgColor="#1d4ed8"
              borderColor="#050505"
              textColor="#ffffff"
              size="lg"
              className="w-full"
            />

            {error && (
              <div className="mt-[1.5em] p-3 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                <p className="text-[0.9em] font-semibold text-[#991b1b]">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute w-[2.5em] h-[2.5em] bg-[#4d61ff] border-[0.15em] border-[#050505] rounded-[0.3em] rotate-45 -bottom-[1.2em] right-[2em] z-0" />
          <div className="absolute bottom-0 left-0 w-[1.5em] h-[1.5em] bg-white border-r-[0.25em] border-t-[0.25em] border-[#050505] rounded-tl-[0.5em] z-[1]" />
        </div>
      </div>
    </div>
  );
}

