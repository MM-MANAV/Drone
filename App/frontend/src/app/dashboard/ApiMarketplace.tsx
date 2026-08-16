"use client";

import { useState } from "react";

export default function ApiPricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const checkIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const dashIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d1d1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div className="pricing-page">
      <style>{`
        .pricing-page {
          padding: 60px 40px;
          background: #ece9e4;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'DM Sans', sans-serif;
        }

        .pr-header {
          text-align: center;
          max-width: 650px;
          margin-bottom: 40px;
        }

        .pr-title {
          font-family: 'Instrument Serif', serif;
          font-size: 48px;
          font-weight: 400;
          letter-spacing: -.02em;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .pr-sub {
          font-size: 16px;
          color: #6b6560;
          line-height: 1.6;
        }

        /* ── Toggle ── */
        .pr-toggle-wrap {
          background: #fff;
          padding: 4px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 50px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .pr-tgl-btn {
          padding: 8px 24px;
          border-radius: 9px;
          border: none;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #8a8480;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .pr-tgl-btn.active {
          background: #1a1a1a;
          color: #fff;
        }
        .pr-save-badge {
          font-size: 10px;
          font-weight: 800;
          color: #22c55e;
          background: rgba(34,197,94,0.1);
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: 8px;
        }

        /* ── Grid ── */
        .pr-grid {
          display: grid;
          grid-template-columns: repeat(3, 320px);
          gap: 24px;
          align-items: stretch;
          width: 100%;
          justify-content: center;
        }

        .pr-card {
           background: #fff;
           border-radius: 24px;
           padding: 40px 32px;
           display: flex;
           flex-direction: column;
           border: 1px solid #e2dfd9;
           position: relative;
           transition: transform 0.3s ease;
        }

        .pr-card.popular {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .pr-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #facc15;
          color: #000;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 8px;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .pr-card-h {
          margin-bottom: 8px;
          font-size: 20px;
          font-weight: 700;
        }

        .pr-card-sub {
          font-size: 13px;
          opacity: 0.6;
          margin-bottom: 24px;
        }

        .pr-price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 4px;
        }

        .pr-curr { font-size: 20px; font-weight: 600; vertical-align: super; }
        .pr-amount { font-size: 44px; font-weight: 800; letter-spacing: -1px; }
        .pr-period { font-size: 14px; opacity: 0.6; }

        .pr-divider {
          height: 1px;
          background: rgba(0,0,0,0.06);
          margin: 32px 0;
        }
        .pr-card.popular .pr-divider {
          background: rgba(255,255,255,0.1);
        }

        .pr-features {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
        }

        .pr-feat {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 500;
        }
        .pr-feat.disabled {
          opacity: 0.3;
        }

        .pr-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e2dfd9;
          background: #fff;
          color: #1a1a1a;
        }
        .pr-btn:hover {
          background: #f5f3ef;
        }

        .pr-card.popular .pr-btn {
          background: #fff;
          color: #1a1a1a;
          border: none;
        }
        .pr-card.popular .pr-btn:hover {
          background: #ece9e4;
        }
      `}</style>

      <header className="pr-header">
        <h1 className="pr-title">Tactical API, Priced for Your Mission</h1>
        <p className="pr-sub">
          Integrate Trinetra&apos;s UAV intelligence directly into your systems. Real-time telemetry, mission logs, and FLIR data — all via REST API.
        </p>
      </header>

      <div className="pr-toggle-wrap">
        <button
          className={`pr-tgl-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly
        </button>
        <button
          className={`pr-tgl-btn ${billingCycle === 'annual' ? 'active' : ''}`}
          onClick={() => setBillingCycle('annual')}
        >
          Annual <span className="pr-save-badge">SAVE 20%</span>
        </button>
      </div>

      <div className="pr-grid">
        {/* Free Plan */}
        <div className="pr-card">
          <h3 className="pr-card-h">Free</h3>
          <p className="pr-card-sub">For hobbyists & early exploration</p>
          <div className="pr-price-row">
            <span className="pr-curr">₹</span>
            <span className="pr-amount">0</span>
          </div>
          <div className="pr-divider" />
          <div className="pr-features">
            <div className="pr-feat">{checkIcon} 100 API calls / month</div>
            <div className="pr-feat">{checkIcon} UAV telemetry endpoints</div>
            <div className="pr-feat">{checkIcon} Basic mission logs</div>
            <div className="pr-feat">{checkIcon} Community support</div>
            <div className="pr-feat disabled">{dashIcon} Thermal FLIR access</div>
            <div className="pr-feat disabled">{dashIcon} Multispectral analysis</div>
            <div className="pr-feat disabled">{dashIcon} Custom webhooks</div>
            <div className="pr-feat disabled">{dashIcon} SLA guarantee</div>
          </div>
          <button className="pr-btn">Get Started Free</button>
        </div>

        {/* Pro Plan */}
        <div className="pr-card popular">
          <div className="pr-badge">MOST POPULAR</div>
          <h3 className="pr-card-h">Pro</h3>
          <p className="pr-card-sub">For tactical teams & active missions</p>
          <div className="pr-price-row">
            <span className="pr-curr">₹</span>
            <span className="pr-amount">49.99</span>
            <span className="pr-period">/mo</span>
          </div>
          <p className="pr-card-sub" style={{ marginBottom: 0, marginTop: 4 }}>per month</p>
          <div className="pr-divider" />
          <div className="pr-features">
            <div className="pr-feat">{checkIcon} 50,000 API calls / month</div>
            <div className="pr-feat">{checkIcon} UAV telemetry endpoints</div>
            <div className="pr-feat">{checkIcon} Full mission logs & history</div>
            <div className="pr-feat">{checkIcon} Priority support (24h SLA)</div>
            <div className="pr-feat">{checkIcon} Thermal FLIR access</div>
            <div className="pr-feat">{checkIcon} Multispectral analysis</div>
            <div className="pr-feat disabled" style={{ opacity: 0.1 }}>{dashIcon} Custom webhooks</div>
            <div className="pr-feat disabled" style={{ opacity: 0.1 }}>{dashIcon} Dedicated infra SLA</div>
          </div>
          <button className="pr-btn">Activate Pro →</button>
        </div>

        {/* Custom Plan */}
        <div className="pr-card">
          <h3 className="pr-card-h">Custom</h3>
          <p className="pr-card-sub">For defence orgs & enterprise ops</p>
          <div className="pr-price-row">
            <span className="pr-amount">Custom</span>
          </div>
          <div className="pr-divider" />
          <div className="pr-features">
            <div className="pr-feat">{checkIcon} Unlimited API calls</div>
            <div className="pr-feat">{checkIcon} UAV telemetry endpoints</div>
            <div className="pr-feat">{checkIcon} Full mission logs & history</div>
            <div className="pr-feat">{checkIcon} Dedicated account manager</div>
            <div className="pr-feat">{checkIcon} Thermal FLIR access</div>
            <div className="pr-feat">{checkIcon} Multispectral analysis</div>
            <div className="pr-feat">{checkIcon} Custom webhooks & integrations</div>
            <div className="pr-feat">{checkIcon} 99.99% uptime SLA</div>
          </div>
          <button className="pr-btn">Contact Sales →</button>
        </div>
      </div>
    </div>
  );
}
