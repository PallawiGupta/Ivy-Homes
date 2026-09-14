import React, { useState, useEffect, useMemo } from 'react';
import { Key, MapPin, Bed, Maximize2, ShieldCheck, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Phone, User } from 'lucide-react';
import { fetchRentalsApi } from '../api';
import { formatINR, capitalize } from '../utils/format';

const LOCALITIES = [
  'all',
  'madhapur',
  'banjara hills',
  'gachibowli',
  'jubilee hills',
  'kondapur',
  'manikonda',
  'miyapur',
  'nallagandla',
  'kompally',
  'kukatpally'
];

export default function RentalsView() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  // Filters
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedFurnishing, setSelectedFurnishing] = useState('all');
  const [selectedRental, setSelectedRental] = useState(null);

  const loadRentals = async (newOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRentalsApi({
        limit: pageSize,
        offset: newOffset,
        locality: selectedLocality !== 'all' ? selectedLocality : undefined,
        bhk: selectedBhk !== 'all' ? parseInt(selectedBhk, 10) : undefined,
        furnishing: selectedFurnishing !== 'all' ? selectedFurnishing : undefined
      });

      setRentals(data.results || []);
      setTotal(data.total || 1650);
      setHasMore(data.has_more ?? (newOffset + pageSize < (data.total || 1650)));
      setOffset(newOffset);
    } catch (err) {
      console.error('Fetch rentals error:', err);
      setError(err.message || 'Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals(0);
  }, [selectedLocality, selectedBhk, selectedFurnishing]);

  return (
    <div>
      <section className="hero-banner glass-panel">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'rgba(52,211,153,0.2)', padding: '0.5rem', borderRadius: '10px', color: '#34d399' }}>
              <Key size={24} />
            </div>
            <h1 className="hero-title" style={{ margin: 0 }}>Hyderabad Rentals</h1>
          </div>
          <p className="hero-subtitle">
            Browse verified apartments and villas for rent across Hyderabad with honest monthly rents, deposit, and maintenance breakdown.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="filter-card glass-panel">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Locality</label>
            <select
              className="filter-select"
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
            >
              {LOCALITIES.map((loc) => (
                <option key={loc} value={loc} style={{ background: '#101522' }}>
                  {loc === 'all' ? 'All Localities' : loc.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Bedrooms</label>
            <select
              className="filter-select"
              value={selectedBhk}
              onChange={(e) => setSelectedBhk(e.target.value)}
            >
              <option value="all" style={{ background: '#101522' }}>All BHK</option>
              <option value="1" style={{ background: '#101522' }}>1 BHK</option>
              <option value="2" style={{ background: '#101522' }}>2 BHK</option>
              <option value="3" style={{ background: '#101522' }}>3 BHK</option>
              <option value="4" style={{ background: '#101522' }}>4+ BHK</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Furnishing</label>
            <select
              className="filter-select"
              value={selectedFurnishing}
              onChange={(e) => setSelectedFurnishing(e.target.value)}
            >
              <option value="all" style={{ background: '#101522' }}>All Furnishing</option>
              <option value="fully-furnished" style={{ background: '#101522' }}>Fully Furnished</option>
              <option value="semi-furnished" style={{ background: '#101522' }}>Semi Furnished</option>
              <option value="unfurnished" style={{ background: '#101522' }}>Unfurnished</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Showing <strong>{rentals.length}</strong> rentals (Total available: {total})
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
          <button className="btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => loadRentals(offset)}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
          <RefreshCw size={32} className="spinning-icon" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <div>Loading rental listings...</div>
        </div>
      ) : rentals.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Key size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No rentals found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Try clearing filters to see more available rentals.</p>
        </div>
      ) : (
        <div className="property-grid">
          {rentals.map((r) => (
            <div
              key={r.listing_id}
              className="property-card"
              onClick={() => setSelectedRental(r)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-header-visual">
                <Key className="card-visual-icon" />
                <div className="card-badges">
                  <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                    For Rent
                  </span>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                    {capitalize(r.furnishing)}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <div className="card-price-row">
                  <div className="card-price" style={{ color: '#34d399' }}>
                    ₹{r.price?.toLocaleString('en-IN')}<span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 400 }}> /month</span>
                  </div>
                  {r.deposit && (
                    <div className="card-sqft-rate">Deposit: {formatINR(r.deposit)}</div>
                  )}
                </div>

                <h3 className="card-title">{r.title || r.apartment_name || `${r.bedroom} BHK in ${capitalize(r.locality)}`}</h3>

                <div className="card-location">
                  <MapPin size={14} color="#ec4899" />
                  <span>{capitalize(r.locality)}, Hyderabad</span>
                </div>

                <div className="card-specs">
                  <div className="spec-item">
                    <span className="spec-label">Configuration</span>
                    <span className="spec-val">{r.bedroom} BHK</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Carpet Area</span>
                    <span className="spec-val">{r.carpet_area ? `${r.carpet_area} sqft` : 'N/A'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Floor</span>
                    <span className="spec-val">{r.floor && r.total_floors ? `${r.floor}/${r.total_floors}` : '—'}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {r.maintenance ? `+₹${r.maintenance} Maint.` : 'No Maint.'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                    Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
        <button
          className="btn-secondary"
          onClick={() => loadRentals(Math.max(0, offset - pageSize))}
          disabled={offset === 0 || loading}
          style={{ opacity: offset === 0 ? 0.4 : 1 }}
        >
          <ChevronLeft size={16} /> Previous 50
        </button>
        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Page {Math.floor(offset / pageSize) + 1}
        </span>
        <button
          className="btn-secondary"
          onClick={() => loadRentals(offset + pageSize)}
          disabled={!hasMore || loading}
          style={{ opacity: !hasMore ? 0.4 : 1 }}
        >
          Next 50 <ChevronRight size={16} />
        </button>
      </div>

      {/* Rental Detail Modal */}
      {selectedRental && (
        <div className="modal-overlay" onClick={() => setSelectedRental(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRental(null)}>
              ✕
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <span className="badge" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', marginBottom: '0.5rem' }}>
                Rental Property
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.4rem' }}>
                {selectedRental.title || selectedRental.apartment_name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                <MapPin size={15} color="#ec4899" />
                <span>{capitalize(selectedRental.locality)}, Hyderabad</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(52,211,153,0.08)',
              border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Monthly Rent</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                  ₹{selectedRental.price?.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Security Deposit</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {formatINR(selectedRental.deposit)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Maintenance</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  ₹{selectedRental.maintenance || 0}/mo
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Description</h4>
              <p style={{ color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px' }}>
                {selectedRental.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Posted by {capitalize(selectedRental.posted_by) || 'Owner'}</div>
                <div style={{ fontWeight: 600 }}>{selectedRental.posted_by_name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 600 }}>
                <Phone size={15} />
                <span>{selectedRental.posted_by_contact}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
