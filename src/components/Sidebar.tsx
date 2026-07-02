interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  role: 'merchant' | 'buyer';
}
const merchantNav = [
  { id: 'dashboard', label: '🏠 Dashboard' },
  { id: 'create', label: '➕ Create Payment' },
  { id: 'register', label: '🏪 Register Merchant' },
  { id: 'transactions', label: '📋 Transactions' },
  { id: 'risk', label: '🛡️ Risk Panel' },
];

const buyerNav = [
  { id: 'pay', label: '💳 Pay Invoice' },
  { id: 'transactions', label: '📋 Transactions' },
];

export default function Sidebar({ isOpen, onClose, activePage, onNavigate, role }: SidebarProps) {
  const navItems = role === 'buyer' ? buyerNav : merchantNav;
  function handleNavClick(pageId: string) {
    onNavigate(pageId);
    onClose();
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <div className="logo-icon">₿</div>
          <div>
            <div className="logo-text">StacksBit</div>
            <div className="logo-sub">Trust Layer · Africa</div>
          </div>
        </div>

        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            {item.label}
          </button>
        ))}

        <div className="nav-footer">
          <div className="wallet-info">
            <div className="wallet-status-row">
              <span className="dot dot-orange"></span>
              <span>Testnet</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}