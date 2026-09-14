import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ListingsView from './components/ListingsView';
import RentalsView from './components/RentalsView';
import ProjectsView from './components/ProjectsView';
import SavedView from './components/SavedView';
import InsightsView from './components/InsightsView';
import ListingDetailModal from './components/ListingDetailModal';
import LoginModal from './components/LoginModal';
import { useAuth } from './context/AuthContext';
import { fetchSavedApi, saveListingApi, removeSavedApi, fetchListingDetailApi } from './api';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [savedIds, setSavedIds] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync saved list from API
  const loadSavedIds = async () => {
    if (!isAuthenticated) {
      setSavedIds([]);
      return;
    }
    try {
      const data = await fetchSavedApi();
      const ids = (data.results || []).map((x) => x.listing_id);
      setSavedIds(ids);
    } catch (err) {
      console.warn('Failed to load saved IDs:', err);
    }
  };

  useEffect(() => {
    loadSavedIds();
  }, [isAuthenticated]);

  // Toggle Save handler
  const handleToggleSave = async (listingId) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }

    const isAlreadySaved = savedIds.includes(listingId);
    try {
      if (isAlreadySaved) {
        await removeSavedApi(listingId);
        setSavedIds((prev) => prev.filter((id) => id !== listingId));
        showToast('Removed from saved listings');
      } else {
        await saveListingApi(listingId);
        setSavedIds((prev) => [...prev, listingId]);
        showToast('Added to saved listings');
      }
    } catch (err) {
      console.error('Error toggling saved listing:', err);
      showToast(err.message || 'Error updating saved property');
    }
  };

  // URL Hash Routing Support: #/listings/:id or #/tab
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/listings/')) {
        const id = hash.replace('#/listings/', '');
        if (id) {
          try {
            const data = await fetchListingDetailApi(id);
            setSelectedListing(data);
          } catch (err) {
            console.error('Failed to load listing from URL:', err);
          }
        }
      } else if (hash === '#/rentals') {
        setActiveTab('rentals');
      } else if (hash === '#/projects') {
        setActiveTab('projects');
      } else if (hash === '#/saved') {
        setActiveTab('saved');
      } else if (hash === '#/insights') {
        setActiveTab('insights');
      } else if (hash === '#/listings' || hash === '') {
        setActiveTab('listings');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectListing = (listing) => {
    setSelectedListing(listing);
    window.location.hash = `#/listings/${listing.listing_id}`;
  };

  const handleCloseDetail = () => {
    setSelectedListing(null);
    window.location.hash = `#/${activeTab}`;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        savedCount={savedIds.length}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            color: '#f8fafc',
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <span style={{ color: '#ec4899' }}>✦</span> {toastMessage}
        </div>
      )}

      <main className="main-container" style={{ flex: 1 }}>
        {activeTab === 'listings' && (
          <ListingsView
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectListing={handleSelectListing}
          />
        )}

        {activeTab === 'rentals' && <RentalsView />}

        {activeTab === 'projects' && (
          <ProjectsView
            onSelectProject={(projectId) => {
              // Switch to projects tab
              setActiveTab('projects');
            }}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectListing={handleSelectListing}
          />
        )}

        {activeTab === 'insights' && <InsightsView />}
      </main>

      {/* Listing Detail Modal */}
      <ListingDetailModal
        listing={selectedListing}
        isSaved={selectedListing && savedIds.includes(selectedListing.listing_id)}
        onToggleSave={handleToggleSave}
        onClose={handleCloseDetail}
      />

      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            Ivy Homes Property Intelligence Platform · Hyderabad Engineering Internship
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Key: <code>IVY26-FECF9FEEEF8C</code></span>
            <span>Locality: <strong>Madhapur</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
