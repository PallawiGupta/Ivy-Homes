import React from 'react';
import { Home, Building2, Key, Bookmark, BarChart3, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../api';

export default function Navbar({ activeTab, setActiveTab, savedCount = 0, onOpenLogin }) {
  const { user, isAuthenticated, logout, login, lastRefreshedAt } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('listings')}>
        <div className="nav-logo-icon">
          <Home size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="nav-title">Ivy Homes</span>
            <span className="nav-city-tag">Hyderabad</span>
          </div>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          <Home size={16} />
          Sale Listings
        </button>

        <button
          className={`nav-btn ${activeTab === 'rentals' ? 'active' : ''}`}
          onClick={() => setActiveTab('rentals')}
        >
          <Key size={16} />
          Rentals
        </button>

        <button
          className={`nav-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Building2 size={16} />
          Projects
        </button>

        <button
          className={`nav-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={16} />
          Saved
          {savedCount > 0 && (
            <span style={{
              background: '#ec4899',
              color: 'white',
              fontSize: '0.7rem',
              padding: '0.1rem 0.45rem',
              borderRadius: '9999px',
              fontWeight: 'bold'
            }}>
              {savedCount}
            </span>
          )}
        </button>

        <button
          className={`nav-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <BarChart3 size={16} />
          Insights & Audit
        </button>
      </nav>

      <div className="nav-actions">
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Quick Switch Dropdown for Demo Accounts */}
            <select
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#f8fafc',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
              value={user?.email || 'demo1@ivy.homes'}
              onChange={(e) => login(e.target.value)}
              title="Switch between the 3 demo accounts"
            >
              {DEMO_USERS.map((u) => (
                <option key={u.email} value={u.email} style={{ background: '#101522', color: '#fff' }}>
                  {u.email}
                </option>
              ))}
            </select>

            <div className="user-pill" title={`Session active. Auto-refreshes every 12 mins. Last refresh: ${lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString() : 'Initial'}`}>
              <div className="user-status-dot" />
              <User size={14} style={{ opacity: 0.8 }} />
              <span style={{ fontWeight: 600 }}>{user?.email?.split('@')[0]}</span>
            </div>

            <button
              onClick={logout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.4rem',
                borderRadius: '6px'
              }}
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenLogin}>
            Log In
          </button>
        )}
      </div>
    </header>
  );
}
