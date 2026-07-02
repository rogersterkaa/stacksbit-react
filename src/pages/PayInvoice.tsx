import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { openContractCall } from '@stacks/connect';
import { uintCV, contractPrincipalCV, noneCV } from '@stacks/transactions';

const CONTRACT_ADDR = 'ST3GTDAAVRPKHCC45FFW0540MPTDHGWWRMB5DS4Q0';
const CONTRACT_NAME = 'stacksbit-gateway';

export default function PayInvoice() {
  const { buyerWallet, connectWalletForRole } = useWallet();
  const [paymentId, setPaymentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [paid, setPaid] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    try {
      await connectWalletForRole('buyer');
    } catch (err) {
      console.error('Connect failed:', err);
    }
  }

  async function handlePay() {
    setIsSubmitting(true);
    setError(null);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDR,
        contractName: CONTRACT_NAME,
        functionName: 'pay-invoice',
        functionArgs: [
          uintCV(parseInt(paymentId, 10)),
          contractPrincipalCV(CONTRACT_ADDR, 'sbtc'),
          noneCV(),
        ],
        network: 'testnet',
        appDetails: { name: 'StacksBit', icon: '' },
        onFinish: () => {
          setPaid(true);
        },
        onCancel: () => {
          setError('Transaction cancelled');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelivery() {
    setIsConfirming(true);
    setError(null);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDR,
        contractName: CONTRACT_NAME,
        functionName: 'confirm-delivery',
        functionArgs: [
          uintCV(parseInt(paymentId, 10)),
          contractPrincipalCV(CONTRACT_ADDR, 'sbtc'),
        ],
        network: 'testnet',
        appDetails: { name: 'StacksBit', icon: '' },
        onFinish: () => {
          setResolved(true);
        },
        onCancel: () => {
          setError('Transaction cancelled');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setIsConfirming(false);
    }
  }

  if (!buyerWallet) {
    return (
      <div className="connect-screen">
        <div className="connect-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#F7931A" strokeWidth="1.5">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
            <circle cx="18" cy="15" r="1.2" fill="#F7931A" stroke="none" />
          </svg>
        </div>
        <div className="connect-title">Connect Your Wallet</div>
        <div className="connect-sub">
          Connect your own wallet as the buyer to pay an invoice. This is separate
          from any merchant wallet connected in this session.
        </div>
        <button className="btn btn-primary" onClick={handleConnect}>
          🔗 Connect Wallet
        </button>
      </div>
    );
  }

  if (resolved) {
    return (
      <div className="card success-state">
        <div className="success-icon" style={{ background: 'rgba(15,157,114,0.15)' }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0F9D72" strokeWidth="2">
            <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="success-title">Delivery Confirmed</div>
        <div className="success-sub">
          Funds have been released from escrow to the merchant.
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="form-card" style={{ maxWidth: 500 }}>
        <div className="protection-notice checked">
          <div className="seal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0F9D72" strokeWidth="2">
              <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="protection-text">
            <div className="protection-label">Payment locked in escrow</div>
            <div className="protection-body">
              Your payment for invoice #{paymentId} is held securely. It releases to the
              merchant only when you confirm delivery below.
            </div>
          </div>
        </div>

        {error && <div className="alert alert-warning">⚠️ {error}</div>}

        <button
          className="btn btn-block"
          style={{ background: 'rgba(15,157,114,0.15)', borderColor: 'var(--protect)', color: 'var(--protect)', marginBottom: 8 }}
          disabled={isConfirming}
          onClick={handleConfirmDelivery}
        >
          {isConfirming ? 'Confirming...' : '✅ Confirm Delivery'}
        </button>
        <button className="btn btn-block" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
          ⚠️ Raise Dispute
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <div className="form-group">
        <label className="form-label">Payment ID</label>
        <input
          className="form-input"
          type="number"
          placeholder="e.g. 1"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
        />
        <div className="form-hint">Get this from your merchant's payment request.</div>
      </div>

      {error && <div className="alert alert-warning">⚠️ {error}</div>}

      <button
        className="btn btn-primary btn-block"
        disabled={!paymentId || isSubmitting}
        onClick={handlePay}
      >
        {isSubmitting ? 'Paying...' : '💳 Pay Invoice'}
      </button>
    </div>
  );
}