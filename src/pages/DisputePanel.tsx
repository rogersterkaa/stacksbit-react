import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { openContractCall } from '@stacks/connect';
import { uintCV, contractPrincipalCV } from '@stacks/transactions';

const STACKS_CONTRACT_ADDR = 'ST3GTDAAVRPKHCC45FFW0540MPTDHGWWRMB5DS4Q0';
const STACKS_CONTRACT_NAME = 'stacksbit-gateway';

export default function DisputePanel() {
  const { merchantWallet, connectWalletForRole } = useWallet();
  const [paymentId, setPaymentId] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    try {
      await connectWalletForRole('merchant');
    } catch (err) {
      console.error('Connect failed:', err);
    }
  }

  async function handleResolve(refundBuyer: boolean) {
    setIsResolving(true);
    setError(null);
    try {
      await openContractCall({
        contractAddress: STACKS_CONTRACT_ADDR,
        contractName: STACKS_CONTRACT_NAME,
        functionName: refundBuyer ? 'resolve-dispute-refund' : 'resolve-dispute-release',
        functionArgs: [uintCV(parseInt(paymentId, 10)), contractPrincipalCV(STACKS_CONTRACT_ADDR, 'sbtc')],
        network: 'testnet',
        appDetails: { name: 'StacksBit', icon: '' },
        onFinish: (data: any) => {
          setTxId(data.txId);
        },
        onCancel: () => {
          setError('Transaction cancelled');
          setIsResolving(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve');
      setIsResolving(false);
    }
  }

  if (!merchantWallet) {
    return (
      <div className="connect-screen">
        <div className="connect-icon">⚖️</div>
        <div className="connect-title">Dispute Resolution</div>
        <div className="connect-sub">Connect wallet to resolve disputes.</div>
        <button className="btn btn-primary" onClick={handleConnect}>
          Connect Wallet
        </button>
      </div>
    );
  }

  if (txId) {
    return (
      <div className="form-card">
        <div className="success-state">
          <div className="success-icon">✅</div>
          <div className="success-title">Dispute Resolved</div>
          <div className="success-sub">Payment #{paymentId} resolved successfully.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card">
      <div className="info-banner">Resolve disputed payments</div>
      <div className="form-group">
        <label className="form-label">Payment ID</label>
        <input className="form-input" type="number" placeholder="1" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} />
      </div>
      {error && <div className="alert alert-warning">⚠️ {error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button className="btn btn-block" disabled={!paymentId || isResolving} onClick={() => handleResolve(true)}>
          ↩️ Refund
        </button>
        <button className="btn btn-block" disabled={!paymentId || isResolving} onClick={() => handleResolve(false)}>
          ✅ Release
        </button>
      </div>
    </div>
  );
}