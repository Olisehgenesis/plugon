'use client';

import React from 'react';

interface BottomNavProps {
  currentView: 'home' | 'scan' | 'help';
  onViewChange: (view: 'home' | 'scan' | 'help') => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-[0.35em] border-[#050505] shadow-[0_-0.4em_0.8em_rgba(0,0,0,0.15)] z-50 safe-area-inset-bottom">
      <div className="max-w-[50em] mx-auto">
        <div className="flex items-center justify-around px-2 py-2">
          <button
            onClick={() => onViewChange('home')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[4.5em] transition-all duration-300 relative ${
              currentView === 'home'
                ? 'text-[#2563eb]'
                : 'text-[#6b7280] hover:text-[#050505]'
            }`}
          >
            {currentView === 'home' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3em] h-[0.25em] bg-[#2563eb] rounded-b-[0.2em]" />
            )}
            <div className={`text-[1.8em] transition-transform duration-300 ${currentView === 'home' ? 'scale-110' : 'scale-100'}`}>
              🏠
            </div>
            <span className={`text-[0.7em] font-extrabold uppercase tracking-[0.08em] transition-all duration-300 ${
              currentView === 'home' ? 'text-[#2563eb]' : ''
            }`}>
              Home
            </span>
          </button>

          <button
            onClick={() => onViewChange('scan')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[4.5em] transition-all duration-300 relative ${
              currentView === 'scan'
                ? 'text-[#2563eb]'
                : 'text-[#6b7280] hover:text-[#050505]'
            }`}
          >
            {currentView === 'scan' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3em] h-[0.25em] bg-[#2563eb] rounded-b-[0.2em]" />
            )}
            <div className={`text-[1.8em] transition-transform duration-300 ${currentView === 'scan' ? 'scale-110' : 'scale-100'}`}>
              📱
            </div>
            <span className={`text-[0.7em] font-extrabold uppercase tracking-[0.08em] transition-all duration-300 ${
              currentView === 'scan' ? 'text-[#2563eb]' : ''
            }`}>
              Scan
            </span>
          </button>

          <button
            onClick={() => onViewChange('help')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[4.5em] transition-all duration-300 relative ${
              currentView === 'help'
                ? 'text-[#2563eb]'
                : 'text-[#6b7280] hover:text-[#050505]'
            }`}
          >
            {currentView === 'help' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3em] h-[0.25em] bg-[#2563eb] rounded-b-[0.2em]" />
            )}
            <div className={`text-[1.8em] transition-transform duration-300 ${currentView === 'help' ? 'scale-110' : 'scale-100'}`}>
              ❓
            </div>
            <span className={`text-[0.7em] font-extrabold uppercase tracking-[0.08em] transition-all duration-300 ${
              currentView === 'help' ? 'text-[#2563eb]' : ''
            }`}>
              Help
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

