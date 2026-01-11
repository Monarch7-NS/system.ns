
import { HistoryState, AuthResponse } from '../types';

// Changing from localhost to 127.0.0.1 can fix 1-2 second delays on some OS configurations (IPv6 lookup issues)
const API_URL = 'http://127.0.0.1:5000/api';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const api = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
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
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Failed to fetch: Check if server is running on localhost:5000');
      }
      throw error;
    }
  },

  register: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
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
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
         throw new Error('Failed to fetch: Check if server is running on localhost:5000');
      }
      throw error;
    }
  },

  syncData: async (token: string, history: HistoryState): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_URL}/data/sync`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ history }),
    });
    if (!res.ok) throw new Error('Sync failed');
    return res.json();
  },

  getData: async (token: string): Promise<{ history: HistoryState }> => {
    const res = await fetch(`${API_URL}/data`, {
      method: 'GET',
      headers: getHeaders(token),
    });
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
  }
};
