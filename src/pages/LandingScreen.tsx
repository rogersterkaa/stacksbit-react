import { useWallet } from '../context/WalletContext';

interface LandingScreenProps {
  onMerchant: () => void;
  onBuyer: () => void;
}

export default function LandingScreen({ onMerchant, onBuyer }: LandingScreenProps) {
  const { walletMode, setWalletMode, connectWalletForRole, connectEVMWallet } = useWallet();

  const handleMerchantClick = () => {
    if (walletMode === 'stacks') {
      connectWalletForRole('merchant');
    } else {
      connectEVMWallet('merchant');
    }
    onMerchant();
  };

  const handleBuyerClick = () => {
    if (walletMode === 'stacks') {
      connectWalletForRole('buyer');
    } else {
      connectEVMWallet('buyer');
    }
    onBuyer();
  };

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
          onClick={handleMerchantClick}
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
          onClick={handleBuyerClick}
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