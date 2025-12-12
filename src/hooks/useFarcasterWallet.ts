import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  error: string | null;
}

export function useFarcasterWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    error: null,
  });

  useEffect(() => {
    // Check if wallet is already connected when hook initializes
    const checkConnection = async () => {
      console.log('[FarcasterWallet] Checking connection...');
      
      // Try Farcaster provider first
      try {
        console.log('[FarcasterWallet] Attempting Farcaster provider...');
        const provider = await sdk.wallet.getEthereumProvider();
        if (provider) {
          console.log('[FarcasterWallet] Farcaster provider found');
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const chainId = await provider.request({ method: 'eth_chainId' });
            console.log('[FarcasterWallet] Farcaster wallet connected:', {
              address: accounts[0],
              chainId: parseInt(chainId as string, 16),
            });
            setWallet({
              address: accounts[0],
              isConnected: true,
              chainId: parseInt(chainId as string, 16),
              error: null,
            });
            return;
          }
        }
        console.log('[FarcasterWallet] Farcaster provider not available or no accounts');
      } catch (error: any) {
        // Wallet not connected yet, that's okay
        // Only log if it's not a known expected error
        if (error?.name !== 'RpcResponse.InternalErrorError' && error?.message !== 'Cannot read properties of undefined') {
          console.log('[FarcasterWallet] Farcaster provider check failed (expected if not in Farcaster app):', error.message);
        }
      }

      // Fallback to injected provider
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          console.log('[FarcasterWallet] Trying injected provider...');
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
            console.log('[FarcasterWallet] Injected wallet connected:', {
              address: accounts[0],
              chainId: parseInt(chainId, 16),
            });
            setWallet({
              address: accounts[0],
              isConnected: true,
              chainId: parseInt(chainId, 16),
              error: null,
            });
            return;
          }
          console.log('[FarcasterWallet] Injected provider available but no accounts');
        } catch (error: any) {
          console.log('[FarcasterWallet] Injected provider check failed:', error.message);
        }
      }

      console.log('[FarcasterWallet] No wallet connected');
    };

    checkConnection();
  }, []);

  const connect = async () => {
    console.log('[FarcasterWallet] Connect called');
    
    // Try Farcaster provider first
    try {
      console.log('[FarcasterWallet] Attempting Farcaster provider connection...');
      const provider = await sdk.wallet.getEthereumProvider();
      if (provider) {
        console.log('[FarcasterWallet] Farcaster provider found, requesting accounts...');
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const chainId = await provider.request({ method: 'eth_chainId' });
          console.log('[FarcasterWallet] Farcaster wallet connected:', {
            address: accounts[0],
            chainId: parseInt(chainId as string, 16),
          });
          setWallet({
            address: accounts[0],
            isConnected: true,
            chainId: parseInt(chainId as string, 16),
            error: null,
          });
          return;
        }
      }
      console.log('[FarcasterWallet] Farcaster provider not available');
    } catch (farcasterError: any) {
      console.warn('[FarcasterWallet] Farcaster provider connection failed:', farcasterError.message);
    }

    // Fallback to injected provider
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        console.log('[FarcasterWallet] Falling back to injected provider...');
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
          console.log('[FarcasterWallet] Injected wallet connected:', {
            address: accounts[0],
            chainId: parseInt(chainId, 16),
          });
          setWallet({
            address: accounts[0],
            isConnected: true,
            chainId: parseInt(chainId, 16),
            error: null,
          });
          return;
        }
      } catch (injectedError: any) {
        console.error('[FarcasterWallet] Injected provider connection failed:', injectedError.message);
        setWallet((prev) => ({
          ...prev,
          error: `Both Farcaster and injected providers failed: ${injectedError.message || 'Unknown error'}`,
        }));
        return;
      }
    }

    setWallet((prev) => ({
      ...prev,
      error: 'No Ethereum provider available (neither Farcaster nor injected)',
    }));
  };

  const disconnect = () => {
    setWallet({
      address: null,
      isConnected: false,
      chainId: null,
      error: null,
    });
  };

  const requestSign = async (transaction: any): Promise<string> => {
    if (!wallet.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) {
        throw new Error('Ethereum provider not available');
      }

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      return txHash as string;
    } catch (error: any) {
      throw new Error(error.message || 'Transaction failed');
    }
  };

  return {
    ...wallet,
    connect,
    disconnect,
    requestSign,
  };
}
