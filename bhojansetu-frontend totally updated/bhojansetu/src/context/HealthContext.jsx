import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Tracks whether the FastAPI backend is actually answering.
 *
 * This is deliberately NOT a fake WebSocket heartbeat. Every real request
 * that goes through useApiData reports its outcome here, so the status
 * indicator in the command bar reflects requests that genuinely happened.
 */
const HealthContext = createContext(null);

export function HealthProvider({ children }) {
  const [state, setState] = useState({ status: 'unknown', lastOkAt: null });

  const reportOk = useCallback(() => {
    setState({ status: 'live', lastOkAt: Date.now() });
  }, []);

  const reportDown = useCallback(() => {
    setState((s) => ({ status: 'down', lastOkAt: s.lastOkAt }));
  }, []);

  const value = useMemo(
    () => ({ ...state, reportOk, reportDown }),
    [state, reportOk, reportDown],
  );

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be used within HealthProvider');
  return ctx;
}
