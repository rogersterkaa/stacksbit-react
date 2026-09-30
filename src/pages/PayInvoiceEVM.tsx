import { useState } from 'react';
import { payInvoice, ensureBOTChainNetwork } from '../chains/evm/contract';
import { BOT_CHAIN } from '../chains/evm/config';
import ConfirmDeliveryEVM from './ConfirmDeliveryEVM';

export default function PayInvoiceEVM() {
  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePayInvoice() {
    setIsSubmitting(true);
    setError(null);
    try {
      await ensureBOTChainNetwork();
      const hash = await payInvoice(parseInt(paymentId), amount);
      setTxId(hash || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pay invoice');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {txId ? (
        <div className="form-card" style={{ maxWidth: '560px' }}>
          <div className="success-state">
            <div className="success-title">Payment Sent</div>
            <div className="success-sub">
              {amount} BOT locked in escrow. When you receive your order, confirm delivery below to release the funds.
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
      ) : (
        <div className="form-card" style={{ maxWidth: '560px' }}>
          <div className="info-banner">
            <span>Enter the payment ID and amount to lock funds in escrow.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Payment ID</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 1"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
            />
            <div className="form-hint">The ID provided by the merchant</div>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (BOT)</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 0.5"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="form-hint">Amount to lock in escrow</div>
          </div>

          {error && <div className="alert alert-warning">{error}</div>}

          <button
            className="btn btn-primary btn-block"
            onClick={handlePayInvoice}
            disabled={!paymentId || !amount || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Lock in Escrow'}
          </button>
        </div>
      )}

      <ConfirmDeliveryEVM initialPaymentId={txId ? paymentId : ''} />
    </div>
  );
}