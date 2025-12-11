import React from 'react';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { getChainById } from '../utils/chains';

export function History() {
  const { transactions, loading } = useTransactionHistory();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-[1.1em] font-bold text-[#050505]">Loading...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="w-full max-w-[32em] mx-auto px-4">
        <div className="group relative w-full">
          <div 
            className="relative bg-white border-[0.35em] border-[#050505] rounded-[0.6em] shadow-[0.7em_0.7em_0_#000000] overflow-hidden"
            style={{ boxShadow: 'inset 0 0 0 0.15em rgba(0, 0, 0, 0.05)' }}
          >
            <div 
              className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em]"
              style={{ 
                background: '#6b7280',
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
                backgroundBlendMode: 'overlay'
              }}
            >
              <span className="text-[1.2em]">Transaction History</span>
            </div>
            <div className="px-[1.5em] py-[2em] text-center">
              <p className="text-[#050505] text-[1em] font-semibold mb-[0.5em]">No transactions yet</p>
              <p className="text-[0.9em] text-[#6b7280]">
                Your swap history will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[40em] mx-auto px-4">
      <div className="mb-[1.5em]">
        <h2 className="text-[1.5em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
          Transaction History
        </h2>
      </div>
      <div className="flex flex-col gap-[1em]">
        {transactions.map((tx) => {
          const fromChain = getChainById(tx.fromChain);
          const toChain = getChainById(tx.toChain);
          const statusColors: Record<string, { bg: string; text: string }> = {
            pending: { bg: '#f59e0b', text: '#78350f' },
            completed: { bg: '#10b981', text: '#065f46' },
            failed: { bg: '#ef4444', text: '#991b1b' },
          };
          const statusStyle = statusColors[tx.status] || statusColors.pending;

          return (
            <div key={tx.id} className="group relative">
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
                className="relative bg-white border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.3em_0.3em_0_#000000] transition-all duration-[300ms] overflow-hidden z-[2] group-hover:shadow-[0.4em_0.4em_0_#000000] group-hover:-translate-x-[0.2em] group-hover:-translate-y-[0.2em]"
                style={{ boxShadow: 'inset 0 0 0 0.1em rgba(0, 0, 0, 0.03)' }}
              >
                <div className="px-[1.2em] py-[1em]">
                  <div className="flex justify-between items-start mb-[0.75em]">
                    <div className="flex-1">
                      <div className="text-[1em] font-extrabold text-[#050505] mb-[0.3em]">
                        {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                      </div>
                      <div className="text-[0.85em] font-semibold text-[#6b7280]">
                        {fromChain?.name} → {toChain?.name}
                      </div>
                    </div>
                    <span
                      className="text-[0.7em] font-extrabold px-[0.8em] py-[0.4em] border-[0.15em] border-[#050505] rounded-[0.3em] shadow-[0.15em_0.15em_0_#000000] uppercase tracking-[0.1em] rotate-[3deg] flex-shrink-0 ml-2"
                      style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[0.85em] pt-[0.75em] border-t-[0.15em] border-[#050505]">
                    <div className="font-semibold text-[#6b7280]">
                      <span className="uppercase">{tx.aggregator}</span>
                      {' • '}
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#2563eb] hover:text-[#1d4ed8] transition-colors duration-200 underline decoration-2"
                    >
                      View on Explorer →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
