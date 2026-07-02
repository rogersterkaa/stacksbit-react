import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  stringUtf8CV,
  noneCV,
  contractPrincipalCV,
} from '@stacks/transactions';

const CONTRACT_ADDR = 'ST3GTDAAVRPKHCC45FFW0540MPTDHGWWRMB5DS4Q0';
const CONTRACT_NAME = 'stacksbit-gateway';
const API_URL = 'https://api.testnet.hiro.so';

async function pollForPaymentId(
  txId: string,
  onUpdate: (status: string) => void
): Promise<number | null> {
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${API_URL}/extended/v1/tx/0x${txId}`);
      const data = await res.json();
      if (data.tx_status === 'success') {
        const match = (data.tx_result?.repr || '').match(/\(ok u(\d+)\)/);
        if (match) return parseInt(match[1], 10);
        return null;
      }
      if (data.tx_status?.startsWith('abort')) {
        onUpdate('Transaction failed on-chain.');
        return null;
      }
      onUpdate(`Waiting for confirmation... (${i + 1}/${maxAttempts})`);
    } catch {
      // retry on network hiccup
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  onUpdate('Still pending — check the explorer.');
  return null;
}

export default function CreatePayment() {
  const { merchantWallet, connectWalletForRole } = useWallet();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [pollStatus, setPollStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fee = amount ? (parseFloat(amount) * 0.025).toFixed(6) : null;
  const payout = amount ? (parseFloat(amount) * 0.975).toFixed(6) : null;

  async function handleConnect() {
    try {
      await connectWalletForRole('merchant');
    } catch (err) {
      console.error('Connect failed:', err);
    }
  }

  async function handleCreatePayment() {
    setIsSubmitting(true);
    setError(null);
    try {
      const microAmount = Math.round(parseFloat(amount) * 100_000_000);
      await openContractCall({
        contractAddress: CONTRACT_ADDR,
        contractName: CONTRACT_NAME,
        functionName: 'create-payment-request',
        functionArgs: [
          uintCV(microAmount),
          contractPrincipalCV(CONTRACT_ADDR, 'sbtc'),
          stringUtf8CV(description),
          noneCV(),
        ],
        network: 'testnet',
        appDetails: { name: 'StacksBit', icon: '' },
        onFinish: async (data) => {
          setTxId(data.txId);
          setPollStatus('Waiting for confirmation...');
          const id = await pollForPaymentId(data.txId, setPollStatus);
          setPaymentId(id);
          setPollStatus(null);
        },
        onCancel: () => {
          setError('Transaction cancelled');
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      setIsSubmitting(false);
    }
  }

  if (!merchantWallet) {
    return (
      <div className="connect-screen">
        <div className="connect-icon">🔐</div>
        <div className="connect-title">Connect Your Wallet</div>
        <div className="connect-sub">
          Connect your Leather wallet to create a payment request for your customer.
        </div>
        <button className="btn btn-primary" onClick={handleConnect}>
          🔗 Connect Wallet
        </button>
      </div>
    );
  }

  if (txId) {
    return (
      <div className="form-card" style={{ maxWidth: 500 }}>
        <div className="success-state">
          <div
            className="success-icon"
            style={{ background: 'rgba(15,157,114,0.15)' }}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0F9D72" strokeWidth="2">
              <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="success-title">Payment Request Created</div>

          {paymentId !== null ? (
            <>
              <div className="success-sub">
                Share this Payment ID with your customer so they can pay into escrow.
              </div>
              <div className="payment-id-display">
                <div className="payment-id-label">Payment ID</div>
                <div className="payment-id-value">{paymentId}</div>
              </div>
            </>
          ) : (
            <div className="success-sub">{pollStatus || 'Looking up payment ID...'}</div>
          )}

          <div className="info-banner" style={{ marginTop: 12 }}>
            <span>🔗</span>
            <span>TX: {txId.slice(0, 20)}...{txId.slice(-6)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card" style={{ maxWidth: 500 }}>
      <div className="info-banner">
        <span>🔒</span>
        <span>
          Funds go into non-custodial smart contract escrow. StacksBit never holds your money.
        </span>
      </div>

      <div className="form-group">
        <label className="form-label">Amount (sBTC)</label>
        <input
          className="form-input"
          type="number"
          step="0.0001"
          min="0"
          placeholder="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {fee && (
          <div className="form-hints-row">
            <span className="form-hint">Platform fee: {fee} sBTC (2.5%)</span>
            <span className="form-hint">You receive: {payout} sBTC</span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          className="form-input"
          type="text"
          placeholder="e.g. Coffee x2, Phone repair"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="form-hint">Visible to your customer on the payment screen.</div>
      </div>

      <div className="form-group">
        <label className="form-label">Settlement</label>
        <select className="form-select">
          <option value="btc">Receive sBTC</option>
        </select>
      </div>

      <div className="protection-notice checked">
        <div className="seal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0F9D72" strokeWidth="2">
            <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="protection-text">
          <div className="protection-label">Escrow protected</div>
          <div className="protection-body">
            Funds will be locked until your customer confirms delivery. A 2.5% platform fee applies.
          </div>
        </div>
      </div>

      {error && <div className="alert alert-warning">⚠️ {error}</div>}

      <button
        className="btn btn-primary btn-block"
        disabled={!amount || !description || isSubmitting}
        onClick={handleCreatePayment}
      >
        {isSubmitting ? '⏳ Creating...' : '🔗 Create Payment Request'}
      </button>
    </div>
  );
}