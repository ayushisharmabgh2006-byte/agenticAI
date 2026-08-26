import { create } from 'zustand';
import { api, setAuthToken } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('agentflow_token');
    const savedUser = localStorage.getItem('agentflow_user');

    if (token) {
      setAuthToken(token);
      try {
        if (savedUser) {
          set({ user: JSON.parse(savedUser), token, isAuthenticated: true, isLoading: false });
        }
        const { data } = await api.get('/auth/me');
        if (data.user) {
          localStorage.setItem('agentflow_user', JSON.stringify(data.user));
          set({ user: data.user, token, isAuthenticated: true, isLoading: false });
        }
      } catch (err) {
        // Clear invalid token
        setAuthToken(null);
        localStorage.removeItem('agentflow_token');
        localStorage.removeItem('agentflow_user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      // Default to demo operator state for zero friction
      const demoOperator = {
        id: 'user-operator-1',
        name: 'Alex Rivera',
        email: 'operator@agentflow.io',
        role: 'operator'
      };
      set({ user: demoOperator, token: 'demo_token', isAuthenticated: true, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuthToken(data.token);
      localStorage.setItem('agentflow_token', data.token);
      localStorage.setItem('agentflow_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async ({ name, email, password, role }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      setAuthToken(data.token);
      localStorage.setItem('agentflow_token', data.token);
      localStorage.setItem('agentflow_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
