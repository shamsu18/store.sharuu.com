import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me().then(setAdmin).catch(() => setAdmin(null)).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const result = await api.login({ email, password });
    setAdmin(result);
    return result;
  };
  const logout = async () => { await api.logout(); setAdmin(null); };

  const value = useMemo(() => ({ admin, authenticated: Boolean(admin), loading, login, logout }), [admin, loading]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used inside AdminAuthProvider.');
  return context;
}
