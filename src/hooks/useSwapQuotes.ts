import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Chain } from '../utils/chains';
import type { Token } from '../utils/tokens';

export interface SwapQuote {
  aggregator: 'squid' | 'paraswap';
  fromAmount: string;
  toAmount: string;
  rate: string;
  gasEstimate: string;
  gasCostUSD: string;
  feeCostUSD: string;
  priceImpact: string;
  route: any; // Full route data for execution
}

interface UseSwapQuotesParams {
  fromToken: Token | null;
  toToken: Token | null;
  fromChain: Chain | null;
  toChain: Chain | null;
  fromAmount: string;
  userAddress: string | null;
  slippage: number;
}

export function useSwapQuotes() {
  const [quotes, setQuotes] = useState<SwapQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(
    async (params: UseSwapQuotesParams) => {
      if (
        !params.fromToken ||
        !params.toToken ||
        !params.fromChain ||
        !params.toChain ||
        !params.fromAmount ||
        !params.userAddress
      ) {
        setQuotes([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call Next.js API route
        const response = await axios.post('/api/quotes', {
          fromChain: params.fromChain.id,
          toChain: params.toChain.id,
          fromToken: params.fromToken.address,
          toToken: params.toToken.address,
          fromAmount: params.fromAmount,
          fromAddress: params.userAddress,
          slippage: params.slippage,
          aggregator: 'auto',
          fromTokenDecimals: params.fromToken.decimals,
          toTokenDecimals: params.toToken.decimals,
        });

        setQuotes(response.data.quotes || []);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch quotes');
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    quotes,
    loading,
    error,
    fetchQuotes,
  };
}

