export default function RiskPanel() {
  const signals = [
    { icon: '📋', label: 'Dispute Rate', desc: 'Percentage of payments that trigger a dispute', value: '1.2%', badge: 'Low', badgeColor: 'badge-green' },
    { icon: '⏱️', label: 'Delivery Time', desc: 'Average time between payment and confirmation', value: '18m', badge: 'Good', badgeColor: 'badge-green' },
    { icon: '↩️', label: 'Refund History', desc: 'Frequency of resolved refund outcomes', value: '0.5%', badge: 'Low', badgeColor: 'badge-green' },
    { icon: '🔁', label: 'Repeat Customers', desc: 'Share of buyers who return for a second transaction', value: '32%', badge: 'High', badgeColor: 'badge-red' },
    { icon: '💰', label: 'Transaction Volume', desc: 'Total value processed through escrow', value: '2.41', badge: 'sBTC', badgeColor: 'badge-gray' },
  ];

  return (
    <div style={{ maxWidth: 560 }}>

      <div className="form-card" style={{ marginBottom: 14 }}>
        <div className="risk-overview-title">Risk Score Overview</div>

        <div className="gauge-wrapper">
          <svg viewBox="0 0 200 120" width="200" height="120">
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#E5484D" />
              </linearGradient>
            </defs>
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="176" />
            <text x="100" y="92" textAnchor="middle" fill="#F4F5F7" fontSize="28" fontWeight="700" fontFamily="Space Grotesk, sans-serif">28</text>
            <text x="100" y="110" textAnchor="middle" fill="#10B981" fontSize="11" fontWeight="600" fontFamily="Inter, sans-serif">Low Risk</text>
          </svg>

          <div className="gauge-legend">
            <div className="gauge-legend-item">
              <span className="gauge-dot" style={{ background: '#10B981' }} />
              <div>
                <div className="gauge-legend-range">0 – 39</div>
                <div className="gauge-legend-label">Low Risk</div>
              </div>
            </div>
            <div className="gauge-legend-item">
              <span className="gauge-dot" style={{ background: '#F59E0B' }} />
              <div>
                <div className="gauge-legend-range">40 – 69</div>
                <div className="gauge-legend-label">Medium Risk</div>
              </div>
            </div>
            <div className="gauge-legend-item">
              <span className="gauge-dot" style={{ background: '#E5484D' }} />
              <div>
                <div className="gauge-legend-range">70 – 100</div>
                <div className="gauge-legend-label">High Risk</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 14 }}>
        <div className="risk-overview-title" style={{ marginBottom: 12 }}>Fraud Signals Monitored</div>
        {signals.map((s) => (
          <div key={s.label} className="signal-row">
            <div className="signal-row-icon">{s.icon}</div>
            <div className="signal-row-info">
              <div className="signal-row-label">{s.label}</div>
              <div className="signal-row-desc">{s.desc}</div>
            </div>
            <div className="signal-row-right">
              <div className="signal-row-value">{s.value}</div>
              <span className={`signal-badge ${s.badgeColor}`}>{s.badge}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="form-card">
        <div className="ussd-header">
          <span>📱</span>
          <div>
            <div className="ussd-title">Offline USSD Confirmation</div>
            <div className="ussd-sub">No internet required. Works on any phone in Nigeria.</div>
          </div>
        </div>

        <div className="alert alert-warning" style={{ marginBottom: 12 }}>
          <span>🚧</span>
          <span>
            <strong>Coming in Phase 2.</strong> Merchants will confirm deliveries by dialing a USSD
            code on any phone — no internet needed. Backend integration with Africa's Talking API
            is in development.
          </span>
        </div>

        <div className="ussd-steps">
          <div className="ussd-step-title">Planned flow:</div>
          {[
            'Merchant registers phone number on signup',
            'Customer pays → OTP sent to merchant via SMS',
            'Merchant dials *384# and enters OTP',
            'Backend calls confirm-delivery on-chain',
            'Funds released automatically',
          ].map((step, i) => (
            <div key={i} className="ussd-step">
              <span className="ussd-step-num">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}