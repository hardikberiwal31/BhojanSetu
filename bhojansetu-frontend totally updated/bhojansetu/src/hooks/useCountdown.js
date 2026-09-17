import { useEffect, useState } from 'react';

/**
 * Live countdown to a backend-supplied expiry timestamp.
 *
 * The backend owns urgency and remainingMinutes. This hook does NOT decide
 * urgency — it only re-renders the clock between polls so the number on
 * screen isn't stale by 30 seconds. `fallbackMinutes` seeds the display from
 * the backend's own remainingMinutes when expiresAt is missing.
 */
export function useCountdown(expiresAt, fallbackMinutes) {
  const target = expiresAt ? new Date(expiresAt).getTime() : null;

  const compute = () => {
    if (target && !Number.isNaN(target)) {
      return Math.max(0, Math.floor((target - Date.now()) / 1000));
    }
    if (fallbackMinutes !== null && fallbackMinutes !== undefined) {
      return Math.max(0, Math.round(fallbackMinutes * 60));
    }
    return null;
  };

  const [seconds, setSeconds] = useState(compute);

  useEffect(() => {
    setSeconds(compute());
    if (!target || Number.isNaN(target)) return undefined;
    const id = setInterval(() => setSeconds(compute()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, fallbackMinutes]);

  const expired = seconds !== null && seconds <= 0;
  const minutes = seconds === null ? null : Math.floor(seconds / 60);

  return {
    seconds,
    minutes,
    expired,
    label: formatClock(seconds),
  };
}

function formatClock(seconds) {
  if (seconds === null) return '—';
  if (seconds <= 0) return 'expired';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
