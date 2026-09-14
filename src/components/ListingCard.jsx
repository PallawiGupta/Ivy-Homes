import React from 'react';
import { Bookmark, MapPin, Bed, Bath, Maximize2, ShieldCheck, Compass, Building } from 'lucide-react';
import { formatINR, capitalize } from '../utils/format';

export default function ListingCard({ listing, isSaved, onToggleSave, onSelect }) {
  const {
    listing_id,
    apartment_name,
    locality,
    property_type,
    bedroom,
    bathroom,
    price,
    carpet_area,
    floor,
    total_floors,
    facing_direction,
    is_live,
    is_verified,
    website
  } = listing;

  const pricePerSqft = carpet_area > 0 && price !== 0 ? Math.round(Math.abs(price) / carpet_area) : null;

  return (
    <div className="property-card" onClick={() => onSelect(listing)}>
      <div className="card-header-visual">
        <Building className="card-visual-icon" />

        <div className="card-badges">
          {is_live ? (
            <span className="badge badge-live">● Live</span>
          ) : (
            <span className="badge badge-inactive">● Inactive</span>
          )}

          {is_verified && (
            <span className="badge badge-verified">
              <ShieldCheck size={12} />
              Verified
            </span>
          )}
        </div>

        <button
          className={`card-save-btn ${isSaved ? 'saved' : ''}`}
          title={isSaved ? 'Remove from saved' : 'Save property'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(listing_id);
          }}
        >
          <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="card-body">
        <div className="card-price-row">
          <div className="card-price">{formatINR(price)}</div>
          {pricePerSqft && (
            <div className="card-sqft-rate">₹{pricePerSqft.toLocaleString('en-IN')}/sqft</div>
          )}
        </div>

        <h3 className="card-title" title={apartment_name}>
          {apartment_name || capitalize(property_type) || 'Residential Property'}
        </h3>

        <div className="card-location">
          <MapPin size={14} color="#ec4899" />
          <span>{capitalize(locality)}, Hyderabad</span>
        </div>

        <div className="card-specs">
          <div className="spec-item">
            <span className="spec-label">Bedrooms</span>
            <span className="spec-val">
              <Bed size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {bedroom ? `${bedroom} BHK` : property_type === 'plot' ? 'Plot' : 'Studio'}
            </span>
          </div>

          <div className="spec-item">
            <span className="spec-label">Carpet Area</span>
            <span className="spec-val">
              <Maximize2 size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              {carpet_area ? `${carpet_area} sqft` : '—'}
            </span>
          </div>

          <div className="spec-item">
            <span className="spec-label">Floor</span>
            <span className="spec-val">
              {floor !== undefined && total_floors ? `${floor}/${total_floors}` : '—'}
            </span>
          </div>
        </div>

        <div className="card-footer">
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            via {capitalize(website) || 'Partner'}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
}
