'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { sepolia } from 'viem/chains';
import { createWalletClient, custom, createPublicClient, http, zeroAddress } from 'viem';
import { createSmartAccountClient } from 'permissionless';
import { toSimpleSmartAccount } from 'permissionless/accounts';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { privateKeyToAccount } from 'viem/accounts';
import { entryPoint07Address } from 'viem/account-abstraction';

interface SmartAccountState {
  isLoading: boolean;
  smartAccount: any | null;
  smartAccountAddress: string | null;
  smartAccountClient: any | null;
  error: string | null;
}

export function useSmartAccount() {
  const { wallets } = useWallets();
  const { ready, authenticated } = usePrivy();
  
  const [state, setState] = useState<SmartAccountState>({
    isLoading: false,
    smartAccount: null,
    smartAccountAddress: null,
    smartAccountClient: null,
    error: null,
  });

  const createSmartAccount = useCallback(async () => {
    if (!ready || !authenticated || !wallets.length) {
      setState(prev => ({ ...prev, error: 'Not ready: authentication or wallet not available' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const connectedWallet = wallets[0]; 
      
      if (!connectedWallet || !connectedWallet.address) {
        throw new Error('No embedded wallet found. Please ensure you have logged in and Privy has created a wallet.');
      }

      console.log('Using wallet:', connectedWallet.walletClientType, connectedWallet.address);
      console.log('All available wallets:', wallets.map(w => ({ type: w?.walletClientType, address: w?.address })));

      const eip1193provider = await connectedWallet.getEthereumProvider();
      
      const privyClient = createWalletClient({
        account: connectedWallet.address as `0x${string}`,
        chain: sepolia,
        transport: custom(eip1193provider)
      });

      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http("https://sepolia.rpc.thirdweb.com")
      });

      const pimlicoApiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
      if (!pimlicoApiKey) {
        throw new Error('NEXT_PUBLIC_PIMLICO_API_KEY environment variable is required');
      }

      const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${pimlicoApiKey}`

      const pimlicoClient = createPimlicoClient({
        transport: http(pimlicoUrl),
        entryPoint: {
            address: entryPoint07Address,
            version: '0.7'
          },
      });

      // Initialize the smart account for the user using the new v0.2.0 API
      const simpleSmartAccount = await toSimpleSmartAccount({
        client: publicClient,
        owner: privyClient,
        entryPoint: {
          address: entryPoint07Address,
          version: '0.7'
        },
      });

      // v0.2.x API Permissionless
      const smartAccountClient = createSmartAccountClient({
        account: simpleSmartAccount,
        chain: sepolia,
        bundlerTransport: http(pimlicoUrl),
        paymaster: pimlicoClient,
        userOperation: {
            estimateFeesPerGas: async () => {
                return (await pimlicoClient.getUserOperationGasPrice()).fast
            },
        },     
      });

      setState({
        isLoading: false,
        smartAccount: simpleSmartAccount,
        smartAccountAddress: simpleSmartAccount.address,
        smartAccountClient,
        error: null,
      });

    } catch (error) {
      console.error('Error creating smart account:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  }, [ready, authenticated, wallets]);

  // Auto-create smart account when user is authenticated and has wallets
  useEffect(() => {
    if (ready && authenticated && wallets.length > 0 && !state.smartAccount && !state.isLoading && !state.error) {
      const timer = setTimeout(() => {
        createSmartAccount();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [ready, authenticated, wallets.length, state.smartAccount, state.isLoading, state.error, createSmartAccount]);

  const sendUserOperation = useCallback(async (to: string, value: bigint = BigInt(0), data: string = '0x') => {
    if (!state.smartAccountClient) {
      throw new Error('Smart account not initialized');
    }

    try {
      const txHash = await state.smartAccountClient.sendTransaction({
        account: state.smartAccountClient.account,
        to: zeroAddress,
        value: BigInt(0),
        data: '0x',
      });
      
      console.log(`User operation included: https://sepolia.etherscan.io/tx/${txHash}`);
      return txHash;
    } catch (error) {
      console.error('Error sending user operation:', error);
      throw error;
    }
  }, [state.smartAccountClient]);

  return {
    ...state,
    createSmartAccount,
    sendUserOperation,
    isReady: ready && authenticated && !!state.smartAccount && !state.error,
  };
}
