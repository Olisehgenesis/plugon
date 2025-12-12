'use client';

import React from 'react';

export function Help() {
  return (
    <div className="w-full max-w-[50em] mx-auto px-4 pb-24">
      {/* Header Card */}
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
          <div className="absolute -top-[1em] -right-[1em] w-[4em] h-[4em] bg-[#2563eb] rotate-45 z-[1]" />
          <div className="absolute top-[0.4em] right-[0.4em] text-white text-[1.2em] font-bold z-[2]">❓</div>

          {/* Title Area */}
          <div 
            className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              background: '#2563eb',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <span className="text-[1.2em]">Help & Guide</span>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[2em] z-[2]">
            {/* What is Plug It */}
            <div className="mb-[2em]">
              <h2 className="text-[1.3em] font-extrabold text-[#050505] mb-[0.8em] uppercase tracking-[0.05em]">
                What is Plug It?
              </h2>
              <p className="text-[0.95em] font-semibold text-[#050505] mb-[0.5em] leading-relaxed">
                Plug It is a bridge that connects your Farcaster wallet to any Web3 dApp outside of Farcaster. 
                It acts as a gateway, allowing you to use your Farcaster wallet with external applications via WalletConnect.
              </p>
            </div>

            {/* How to Use */}
            <div className="mb-[2em]">
              <h2 className="text-[1.3em] font-extrabold text-[#050505] mb-[0.8em] uppercase tracking-[0.05em]">
                How to Use
              </h2>
              <div className="space-y-[1em]">
                <div className="p-[1em] bg-[#f5f5f5] border-[0.2em] border-[#050505] rounded-[0.4em]">
                  <div className="flex items-start gap-[0.8em]">
                    <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#2563eb] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                      <span className="text-white font-bold text-[0.9em]">1</span>
                    </div>
                    <div>
                      <h3 className="text-[1em] font-extrabold text-[#050505] mb-[0.3em]">
                        Connect Farcaster Wallet
                      </h3>
                      <p className="text-[0.9em] font-semibold text-[#6b7280]">
                        First, connect your Farcaster wallet from the home screen. This activates the bridge.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-[1em] bg-[#f5f5f5] border-[0.2em] border-[#050505] rounded-[0.4em]">
                  <div className="flex items-start gap-[0.8em]">
                    <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#10b981] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                      <span className="text-white font-bold text-[0.9em]">2</span>
                    </div>
                    <div>
                      <h3 className="text-[1em] font-extrabold text-[#050505] mb-[0.3em]">
                        Scan QR Code
                      </h3>
                      <p className="text-[0.9em] font-semibold text-[#6b7280]">
                        Go to the Scan tab and scan the WalletConnect QR code from any dApp. You can also enter the URI manually.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-[1em] bg-[#f5f5f5] border-[0.2em] border-[#050505] rounded-[0.4em]">
                  <div className="flex items-start gap-[0.8em]">
                    <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#a855f7] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                      <span className="text-white font-bold text-[0.9em]">3</span>
                    </div>
                    <div>
                      <h3 className="text-[1em] font-extrabold text-[#050505] mb-[0.3em]">
                        Use the dApp
                      </h3>
                      <p className="text-[0.9em] font-semibold text-[#6b7280]">
                        Once connected, all requests from the dApp are automatically bridged to your Farcaster wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-[2em]">
              <h2 className="text-[1.3em] font-extrabold text-[#050505] mb-[0.8em] uppercase tracking-[0.05em]">
                Features
              </h2>
              <div className="grid grid-cols-1 gap-[0.8em]">
                <div className="flex items-center gap-[0.8em] p-[0.8em] bg-[#f5f5f5] border-[0.15em] border-[#050505] rounded-[0.4em]">
                  <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#10b981] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-[0.9em] font-semibold text-[#050505]">Connect to any dApp via WalletConnect</span>
                </div>
                <div className="flex items-center gap-[0.8em] p-[0.8em] bg-[#f5f5f5] border-[0.15em] border-[#050505] rounded-[0.4em]">
                  <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#2563eb] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                    <span className="text-white font-bold">💱</span>
                  </div>
                  <span className="text-[0.9em] font-semibold text-[#050505]">Swap tokens across multiple chains</span>
                </div>
                <div className="flex items-center gap-[0.8em] p-[0.8em] bg-[#f5f5f5] border-[0.15em] border-[#050505] rounded-[0.4em]">
                  <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#a855f7] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                    <span className="text-white font-bold">🔐</span>
                  </div>
                  <span className="text-[0.9em] font-semibold text-[#050505]">Non-custodial - you control your keys</span>
                </div>
                <div className="flex items-center gap-[0.8em] p-[0.8em] bg-[#f5f5f5] border-[0.15em] border-[#050505] rounded-[0.4em]">
                  <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#f59e0b] border-[0.15em] border-[#050505] rounded-[0.3em] flex-shrink-0">
                    <span className="text-white font-bold">🌉</span>
                  </div>
                  <span className="text-[0.9em] font-semibold text-[#050505]">Automatic request bridging to Farcaster</span>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="mb-[2em]">
              <h2 className="text-[1.3em] font-extrabold text-[#050505] mb-[0.8em] uppercase tracking-[0.05em]">
                Troubleshooting
              </h2>
              <div className="space-y-[1em]">
                <div className="p-[1em] bg-[#dbeafe] border-[0.2em] border-[#2563eb] rounded-[0.4em]">
                  <h3 className="text-[1em] font-extrabold text-[#1e40af] mb-[0.3em]">
                    QR Code Not Scanning?
                  </h3>
                  <p className="text-[0.9em] font-semibold text-[#1e3a8a]">
                    Make sure you have camera permissions enabled. You can also manually enter the WalletConnect URI (starts with &quot;wc:&quot;).
                  </p>
                </div>
                <div className="p-[1em] bg-[#dbeafe] border-[0.2em] border-[#2563eb] rounded-[0.4em]">
                  <h3 className="text-[1em] font-extrabold text-[#1e40af] mb-[0.3em]">
                    Connection Failed?
                  </h3>
                  <p className="text-[0.9em] font-semibold text-[#1e3a8a]">
                    Ensure your Farcaster wallet is connected first. The bridge needs to be active before connecting to external dApps.
                  </p>
                </div>
                <div className="p-[1em] bg-[#dbeafe] border-[0.2em] border-[#2563eb] rounded-[0.4em]">
                  <h3 className="text-[1em] font-extrabold text-[#1e40af] mb-[0.3em]">
                    Transaction Not Working?
                  </h3>
                  <p className="text-[0.9em] font-semibold text-[#1e3a8a]">
                    All transactions are bridged through Plug It to your Farcaster wallet. Make sure you approve the transaction in your Farcaster wallet.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-[1em] bg-[#fef3c7] border-[0.2em] border-[#f59e0b] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
              <p className="text-[0.9em] font-extrabold text-[#92400e] mb-[0.3em]">
                💡 Pro Tip
              </p>
              <p className="text-[0.85em] font-semibold text-[#78350f]">
                You can connect multiple dApps at once. Each connection is independent and can be disconnected individually from the Home screen.
              </p>
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

