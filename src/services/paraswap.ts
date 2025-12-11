import axios from 'axios';

// Note: For client-side, use API route instead
// This file kept for reference but API calls should go through /api/quotes
const PARASWAP_API_URL = process.env.NEXT_PUBLIC_PARASWAP_API_URL || 'https://apiv5.paraswap.io';

export interface ParaSwapQuoteParams {
  srcToken: string;
  destToken: string;
  srcAmount: string;
  srcDecimals: number;
  destDecimals: number;
  network: number;
  userAddress: string;
  slippage?: number;
}

export interface ParaSwapQuote {
  priceRoute: {
    price: string;
    guaranteedPrice: string;
    estimatedGas: string;
    gasCostUSD: string;
    tokenTransferProxy: string;
    contractMethod: string;
    contractAddress: string;
    srcToken: string;
    destToken: string;
    srcAmount: string;
    destAmount: string;
    partner: string;
    partnerFee: string;
    priceImpact: string;
  };
  transaction: {
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: string;
  };
}

export async function getParaSwapQuote(
  params: ParaSwapQuoteParams
): Promise<ParaSwapQuote | null> {
  try {
    // Get price route
    const priceRouteResponse = await axios.get(
      `${PARASWAP_API_URL}/prices`,
      {
        params: {
          srcToken: params.srcToken,
          destToken: params.destToken,
          srcAmount: params.srcAmount,
          srcDecimals: params.srcDecimals,
          destDecimals: params.destDecimals,
          network: params.network,
          partner: 'plugit',
        },
      }
    );

    const priceRoute = priceRouteResponse.data.priceRoute;

    // Build transaction
    const txResponse = await axios.post(
      `${PARASWAP_API_URL}/transactions/${params.network}`,
      {
        srcToken: params.srcToken,
        destToken: params.destToken,
        srcAmount: params.srcAmount,
        destAmount: priceRoute.destAmount,
        priceRoute: priceRoute,
        userAddress: params.userAddress,
        partner: 'plugit',
        slippage: params.slippage || 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      priceRoute,
      transaction: txResponse.data,
    };
  } catch (error) {
    console.error('ParaSwap API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
    return null;
  }
}

