export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

// Common tokens across chains
export const COMMON_TOKENS: Token[] = [
  // Ethereum
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 1,
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    chainId: 1,
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    chainId: 1,
  },
  // Polygon
  {
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 137,
  },
  {
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    symbol: 'WMATIC',
    name: 'Wrapped MATIC',
    decimals: 18,
    chainId: 137,
  },
  // Arbitrum
  {
    address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 42161,
  },
  {
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    chainId: 42161,
  },
  // Base
  {
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 8453,
  },
  {
    address: '0x4200000000000000000000000000000000000006',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    chainId: 8453,
  },
];

export const getTokensForChain = (chainId: number): Token[] => {
  return COMMON_TOKENS.filter((token) => token.chainId === chainId);
};

export const getTokenByAddress = (
  address: string,
  chainId: number
): Token | undefined => {
  return COMMON_TOKENS.find(
    (token) =>
      token.address.toLowerCase() === address.toLowerCase() &&
      token.chainId === chainId
  );
};

export const NATIVE_TOKENS: Record<number, Token> = {
  1: {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    chainId: 1,
  },
  137: {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    chainId: 137,
  },
  42161: {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    name: 'Arbitrum',
    decimals: 18,
    chainId: 42161,
  },
  8453: {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    name: 'Base',
    decimals: 18,
    chainId: 8453,
  },
};

