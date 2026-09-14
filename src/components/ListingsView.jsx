import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import ListingCard from './ListingCard';
import { fetchListingsApi } from '../api';
import { formatINR } from '../utils/format';

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

export default function ListingsView({ savedIds, onToggleSave, onSelectListing }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedFurnishing, setSelectedFurnishing] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [liveOnly, setLiveOnly] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  // Fetch from API
  const loadData = async (newOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListingsApi({
        limit: pageSize,
        offset: newOffset,
        locality: selectedLocality !== 'all' ? selectedLocality : undefined,
        bhk: selectedBhk !== 'all' && selectedBhk !== 'plot' ? parseInt(selectedBhk, 10) : undefined
      });

      setListings(data.results || []);
      setTotalCount(data.total || 4400);
      setHasMore(data.has_more ?? (newOffset + pageSize < (data.total || 4400)));
      setOffset(newOffset);
    } catch (err) {
      console.error('Fetch listings error:', err);
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(0);
  }, [selectedLocality, selectedBhk]);

  // Robust Client-Side Filtering (Crucial because server quietly ignores min_price, max_price, furnishing)
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // 1. Live status
      if (liveOnly && !item.is_live) return false;

      // 2. Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = item.apartment_name?.toLowerCase().includes(q);
        const matchesLoc = item.locality?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesLoc && !matchesDesc) return false;
      }

      // 3. Locality fallback
      if (selectedLocality !== 'all' && item.locality?.toLowerCase() !== selectedLocality) {
        return false;
      }

      // 4. BHK fallback
      if (selectedBhk !== 'all') {
        if (selectedBhk === 'plot') {
          if (item.property_type !== 'plot' && item.bedroom !== 0) return false;
        } else if (item.bedroom !== parseInt(selectedBhk, 10)) {
          return false;
        }
      }

      // 5. Furnishing (Server ignores, handled client-side)
      if (selectedFurnishing !== 'all') {
        if (item.furnishing?.toLowerCase() !== selectedFurnishing) return false;
      }

      // 6. Price Range (Server ignores, handled client-side)
      const price = item.price || 0;
      if (priceMin && price < Number(priceMin)) return false;
      if (priceMax && price > Number(priceMax)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'area_desc') return (b.carpet_area || 0) - (a.carpet_area || 0);
      return 0;
    });
  }, [listings, search, selectedLocality, selectedBhk, selectedFurnishing, priceMin, priceMax, liveOnly, sortBy]);

  const handleNextPage = () => {
    if (!hasMore && offset + pageSize >= totalCount) return;
    loadData(offset + pageSize);
  };

  const handlePrevPage = () => {
    if (offset <= 0) return;
    loadData(Math.max(0, offset - pageSize));
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="hero-banner glass-panel">
        <div className="hero-content">
          <h1 className="hero-title">Hyderabad Property Search</h1>
          <p className="hero-subtitle">
            Explore 4,400+ sale listings across Madhapur, Gachibowli, Banjara Hills and premier IT corridors.
          </p>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="filter-card glass-panel">
        <div className="filter-row">
          {/* Search bar */}
          <div className="filter-group" style={{ gridColumn: 'span 2' }}>
            <label className="filter-label">Search Property or Locality</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
              <input
                type="text"
                className="filter-input"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="Search apartment name, developer, locality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Locality dropdown */}
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

          {/* Bedrooms / BHK */}
          <div className="filter-group">
            <label className="filter-label">Bedrooms</label>
            <select
              className="filter-select"
              value={selectedBhk}
              onChange={(e) => setSelectedBhk(e.target.value)}
            >
              <option value="all" style={{ background: '#101522' }}>All Configurations</option>
              <option value="1" style={{ background: '#101522' }}>1 BHK</option>
              <option value="2" style={{ background: '#101522' }}>2 BHK</option>
              <option value="3" style={{ background: '#101522' }}>3 BHK</option>
              <option value="4" style={{ background: '#101522' }}>4 BHK</option>
              <option value="5" style={{ background: '#101522' }}>5+ BHK</option>
              <option value="plot" style={{ background: '#101522' }}>Plots</option>
            </select>
          </div>

          {/* Furnishing */}
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

          {/* Min Price */}
          <div className="filter-group">
            <label className="filter-label">Min Price (₹)</label>
            <input
              type="number"
              className="filter-input"
              placeholder="e.g. 5000000"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </div>

          {/* Max Price */}
          <div className="filter-group">
            <label className="filter-label">Max Price (₹)</label>
            <input
              type="number"
              className="filter-input"
              placeholder="e.g. 20000000"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default" style={{ background: '#101522' }}>Featured</option>
              <option value="price_asc" style={{ background: '#101522' }}>Price: Low to High</option>
              <option value="price_desc" style={{ background: '#101522' }}>Price: High to Low</option>
              <option value="area_desc" style={{ background: '#101522' }}>Carpet Area: Largest</option>
            </select>
          </div>
        </div>

        {/* Status Toggle & Active Results Count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={liveOnly}
              onChange={(e) => setLiveOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
            />
            <span>Show Active (Live) Listings Only</span>
          </label>

          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Showing <strong>{filteredListings.length}</strong> listings (Offset {offset} to {offset + listings.length})
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
          <button className="btn-secondary" style={{ marginLeft: 'auto', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => loadData(offset)}>
            Retry
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
          <RefreshCw size={32} className="spinning-icon" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <div>Fetching Hyderabad property listings...</div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Filter size={40} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No listings match your filters</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Try relaxing your price range or bedroom filters.
          </p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSearch('');
              setSelectedLocality('all');
              setSelectedBhk('all');
              setSelectedFurnishing('all');
              setPriceMin('');
              setPriceMax('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="property-grid">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              isSaved={savedIds.includes(listing.listing_id)}
              onToggleSave={onToggleSave}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
        <button
          className="btn-secondary"
          onClick={handlePrevPage}
          disabled={offset === 0 || loading}
          style={{ opacity: offset === 0 ? 0.4 : 1 }}
        >
          <ChevronLeft size={16} />
          Previous 50
        </button>

        <span style={{ fontSize: '0.9rem', color: '#94a3b8', padding: '0 1rem' }}>
          Page {Math.floor(offset / pageSize) + 1}
        </span>

        <button
          className="btn-secondary"
          onClick={handleNextPage}
          disabled={!hasMore || loading}
          style={{ opacity: !hasMore ? 0.4 : 1 }}
        >
          Next 50
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
