import { useState, useEffect, useCallback, useRef } from 'react';
import { Core } from '@walletconnect/core';
import { SignClient } from '@walletconnect/sign-client';
import type { SignClientTypes } from '@walletconnect/types';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
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
  signClient: InstanceType<typeof SignClient> | null;
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
  const { address, isConnected: farcasterConnected, chainId } = useFarcasterWallet();
  const [state, setState] = useState<WalletConnectState>({
    signClient: null,
    connected: false,
    connecting: false,
    error: null,
    pendingRequest: null,
  });

  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const coreRef = useRef<InstanceType<typeof Core> | null>(null);
  const signClientRef = useRef<InstanceType<typeof SignClient> | null>(null);

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

  // Initialize WalletConnect SignClient (wallet-side)
  const initializeSignClient = useCallback(async () => {
    if (!farcasterConnected || !address) {
      setState((prev) => ({
        ...prev,
        error: 'Please connect Farcaster wallet first',
      }));
      return;
    }

    if (signClientRef.current) {
      return; // Already initialized
    }

    try {
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';
      
      // Initialize Core
      const core = new Core({
        projectId,
      });
      coreRef.current = core;

      // Initialize SignClient (wallet-side)
      const signClient = await SignClient.init({
        core,
        metadata: {
          name: 'Plug It - Farcaster Bridge',
          description: 'Bridge between Web3 apps and Farcaster wallet',
          url: typeof window !== 'undefined' ? window.location.origin : '',
          icons: [`${typeof window !== 'undefined' ? window.location.origin : ''}/icon.png`],
        },
      });
      signClientRef.current = signClient;

      // Handle session proposals (when dApps want to connect)
      signClient.on('session_proposal', async (proposal) => {
        try {
          const { id, params } = proposal;
          
          // Build approved namespaces based on Farcaster wallet capabilities
          const approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
              eip155: {
                chains: ['eip155:1', 'eip155:137', 'eip155:42161', 'eip155:8453', 'eip155:10', 'eip155:56'],
                methods: [
                  'eth_accounts',
                  'eth_requestAccounts',
                  'eth_sendTransaction',
                  'eth_signTransaction',
                  'eth_sign',
                  'eth_signTypedData',
                  'eth_signTypedData_v3',
                  'eth_signTypedData_v4',
                  'personal_sign',
                  'wallet_switchEthereumChain',
                  'wallet_addEthereumChain',
                  'wallet_getPermissions',
                  'wallet_requestPermissions',
                  'wallet_registerOnboarding',
                  'wallet_watchAsset',
                  'wallet_sendCalls',
                  'wallet_getCallsStatus',
                  'wallet_showCallsStatus',
                  'wallet_getCapabilities',
                ],
                events: ['chainChanged', 'accountsChanged', 'message', 'disconnect', 'connect'],
                accounts: [
                  `eip155:${chainId || 1}:${address}`,
                ],
              },
            },
          });

          // Approve the session
          const session = await signClient.approve({
            id,
            namespaces: approvedNamespaces,
          });

          // Get the full session with peer metadata
          const fullSession = signClient.session.get(session.topic);
          const peerMetadata = params.proposer.metadata || {};

          // Save the connected app
          const newApp: ConnectedApp = {
            id: session.topic,
            name: peerMetadata.name || 'Unknown App',
            url: peerMetadata.url || '',
            icon: peerMetadata.icons?.[0],
            topic: session.topic,
            chainId: chainId || 1,
            accounts: [address],
            connectedAt: Date.now(),
          };

          const updatedApps = [...connectedApps.filter(app => app.topic !== session.topic), newApp];
          saveConnectedApps(updatedApps);
          setState((prev) => ({ ...prev, connected: true, connecting: false }));

          console.log('Session approved:', session);
        } catch (error: any) {
          console.error('Error approving session:', error);
          // Reject the session
          try {
            await signClient.reject({
              id: proposal.id,
              reason: getSdkError('USER_REJECTED'),
            });
          } catch (rejectError) {
            console.error('Failed to reject session:', rejectError);
          }
          setState((prev) => ({
            ...prev,
            error: error.message || 'Failed to approve session',
            connecting: false,
          }));
        }
      });

      // Handle session requests (when dApps want to sign/transact)
      signClient.on('session_request', async (event) => {
        try {
          const { topic, params, id } = event;
          const { request } = params;

          // Bridge the request to Farcaster wallet
          const result = await bridgeRequestToFarcaster({
            id,
            method: request.method,
            params: request.params || [],
          });

          // Respond to the request
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result,
            },
          });

          console.log('Bridged request to Farcaster:', request.method, result);
        } catch (error: any) {
          console.error('RPC request bridge error:', error);
          // Reject the request on error
          try {
            await signClient.respond({
              topic: event.topic,
              response: {
                id: event.id,
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

      // Handle session deletion
      signClient.on('session_delete', (event) => {
        const { topic } = event;
        const updatedApps = connectedApps.filter((app) => app.topic !== topic);
        saveConnectedApps(updatedApps);
        setState((prev) => ({ ...prev, connected: updatedApps.length > 0 }));
      });

      // Load existing sessions
      const sessions = signClient.session.getAll();
      if (sessions.length > 0) {
        const apps: ConnectedApp[] = sessions.map((session) => {
          const accounts = session.namespaces.eip155?.accounts || [];
          const firstAccount = accounts[0] || '';
          const chainIdMatch = firstAccount.match(/eip155:(\d+):/);
          const chainId = chainIdMatch ? parseInt(chainIdMatch[1]) : 1;
          
          // Get peer metadata from session
          const peerMetadata = (session as any).peer?.metadata || {};

          return {
            id: session.topic,
            name: peerMetadata.name || 'Unknown App',
            url: peerMetadata.url || '',
            icon: peerMetadata.icons?.[0],
            topic: session.topic,
            chainId,
            accounts: accounts.map((acc) => acc.split(':')[2] || ''),
            connectedAt: Date.now(),
          };
        });
        saveConnectedApps(apps);
        setState((prev) => ({ ...prev, connected: apps.length > 0 }));
      }

      setState((prev) => ({ ...prev, signClient }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to initialize WalletConnect wallet',
        connecting: false,
      }));
    }
  }, [farcasterConnected, address, chainId, connectedApps, bridgeRequestToFarcaster, saveConnectedApps]);

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

      let signClient = signClientRef.current;
      
      if (!signClient) {
        await initializeSignClient();
        await new Promise(resolve => setTimeout(resolve, 100));
        signClient = signClientRef.current;
      }

      if (!signClient) {
        setState((prev) => ({
          ...prev,
          error: 'Wallet not initialized',
        }));
        return;
      }

      setState((prev) => ({ ...prev, connecting: true, error: null }));

      try {
        // Pair with the dApp using the URI
        await signClient.core.pairing.pair({ uri });
        // The session_proposal event will be triggered automatically
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to connect',
          connecting: false,
        }));
      }
    },
    [farcasterConnected, initializeSignClient]
  );

  // Disconnect from an app
  const disconnectApp = useCallback(
    async (topic: string) => {
      try {
        const signClient = signClientRef.current;
        if (signClient) {
          await signClient.disconnect({
            topic,
            reason: getSdkError('USER_DISCONNECTED'),
          });
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
    [connectedApps, saveConnectedApps]
  );

  // Disconnect all apps
  const disconnectAll = useCallback(async () => {
    try {
      const signClient = signClientRef.current;
      if (signClient) {
        const sessions = signClient.session.getAll();
        for (const session of sessions) {
          await signClient.disconnect({
            topic: session.topic,
            reason: getSdkError('USER_DISCONNECTED'),
          });
        }
      }
      saveConnectedApps([]);
      setState((prev) => ({ ...prev, connected: false }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to disconnect all',
      }));
    }
  }, [saveConnectedApps]);

  // Initialize wallet when Farcaster wallet connects
  useEffect(() => {
    if (farcasterConnected && address && !signClientRef.current) {
      initializeSignClient();
    }
  }, [farcasterConnected, address, initializeSignClient]);

  return {
    ...state,
    connectedApps,
    initializeProvider: initializeSignClient,
    connectViaURI,
    disconnectApp,
    disconnectAll,
    isBridgeReady: farcasterConnected && !!address,
  };
}
