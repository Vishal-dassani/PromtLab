const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const authService = {
  // Check backend server health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        credentials: 'include'
      });
      if (!res.ok) return { online: false };
      const json = await res.json();
      return { online: true, ...json.data };
    } catch {
      return { online: false };
    }
  },

  // Get currently authenticated user
  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  },

  // Log in with email & password
  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Login failed');
    }
    return json.data;
  },

  // Register new account
  async register({ name, email, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Registration failed');
    }
    return json.data;
  },

  // Log out
  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // ignore network errors on logout
    }
    return true;
  }
};
