import React from 'react';
import type { SwapQuote } from '../hooks/useSwapQuotes';
import type { Chain } from '../utils/chains';
import type { Token } from '../utils/tokens';
import { ButtonCool } from './ui/button-cool';

interface TransactionReviewProps {
  quote: SwapQuote;
  fromToken: Token;
  toToken: Token;
  fromChain: Chain;
  toChain: Chain;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TransactionReview({
  quote,
  fromToken,
  toToken,
  fromChain,
  toChain,
  onConfirm,
  onCancel,
}: TransactionReviewProps) {
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
          <div className="absolute -top-[1em] -right-[1em] w-[4em] h-[4em] bg-[#10b981] rotate-45 z-[1]" />
          <div className="absolute top-[0.4em] right-[0.4em] text-[#050505] text-[1.2em] font-bold z-[2]">✓</div>

          {/* Title Area */}
          <div 
            className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              background: '#10b981',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <span className="text-[1.2em]">Review Transaction</span>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[1.5em] z-[2]">
            <div className="mb-[1.5em] p-[1.2em] bg-[#f5f5f5] border-[0.2em] border-[#050505] rounded-[0.4em]">
              <div className="mb-[1em]">
                <div className="text-[0.85em] font-semibold text-[#6b7280] mb-[0.5em] uppercase tracking-[0.05em]">
                  You Pay
                </div>
                <div className="text-[1.5em] font-extrabold text-[#050505]">
                  {parseFloat(quote.fromAmount).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{' '}
                  {fromToken.symbol}
                </div>
                <div className="text-[0.85em] font-semibold text-[#6b7280] mt-[0.3em]">
                  on {fromChain.name}
                </div>
              </div>

              <div className="flex justify-center my-[1em]">
                <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#2563eb] border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                  <span className="text-white font-bold text-[1.2em]">↓</span>
                </div>
              </div>

              <div>
                <div className="text-[0.85em] font-semibold text-[#6b7280] mb-[0.5em] uppercase tracking-[0.05em]">
                  You Receive
                </div>
                <div className="text-[1.5em] font-extrabold text-[#050505]">
                  {parseFloat(quote.toAmount).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{' '}
                  {toToken.symbol}
                </div>
                <div className="text-[0.85em] font-semibold text-[#6b7280] mt-[0.3em]">
                  on {toChain.name}
                </div>
              </div>
            </div>

            <div className="border-t-[0.2em] border-[#050505] pt-[1em] mb-[1.5em]">
              <div className="flex justify-between mb-[0.6em]">
                <span className="text-[0.9em] font-semibold text-[#6b7280]">Aggregator:</span>
                <span className="text-[0.9em] font-extrabold text-[#050505] uppercase">
                  {quote.aggregator}
                </span>
              </div>
              <div className="flex justify-between mb-[0.6em]">
                <span className="text-[0.9em] font-semibold text-[#6b7280]">Exchange Rate:</span>
                <span className="text-[0.9em] font-bold text-[#050505]">{quote.rate}</span>
              </div>
              <div className="flex justify-between mb-[0.6em]">
                <span className="text-[0.9em] font-semibold text-[#6b7280]">Estimated Gas:</span>
                <span className="text-[0.9em] font-bold text-[#050505]">${quote.gasCostUSD}</span>
              </div>
              {quote.feeCostUSD !== '0' && (
                <div className="flex justify-between">
                  <span className="text-[0.9em] font-semibold text-[#6b7280]">Fee:</span>
                  <span className="text-[0.9em] font-bold text-[#050505]">${quote.feeCostUSD}</span>
                </div>
              )}
            </div>

            {/* Warning Box */}
            <div className="p-[1em] bg-[#fef3c7] border-[0.15em] border-[#f59e0b] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000] mb-[1.5em]">
              <p className="text-[0.85em] font-extrabold text-[#92400e] mb-[0.5em] uppercase tracking-[0.05em]">
                ⚠️ Important:
              </p>
              <ul className="pl-[1.5em] text-[0.85em] font-semibold text-[#78350f] space-y-[0.3em]">
                <li>Review all transaction details before signing</li>
                <li>Your wallet will prompt you to sign this transaction</li>
                <li>This is a non-custodial swap - you maintain full control</li>
                <li>Transaction cannot be reversed once confirmed</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-[1em]">
              <ButtonCool
                onClick={onCancel}
                text="Cancel"
                bgColor="#6b7280"
                hoverBgColor="#4b5563"
                borderColor="#050505"
                textColor="#ffffff"
                size="md"
                className="flex-1"
              />
              <ButtonCool
                onClick={onConfirm}
                text="Sign & Send"
                bgColor="#10b981"
                hoverBgColor="#059669"
                borderColor="#050505"
                textColor="#ffffff"
                size="md"
                className="flex-1"
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
