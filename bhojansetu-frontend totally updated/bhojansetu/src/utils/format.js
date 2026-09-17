// Pure display helpers. None of this computes matching, urgency, or status —
// those always come from the backend response. This file only formats what
// the backend already sent.

export function formatMinutes(mins) {
  if (mins === null || mins === undefined) return '—';
  if (mins <= 0) return 'Expired';
  if (mins < 60) return `${Math.round(mins)} min left`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m ? `${h}h ${m}m left` : `${h}h left`;
}

export function formatDistance(km) {
  if (km === null || km === undefined) return '—';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatRelative(ts) {
  if (!ts) return '';
  const secs = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function titleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function foodTypeLabel(type) {
  if (!type) return '—';
  const t = String(type).toLowerCase();
  if (t === 'veg') return 'Veg';
  if (t === 'non-veg') return 'Non-veg';
  if (t === 'mixed') return 'Mixed';
  return titleCase(t);
}
