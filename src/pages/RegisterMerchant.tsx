import { registerMerchant as registerMerchantEVM, ensureBOTChainNetwork } from '../chains/evm/contract';
import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV } from '@stacks/transactions';

const CONTRACT_ADDR = 'ST3GTDAAVRPKHCC45FFW0540MPTDHGWWRMB5DS4Q0';
const CONTRACT_NAME = 'stacksbit-gateway';

export default function RegisterMerchant() {
  const { merchantWallet, walletMode, connectWalletForRole, connectEVMWallet, evmWallet } = useWallet();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentWallet = walletMode === 'stacks' ? merchantWallet : evmWallet;

  async function handleConnect() {
    try {
      if (walletMode === 'stacks') {
        await connectWalletForRole('merchant');
      } else {
        await connectEVMWallet('merchant');
      }
    } catch (err) {
      console.error('Connect failed:', err);
    }
  }

  async function handleRegister() {
  setIsSubmitting(true);
  setError(null);
  try {
    if (walletMode === 'stacks') {
      await openContractCall({
        contractAddress: CONTRACT_ADDR,
        contractName: CONTRACT_NAME,
        functionName: 'register-merchant',
        functionArgs: [stringUtf8CV(businessName), stringUtf8CV(email)],
        network: 'testnet',
        appDetails: { name: 'StacksBit', icon: '' },
        onFinish: (data) => {
          setTxId(data.txId);
        },
        onCancel: () => {
          setError('Transaction cancelled');
          setIsSubmitting(false);
        },
      });
    } else {
      // EVM wallet (BOT Chain) — FORCE TESTNET SWITCH FIRST
      await ensureBOTChainNetwork();
      const hash = await registerMerchantEVM(businessName, email);
      setTxId(hash || null);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Registration failed');
    setIsSubmitting(false);
  }
}

  if (!currentWallet) {
    return (
      <div className="connect-screen">
        <div className="connect-icon">🏪</div>
        <div className="connect-title">Merchant Registration</div>
        <div className="connect-sub">
          Connect your {walletMode === 'stacks' ? 'Leather' : 'MetaMask'} wallet to register your business.
        </div>
        <button className="btn btn-primary" onClick={handleConnect}>
          🔗 Connect Wallet
        </button>
      </div>
    );
  }

  if (txId) {
    return (
      <div className="form-card" style={{ maxWidth: '500px' }}>
        <div className="success-state">
          <div className="success-icon">✅</div>
          <div className="success-title">Registration Successful!</div>
          <div className="success-sub">
            Your business "{businessName}" is now registered on StacksBit.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card" style={{ maxWidth: '560px' }}>
      {step === 1 ? (
        <>
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Lagos Coffee Shop"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="contact@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={() => setStep(2)}
            disabled={!businessName || !email}
          >
            Continue →
          </button>
        </>
      ) : (
        <>
          <div className="info-banner">
            <span>✅</span>
            <span>Review your information before registering on-chain.</span>
          </div>

          <div className="form-card" style={{ background: 'var(--surface-2)', marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Business Name</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{businessName}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{email}</div>
            </div>
          </div>

          <label style={{ display: 'flex', gap: '8px', marginBottom: '16px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span style={{ fontSize: '13px' }}>
              I confirm this information is accurate and will be stored on-chain.
            </span>
          </label>

          {error && <div className="alert alert-warning">⚠️ {error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              className="btn btn-block"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <button
              className="btn btn-primary btn-block"
              onClick={handleRegister}
              disabled={!agreed || isSubmitting}
            >
              {isSubmitting ? '⏳ Registering...' : '✓ Register'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}