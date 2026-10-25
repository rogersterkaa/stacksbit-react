import { useState } from 'react';
import { createPayment, ensureBOTChainNetwork } from '../chains/evm/contract';
import { BOT_CHAIN } from '../chains/evm/config';

function friendlyError(err: any): string {
  if (err?.code === 'ACTION_REJECTED') {
    return 'You rejected the transaction in MetaMask. Nothing was created.';
  }
  const name = err?.revert?.name;
  if (name === 'NotRegistered') {
    return 'This wallet is not registered as a merchant yet. Open Register Merchant, confirm it in MetaMask, then try again.';
  }
  return err instanceof Error ? err.message : 'Failed to create payment';
}

export default function CreatePaymentEVM() {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreatePayment() {
    setIsSubmitting(true);
    setError(null);
    try {
      await ensureBOTChainNetwork();
      const result = await createPayment(description);
      setPaymentId(result.paymentId);
      setTxId(result.txHash || null);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  if (txId) {
    const buyerMessage =
      `StacksBit payment request #${paymentId}: ${description}. ` +
      `Open https://stacksbit-react.vercel.app in MetaMask, go to Pay Invoice and enter this payment ID.`;

    return (
      <div className="form-card" style={{ maxWidth: '560px' }}>
        <div className="success-state">
          <div className="success-title">Payment Created</div>

          {paymentId ? (
            <>
              <div className="success-sub">Share this payment ID with your buyer:</div>
              <div style={{ fontSize: '40px', fontWeight: 700, margin: '12px 0' }}>#{paymentId}</div>
              <button
                className="btn btn-primary btn-block"
                onClick={() => copy(paymentId, 'id')}
              >
                {copied === 'id' ? 'Copied' : 'Copy payment ID'}
              </button>
              <button
                className="btn btn-block"
                style={{ marginTop: '8px' }}
                onClick={() => copy(buyerMessage, 'message')}
              >
                {copied === 'message' ? 'Copied' : 'Copy message for buyer'}
              </button>
            </>
          ) : (
            <div className="success-sub">
              Your invoice was created, but the payment ID could not be read here. Open the
              transaction below, choose the Logs tab, and find the paymentId value.
            </div>
          )}

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
      <div className="form-group">
        <label className="form-label">Invoice Description</label>
        <textarea
          className="form-input"
          placeholder="e.g. 5kg bag of rice, delivery to Ikoyi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: '100px' }}
        />
        <div className="form-hint">
          Describe what the buyer is paying for. This will be stored on-chain.
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <button
        className="btn btn-primary btn-block"
        onClick={handleCreatePayment}
        disabled={!description || isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Invoice'}
      </button>
    </div>
  );
}