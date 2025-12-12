'use client';

import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'pending';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (type !== 'pending') {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  const bgColor = {
    success: '#10b981',
    error: '#ef4444',
    info: '#2563eb',
    pending: '#f59e0b',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    pending: '⏳',
  }[type];

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div className="group relative">
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
          className="relative bg-white border-[0.35em] border-[#050505] rounded-[0.6em] shadow-[0.7em_0.7em_0_#000000] overflow-hidden z-[2] min-w-[20em]"
          style={{ boxShadow: 'inset 0 0 0 0.15em rgba(0, 0, 0, 0.05)' }}
        >
          {/* Accent Corner */}
          <div 
            className="absolute -top-[1em] -right-[1em] w-[4em] h-[4em] rotate-45 z-[1]"
            style={{ backgroundColor: bgColor }}
          />
          <div className="absolute top-[0.4em] right-[0.4em] text-white text-[1.2em] font-bold z-[2]">{icon}</div>

          {/* Title Area */}
          <div 
            className="relative px-[1.4em] py-[1em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              backgroundColor: bgColor,
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <span className="text-[1em]">{type === 'pending' ? 'Processing...' : type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Info'}</span>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[1.2em] z-[2]">
            <p className="text-[0.95em] font-semibold text-[#050505] leading-relaxed">
              {message}
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute w-[2.5em] h-[2.5em] border-[0.15em] border-[#050505] rounded-[0.3em] rotate-45 -bottom-[1.2em] right-[2em] z-0" style={{ backgroundColor: bgColor, opacity: 0.3 }} />
          <div className="absolute bottom-0 left-0 w-[1.5em] h-[1.5em] bg-white border-r-[0.25em] border-t-[0.25em] border-[#050505] rounded-tl-[0.5em] z-[1]" />
        </div>
      </div>
    </div>
  );
}

