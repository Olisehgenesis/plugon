import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, type UserSettings } from '../services/storage';
import { CHAINS } from '../utils/chains';
import { ButtonCool } from './ui/button-cool';

export function Settings() {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [saved]);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
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
          <div className="absolute -top-[1em] -right-[1em] w-[4em] h-[4em] bg-[#a855f7] rotate-45 z-[1]" />
          <div className="absolute top-[0.4em] right-[0.4em] text-white text-[1.2em] font-bold z-[2]">⚙️</div>

          {/* Title Area */}
          <div 
            className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              background: '#a855f7',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <span className="text-[1.2em]">Settings</span>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[1.5em] z-[2]">
            <div className="flex flex-col gap-[1.5em]">
              {/* Preferred Aggregator */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  Preferred Aggregator
                </label>
                <select
                  value={settings.preferredAggregator}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preferredAggregator: e.target.value as UserSettings['preferredAggregator'],
                    })
                  }
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-semibold text-[#050505] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
                >
                  <option value="auto">Auto (Best Rate)</option>
                  <option value="squid">Squid Router</option>
                  <option value="paraswap">ParaSwap</option>
                </select>
                <p className="text-[0.85em] font-semibold text-[#6b7280] mt-[0.4em]">
                  Choose your preferred swap aggregator, or let us find the best rate
                </p>
              </div>

              {/* Slippage */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  Slippage Tolerance (%)
                </label>
                <input
                  type="number"
                  value={settings.slippage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      slippage: parseFloat(e.target.value) || 1,
                    })
                  }
                  min="0.1"
                  max="50"
                  step="0.1"
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-bold text-[#050505] focus:outline-none focus:ring-2 focus:ring-[#a855f7] transition-all duration-200"
                />
                <p className="text-[0.85em] font-semibold text-[#6b7280] mt-[0.4em]">
                  Maximum acceptable price slippage (default: 1%)
                </p>
              </div>

              {/* Default From Chain */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  Default From Chain
                </label>
                <select
                  value={settings.defaultFromChain}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultFromChain: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-semibold text-[#050505] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
                >
                  {Object.values(CHAINS).map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Default To Chain */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  Default To Chain
                </label>
                <select
                  value={settings.defaultToChain}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultToChain: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-semibold text-[#050505] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#a855f7]"
                >
                  {Object.values(CHAINS).map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <ButtonCool
                onClick={handleSave}
                text={saved ? '✓ Saved' : 'Save Settings'}
                bgColor={saved ? '#10b981' : '#a855f7'}
                hoverBgColor={saved ? '#059669' : '#9333ea'}
                borderColor="#050505"
                textColor="#ffffff"
                size="lg"
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
