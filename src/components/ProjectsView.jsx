import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Calendar, CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';
import { fetchProjectsApi } from '../api';
import { capitalize } from '../utils/format';

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

/**
 * Accurately formats project price range accounting for API unit quirks:
 * Values < 10 are in Crores, values >= 10 are in Lakhs.
 */
function formatProjectPrice(pmin, pmax) {
  if (pmin === undefined && pmax === undefined) return 'Price on Request';
  
  const formatVal = (v) => {
    if (v === null || v === undefined) return '';
    if (v < 10) {
      return `₹${v.toFixed(2)} Cr`;
    }
    return `₹${v.toFixed(1)} Lakh`;
  };

  if (pmin && pmax) {
    return `${formatVal(pmin)} – ${formatVal(pmax)}`;
  }
  return formatVal(pmin || pmax);
}

export default function ProjectsView({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  // Filters
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeProject, setActiveProject] = useState(null);

  const loadProjects = async (newOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjectsApi({
        limit: pageSize,
        offset: newOffset,
        locality: selectedLocality !== 'all' ? selectedLocality : undefined,
        project_status: selectedStatus !== 'all' ? selectedStatus : undefined
      });

      setProjects(data.results || []);
      setTotal(data.total || 470);
      setHasMore(data.has_more ?? (newOffset + pageSize < (data.total || 470)));
      setOffset(newOffset);
    } catch (err) {
      console.error('Fetch projects error:', err);
      setError(err.message || 'Failed to load builder projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(0);
  }, [selectedLocality, selectedStatus]);

  return (
    <div>
      <section className="hero-banner glass-panel">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'rgba(99,102,241,0.2)', padding: '0.5rem', borderRadius: '10px', color: '#818cf8' }}>
              <Building2 size={24} />
            </div>
            <h1 className="hero-title" style={{ margin: 0 }}>Builder Projects</h1>
          </div>
          <p className="hero-subtitle">
            Explore 470 premier residential master developments in Hyderabad with accurate pricing (Lakhs & Crores), RERA verification, and unit configurations.
          </p>
        </div>
      </section>

      {/* Filter Toolbar */}
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
            <label className="filter-label">Project Status</label>
            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all" style={{ background: '#101522' }}>All Statuses</option>
              <option value="under construction" style={{ background: '#101522' }}>Under Construction</option>
              <option value="ready to move" style={{ background: '#101522' }}>Ready to Move</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Showing <strong>{projects.length}</strong> master developments
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
          <button className="btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => loadProjects(offset)}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
          <RefreshCw size={32} className="spinning-icon" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <div>Loading builder projects...</div>
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Building2 size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No projects match filters</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Try choosing another locality.</p>
        </div>
      ) : (
        <div className="property-grid">
          {projects.map((p) => {
            const isReady = p.project_status?.toLowerCase().includes('ready');
            return (
              <div
                key={p.project_id}
                className="property-card"
                onClick={() => setActiveProject(p)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-header-visual">
                  <Building2 className="card-visual-icon" />
                  <div className="card-badges">
                    <span
                      className="badge"
                      style={{
                        background: isReady ? 'rgba(52,211,153,0.15)' : 'rgba(245,158,11,0.15)',
                        color: isReady ? '#34d399' : '#fbbf24',
                        border: `1px solid ${isReady ? 'rgba(52,211,153,0.3)' : 'rgba(245,158,11,0.3)'}`
                      }}
                    >
                      {capitalize(p.project_status)}
                    </span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                      {p.total_units} Units
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-price-row">
                    <div className="card-price" style={{ color: '#818cf8', fontSize: '1.35rem' }}>
                      {formatProjectPrice(p.price_min, p.price_max)}
                    </div>
                  </div>

                  <h3 className="card-title">{p.apartment_name}</h3>

                  <div className="card-location">
                    <MapPin size={14} color="#ec4899" />
                    <span>{capitalize(p.locality)}, Hyderabad</span>
                    <span style={{ color: '#64748b', marginLeft: 'auto' }}>by {p.developer_name}</span>
                  </div>

                  <div className="card-specs">
                    <div className="spec-item">
                      <span className="spec-label">Area Range</span>
                      <span className="spec-val">{p.min_area_sqft} - {p.max_area_sqft} sqft</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Towers / Floors</span>
                      <span className="spec-val">{p.total_towers} T / {p.total_floors} F</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Possession</span>
                      <span className="spec-val">{p.possession_date ? new Date(p.possession_date).getFullYear() : '—'}</span>
                    </div>
                  </div>

                  {/* Amenities Pills */}
                  {p.amenities && p.amenities.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                      {p.amenities.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.72rem',
                            background: 'rgba(255,255,255,0.04)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            color: '#94a3b8'
                          }}
                        >
                          ✓ {capitalize(a)}
                        </span>
                      ))}
                      {p.amenities.length > 3 && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          +{p.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="card-footer" style={{ marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      RERA: {p.rera_number ? 'Certified' : 'Pending'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                      Project Specs →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
        <button
          className="btn-secondary"
          onClick={() => loadProjects(Math.max(0, offset - pageSize))}
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
          onClick={() => loadProjects(offset + pageSize)}
          disabled={!hasMore || loading}
          style={{ opacity: !hasMore ? 0.4 : 1 }}
        >
          Next 50 <ChevronRight size={16} />
        </button>
      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div className="modal-overlay" onClick={() => setActiveProject(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveProject(null)}>
              ✕
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                  {activeProject.developer_name}
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  ID: {activeProject.project_id}
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {activeProject.apartment_name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                <MapPin size={15} color="#ec4899" />
                <span>{capitalize(activeProject.locality)}, Hyderabad</span>
              </div>
            </div>

            {/* Price Box */}
            <div style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                Estimated Price Range (Corrected Units)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8', marginTop: '0.2rem' }}>
                {formatProjectPrice(activeProject.price_min, activeProject.price_max)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                Unit sizes from {activeProject.min_area_sqft} sqft to {activeProject.max_area_sqft} sqft
              </div>
            </div>

            {/* Specs Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              background: 'rgba(255,255,255,0.03)',
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Status</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{capitalize(activeProject.project_status)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Launch Date</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{activeProject.launch_date || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Possession</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{activeProject.possession_date || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Total Units</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{activeProject.total_units} across {activeProject.total_towers} towers</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Floors</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{activeProject.total_floors} Floors</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>RERA Number</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem', fontSize: '0.85rem' }}>{activeProject.rera_number || 'N/A'}</div>
              </div>
            </div>

            {/* Amenities */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Featured Amenities
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {activeProject.amenities?.map((a, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    ✦ {capitalize(a)}
                  </span>
                ))}
              </div>
            </div>

            {activeProject.project_url && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={activeProject.project_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Visit Official Project Page <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
