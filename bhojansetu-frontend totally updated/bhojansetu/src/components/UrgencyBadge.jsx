import { URGENCY_TONE, toneVars } from '../utils/status';

/** Urgency is calculated by the backend. This only paints it. */
export default function UrgencyBadge({ urgency }) {
  if (!urgency) return null;
  const tone = URGENCY_TONE[urgency] || 'idle';
  const { fg, bg } = toneVars(tone);
  return (
    <span
      className="inline-flex items-center rounded-[2px] px-1.5 py-0.5 text-[10px] font-bold tracking-wide"
      style={{ background: bg, color: fg }}
    >
      {urgency}
    </span>
  );
}
