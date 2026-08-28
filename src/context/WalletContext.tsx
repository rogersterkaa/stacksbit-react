import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { connect, disconnect } from '@stacks/connect';

export type WalletRole = 'merchant' | 'buyer';
export type WalletMode = 'stacks' | 'evm';

interface ConnectedWallet {
  address: string;
  role: WalletRole;
}

interface WalletContextType {
  // Mode selection
  walletMode: WalletMode;
  setWalletMode: (mode: WalletMode) => void;
  
  // Stacks wallets (existing)
  merchantWallet: ConnectedWallet | null;
  buyerWallet: ConnectedWallet | null;
  connectingRole: WalletRole | null;
  connectWalletForRole: (role: WalletRole) => Promise<void>;
  disconnectWallet: (role: WalletRole) => void;
  
  // EVM wallets (new)
  evmWallet: ConnectedWallet | null;
  connectEVMWallet: (role: WalletRole) => Promise<void>;
  disconnectEVMWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  // Mode state
  const [walletMode, setWalletMode] = useState<WalletMode>('stacks');
  
  // Stacks wallets (existing)
  const [merchantWallet, setMerchantWallet] = useState<ConnectedWallet | null>(null);
  const [buyerWallet, setBuyerWallet] = useState<ConnectedWallet | null>(null);
  const [connectingRole, setConnectingRole] = useState<WalletRole | null>(null);

  // EVM wallet (new)
  const [evmWallet, setEvmWallet] = useState<ConnectedWallet | null>(null);

  // Existing Stacks connection logic
  async function connectWalletForRole(role: WalletRole) {
    setConnectingRole(role);
    try {
      const response = await connect();
      const stxAddress = response.addresses.find(
        (a) => a.address.startsWith('ST') || a.address.startsWith('SP')
      );

      if (!stxAddress) {
        throw new Error('No Stacks address found in wallet response');
      }

      const wallet: ConnectedWallet = { address: stxAddress.address, role };

      if (role === 'merchant') {
        setMerchantWallet(wallet);
      } else {
        setBuyerWallet(wallet);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    } finally {
      setConnectingRole(null);
    }
  }

  function disconnectWallet(role: WalletRole) {
    disconnect();
    if (role === 'merchant') {
      setMerchantWallet(null);
    } else {
      setBuyerWallet(null);
    }
  }

  // New EVM wallet connection logic
  async function connectEVMWallet(role: WalletRole) {
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask or EVM wallet not detected. Please install MetaMask.');
      }

      // Request account access
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No EVM wallet address found');
      }

      const wallet: ConnectedWallet = { address: accounts[0], role };
      setEvmWallet(wallet);

      // Optionally, switch to BOT Chain if not already on it
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2A5' }],
        });
      } catch (switchError: any) {
        // Chain not added, prompt to add it
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2A5',
                chainName: 'BOT Chain',
                rpcUrls: ['https://rpc.botchain.ai'],
                nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
                blockExplorerUrls: ['https://scan.botchain.ai'],
              },
            ],
          });
        }
      }
    } catch (err) {
      console.error('EVM wallet connection failed:', err);
      throw err;
    }
  }

  function disconnectEVMWallet() {
    setEvmWallet(null);
  }

  return (
    <WalletContext.Provider
      value={{
        walletMode,
        setWalletMode,
        merchantWallet,
        buyerWallet,
        connectingRole,
        connectWalletForRole,
        disconnectWallet,
        evmWallet,
        connectEVMWallet,
        disconnectEVMWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}