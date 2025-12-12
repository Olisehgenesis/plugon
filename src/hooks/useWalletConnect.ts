import { useState, useEffect, useCallback, useRef } from 'react';
import { Core } from '@walletconnect/core';
import { SignClient } from '@walletconnect/sign-client';
import type { SignClientTypes } from '@walletconnect/types';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcasterWallet } from './useFarcasterWallet';

// Toast notification function (will be set by context)
let showToastFn: ((message: string, type: 'success' | 'error' | 'info' | 'pending') => void) | null = null;

export function setToastFunction(fn: (message: string, type: 'success' | 'error' | 'info' | 'pending') => void) {
  showToastFn = fn;
}

async function monitorWalletConnectTransaction(txHash: string, chainId: number) {
  try {
    const { getChainById } = await import('../utils/chains');
    const chain = getChainById(chainId);
    if (!chain?.rpc) {
      if (showToastFn) showToastFn('Transaction submitted!', 'success');
      return;
    }

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
          if (status === 1) {
            if (showToastFn) showToastFn('Transaction confirmed!', 'success');
            confirmed = true;
          } else {
            if (showToastFn) showToastFn('Transaction failed', 'error');
            confirmed = true;
          }
        }
      } catch (err) {
        // Continue polling on error
        console.error('[WalletConnect] Error checking transaction:', err);
      }
    }

    if (!confirmed && showToastFn) {
      showToastFn('Transaction submitted! (checking status...)', 'info');
    }
  } catch (err: any) {
    console.error('[WalletConnect] Error monitoring transaction:', err);
    // Show success anyway since transaction was submitted
    if (showToastFn) showToastFn('Transaction submitted!', 'success');
  }
}

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

  // Bridge WalletConnect requests to Farcaster wallet or injected provider
  const bridgeRequestToFarcaster = useCallback(
    async (request: { id: number; method: string; params: any[] }) => {
      console.log('[WalletConnect] Bridge request:', {
        method: request.method,
        params: request.params,
        farcasterConnected,
        address,
      });

      // Try Farcaster provider first
      try {
        console.log('[WalletConnect] Attempting Farcaster provider...');
        const farcasterProvider = await sdk.wallet.getEthereumProvider();
        if (farcasterProvider) {
          console.log('[WalletConnect] Farcaster provider found, making request...');
          const result = await farcasterProvider.request({
            method: request.method,
            params: request.params,
          });
          console.log('[WalletConnect] Farcaster request successful:', result);
          return result;
        }
        console.log('[WalletConnect] Farcaster provider not available');
      } catch (farcasterError: any) {
        console.warn('[WalletConnect] Farcaster provider failed:', farcasterError);
      }

      // Fallback to injected provider (window.ethereum)
      try {
        console.log('[WalletConnect] Falling back to injected provider (window.ethereum)...');
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const injectedProvider = (window as any).ethereum;
          console.log('[WalletConnect] Injected provider found:', {
            isMetaMask: injectedProvider.isMetaMask,
            isCoinbaseWallet: injectedProvider.isCoinbaseWallet,
          });

          // Request accounts if needed
          if (request.method === 'eth_requestAccounts' || request.method === 'eth_accounts') {
            const accounts = await injectedProvider.request({ method: 'eth_requestAccounts' });
            console.log('[WalletConnect] Injected provider accounts:', accounts);
            return accounts;
          }

          // For other methods, forward the request
          const result = await injectedProvider.request({
            method: request.method,
            params: request.params,
          });
          console.log('[WalletConnect] Injected provider request successful:', result);
          return result;
        }
        console.log('[WalletConnect] No injected provider found');
      } catch (injectedError: any) {
        console.error('[WalletConnect] Injected provider failed:', injectedError);
        throw new Error(`Both Farcaster and injected providers failed: ${injectedError.message || 'Unknown error'}`);
      }

      throw new Error('No Ethereum provider available (neither Farcaster nor injected)');
    },
    [farcasterConnected, address]
  );

  // Initialize WalletConnect SignClient (wallet-side)
  const initializeSignClient = useCallback(async () => {
    console.log('[WalletConnect] initializeSignClient called:', {
      farcasterConnected,
      address,
      hasInjected: typeof window !== 'undefined' && !!(window as any).ethereum,
    });

    // Check if we have any wallet (Farcaster or injected)
    const hasInjected = typeof window !== 'undefined' && !!(window as any).ethereum;
    if (!farcasterConnected && !hasInjected) {
      console.warn('[WalletConnect] No wallet available (neither Farcaster nor injected)');
      setState((prev) => ({
        ...prev,
        error: 'Please connect a wallet first (Farcaster or browser extension)',
      }));
      return;
    }

    if (signClientRef.current) {
      console.log('[WalletConnect] SignClient already initialized');
      return; // Already initialized
    }

    try {
      const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
      
      if (!projectId || projectId === 'demo-project-id') {
        const errorMsg = 'WalletConnect Project ID is missing or invalid. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env file. Get your project ID from https://cloud.walletconnect.com';
        console.error('[WalletConnect]', errorMsg);
        setState((prev) => ({
          ...prev,
          error: errorMsg,
        }));
        return;
      }

      console.log('[WalletConnect] Initializing Core and SignClient with projectId:', projectId.substring(0, 8) + '...');
      
      // Initialize Core
      const core = new Core({
        projectId,
      });
      coreRef.current = core;

      // Initialize SignClient (wallet-side)
      const signClient = await SignClient.init({
        core,
        metadata: {
          name: 'Plug It - Wallet Bridge',
          description: 'Bridge between Web3 apps and wallet (Farcaster or injected)',
          url: typeof window !== 'undefined' ? window.location.origin : '',
          icons: [`${typeof window !== 'undefined' ? window.location.origin : ''}/icon.png`],
        },
      });
      signClientRef.current = signClient;
      console.log('[WalletConnect] SignClient initialized successfully');

      // Handle session proposals (when dApps want to connect)
      signClient.on('session_proposal', async (proposal) => {
        const requiredChains = proposal.params.requiredNamespaces?.eip155?.chains || [];
        const optionalChains = proposal.params.optionalNamespaces?.eip155?.chains || [];
        
        console.log('[WalletConnect] Session proposal received:', {
          id: proposal.id,
          proposer: proposal.params.proposer.metadata?.name,
          requiredChains,
          optionalChains,
          requiredNamespaces: Object.keys(proposal.params.requiredNamespaces || {}),
          fullRequiredNamespaces: JSON.stringify(proposal.params.requiredNamespaces, null, 2),
        });

        try {
          const { id, params } = proposal;
          
          // Get current account and chainId (try Farcaster first, then injected)
          let currentAddress = address;
          let currentChainId = chainId || 1;

          if (!currentAddress) {
            console.log('[WalletConnect] No Farcaster address, trying injected provider...');
            try {
              if (typeof window !== 'undefined' && (window as any).ethereum) {
                const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts && accounts.length > 0) {
                  currentAddress = accounts[0];
                  const chainIdHex = await (window as any).ethereum.request({ method: 'eth_chainId' });
                  currentChainId = parseInt(chainIdHex, 16);
                  console.log('[WalletConnect] Using injected provider:', { currentAddress, currentChainId });
                }
              }
            } catch (err) {
              console.error('[WalletConnect] Failed to get injected provider account:', err);
            }
          }

          if (!currentAddress) {
            throw new Error('No wallet account available');
          }

          // Get requested chains from the proposal - check both required and optional namespaces
          const requiredChainsFromProposal = params.requiredNamespaces?.eip155?.chains || [];
          const optionalChainsFromProposal = params.optionalNamespaces?.eip155?.chains || [];
          
          // Also check if chains are specified in a different format
          const allProposalChains = [...requiredChainsFromProposal, ...optionalChainsFromProposal];
          
          // Supported EVM chains: Base, BSC, ETH, Arbitrum, Optimism, Celo
          // Chain IDs: Ethereum=1, Polygon=137, Arbitrum=42161, Base=8453, Optimism=10, BSC=56, Celo=42220, Avalanche=43114
          const supportedChains = [
            'eip155:1',      // Ethereum Mainnet
            'eip155:137',    // Polygon
            'eip155:42161',  // Arbitrum
            'eip155:8453',   // Base
            'eip155:10',     // Optimism
            'eip155:56',     // BSC
            'eip155:42220',  // Celo
            'eip155:43114',  // Avalanche
          ];
          
          // Build accounts array - provide the same address for all chains
          // EVM addresses are the same across all EVM chains
          const accounts: string[] = [];
          
          // Determine which chains to support
          // CRITICAL: Always include Ethereum mainnet (eip155:1) as most dApps require it
          let chainsToSupport: string[] = ['eip155:1']; // Always start with Ethereum mainnet
          
          if (allProposalChains.length > 0) {
            // Add any requested chains that we support
            allProposalChains.forEach(chain => {
              if (supportedChains.includes(chain) && !chainsToSupport.includes(chain)) {
                chainsToSupport.push(chain);
              }
            });
          } else {
            // If no chains specified, add all our supported chains
            supportedChains.forEach(chain => {
              if (!chainsToSupport.includes(chain)) {
                chainsToSupport.push(chain);
              }
            });
          }
          
          // Create accounts for all chains we're supporting
          chainsToSupport.forEach(chain => {
            accounts.push(`${chain}:${currentAddress}`);
          });
          
          console.log('[WalletConnect] Final chains and accounts:', {
            chainsToSupport,
            accountsCount: accounts.length,
            accounts: accounts.slice(0, 3) + '...', // Show first 3
          });

          console.log('[WalletConnect] Building approved namespaces with:', {
            address: currentAddress,
            chainId: currentChainId,
            requiredChainsFromProposal,
            optionalChainsFromProposal,
            allProposalChains,
            chainsToSupport,
            accountsProvided: accounts,
          });
          
          // Build approved namespaces based on wallet capabilities
          const approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
              eip155: {
                chains: chainsToSupport,
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
                accounts: accounts,
              },
            },
          });

          // Validate approved namespaces
          console.log('[WalletConnect] Approved namespaces:', JSON.stringify(approvedNamespaces, null, 2));
          
          // Ensure all required chains have accounts
          const requiredChainsInApproved = approvedNamespaces.eip155?.chains || [];
          const accountsInApproved = approvedNamespaces.eip155?.accounts || [];
          
          console.log('[WalletConnect] Validation:', {
            requiredChainsInApproved,
            accountsInApproved,
            accountsCount: accountsInApproved.length,
            allChainsHaveAccounts: requiredChainsInApproved.every(chain => 
              accountsInApproved.some(acc => acc.startsWith(chain))
            ),
          });

          // Verify accounts are provided for all chains
          const missingAccounts = requiredChainsInApproved.filter(chain => 
            !accountsInApproved.some(acc => acc.startsWith(chain))
          );
          
          if (missingAccounts.length > 0) {
            console.warn('[WalletConnect] Missing accounts for chains:', missingAccounts);
            // Add missing accounts
            missingAccounts.forEach(chain => {
              accountsInApproved.push(`${chain}:${currentAddress}`);
            });
            approvedNamespaces.eip155!.accounts = accountsInApproved;
            console.log('[WalletConnect] Fixed accounts:', approvedNamespaces.eip155?.accounts);
          }

          console.log('[WalletConnect] Approving session with final namespaces...');
          // Approve the session
          const session = await signClient.approve({
            id,
            namespaces: approvedNamespaces,
          });
          console.log('[WalletConnect] Session approved:', {
            topic: session.topic,
            acknowledged: session.acknowledged,
          });
          
          // Wait a bit for session keys to sync
          await new Promise(resolve => setTimeout(resolve, 500));

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
            chainId: currentChainId,
            accounts: [currentAddress],
            connectedAt: Date.now(),
          };

          console.log('[WalletConnect] Connected app saved:', newApp);

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
        console.log('[WalletConnect] Session request received:', {
          topic: event.topic,
          method: event.params.request.method,
          id: event.id,
        });

        try {
          const { topic, params, id } = event;
          const { request } = params;

          // Verify session exists
          const session = signClient.session.get(topic);
          if (!session) {
            console.error('[WalletConnect] Session not found for topic:', topic);
            throw new Error('Session not found');
          }
          console.log('[WalletConnect] Session verified:', session.topic);

          // Bridge the request to wallet (Farcaster or injected)
          console.log('[WalletConnect] Bridging request:', request.method);
          
          // Show pending toast for transactions
          if (request.method === 'eth_sendTransaction' && showToastFn) {
            showToastFn('Transaction pending...', 'pending');
          }
          
          const result = await bridgeRequestToFarcaster({
            id,
            method: request.method,
            params: request.params || [],
          });

          // Respond to the request
          console.log('[WalletConnect] Responding to request with result');
          await signClient.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              result,
            },
          });

          console.log('[WalletConnect] Request bridged successfully:', request.method);
          
          // Monitor transaction if it's a sendTransaction
          if (request.method === 'eth_sendTransaction' && result && typeof result === 'string') {
            monitorWalletConnectTransaction(result, chainId || 1).catch(err => {
              console.error('[WalletConnect] Error monitoring transaction:', err);
            });
          } else if (request.method === 'eth_sendTransaction' && showToastFn) {
            showToastFn('Transaction submitted!', 'success');
          }
        } catch (error: any) {
          console.error('[WalletConnect] RPC request bridge error:', error);
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
      console.log('[WalletConnect] connectViaURI called:', {
        uri: uri.substring(0, 50) + '...',
        farcasterConnected,
        address,
      });

      // Allow connection even if Farcaster is not connected (will use injected provider)
      if (!farcasterConnected && typeof window !== 'undefined' && !(window as any).ethereum) {
        console.error('[WalletConnect] No wallet available (neither Farcaster nor injected)');
        setState((prev) => ({
          ...prev,
          error: 'Please connect a wallet first (Farcaster or browser extension)',
        }));
        return;
      }

      let signClient = signClientRef.current;
      
      if (!signClient) {
        console.log('[WalletConnect] Initializing SignClient...');
        await initializeSignClient();
        await new Promise(resolve => setTimeout(resolve, 100));
        signClient = signClientRef.current;
      }

      if (!signClient) {
        console.error('[WalletConnect] SignClient initialization failed');
        setState((prev) => ({
          ...prev,
          error: 'Wallet not initialized',
        }));
        return;
      }

      console.log('[WalletConnect] Starting pairing process...');
      setState((prev) => ({ ...prev, connecting: true, error: null }));

      try {
        // Pair with the dApp using the URI
        console.log('[WalletConnect] Pairing with URI...');
        await signClient.core.pairing.pair({ uri });
        console.log('[WalletConnect] Pairing successful, waiting for session proposal...');
        // The session_proposal event will be triggered automatically
      } catch (error: any) {
        console.error('[WalletConnect] Pairing failed:', error);
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to connect',
          connecting: false,
        }));
      }
    },
    [farcasterConnected, address, initializeSignClient]
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

  // Initialize wallet when any wallet connects (Farcaster or injected)
  useEffect(() => {
    const hasInjected = typeof window !== 'undefined' && !!(window as any).ethereum;
    if ((farcasterConnected && address) || hasInjected) {
      if (!signClientRef.current) {
        console.log('[WalletConnect] Wallet available, initializing SignClient...');
        initializeSignClient();
      }
    }
  }, [farcasterConnected, address, initializeSignClient]);

  return {
    ...state,
    connectedApps,
    initializeProvider: initializeSignClient,
    connectViaURI,
    disconnectApp,
    disconnectAll,
    isBridgeReady: (farcasterConnected && !!address) || (typeof window !== 'undefined' && !!(window as any).ethereum),
  };
}
