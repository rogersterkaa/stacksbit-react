interface TopbarProps {
  pageTitle: string;
  pageSubtitle: string;
  onMenuClick: () => void;
  walletAddress: string | null;
  onConnectClick: () => void;
}

export default function Topbar({
  pageTitle,
  pageSubtitle,
  onMenuClick,
  walletAddress,
  onConnectClick,
}: TopbarProps) {
  return (
    <header className="topbar">
      <button className="mobile-menu-btn" onClick={onMenuClick}>
        ☰
      </button>

      <div>
        <div className="topbar-title">{pageTitle}</div>
        <div className="topbar-sub">{pageSubtitle}</div>
      </div>

      <div className="topbar-right">
        <span className="badge badge-orange">Testnet</span>
        <button className="btn btn-primary btn-sm" onClick={onConnectClick}>
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : '🔗 Connect Wallet'}
        </button>
      </div>
    </header>
  );
}