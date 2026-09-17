import { toneVars, DELIVERY_TONE, DELIVERY_LABEL, FOOD_STATUS_TONE, FOOD_STATUS_LABEL } from '../utils/status';

/**
 * Renders a backend status value. `kind` picks which vocabulary it belongs
 * to. Unknown values fall through and are shown verbatim rather than hidden,
 * so a backend change is visible instead of silently swallowed.
 */
export default function StatusPill({ status, kind = 'delivery', showRaw = false }) {
  if (!status) return <span style={{ color: 'var(--text-faint)' }}>—</span>;

  const tone =
    (kind === 'delivery' ? DELIVERY_TONE[status] : FOOD_STATUS_TONE[status]) || 'idle';
  const label =
    (kind === 'delivery' ? DELIVERY_LABEL[status] : FOOD_STATUS_LABEL[status]) || status;
  const { fg, bg } = toneVars(tone);
  const live = status === 'IN_TRANSIT' || status === 'PICKED_UP';

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[2px] px-2 py-1 text-[11px] font-semibold"
      style={{ background: bg, color: fg }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? 'beacon' : ''}`}
        style={{ background: fg, color: fg }}
        aria-hidden="true"
      />
      {label}
      {showRaw && (
        <span className="mono opacity-60" style={{ fontSize: 10 }}>
          {status}
        </span>
      )}
    </span>
  );
}
