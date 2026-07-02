import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';

const API_URL = 'https://api.testnet.hiro.so';
const EXPLORER_URL = 'https://explorer.hiro.so/txid';

interface TxItem {
  tx_id: string;
  tx_status: string;
  contract_call?: { function_name: string };
  tx_type: string;
  burn_block_time_iso?: string;
}

export default function Transactions() {
  const { merchantWallet, connectWalletForRole } = useWallet();
  const [txs, setTxs] = useState<TxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    try {
      await connectWalletForRole('merchant');
    } catch (err) {
      console.error('Connect failed:', err);
    }
  }

  useEffect(() => {
    if (!merchantWallet) return;

    async function loadTxs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_URL}/extended/v1/address/${merchantWallet!.address}/transactions?limit=20`
        );
        const data = await res.json();
        setTxs(data.results || []);
      } catch {
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    }

    loadTxs();
  }, [merchantWallet]);

  if (!merchantWallet) {
    return (
      <div className="connect-screen">
        <div className="connect-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#F7931A" strokeWidth="1.5">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        </div>
        <div className="connect-title">Connect Your Wallet</div>
        <div className="connect-sub">Connect your wallet to view your transaction history.</div>
        <button className="btn btn-primary" onClick={handleConnect}>
          🔗 Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {loading && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading transactions...</p>}
      {error && <div className="alert alert-warning">⚠️ {error}</div>}
      {!loading && !error && txs.length === 0 && (
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No transactions yet.</p>
      )}

      {txs.map((tx) => {
        const fn = tx.contract_call?.function_name || tx.tx_type;
        const time = tx.burn_block_time_iso ? new Date(tx.burn_block_time_iso).toLocaleString() : '';
        return (
          <a
            key={tx.tx_id}
            href={`${EXPLORER_URL}/${tx.tx_id}?chain=testnet`}
            target="_blank"
            rel="noreferrer"
            className="tx-item"
          >
            <div className="tx-icon">{tx.tx_status === 'success' ? '✅' : tx.tx_status.startsWith('abort') ? '❌' : '⏳'}</div>
            <div className="tx-info">
              <div className="tx-name">{fn}</div>
              <div className="tx-meta">{tx.tx_status} · {time}</div>
            </div>
          </a>
        );
      })}
    </div>
  );
}