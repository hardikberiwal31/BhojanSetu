import { useCallback, useEffect, useRef, useState } from 'react';
import { useDemoMode } from '../context/DemoModeContext';
import { useHealth } from '../context/HealthContext';
import { NetworkUnavailableError } from '../services/api/client';

/**
 * Runs `fetcher()` against the real backend.
 *
 * - Polls on an interval so the board reflects backend state changes without
 *   a manual refresh (the spec asks for polling, not WebSocket plumbing).
 * - Reports every outcome to HealthContext so the live/offline indicator is
 *   based on real requests.
 * - Falls back to `mockData` ONLY when demo mode is explicitly on and the
 *   backend is unreachable. Callers render <DemoBanner /> in that case.
 */
export function useApiData(fetcher, mockData, deps = [], { pollMs = 15000 } = {}) {
  const { demoMode } = useDemoMode();
  const { reportOk, reportDown } = useHealth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [usedMock, setUsedMock] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const firstLoad = useRef(true);

  const load = useCallback(async () => {
    if (firstLoad.current) setLoading(true);
    else setRefreshing(true);
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
      setUsedMock(false);
      setUpdatedAt(Date.now());
      reportOk();
    } catch (err) {
      if (err instanceof NetworkUnavailableError) {
        reportDown();
        if (demoMode) {
          setData(mockData);
          setUsedMock(true);
          setError(null);
          setUpdatedAt(Date.now());
        } else {
          setError(err);
          setData(null);
        }
      } else {
        // The server answered, it just said no — the backend is up.
        reportOk();
        setError(err);
        if (firstLoad.current) setData(null);
      }
    } finally {
      firstLoad.current = false;
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!pollMs) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  return { data, loading, refreshing, error, usedMock, updatedAt, refetch: load };
}
