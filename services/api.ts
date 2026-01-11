
import { HistoryState, AuthResponse } from '../types';

// Default to localhost, but allow overriding via localStorage for phone/remote access
const DEFAULT_API_URL = 'http://127.0.0.1:5000/api';

export const getApiUrl = () => {
  return localStorage.getItem('system_api_url') || DEFAULT_API_URL;
};

export const setApiUrl = (url: string) => {
  // Ensure no trailing slash
  const cleanUrl = url.replace(/\/$/, '');
  localStorage.setItem('system_api_url', cleanUrl);
};

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const api = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Login failed');
      }
      return res.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && (error.message === 'Failed to fetch' || error.message.includes('Network'))) {
        throw new Error(`Connection refused to ${getApiUrl()}. Check Server Settings.`);
      }
      throw error;
    }
  },

  register: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Registration failed');
      }
      return res.json();
    } catch (error: any) {
       if (error.name === 'TypeError' && (error.message === 'Failed to fetch' || error.message.includes('Network'))) {
        throw new Error(`Connection refused to ${getApiUrl()}. Check Server Settings.`);
      }
      throw error;
    }
  },

  syncData: async (token: string, history: HistoryState): Promise<{ success: boolean }> => {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/data/sync`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ history }),
    });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
  },

  getData: async (token: string): Promise<{ history: HistoryState }> => {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/data`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
  }
};
