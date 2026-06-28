import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, clearToken } from '../lib/storage';
import { apiRoutes } from '../lib/apiRoutes';
import { api } from '../lib/api';





export type AppUser = {
  id: string;
  name: string;
  email: string;
  theme?: 'light' | 'dark';
  profileImageUrl?: string;
};

type AuthContextValue = {
  user: AppUser | null;
  token: string | null;
  login: (token: string, user: AppUser) => void;
  logout: () => void;
  refreshUserFromToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AppUser | null>(null);

  const logout = () => {
    clearToken();

    setTokenState(null);
    setUser(null);
    navigate('/login', { replace: true });
  };

  const login = (nextToken: string, nextUser: AppUser) => {
    // persist token for axios interceptors + protected routes
    localStorage.setItem('tf_token', nextToken);
    setTokenState(nextToken);
    setUser(nextUser);
  };

  const refreshUserFromToken = async () => {
    const t = getToken();
    if (!t) return;

    try {
      const res = await api.get(apiRoutes.me);
      if (res.data?.success) setUser(res.data.user);
      else setUser(null);
    } catch (e) {
      // invalid/expired
      logout();
    }
  };

  useEffect(() => {
    if (token) refreshUserFromToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ user, token, login, logout, refreshUserFromToken }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

