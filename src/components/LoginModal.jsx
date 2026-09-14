import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS, DEMO_PASSWORD } from '../api';

export default function LoginModal({ isOpen, onClose }) {
  const { login, isLoading, authError } = useAuth();
  const [email, setEmail] = useState('demo1@ivy.homes');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  const handleQuickDemoSelect = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    try {
      await login(demoEmail, DEMO_PASSWORD);
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Login failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Lock size={26} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem' }}>Welcome Back</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Authenticate against the Ivy Homes live session server
          </p>
        </div>

        {/* Quick Demo Accounts Selection */}
        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600, marginBottom: '0.6rem' }}>
            Quick-Select Demo Account
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {DEMO_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                className="btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.2rem',
                  justifyContent: 'center',
                  background: email === u.email ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                  borderColor: email === u.email ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'
                }}
                onClick={() => handleQuickDemoSelect(u.email)}
              >
                {u.email.split('@')[0]}
              </button>
            ))}
          </div>
        </div>

        {(localError || authError) && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{localError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="filter-group">
            <label className="filter-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
              <input
                type="email"
                required
                className="filter-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ivy.homes"
              />
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
              <input
                type="password"
                required
                className="filter-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          Real auth flow with automatic 15-minute token rotation surviving 30+ minutes.
        </div>
      </div>
    </div>
  );
}
