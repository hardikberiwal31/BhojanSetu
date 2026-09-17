import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { demoLogin, listDemoAccounts } from '../services/api/auth';

const AuthContext = createContext(null);

const STORAGE_KEY = 'bhojansetu:session';
const USER_ID_KEY = 'bhojansetu:userId';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real seeded demo accounts (actual Mongo _id values from seed.py), fetched
  // once on load. The login screen and the role switcher both pick ids from
  // this list instead of guessing a fake one — see GET /api/auth/demo-accounts.
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listDemoAccounts()
      .then((list) => {
        if (!cancelled) setAccounts(list || []);
      })
      .catch((err) => {
        if (!cancelled) setAccountsError(err);
      })
      .finally(() => {
        if (!cancelled) setAccountsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const accountsByRole = useCallback(
    (role) => accounts.filter((a) => a.role === role),
    [accounts],
  );

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(USER_ID_KEY, session.userId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_ID_KEY);
    }
  }, [session]);

  const login = useCallback(async (userId, role) => {
    setLoading(true);
    setError(null);
    try {
      // Store userId first so X-User-Id is attached to the demo-login call
      // itself, matching the backend contract.
      localStorage.setItem(USER_ID_KEY, userId);
      const result = await demoLogin(userId, role);
      const resolved = { userId, role, ...(result || {}) };
      setSession(resolved);
      return resolved;
    } catch (err) {
      setError(err);
      localStorage.removeItem(USER_ID_KEY);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        login,
        logout,
        loading,
        error,
        accounts,
        accountsLoading,
        accountsError,
        accountsByRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

