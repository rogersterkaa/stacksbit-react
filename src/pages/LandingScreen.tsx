import { useWallet } from '../context/WalletContext';

export default function LandingScreen() {
  const { walletMode, setWalletMode, connectWalletForRole, connectEVMWallet } = useWallet();

  return (
    <div className="landing-screen">
      {/* Wallet Mode Toggle */}
      <div className="mode-toggle">
        <div className="toggle-label">Select Blockchain Network</div>
        <div className="toggle-buttons">
          <button
            className={`toggle-btn ${walletMode === 'stacks' ? 'active' : ''}`}
            onClick={() => setWalletMode('stacks')}
          >
            ₿ Stacks (Bitcoin L2)
          </button>
          <button
            className={`toggle-btn ${walletMode === 'evm' ? 'active' : ''}`}
            onClick={() => setWalletMode('evm')}
          >
            ⛓️ BOT Chain (EVM)
          </button>
        </div>
      </div>

      {/* Role Selection */}
      <div className="landing-cards">
        <div
          className="landing-card"
          onClick={() =>
            walletMode === 'stacks'
              ? connectWalletForRole('merchant')
              : connectEVMWallet('merchant')
          }
        >
          <div className="card-icon">🏪</div>
          <div className="card-title">I'm a Merchant</div>
          <div className="card-desc">
            Create invoices and receive payments safely through escrow
          </div>
          <div className="card-arrow">→</div>
        </div>

        <div
          className="landing-card landing-card-buyer"
          onClick={() =>
            walletMode === 'stacks'
              ? connectWalletForRole('buyer')
              : connectEVMWallet('buyer')
          }
        >
          <div className="card-icon">👤</div>
          <div className="card-title">I'm a Buyer</div>
          <div className="card-desc">
            Pay securely with guaranteed delivery confirmation
          </div>
          <div className="card-arrow">→</div>
        </div>
      </div>

      <div className="landing-footer">
        <div className="footer-text">
          {walletMode === 'stacks'
            ? 'Connect your Leather wallet to get started'
            : 'Connect your MetaMask or EVM wallet to get started'}
        </div>
      </div>
    </div>
  );
}