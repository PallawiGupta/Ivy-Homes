import React, { useState } from 'react';
import { X, MapPin, Bed, Bath, Maximize2, Compass, Car, Phone, User, ShieldCheck, Bookmark, Share2, Check, ExternalLink, Building2, AlertTriangle } from 'lucide-react';
import { formatINR, capitalize } from '../utils/format';

export default function ListingDetailModal({ listing, isSaved, onToggleSave, onClose, onSelectProject }) {
  const [copied, setCopied] = useState(false);
  if (!listing) return null;

  const {
    listing_id,
    apartment_name,
    locality,
    property_type,
    bedroom,
    bathroom,
    balcony,
    floor,
    total_floors,
    furnishing,
    facing_direction,
    covered_parking,
    price,
    carpet_area,
    super_built_up_area,
    latitude,
    longitude,
    posted_by,
    posted_by_name,
    posted_by_contact,
    project_id,
    is_live,
    is_verified,
    description,
    posted_at,
    website,
    listing_url
  } = listing;

  const pricePerSqft = carpet_area > 0 && price !== 0 ? Math.round(Math.abs(price) / carpet_area) : null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#/listings/${listing_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Badges & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {is_live ? (
              <span className="badge badge-live">● Active Listing</span>
            ) : (
              <span className="badge badge-inactive">● Inactive / Delisted</span>
            )}
            {is_verified && (
              <span className="badge badge-verified">
                <ShieldCheck size={12} />
                Verified by Ivy
              </span>
            )}
            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
              ID: {listing_id}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
              onClick={handleCopyLink}
              title="Copy shareable link"
            >
              {copied ? <Check size={14} color="#34d399" /> : <Share2 size={14} />}
              {copied ? 'Copied!' : 'Share'}
            </button>

            <button
              className={`btn-primary ${isSaved ? 'saved' : ''}`}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.82rem',
                background: isSaved ? '#ec4899' : undefined
              }}
              onClick={() => onToggleSave(listing_id)}
            >
              <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Title and Price */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            {apartment_name || capitalize(property_type) || 'Residential Property'}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            <MapPin size={16} color="#ec4899" />
            <span>{capitalize(locality)}, Hyderabad</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
              {formatINR(price)}
            </div>
            {pricePerSqft && (
              <div style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.95rem' }}>
                ₹{pricePerSqft.toLocaleString('en-IN')}/sqft carpet
              </div>
            )}
          </div>
        </div>

        {/* Specifications Grid */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1.2rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Configuration</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
              {bedroom ? `${bedroom} BHK` : 'Plot'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Carpet Area</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
              {carpet_area ? `${carpet_area} sqft` : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Super Built-Up</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
              {super_built_up_area ? `${super_built_up_area} sqft` : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Floor</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
              {floor !== undefined && total_floors ? `${floor} of ${total_floors}` : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Facing</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
              {facing_direction ? capitalize(facing_direction) : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Furnishing</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
              {furnishing ? capitalize(furnishing) : 'Unfurnished'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Bathrooms</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
              {bathroom !== undefined ? bathroom : 'N/A'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Covered Parking</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.2rem' }}>
              {covered_parking ? `${covered_parking} Slot` : 'None'}
            </div>
          </div>
        </div>

        {/* Project Link if applicable */}
        {project_id && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building2 size={22} color="#818cf8" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Part of Project {project_id}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>View master developer specifications & amenities</div>
              </div>
            </div>
            {onSelectProject && (
              <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => onSelectProject(project_id)}>
                View Project →
              </button>
            )}
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem' }}>
            Property Description
          </h4>
          <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px' }}>
            {description || 'No description provided by seller.'}
          </p>
        </div>

        {/* Seller Info & Location */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.25rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Contact Information
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <User size={16} color="#818cf8" />
              <span style={{ fontWeight: 600 }}>{posted_by_name || 'Verified Partner'}</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                {capitalize(posted_by) || 'Agent'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              <Phone size={15} color="#34d399" />
              <span>{posted_by_contact || 'Contact Protected'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Coordinates & Map
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Lat: {latitude?.toFixed(4)}, Lon: {longitude?.toFixed(4)}
            </div>
            {latitude && longitude && (
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: '#818cf8',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  textDecoration: 'none'
                }}
              >
                Open in Google Maps <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <span>Listed on {posted_at ? new Date(posted_at).toLocaleDateString() : 'Recent'}</span>
          {listing_url && (
            <a href={listing_url} target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
              Source: {website}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
