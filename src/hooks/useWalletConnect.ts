import { useState, useEffect, useCallback } from 'react';
// @ts-ignore - WalletConnect types will be available after npm install
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcasterWallet } from './useFarcasterWallet';

export interface ConnectedApp {
  id: string;
  name: string;
  url: string;
  icon?: string;
  topic: string;
  chainId: number;
  accounts: string[];
  connectedAt: number;
}

interface WalletConnectState {
  provider: EthereumProvider | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  pendingRequest: {
    id: number;
    method: string;
    params: any[];
  } | null;
}

export function useWalletConnect() {
  const { address, isConnected: farcasterConnected, requestSign } = useFarcasterWallet();
  const [state, setState] = useState<WalletConnectState>({
    provider: null,
    connected: false,
    connecting: false,
    error: null,
    pendingRequest: null,
  });

  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);

  // Load connected apps from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('plugit_connected_apps');
    if (stored) {
      try {
        setConnectedApps(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading connected apps:', error);
      }
    }
  }, []);

  // Save connected apps to storage
  const saveConnectedApps = useCallback((apps: ConnectedApp[]) => {
    localStorage.setItem('plugit_connected_apps', JSON.stringify(apps));
    setConnectedApps(apps);
  }, []);

  // Bridge WalletConnect requests to Farcaster wallet
  const bridgeRequestToFarcaster = useCallback(
    async (request: { id: number; method: string; params: any[] }) => {
      if (!farcasterConnected || !address) {
        throw new Error('Farcaster wallet not connected');
      }

      try {
        // Get Farcaster Ethereum provider
        const farcasterProvider = await sdk.wallet.getEthereumProvider();
        if (!farcasterProvider) {
          throw new Error('Farcaster wallet provider not available');
        }

        // Forward request to Farcaster wallet provider
        const result = await farcasterProvider.request({
          method: request.method,
          params: request.params,
        });

        return result;
      } catch (error: any) {
        throw new Error(error.message || 'Request failed');
      }
    },
    [farcasterConnected, address]
  );

  // Initialize WalletConnect provider as a bridge
  const initializeProvider = useCallback(async () => {
    if (!farcasterConnected) {
      setState((prev) => ({
        ...prev,
        error: 'Please connect Farcaster wallet first',
      }));
      return;
    }

    try {
      const provider = await EthereumProvider.init({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
        chains: [1, 137, 42161, 8453], // Ethereum, Polygon, Arbitrum, Base
        optionalChains: [10, 56], // Optimism, BSC
        showQrModal: false, // We'll handle QR display ourselves
        metadata: {
          name: 'Plug It - Farcaster Bridge',
          description: 'Bridge between Web3 apps and Farcaster wallet',
          url: typeof window !== 'undefined' ? window.location.origin : '',
          icons: [`${typeof window !== 'undefined' ? window.location.origin : ''}/icon.png`],
        },
      });

      // Handle incoming session proposals - auto-approve if Farcaster wallet is connected
      provider.on('session_proposal', async (event: any) => {
        try {
          const { id, params } = event;
          // Auto-approve session proposals if Farcaster wallet is connected
          const session = await provider.approveSession({
            accounts: [address!],
            chainId: 1,
          });
          
          // Save connected app
          if (session) {
            const newApp: ConnectedApp = {
              id: session.topic,
              name: params.proposer.metadata?.name || 'Unknown App',
              url: params.proposer.metadata?.url || '',
              icon: params.proposer.metadata?.icons?.[0],
              topic: session.topic,
              chainId: session.chainId || 1,
              accounts: session.accounts || [address!],
              connectedAt: Date.now(),
            };

            const updatedApps = [...connectedApps.filter(app => app.topic !== session.topic), newApp];
            saveConnectedApps(updatedApps);
          }
        } catch (error: any) {
          console.error('Session proposal error:', error);
        }
      });

      provider.on('display_uri', (uri: string) => {
        console.log('WalletConnect URI:', uri);
      });

      provider.on('connect', () => {
        setState((prev) => ({ ...prev, connected: true, connecting: false }));
      });

      provider.on('disconnect', () => {
        setState((prev) => ({ ...prev, connected: false, provider: null }));
      });

      provider.on('session_delete', () => {
        setState((prev) => ({ ...prev, connected: false, provider: null }));
      });

      // Handle RPC requests from connected apps - bridge to Farcaster wallet
      provider.on('session_request', async (event: any) => {
        try {
          const { id, topic, params } = event;
          const { request } = params;
          
          if (request) {
            const result = await bridgeRequestToFarcaster({
              id,
              method: request.method,
              params: request.params || [],
            });
            
            // Respond to the request
            await provider.respondSessionRequest({
              topic,
              response: {
                id,
                jsonrpc: '2.0',
                result,
              },
            });
            
            console.log('Bridged request to Farcaster:', request.method, result);
          }
        } catch (error: any) {
          console.error('RPC request bridge error:', error);
          // Reject the request on error
          try {
            const { id, topic } = event;
            await provider.respondSessionRequest({
              topic,
              response: {
                id,
                jsonrpc: '2.0',
                error: {
                  code: 5000,
                  message: error.message || 'Request failed',
                },
              },
            });
          } catch (rejectError) {
            console.error('Failed to reject request:', rejectError);
          }
        }
      });

      setState((prev) => ({ ...prev, provider }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to initialize WalletConnect bridge',
        connecting: false,
      }));
    }
  }, [farcasterConnected, address, connectedApps, bridgeRequestToFarcaster, saveConnectedApps]);

  // Connect via QR code URI (from external dApp)
  const connectViaURI = useCallback(
    async (uri: string) => {
      if (!farcasterConnected) {
        setState((prev) => ({
          ...prev,
          error: 'Please connect Farcaster wallet first',
        }));
        return;
      }

      let provider = state.provider;
      
      if (!provider) {
        await initializeProvider();
        await new Promise(resolve => setTimeout(resolve, 100));
        provider = state.provider;
      }

      if (!provider) {
        setState((prev) => ({
          ...prev,
          error: 'Bridge not initialized',
        }));
        return;
      }

      setState((prev) => ({ ...prev, connecting: true, error: null }));

      try {
        // Connect to external dApp via WalletConnect
        await provider.connect({
          uri,
          optionalChains: [1, 137, 42161, 8453],
        });

        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 500));

        // Extract session info
        const session = provider.session;
        if (session) {
          const newApp: ConnectedApp = {
            id: session.topic,
            name: session.peer.metadata.name || 'Unknown App',
            url: session.peer.metadata.url || '',
            icon: session.peer.metadata.icons?.[0],
            topic: session.topic,
            chainId: session.chainId || 1,
            accounts: session.accounts || [address!],
            connectedAt: Date.now(),
          };

          const updatedApps = [...connectedApps.filter(app => app.topic !== session.topic), newApp];
          saveConnectedApps(updatedApps);
          setState((prev) => ({ ...prev, connected: true, connecting: false }));
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to connect',
          connecting: false,
        }));
      }
    },
    [state.provider, connectedApps, initializeProvider, saveConnectedApps, farcasterConnected, address]
  );

  // Disconnect from an app
  const disconnectApp = useCallback(
    async (topic: string) => {
      try {
        if (state.provider && state.provider.session?.topic === topic) {
          await state.provider.disconnect();
        }

        const updatedApps = connectedApps.filter((app) => app.topic !== topic);
        saveConnectedApps(updatedApps);
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to disconnect',
        }));
      }
    },
    [state.provider, connectedApps, saveConnectedApps]
  );

  // Disconnect all apps
  const disconnectAll = useCallback(async () => {
    try {
      if (state.provider) {
        await state.provider.disconnect();
      }
      saveConnectedApps([]);
      setState((prev) => ({ ...prev, connected: false, provider: null }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to disconnect all',
      }));
    }
  }, [state.provider, saveConnectedApps]);

  // Initialize bridge when Farcaster wallet connects
  useEffect(() => {
    if (farcasterConnected && address && !state.provider) {
      initializeProvider();
    }
  }, [farcasterConnected, address, state.provider, initializeProvider]);

  return {
    ...state,
    connectedApps,
    initializeProvider,
    connectViaURI,
    disconnectApp,
    disconnectAll,
    isBridgeReady: farcasterConnected && !!address,
  };
}
