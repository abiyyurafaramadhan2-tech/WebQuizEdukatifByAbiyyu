import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('qg_user');
    const token = localStorage.getItem('qg_token');
    if (saved && token) {
      setUser(JSON.parse(saved));
      // Refresh user data
      api.get('/auth/me').then(r => {
        setUser(r.data);
        localStorage.setItem('qg_user', JSON.stringify(r.data));
      }).catch(() => {
        localStorage.removeItem('qg_token');
        localStorage.removeItem('qg_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('qg_token', res.data.token);
    localStorage.setItem('qg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('qg_token', res.data.token);
    localStorage.setItem('qg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('qg_token');
    localStorage.removeItem('qg_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data);
    localStorage.setItem('qg_user', JSON.stringify(res.data));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus di dalam AuthProvider');
  return ctx;
};
