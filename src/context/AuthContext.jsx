import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

const fallbackAuth = {
  user: null,
  ready: true,
  login() {},
  async logout() {},
  updateUser() {},
  async refresh() {},
};

const AuthContext =
  (import.meta.hot?.data && import.meta.hot.data.AuthContext) ||
  createContext(fallbackAuth);

if (import.meta.hot) {
  import.meta.hot.data.AuthContext = AuthContext;
}

function withoutHeavyPayload(value) {
  if (typeof value === 'string' && value.startsWith('data:')) return '';
  if (Array.isArray(value)) return value.map(withoutHeavyPayload);
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === 'file' || key === 'messages') continue;
      next[key] = withoutHeavyPayload(val);
    }
    return next;
  }
  return value;
}

function writeUserCache(user) {
  try {
    if (!user) {
      localStorage.removeItem('nidus_user');
      localStorage.removeItem('nidus_token');
      return;
    }
    localStorage.setItem('nidus_user', JSON.stringify(withoutHeavyPayload(user)));
  } catch {
    /* cache opcional */
  }
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem('nidus_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [ready, setReady] = useState(false);

  const persist = useCallback((nextUser) => {
    writeUserCache(nextUser);
    setUser(nextUser);
    window.dispatchEvent(new Event('nidus-user-updated'));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch('/api/me');
      persist(data.user);
    } catch {
      persist(null);
    } finally {
      setReady(true);
    }
  }, [persist]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback((nextUser) => {
    persist(nextUser);
  }, [persist]);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    persist(null);
  }, [persist]);

  const updateUser = useCallback((values) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...values };
      writeUserCache(next);
      window.dispatchEvent(new Event('nidus-user-updated'));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, logout, updateUser, refresh }),
    [user, ready, login, logout, updateUser, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext) || fallbackAuth;
}
