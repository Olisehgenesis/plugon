import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const SQUID_API_URL = process.env.SQUID_API_URL || 'https://v2.api.squidrouter.com';
const INTEGRATOR_ID = process.env.SQUID_INTEGRATOR_ID || '';
const PARASWAP_API_URL = process.env.PARASWAP_API_URL || 'https://apiv5.paraswap.io';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      fromAddress,
      slippage = 1,
      aggregator = 'auto',
      fromTokenDecimals,
      toTokenDecimals,
    } = body;

    const quotes: any[] = [];

    // Fetch Squid quote (for cross-chain or same-chain)
    if (aggregator === 'auto' || aggregator === 'squid') {
      try {
        const squidResponse = await axios.post(
          `${SQUID_API_URL}/v2/route`,
          {
            fromChain: fromChain.toString(),
            toChain: toChain.toString(),
            fromToken,
            toToken,
            fromAmount,
            fromAddress,
            slippage,
            enableBoost: true,
          },
          {
            headers: {
              'x-integrator-id': INTEGRATOR_ID,
              'Content-Type': 'application/json',
            },
          }
        );

        const route = squidResponse.data.route;
        const estimate = route.estimate;
        const routeData = estimate.route;
        const totalGasUSD = estimate.gasCosts.reduce(
          (sum: number, gas: any) => sum + parseFloat(gas.amountUSD || '0'),
          0
        );
        const totalFeeUSD = estimate.feeCosts.reduce(
          (sum: number, fee: any) => sum + parseFloat(fee.amountUSD || '0'),
          0
        );

        quotes.push({
          aggregator: 'squid',
          fromAmount: routeData.fromAmount,
          toAmount: routeData.toAmount,
          rate: (parseFloat(routeData.toAmount) / parseFloat(routeData.fromAmount)).toFixed(6),
          gasEstimate: estimate.gasCosts[0]?.estimate || '0',
          gasCostUSD: totalGasUSD.toFixed(2),
          feeCostUSD: totalFeeUSD.toFixed(2),
          priceImpact: '0',
          route: route,
        });
      } catch (error) {
        console.error('Squid API error:', error);
      }
    }

    // Fetch ParaSwap quote (only for same-chain swaps)
    if ((aggregator === 'auto' || aggregator === 'paraswap') && fromChain === toChain) {
      try {
        // Get price route
        const priceRouteResponse = await axios.get(`${PARASWAP_API_URL}/prices`, {
          params: {
            srcToken: fromToken,
            destToken: toToken,
            srcAmount: fromAmount,
            srcDecimals: fromTokenDecimals || 18,
            destDecimals: toTokenDecimals || 18,
            network: fromChain,
            partner: 'plugit',
          },
        });

        const priceRoute = priceRouteResponse.data.priceRoute;

        // Build transaction
        const txResponse = await axios.post(
          `${PARASWAP_API_URL}/transactions/${fromChain}`,
          {
            srcToken: fromToken,
            destToken: toToken,
            srcAmount: fromAmount,
            destAmount: priceRoute.destAmount,
            priceRoute: priceRoute,
            userAddress: fromAddress,
            partner: 'plugit',
            slippage,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        quotes.push({
          aggregator: 'paraswap',
          fromAmount: priceRoute.srcAmount,
          toAmount: priceRoute.destAmount,
          rate: (parseFloat(priceRoute.destAmount) / parseFloat(priceRoute.srcAmount)).toFixed(6),
          gasEstimate: priceRoute.estimatedGas,
          gasCostUSD: priceRoute.gasCostUSD,
          feeCostUSD: '0',
          priceImpact: priceRoute.priceImpact,
          route: {
            priceRoute,
            transaction: txResponse.data,
          },
        });
      } catch (error) {
        console.error('ParaSwap API error:', error);
      }
    }

    // Sort by best rate (highest toAmount)
    quotes.sort((a, b) => parseFloat(b.toAmount) - parseFloat(a.toAmount));

    return NextResponse.json({ quotes });
  } catch (error: any) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

