import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV } from '@stacks/transactions';

const CONTRACT_ADDR = 'ST3GTDAAVRPKHCC45FFW0540MPTDHGWWRMB5DS4Q0';
const CONTRACT_NAME = 'stacksbit-gateway';

const businessTypes = [
  'Logistics & Delivery',
  'Fashion & Retail',
  'Electronics',
  'Food & Groceries',
  'General Merchandise',
  'Other',
];

export default function RegisterMerchant() {
  const { merchantWallet, connectWalletForRole } = useWallet();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    try { await connectWalletForRole('merchant'); }
    catch (err) { console.error('Connect failed:', err); }
  }

  async function handleRegister() {
    setIsSubmitting(true);
    setError(null);
    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDR,
        contractName: CONTRACT_NAME,
        functionName: 'register-merchant',
        functionArgs: [stringUtf8CV(businessName), stringUtf8CV(email)],
        network: 'testnet',
        appDetails: { name: 'StacksBit', icon: '' },
        onFinish: (data) => { setTxId(data.txId); },
        onCancel: () => {
          setError('Transaction cancelled');
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setIsSubmitting(false);
    }
  }

  if (!merchantWallet) {
    return (
      <div className="connect-screen">
        <div className="connect-icon">🏪</div>
        <div className="connect-title">Register Your Business</div>
        <div className="connect-sub">
          Connect your Leather wallet to register as a protected merchant on StacksBit.
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
          <div className="success-icon" style={{ background: 'rgba(15,157,114,0.15)' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#0F9D72" strokeWidth="2">
              <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="success-title">Merchant Registered!</div>
          <div className="success-sub">
            <strong>{businessName}</strong> is now registered on Stacks Testnet.
            You can now create payment requests.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card" style={{ maxWidth: 500 }}>
      <div className="reg-progress">
        <div className="reg-progress-fill" style={{ width: step === 1 ? '50%' : '100%' }} />
      </div>
      <div className="reg-step-label">Step {step} of 2</div>

      {step === 1 && (
        <>
          <div className="form-group">
            <label className="form-label">
              <span className="field-icon">🏪</span> Business Name
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Lagos Coffee Shop"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="field-icon">✉️</span> Email Address
            </label>
            <input
              className="form-input"
              type="email"
              placeholder="shop@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="field-icon">📱</span> Phone Number
              <span className="field-badge">USSD support coming soon</span>
            </label>
            <input
              className="form-input"
              type="tel"
              placeholder="+234 801 234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="why-collect-box">
            <div className="why-collect-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0F9D72" strokeWidth="2">
                <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
              </svg>
            </div>
            <div>
              <div className="why-collect-title">Why we collect this</div>
              <div className="why-collect-body">
                We use this information to verify deliveries and protect your business and customers.
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-block"
            disabled={!businessName || !email}
            onClick={() => setStep(2)}
          >
            Continue →
          </button>

          <div className="reg-footer-link">
            Already registered? <span className="accent-link">Sign in</span>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="form-group">
            <label className="form-label">Business Type</label>
            <select
              className="form-select"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            >
              <option value="">Select a category</option>
              {businessTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div
            className={`protection-notice ${agreed ? 'checked' : ''}`}
            onClick={() => setAgreed(!agreed)}
          >
            <div className="seal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0F9D72" strokeWidth="2">
                <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="protection-text">
              <div className="protection-label">Escrow protected</div>
              <div className="protection-body">
                StacksBit holds payments in escrow until delivery is confirmed.
                A 2.5% platform fee applies on completed transactions.
              </div>
            </div>
            <div className="protection-check">
              {agreed && (
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="white" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          {error && <div className="alert alert-warning">⚠️ {error}</div>}

          <button
            className="btn btn-primary btn-block"
            disabled={!businessType || !agreed || isSubmitting}
            onClick={handleRegister}
          >
            {isSubmitting ? '⏳ Registering...' : '🏪 Register on Stacks Testnet'}
          </button>

          <button
            className="btn btn-block"
            style={{ marginTop: 8 }}
            onClick={() => setStep(1)}
          >
            ← Back
          </button>
        </>
      )}
    </div>
  );
}