import { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import RegisterMerchant from './pages/RegisterMerchant';
import CreatePayment from './pages/CreatePayment';
import PayInvoice from './pages/PayInvoice';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import RiskPanel from './pages/RiskPanel';
import LandingScreen from './components/LandingScreen';
import './index.css';

const pageInfo: Record<string, { title: string; subtitle: (connected: boolean) => string }> = {
  dashboard: { title: 'Dashboard', subtitle: (c) => c ? 'Welcome back' : 'Connect wallet to get started' },
  create: { title: 'Create Payment', subtitle: () => 'Generate a new invoice' },
  pay: { title: 'Pay Invoice', subtitle: () => 'Pay an existing payment request' },
  register: { title: 'Register Merchant', subtitle: () => 'Set up your business profile' },
  transactions: { title: 'Transactions', subtitle: () => 'View your payment history' },
  risk: { title: 'Risk Panel', subtitle: () => 'Fraud detection and dispute tools' },
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [userRole, setUserRole] = useState<'merchant' | 'buyer' | null>(null);
  const { merchantWallet, buyerWallet, connectWalletForRole } = useWallet();

  const buyerPages = ['pay'];
  const relevantWallet = buyerPages.includes(activePage) ? buyerWallet : merchantWallet;

  async function handleConnectClick() {
    try {
      const role = buyerPages.includes(activePage) ? 'buyer' : 'merchant';
      await connectWalletForRole(role);
    } catch (err) {
      console.error('Connect failed:', err);
    }
  }

  const current = pageInfo[activePage];
const subtitle = current.subtitle(!!merchantWallet);

if (!userRole) {
  return (
    <LandingScreen
      onMerchant={() => setUserRole('merchant')}
      onBuyer={() => {
        setUserRole('buyer');
        setActivePage('pay');
      }}
    />
  );
}

  function renderPage() {
   switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'register':
        return <RegisterMerchant />;
      case 'create':
        return <CreatePayment />;
      case 'pay':
        return <PayInvoice />;
      case 'transactions':
        return <Transactions />;
        case 'risk':
        return <RiskPanel />;
      default:
        return (
          <div className="card">
            <p>Page "{activePage}" not built yet.</p>
          </div>
        );
    }
  }

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
        role={userRole}
      />

      <div className="main">
        <Topbar
          pageTitle={current.title}
          pageSubtitle={subtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          walletAddress={relevantWallet?.address ?? null}
          onConnectClick={handleConnectClick}
        />

        <div className="page">{renderPage()}</div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}