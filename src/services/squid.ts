import axios from 'axios';
import type { Chain } from '../utils/chains';

// Note: For client-side, use API route instead
// This file kept for reference but API calls should go through /api/quotes
const SQUID_API_URL = process.env.NEXT_PUBLIC_SQUID_API_URL || 'https://v2.api.squidrouter.com';
const INTEGRATOR_ID = process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || '';

export interface SquidQuoteParams {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  slippage?: number;
}

export interface SquidRoute {
  route: {
    estimate: {
      feeCosts: Array<{
        name: string;
        description: string;
        token: {
          address: string;
          symbol: string;
          decimals: number;
        };
        amount: string;
        amountUSD: string;
      }>;
      gasCosts: Array<{
        type: string;
        price: string;
        estimate: string;
        limit: string;
        amount: string;
        amountUSD: string;
        token: {
          address: string;
          symbol: string;
          decimals: number;
        };
      }>;
      route: {
        fromChain: number;
        toChain: number;
        fromToken: {
          address: string;
          symbol: string;
          decimals: number;
        };
        toToken: {
          address: string;
          symbol: string;
          decimals: number;
        };
        fromAmount: string;
        toAmount: string;
      };
    };
    transactionRequest: {
      data: string;
      to: string;
      value: string;
      gasLimit: string;
      gasPrice: string;
    };
  };
}

export async function getSquidQuote(
  params: SquidQuoteParams
): Promise<SquidRoute | null> {
  try {
    const response = await axios.post(
      `${SQUID_API_URL}/v2/route`,
      {
        fromChain: params.fromChain.toString(),
        toChain: params.toChain.toString(),
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.fromAmount,
        fromAddress: params.fromAddress,
        slippage: params.slippage || 1,
        enableBoost: true,
      },
      {
        headers: {
          'x-integrator-id': INTEGRATOR_ID,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data as SquidRoute;
  } catch (error) {
    console.error('Squid Router API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
    return null;
  }
}

export async function executeSquidRoute(
  route: SquidRoute,
  signer: any
): Promise<string | null> {
  try {
    // The route contains the transaction request
    const txRequest = route.route.transactionRequest;

    // Sign and send transaction using the wallet
    // This will be handled by the Farcaster wallet SDK
    const txHash = await signer.sendTransaction({
      to: txRequest.to,
      data: txRequest.data,
      value: txRequest.value,
      gasLimit: txRequest.gasLimit,
      gasPrice: txRequest.gasPrice,
    });

    return txHash;
  } catch (error) {
    console.error('Error executing Squid route:', error);
    return null;
  }
}

