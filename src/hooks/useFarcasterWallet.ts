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
      try {
        const provider = await sdk.wallet.getEthereumProvider();
        if (provider) {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const chainId = await provider.request({ method: 'eth_chainId' });
            setWallet({
              address: accounts[0],
              isConnected: true,
              chainId: parseInt(chainId as string, 16),
              error: null,
            });
          }
        }
      } catch (error) {
        // Wallet not connected yet, that's okay
        console.log('Wallet not connected:', error);
      }
    };

    checkConnection();
  }, []);

  const connect = async () => {
    try {
      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) {
        throw new Error('Ethereum provider not available');
      }

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const chainId = await provider.request({ method: 'eth_chainId' });
        setWallet({
          address: accounts[0],
          isConnected: true,
          chainId: parseInt(chainId as string, 16),
          error: null,
        });
      }
    } catch (error: any) {
      setWallet((prev) => ({
        ...prev,
        error: error.message || 'Failed to connect wallet',
      }));
    }
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
