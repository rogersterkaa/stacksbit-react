import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { connect, disconnect } from '@stacks/connect';

export type WalletRole = 'merchant' | 'buyer';

interface ConnectedWallet {
  address: string;
  role: WalletRole;
}

interface WalletContextType {
  merchantWallet: ConnectedWallet | null;
  buyerWallet: ConnectedWallet | null;
  connectingRole: WalletRole | null;
  connectWalletForRole: (role: WalletRole) => Promise<void>;
  disconnectWallet: (role: WalletRole) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [merchantWallet, setMerchantWallet] = useState<ConnectedWallet | null>(null);
  const [buyerWallet, setBuyerWallet] = useState<ConnectedWallet | null>(null);
  const [connectingRole, setConnectingRole] = useState<WalletRole | null>(null);

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

  return (
    <WalletContext.Provider
      value={{ merchantWallet, buyerWallet, connectingRole, connectWalletForRole, disconnectWallet }}
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