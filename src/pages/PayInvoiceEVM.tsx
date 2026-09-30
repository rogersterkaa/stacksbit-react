import { useState } from 'react';
import { payInvoice, ensureBOTChainNetwork } from '../chains/evm/contract';
import { BOT_CHAIN } from '../chains/evm/config';
import ConfirmDeliveryEVM from './ConfirmDeliveryEVM';

function friendlyPayError(err: any): string {
  if (err?.code === 'ACTION_REJECTED') {
    return 'You rejected the transaction in MetaMask. Nothing was sent.';
  }
  const name = err?.revert?.name;
  if (name === 'WrongStatus') {
    return 'This payment cannot be paid right now. It may already be paid or completed. Ask the merchant for a new payment ID.';
  }
  if (name === 'PaymentNotFound') {
    return 'No payment found with that ID. Check the ID with the merchant.';
  }
  if (name === 'InsufficientAmount') {
    return 'The amount is too low for this payment.';
  }
  const msg = String(err?.shortMessage ?? err?.message ?? '');
  if (msg.includes('coalesce') || msg.includes('ERR_CONNECTION') || msg.includes('network')) {
    return 'Network connection problem. Nothing was sent. Check your connection and try again.';
  }
  if (msg.includes('insufficient funds')) {
    return 'Not enough BOT in this wallet to cover the amount plus the network fee.';
  }
  return msg || 'Failed to pay invoice';
}

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
      setError(friendlyPayError(err));
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