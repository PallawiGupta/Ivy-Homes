// Centralized API Client for Ivy Homes

export const API_BASE = 'https://solve.ivy.homes';
export const API_KEY = 'IVY26-FECF9FEEEF8C';

export const DEMO_USERS = [
  { email: 'demo1@ivy.homes', label: 'Demo User 1' },
  { email: 'demo2@ivy.homes', label: 'Demo User 2' },
  { email: 'demo3@ivy.homes', label: 'Demo User 3' },
];

export const DEMO_PASSWORD = 'dee4ea5948';

/**
 * Executes an authenticated API request with auto-retry on 401 if refresh token is available.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = localStorage.getItem('ivy_access_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    console.error(`Network error requesting ${url}:`, err);
    throw err;
  }

  // Handle Token Expiry & Automatic Silent Refresh
  if (response.status === 401 && !options._isRetry) {
    const refreshToken = localStorage.getItem('ivy_refresh_token');
    if (refreshToken) {
      try {
        console.log('[API] 401 received, attempting silent refresh with refresh_token...');
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem('ivy_access_token', refreshData.access_token);
          if (refreshData.refresh_token) {
            localStorage.setItem('ivy_refresh_token', refreshData.refresh_token);
          }
          headers['Authorization'] = `Bearer ${refreshData.access_token}`;
          return apiFetch(endpoint, { ...options, headers, _isRetry: true });
        }
      } catch (refreshErr) {
        console.warn('[API] Silent refresh failed:', refreshErr);
      }
    }
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch (_) {
      // non-json body
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Logs in with credentials.
 */
export async function loginApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Login failed');
  }

  return res.json();
}

/**
 * Refreshes an existing session.
 */
export async function refreshApi(refreshToken) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!res.ok) {
    throw new Error('Refresh token invalid or expired');
  }

  return res.json();
}

/**
 * Fetches listings with offset-based pagination and optional server query params.
 */
export async function fetchListingsApi({ limit = 50, offset = 0, locality, bhk, property_type, sort_by, order } = {}) {
  const params = new URLSearchParams();
  params.append('limit', limit);
  params.append('offset', offset);
  if (locality) params.append('locality', locality);
  if (bhk) params.append('bhk', bhk);
  if (property_type) params.append('property_type', property_type);
  if (sort_by) params.append('sort_by', sort_by);
  if (order) params.append('order', order);

  return apiFetch(`/v1/listings?${params.toString()}`);
}

/**
 * Fetches single listing details (using the real plural endpoint /v1/listings/:id).
 */
export async function fetchListingDetailApi(listingId) {
  return apiFetch(`/v1/listings/${listingId}`);
}

/**
 * Fetches rentals.
 */
export async function fetchRentalsApi({ limit = 50, offset = 0, locality, bhk, furnishing, sort_by, order } = {}) {
  const params = new URLSearchParams();
  params.append('limit', limit);
  params.append('offset', offset);
  if (locality) params.append('locality', locality);
  if (bhk) params.append('bhk', bhk);
  if (furnishing) params.append('furnishing', furnishing);
  if (sort_by) params.append('sort_by', sort_by);
  if (order) params.append('order', order);

  return apiFetch(`/v1/rentals?${params.toString()}`);
}

/**
 * Fetches builder projects.
 */
export async function fetchProjectsApi({ limit = 50, offset = 0, locality, project_status, sort_by, order } = {}) {
  const params = new URLSearchParams();
  params.append('limit', limit);
  params.append('offset', offset);
  if (locality) params.append('locality', locality);
  if (project_status) params.append('project_status', project_status);
  if (sort_by) params.append('sort_by', sort_by);
  if (order) params.append('order', order);

  return apiFetch(`/v1/projects?${params.toString()}`);
}

/**
 * Fetches saved listings using the active /v1/saved endpoint.
 */
export async function fetchSavedApi() {
  return apiFetch('/v1/saved');
}

/**
 * Saves a listing with the required payload { listing_id: "..." }.
 */
export async function saveListingApi(listingId) {
  return apiFetch('/v1/saved', {
    method: 'POST',
    body: JSON.stringify({ listing_id: listingId })
  });
}

/**
 * Removes a saved listing.
 */
export async function removeSavedApi(listingId) {
  return apiFetch(`/v1/saved/${listingId}`, {
    method: 'DELETE'
  });
}
