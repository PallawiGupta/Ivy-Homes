import React, { useState, useEffect } from 'react';
import { Bookmark, AlertCircle, RefreshCw } from 'lucide-react';
import ListingCard from './ListingCard';
import { fetchSavedApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function SavedView({ onToggleSave, onSelectListing, savedIds }) {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSaved = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSavedApi();
      setSavedListings(data.results || []);
    } catch (err) {
      console.error('Fetch saved error:', err);
      setError(err.message || 'Failed to load saved properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [user?.email, savedIds]);

  return (
    <div>
      <section className="hero-banner glass-panel">
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'rgba(236,72,153,0.2)', padding: '0.5rem', borderRadius: '10px', color: '#ec4899' }}>
              <Bookmark size={24} />
            </div>
            <h1 className="hero-title" style={{ margin: 0 }}>Saved Properties</h1>
          </div>
          <p className="hero-subtitle">
            Properties bookmarked by <strong>{user?.email}</strong>. Stored on the server via <code>/v1/saved</code> and isolated per user.
          </p>
        </div>
      </section>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>{error}</div>
          <button className="btn-secondary" style={{ marginLeft: 'auto' }} onClick={loadSaved}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8' }}>
          <RefreshCw size={32} className="spinning-icon" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <div>Loading your saved listings...</div>
        </div>
      ) : savedListings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Bookmark size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Saved Properties Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Browse through sale listings or rentals and click the bookmark icon to save properties to this list.
          </p>
        </div>
      ) : (
        <div className="property-grid">
          {savedListings.map((listing) => (
            <ListingCard
              key={listing.listing_id}
              listing={listing}
              isSaved={true}
              onToggleSave={onToggleSave}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      )}
    </div>
  );
}
