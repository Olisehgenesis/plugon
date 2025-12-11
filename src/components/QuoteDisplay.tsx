import React from 'react';
import type { SwapQuote } from '../hooks/useSwapQuotes';

interface QuoteDisplayProps {
  quotes: SwapQuote[];
  onSelectQuote: (quote: SwapQuote) => void;
}

export function QuoteDisplay({ quotes, onSelectQuote }: QuoteDisplayProps) {
  if (quotes.length === 0) {
    return null;
  }

  return (
    <div className="mt-[1.5em]">
      <h3 className="text-[1em] font-extrabold text-[#050505] uppercase tracking-[0.05em] mb-[1em]">
        Available Routes
      </h3>
      <div className="flex flex-col gap-[0.75em]">
        {quotes.map((quote, index) => (
          <div
            key={index}
            className="group relative cursor-pointer"
            onClick={() => onSelectQuote(quote)}
          >
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
              className="relative bg-white border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] transition-all duration-[300ms] overflow-hidden z-[2] group-hover:shadow-[0.4em_0.4em_0_#000000] group-hover:-translate-x-[0.2em] group-hover:-translate-y-[0.2em] group-hover:scale-[1.01] active:translate-x-[0.1em] active:translate-y-[0.1em] active:shadow-[0.2em_0.2em_0_#000000]"
              style={{ boxShadow: 'inset 0 0 0 0.1em rgba(0, 0, 0, 0.03)' }}
            >
              <div className="px-[1.2em] py-[1em]">
                <div className="flex justify-between items-center mb-[0.6em]">
                  <span className="text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.1em]">
                    {quote.aggregator}
                  </span>
                  {index === 0 && (
                    <span className="bg-[#10b981] text-white text-[0.6em] font-extrabold px-[0.8em] py-[0.3em] border-[0.15em] border-[#050505] rounded-[0.3em] shadow-[0.15em_0.15em_0_#000000] uppercase tracking-[0.1em] rotate-[3deg]">
                      Best Rate
                    </span>
                  )}
                </div>
                
                <div className="text-[1.3em] font-extrabold text-[#050505] mb-[0.6em]">
                  {parseFloat(quote.toAmount).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}
                </div>
                
                <div className="grid grid-cols-2 gap-[0.6em] text-[0.85em]">
                  <div className="flex items-center gap-[0.4em]">
                    <span className="font-semibold text-[#6b7280]">Rate:</span>
                    <span className="font-bold text-[#050505]">{quote.rate}</span>
                  </div>
                  <div className="flex items-center gap-[0.4em]">
                    <span className="font-semibold text-[#6b7280]">Gas:</span>
                    <span className="font-bold text-[#050505]">${quote.gasCostUSD}</span>
                  </div>
                  {quote.feeCostUSD !== '0' && (
                    <div className="flex items-center gap-[0.4em]">
                      <span className="font-semibold text-[#6b7280]">Fee:</span>
                      <span className="font-bold text-[#050505]">${quote.feeCostUSD}</span>
                    </div>
                  )}
                  {quote.priceImpact !== '0' && (
                    <div className="flex items-center gap-[0.4em]">
                      <span className="font-semibold text-[#6b7280]">Impact:</span>
                      <span className="font-bold text-[#050505]">{parseFloat(quote.priceImpact).toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
