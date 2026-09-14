import React, { useState } from 'react';
import { BarChart3, AlertTriangle, ShieldAlert, CheckCircle, FileText, Bug, Search, TrendingUp, Layers } from 'lucide-react';
import submissionData from '../../submission.json';
import { formatINR } from '../utils/format';

export default function InsightsView() {
  const [activeTab, setActiveTab] = useState('market');
  const [filterCategory, setFilterCategory] = useState('all');

  const { answers, findings } = submissionData;

  const categories = ['all', ...new Set(findings.map((f) => f.category))];

  const filteredFindings = filterCategory === 'all' 
    ? findings 
    : findings.filter(f => f.category === filterCategory);

  return (
    <div>
      <section className="hero-banner glass-panel">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: '10px', color: 'white' }}>
              <BarChart3 size={24} />
            </div>
            <h1 className="hero-title" style={{ margin: 0 }}>Hyderabad Market Insights & API Audit</h1>
          </div>
          <p className="hero-subtitle">
            Synthesizing city-wide property intelligence, domain analytics, and the complete audit report uncovering discrepancies between <code>API_REFERENCE.md</code> and the running service.
          </p>
        </div>
      </section>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          className={`btn-secondary ${activeTab === 'market' ? 'active' : ''}`}
          style={{
            background: activeTab === 'market' ? 'rgba(99,102,241,0.2)' : undefined,
            borderColor: activeTab === 'market' ? '#6366f1' : undefined
          }}
          onClick={() => setActiveTab('market')}
        >
          <TrendingUp size={16} />
          Market Intelligence & Metrics
        </button>

        <button
          className={`btn-secondary ${activeTab === 'data_quality' ? 'active' : ''}`}
          style={{
            background: activeTab === 'data_quality' ? 'rgba(236,72,153,0.2)' : undefined,
            borderColor: activeTab === 'data_quality' ? '#ec4899' : undefined
          }}
          onClick={() => setActiveTab('data_quality')}
        >
          <ShieldAlert size={16} color="#ec4899" />
          Data Quality & Anomaly Radar ({answers.corrupt_listing_ids.length + answers.fake_listing_ids.length})
        </button>

        <button
          className={`btn-secondary ${activeTab === 'audit' ? 'active' : ''}`}
          style={{
            background: activeTab === 'audit' ? 'rgba(245,158,11,0.2)' : undefined,
            borderColor: activeTab === 'audit' ? '#f59e0b' : undefined
          }}
          onClick={() => setActiveTab('audit')}
        >
          <FileText size={16} color="#fbbf24" />
          Documentation Audit Findings ({findings.length})
        </button>
      </div>

      {/* TAB 1: Market Intelligence */}
      {activeTab === 'market' && (
        <div>
          <div className="insights-grid">
            <div className="stat-card glass-panel">
              <div className="stat-title">Total Retrievable Listings</div>
              <div className="stat-val" style={{ color: '#818cf8' }}>{answers.total_listing_records.toLocaleString()}</div>
              <div className="stat-desc">
                Server reported 4,128 in header; offset pagination uncovers 4,400 distinct records.
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-title">Active Market Units</div>
              <div className="stat-val" style={{ color: '#34d399' }}>{answers.active_listings.toLocaleString()}</div>
              <div className="stat-desc">
                79.0% of retrievable listings are live. 923 are withdrawn or inactive.
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-title">Distinct Physical Properties</div>
              <div className="stat-val" style={{ color: '#f472b6' }}>{answers.unique_properties.toLocaleString()}</div>
              <div className="stat-desc">
                20 duplicates identified where identical units were listed across multiple portals.
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-title">2 BHK Mean Price / Sqft</div>
              <div className="stat-val" style={{ color: '#fbbf24' }}>₹{answers.avg_price_per_sqft_2bhk.toLocaleString()}</div>
              <div className="stat-desc">
                Clean benchmark calculated strictly excluding corrupt and bait records.
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-title">Madhapur Monthly Rent Pool</div>
              <div className="stat-val" style={{ color: '#38bdf8' }}>{formatINR(answers.total_monthly_rent)}</div>
              <div className="stat-desc">
                Sum across 165 active rental properties in candidate assigned locality.
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-title">Costliest Project Max Price</div>
              <div className="stat-val" style={{ color: '#a78bfa' }}>{formatINR(answers.costliest_project.price_max_inr)}</div>
              <div className="stat-desc">
                Project {answers.costliest_project.project_id} (Rohan Vista, Kondapur) max price 4.15 Cr.
              </div>
            </div>
          </div>

          {/* Locality & BHK Distributions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#818cf8" />
                Hyderabad Key Locality Distributions
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Locality</th>
                    <th>Median Sale Price</th>
                    <th>Avg ₹/sqft</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Jubilee Hills</strong></td>
                    <td>₹1.85 Cr</td>
                    <td>₹22,400</td>
                  </tr>
                  <tr>
                    <td><strong>Banjara Hills</strong></td>
                    <td>₹1.62 Cr</td>
                    <td>₹19,800</td>
                  </tr>
                  <tr>
                    <td><strong>Madhapur</strong></td>
                    <td>₹1.28 Cr</td>
                    <td>₹17,500</td>
                  </tr>
                  <tr>
                    <td><strong>Gachibowli</strong></td>
                    <td>₹1.15 Cr</td>
                    <td>₹16,200</td>
                  </tr>
                  <tr>
                    <td><strong>Kondapur</strong></td>
                    <td>₹98.5 Lakh</td>
                    <td>₹14,900</td>
                  </tr>
                  <tr>
                    <td><strong>Nallagandla</strong></td>
                    <td>₹82.0 Lakh</td>
                    <td>₹12,800</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} color="#34d399" />
                Configuration (BHK) Supply Share
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>3 BHK Apartments (Highest Demand)</span>
                    <span style={{ fontWeight: 600 }}>38.2% (1,680)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '38.2%', height: '100%', background: '#6366f1' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>2 BHK Apartments</span>
                    <span style={{ fontWeight: 600 }}>32.4% (1,425)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '32.4%', height: '100%', background: '#34d399' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>4+ BHK Luxury Homes</span>
                    <span style={{ fontWeight: 600 }}>18.1% (798)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '18.1%', height: '100%', background: '#ec4899' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>1 BHK & Compact Units</span>
                    <span style={{ fontWeight: 600 }}>6.8% (300)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '6.8%', height: '100%', background: '#f59e0b' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>Residential Plots</span>
                    <span style={{ fontWeight: 600 }}>4.5% (197)</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '4.5%', height: '100%', background: '#8b5cf6' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Data Quality Radar */}
      {activeTab === 'data_quality' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Bug size={20} />
                50 Physically Corrupt Records (Q4)
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1rem' }}>
                5 distinct categories of 10 synthetic corrupt records injected into the dataset describing impossible real estate properties.
              </p>
              <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>10 Negative Prices:</strong> e.g., MAG-2002456 (-₹99.9 Lakh)</li>
                <li><strong>10 Floor &gt; Total:</strong> e.g., MAG-2000670 (Floor 28 of 21)</li>
                <li><strong>10 Carpet &gt; Super:</strong> e.g., MAG-2002624 (1,000 &gt; 766 sqft)</li>
                <li><strong>10 Swapped Lat/Lon:</strong> Placed in Arctic Ocean (lat &gt; 50)</li>
                <li><strong>10 Non-plot 0 Bedrooms:</strong> Villas/apartments with 0 BHK</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ec4899' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontWeight: 700, marginBottom: '0.5rem' }}>
                <ShieldAlert size={20} />
                82 Fake / Advance-Fee Bait Listings (Q9)
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1rem' }}>
                Listings created to harvest leads or solicit deceptive advance token payments before site visits.
              </p>
              <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>32 Token Fee Scams:</strong> "Pay token amount of Rs 25,000 today"</li>
                <li><strong>24 Site Visit Blockers:</strong> "Site visit only after booking amount paid"</li>
                <li><strong>16 False Urgency Baits:</strong> "Below market price, this week only"</li>
                <li><strong>10 Extreme Price Baits:</strong> ₹4,910 - ₹15,660 for entire villas</li>
                <li><strong>Syndicate Phones:</strong> 7 phone numbers rotating 30+ fictitious agency names</li>
              </ul>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.5rem' }}>
                <AlertTriangle size={20} />
                129 Project Count Mismatches (Q10)
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1rem' }}>
                Every project reports <code>total_listings</code>, claimed to dynamically match currently available listings.
              </p>
              <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>341 Projects:</strong> Match active live listings accurately.</li>
                <li><strong>129 Projects:</strong> Out of sync with active listings.</li>
                <li><strong>Underlying Issue:</strong> Server cache stale or ignoring delisted units.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Documentation Audit Findings */}
      {activeTab === 'audit' && (
        <div>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {categories.map((c) => (
              <button
                key={c}
                className="btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.75rem',
                  background: filterCategory === c ? 'rgba(99,102,241,0.25)' : undefined,
                  borderColor: filterCategory === c ? '#6366f1' : undefined
                }}
                onClick={() => setFilterCategory(c)}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredFindings.map((f, i) => (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderLeft: '4px solid #6366f1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                      {f.endpoint}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(99,102,241,0.15)',
                        color: '#818cf8',
                        border: '1px solid rgba(99,102,241,0.3)'
                      }}
                    >
                      {f.category}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Finding #{i + 1}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Documented Claim (The Lie)
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{f.documented}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Actual Live Behavior (The Truth)
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{f.actual}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>How Verified:</span> {f.how_found}
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Impact:</span> {f.impact}
                  </div>
                </div>

                {f.evidence && f.evidence.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Reproducible Evidence IDs:</span>
                    {f.evidence.map((ev, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          background: 'rgba(255,255,255,0.06)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          color: '#cbd5e1'
                        }}
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
