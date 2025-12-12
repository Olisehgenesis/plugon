'use client';

import React from 'react';

interface BottomNavProps {
  currentView: 'home' | 'apps';
  onViewChange: (view: 'home' | 'apps') => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
      <div className="max-w-[50em] mx-auto">
        <div className="flex items-center justify-around px-2 py-3">
          <button
            onClick={() => onViewChange('home')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[4.5em] transition-all duration-200 relative ${
              currentView === 'home'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {currentView === 'home' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
            )}
            <div className={`text-2xl transition-transform duration-200 ${currentView === 'home' ? 'scale-110' : 'scale-100'}`}>
              🏠
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${
              currentView === 'home' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              Home
            </span>
          </button>

          <button
            onClick={() => onViewChange('apps')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[4.5em] transition-all duration-200 relative ${
              currentView === 'apps'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {currentView === 'apps' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
            )}
            <div className={`text-2xl transition-transform duration-200 ${currentView === 'apps' ? 'scale-110' : 'scale-100'}`}>
              🔌
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${
              currentView === 'apps' ? 'text-blue-600' : 'text-gray-500'
            }`}>
              Apps
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

