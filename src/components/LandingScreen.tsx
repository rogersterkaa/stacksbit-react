interface LandingScreenProps {
  onMerchant: () => void;
  onBuyer: () => void;
}

export default function LandingScreen({ onMerchant, onBuyer }: LandingScreenProps) {
  return (
    <div className="landing-screen">
      <div className="landing-logo">
        <div className="logo-icon" style={{ width: 56, height: 56, fontSize: 26, margin: '0 auto 16px' }}>₿</div>
        <div className="landing-title">StacksBit</div>
        <div className="landing-sub">Trust Layer · Africa</div>
      </div>

      <div className="landing-tagline">
        Fraud-protection escrow for African commerce.<br />
        Nobody loses. Both sides protected.
      </div>

      <div className="landing-cards">
        <button className="landing-card" onClick={onMerchant}>
          <div className="landing-card-icon">🏪</div>
          <div className="landing-card-title">I'm a Merchant</div>
          <div className="landing-card-desc">
            Register your business, create payment requests, and receive funds securely into escrow.
          </div>
          <div className="landing-card-cta">Get started →</div>
        </button>

        <button className="landing-card landing-card-buyer" onClick={onBuyer}>
          <div className="landing-card-icon">💳</div>
          <div className="landing-card-title">I'm a Buyer</div>
          <div className="landing-card-desc">
            Received a Payment ID from your merchant? Pay securely into escrow and confirm on delivery.
          </div>
          <div className="landing-card-cta">Pay an invoice →</div>
        </button>
      </div>

      <div className="landing-footer">
        Powered by Bitcoin · Built on Stacks · Non-custodial escrow
      </div>
    </div>
  );
}