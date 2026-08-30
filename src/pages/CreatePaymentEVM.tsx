import { useState } from 'react';
import { createPayment, ensureBOTChainNetwork } from '../chains/evm/contract';

export default function CreatePaymentEVM() {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreatePayment() {
    setIsSubmitting(true);
    setError(null);
    try {
      await ensureBOTChainNetwork();
      const result = await createPayment(description);
      setTxId(result.txHash || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      setIsSubmitting(false);
    }
  }

  if (txId) {
    return (
      <div className="form-card" style={{ maxWidth: '500px' }}>
        <div className="success-state">
          <div className="success-icon">✅</div>
          <div className="success-title">Payment Created</div>
          <div className="success-sub">
            Invoice created successfully. Share the payment ID with your buyer.
          </div>
            <a
            href={`https://scan.botchain.ai/tx/${txId}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ marginTop: 16, textDecoration: 'none' }}
          >
            View on Explorer →
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

      {error && <div className="alert alert-warning">⚠️ {error}</div>}

      <button
        className="btn btn-primary btn-block"
        onClick={handleCreatePayment}
        disabled={!description || isSubmitting}
      >
        {isSubmitting ? '⏳ Creating...' : '📄 Create Invoice'}
      </button>
    </div>
  );
}