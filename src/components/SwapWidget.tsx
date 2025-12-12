import React, { useState, useEffect } from 'react';
import { useFarcasterWallet } from '../hooks/useFarcasterWallet';
import { useSwapQuotes } from '../hooks/useSwapQuotes';
import { CHAINS, getChainById } from '../utils/chains';
import { getTokensForChain, COMMON_TOKENS, type Token } from '../utils/tokens';
import { getSettings } from '../services/storage';
import { QuoteDisplay } from './QuoteDisplay';
import { TransactionReview } from './TransactionReview';
import { ButtonCool } from './ui/button-cool';
import { useToast } from '../contexts/ToastContext';
import type { SwapQuote } from '../hooks/useSwapQuotes';

export function SwapWidget() {
  const { address, isConnected, requestSign } = useFarcasterWallet();
  const { quotes, loading, error, fetchQuotes } = useSwapQuotes();
  const { showToast } = useToast();
  const settings = getSettings();

  const [fromChain, setFromChain] = useState<string>(
    getChainById(settings.defaultFromChain)?.name.toLowerCase() || 'ethereum'
  );
  const [toChain, setToChain] = useState<string>(
    getChainById(settings.defaultToChain)?.name.toLowerCase() || 'polygon'
  );
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<SwapQuote | null>(null);
  const [showReview, setShowReview] = useState(false);

  const fromChainObj = CHAINS[fromChain];
  const toChainObj = CHAINS[toChain];
  const fromTokens = fromChainObj ? getTokensForChain(fromChainObj.id) : [];
  const toTokens = toChainObj ? getTokensForChain(toChainObj.id) : [];

  useEffect(() => {
    if (fromTokens.length > 0 && !fromToken) {
      setFromToken(fromTokens[0]);
    }
  }, [fromTokens, fromToken]);

  useEffect(() => {
    if (toTokens.length > 0 && !toToken) {
      setToToken(toTokens[0]);
    }
  }, [toTokens, toToken]);

  const handleGetQuotes = () => {
    if (!fromToken || !toToken || !fromAmount || !address) return;

    fetchQuotes({
      fromToken,
      toToken,
      fromChain: fromChainObj!,
      toChain: toChainObj!,
      fromAmount,
      userAddress: address,
      slippage: settings.slippage,
    });
  };

  const handleSelectQuote = (quote: SwapQuote) => {
    setSelectedQuote(quote);
    setShowReview(true);
  };

  const handleExecuteSwap = async () => {
    if (!selectedQuote || !address) return;

    try {
      // Execute swap based on aggregator
      let txHash: string | null = null;

      if (selectedQuote.aggregator === 'squid') {
        // Execute Squid route
        const txRequest = selectedQuote.route.transactionRequest;
        txHash = await requestSign({
          to: txRequest.to,
          data: txRequest.data,
          value: txRequest.value,
          gasLimit: txRequest.gasLimit,
          gasPrice: txRequest.gasPrice,
        });
      } else if (selectedQuote.aggregator === 'paraswap') {
        // Execute ParaSwap route
        const tx = selectedQuote.route.transaction;
        txHash = await requestSign({
          to: tx.to,
          data: tx.data,
          value: tx.value,
          gasPrice: tx.gasPrice,
          gas: tx.gas,
        });
      }

      if (txHash && fromToken && toToken) {
        // Save to history
        const { saveTransaction } = await import('../services/storage');
        const { getChainById } = await import('../utils/chains');
        const fromChainData = getChainById(fromChainObj!.id);
        const toChainData = getChainById(toChainObj!.id);

        saveTransaction({
          id: Date.now().toString(),
          txHash,
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          fromAmount,
          toAmount: selectedQuote.toAmount,
          fromChain: fromChainObj!.id,
          toChain: toChainObj!.id,
          aggregator: selectedQuote.aggregator,
          timestamp: Date.now(),
          status: 'pending',
          explorerUrl: `${fromChainData?.explorer}/tx/${txHash}`,
        });

        setShowReview(false);
        setSelectedQuote(null);
        setFromAmount('');
        showToast(`Transaction submitted! Hash: ${txHash.slice(0, 10)}...`, 'pending');
        
        // Monitor transaction confirmation
        monitorTransaction(txHash, fromChainObj!.id);
      }
    } catch (err: any) {
      showToast(`Swap failed: ${err.message}`, 'error');
    }
  };

  const monitorTransaction = async (txHash: string, chainId: number) => {
    try {
      const chain = getChainById(chainId);
      if (!chain?.rpc) return;

      // Poll for transaction confirmation using RPC
      let confirmed = false;
      const maxAttempts = 60; // 5 minutes (5 second intervals)
      let attempts = 0;

      while (!confirmed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;

        try {
          const response = await fetch(chain.rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getTransactionReceipt',
              params: [txHash],
              id: 1,
            }),
          });

          const data = await response.json();
          if (data.result) {
            const status = parseInt(data.result.status, 16);
            const { updateTransactionStatus } = await import('../services/storage');
            if (status === 1) {
              updateTransactionStatus(txHash, 'confirmed');
              showToast('Transaction confirmed!', 'success');
              confirmed = true;
            } else {
              updateTransactionStatus(txHash, 'failed');
              showToast('Transaction failed', 'error');
              confirmed = true;
            }
          }
        } catch (err) {
          // Continue polling on error
          console.error('Error checking transaction:', err);
        }
      }

      if (!confirmed) {
        showToast('Transaction submitted! (checking status...)', 'info');
      }
    } catch (err: any) {
      console.error('Error monitoring transaction:', err);
      // Don't show error toast for monitoring failures
    }
  };

  if (!isConnected) {
    return null;
  }

  if (showReview && selectedQuote) {
    return (
      <TransactionReview
        quote={selectedQuote}
        fromToken={fromToken!}
        toToken={toToken!}
        fromChain={fromChainObj!}
        toChain={toChainObj!}
        onConfirm={handleExecuteSwap}
        onCancel={() => {
          setShowReview(false);
          setSelectedQuote(null);
        }}
      />
    );
  }

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
          <div className="absolute top-[0.4em] right-[0.4em] text-white text-[1.2em] font-bold z-[2]">💱</div>

          {/* Title Area */}
          <div 
            className="relative px-[1.4em] py-[1.4em] text-white font-extrabold border-b-[0.35em] border-[#050505] uppercase tracking-[0.05em] z-[2]"
            style={{ 
              background: '#2563eb',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1) 0.5em, transparent 0.5em, transparent 1em)',
              backgroundBlendMode: 'overlay'
            }}
          >
            <span className="text-[1.2em]">Swap Tokens</span>
          </div>

          {/* Body */}
          <div className="relative px-[1.5em] py-[1.5em] z-[2]">
            <div className="flex flex-col gap-[1.2em]">
              {/* From Chain */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  From Chain
                </label>
                <select
                  value={fromChain}
                  onChange={(e) => {
                    setFromChain(e.target.value);
                    setFromToken(null);
                  }}
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-semibold text-[#050505] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  {Object.values(CHAINS).map((chain) => (
                    <option key={chain.id} value={chain.name.toLowerCase()}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Token */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  From Token
                </label>
                <select
                  value={fromToken?.address || ''}
                  onChange={(e) => {
                    const token = fromTokens.find((t) => t.address === e.target.value);
                    setFromToken(token || null);
                  }}
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-semibold text-[#050505] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  {fromTokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  Amount
                </label>
                <input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-bold text-[#050505] focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all duration-200"
                />
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-[-0.5em]">
                <div className="w-[2em] h-[2em] flex items-center justify-center bg-[#2563eb] border-[0.2em] border-[#050505] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000] rotate-90">
                  <span className="text-white font-bold text-[1.2em]">↓</span>
                </div>
              </div>

              {/* To Chain */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  To Chain
                </label>
                <select
                  value={toChain}
                  onChange={(e) => {
                    setToChain(e.target.value);
                    setToToken(null);
                  }}
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-semibold text-[#050505] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  {Object.values(CHAINS).map((chain) => (
                    <option key={chain.id} value={chain.name.toLowerCase()}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Token */}
              <div>
                <label className="block mb-[0.5em] text-[0.85em] font-extrabold text-[#050505] uppercase tracking-[0.05em]">
                  To Token
                </label>
                <select
                  value={toToken?.address || ''}
                  onChange={(e) => {
                    const token = toTokens.find((t) => t.address === e.target.value);
                    setToToken(token || null);
                  }}
                  className="w-full px-[0.8em] py-[0.6em] bg-white border-[0.2em] border-[#050505] rounded-[0.4em] font-semibold text-[#050505] cursor-pointer transition-all duration-200 hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                >
                  {toTokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Get Quotes Button */}
              <ButtonCool
                onClick={handleGetQuotes}
                disabled={!fromToken || !toToken || !fromAmount || loading}
                text={loading ? 'Fetching Quotes...' : 'Get Quotes'}
                bgColor="#2563eb"
                hoverBgColor="#1d4ed8"
                borderColor="#050505"
                textColor="#ffffff"
                size="lg"
                className="w-full"
              />

              {/* Error */}
              {error && (
                <div className="p-3 bg-[#fee2e2] border-[0.15em] border-[#ef4444] rounded-[0.4em] shadow-[0.2em_0.2em_0_#000000]">
                  <p className="text-[0.9em] font-semibold text-[#991b1b]">{error}</p>
                </div>
              )}

              {/* Quotes */}
              {quotes.length > 0 && (
                <QuoteDisplay quotes={quotes} onSelectQuote={handleSelectQuote} />
              )}
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
