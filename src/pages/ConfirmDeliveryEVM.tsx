import { useState } from 'react';
import { confirmDelivery, ensureBOTChainNetwork } from '../chains/evm/contract';
import { BOT_CHAIN } from '../chains/evm/config';

function friendlyError(err: any): string {
  if (err?.code === 'ACTION_REJECTED') {
    return 'You rejected the transaction in MetaMask. Nothing was sent.';
  }
  const name = err?.revert?.name;
  if (name === 'NotBuyer') {
    return 'Wrong account. Only the buyer who paid this invoice can confirm delivery. Switch accounts in MetaMask and try again.';
  }
  if (name === 'WrongStatus') {
    return 'This payment cannot be confirmed right now. It may not be paid yet, or it may already be confirmed.';
  }
  if (name === 'PaymentNotFound') {
    return 'No payment found with that ID.';
  }
  return err instanceof Error ? err.message : 'Failed to confirm delivery';
}

export default function ConfirmDeliveryEVM({ initialPaymentId = '' }: { initialPaymentId?: string }) {
  const [paymentId, setPaymentId] = useState(initialPaymentId);
  const [received, setReceived] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    try {
      await ensureBOTChainNetwork();
      const hash = await confirmDelivery(parseInt(paymentId));
      setTxId(hash || null);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (txId) {
    return (
      <div className="form-card" style={{ maxWidth: '560px' }}>
        <div className="success-state">
          <div className="success-title">Delivery Confirmed</div>
          <div className="success-sub">
            Payment #{paymentId} was released to the merchant, minus the 2.5% platform fee.
          </div>
          <a
            href={`${BOT_CHAIN.blockExplorer}/tx/${txId}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '16px', textDecoration: 'none', display: 'block' }}
          >
            View Transaction
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card" style={{ maxWidth: '560px' }}>
      <div className="info-banner">
        <span>Only the buyer who paid can confirm delivery. This releases the funds to the merchant and cannot be undone.</span>
      </div>

      <div className="form-group">
        <label className="form-label">Payment ID</label>
        <input
          className="form-input"
          type="number"
          placeholder="e.g. 6"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={received}
            onChange={(e) => setReceived(e.target.checked)}
          />
          <span>I received what I paid for</span>
        </label>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <button
        className="btn btn-primary btn-block"
        onClick={handleConfirm}
        disabled={!paymentId || !received || isSubmitting}
      >
        {isSubmitting ? 'Confirming...' : 'Confirm Delivery'}
      </button>
    </div>
  );
}