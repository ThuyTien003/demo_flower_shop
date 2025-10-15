import { useEffect, useMemo, useState } from 'react';
import { getProfile, login as apiLogin, register as apiRegister } from '@/services/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getProfile();
        setUser(res.data);
      } catch (error) {
        console.warn('Profile load failed:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const tk = res.data.token;
    localStorage.setItem('token', tk);
    setToken(tk);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await apiRegister(payload);
    const tk = res.data.token;
    localStorage.setItem('token', tk);
    setToken(tk);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
