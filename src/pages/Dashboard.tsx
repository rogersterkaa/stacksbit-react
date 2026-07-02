import { useWallet } from '../context/WalletContext';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { merchantWallet, buyerWallet, connectWalletForRole } = useWallet();

  async function handleConnect() {
    try {
      await connectWalletForRole('merchant');
    } catch (err) {
      console.error('Connect failed:', err);
    }
  }

  if (!merchantWallet) {
    return (
      <div className="connect-screen">
        <div className="connect-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#F7931A" strokeWidth="1.5">
            <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
          </svg>
        </div>
        <div className="connect-title">Welcome to StacksBit</div>
        <div className="connect-sub">
          Fraud-protection infrastructure for African commerce. Connect your wallet
          to register as a merchant or manage your payments.
        </div>
        <button className="btn btn-primary" onClick={handleConnect}>
          🔗 Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="card hero-card">
        <div className="hero-greeting">Welcome back</div>
        <div className="hero-address">{merchantWallet.address}</div>
        <div className="protection-notice checked" style={{ marginTop: 16, marginBottom: 0 }}>
          <div className="seal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0F9D72" strokeWidth="2">
              <path d="M12 2L4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="protection-text">
            <div className="protection-label">Escrow protected</div>
            <div className="protection-body">
              Every payment through StacksBit is held in escrow until delivery is confirmed.
            </div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-card" onClick={() => onNavigate('register')}>
          <span className="action-icon">🏪</span>
          <span className="action-label">Register Merchant</span>
        </button>
        <button className="action-card" onClick={() => onNavigate('create')}>
          <span className="action-icon">➕</span>
          <span className="action-label">Create Payment</span>
        </button>
        <button className="action-card" onClick={() => onNavigate('pay')}>
          <span className="action-icon">💳</span>
          <span className="action-label">Pay Invoice</span>
        </button>
        <button className="action-card" onClick={() => onNavigate('transactions')}>
          <span className="action-icon">📋</span>
          <span className="action-label">View Transactions</span>
        </button>
      </div>

      {buyerWallet && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="protection-label" style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>
            Buyer wallet also connected
          </div>
          <div className="hero-address" style={{ fontSize: 13 }}>{buyerWallet.address}</div>
        </div>
      )}
    </div>
  );
}