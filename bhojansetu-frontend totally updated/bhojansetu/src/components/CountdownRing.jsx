import { useCountdown } from '../hooks/useCountdown';

/**
 * The signature element of the board: a live expiry clock.
 *
 * The ring needs a denominator to draw an arc against. When the backend
 * sends preparedAt it uses the real prepared -> expires window; otherwise it
 * falls back to a two-hour dispatch window, so the arc reads as "how much of
 * the final two hours is left". The *number* in the middle is always the
 * true remaining time — only the arc is windowed.
 */
export default function CountdownRing({
  expiresAt,
  preparedAt,
  remainingMinutes,
  size = 62,
  tone,
}) {
  const { seconds, minutes, expired, label } = useCountdown(expiresAt, remainingMinutes);

  const DEFAULT_WINDOW_S = 120 * 60;
  let windowSeconds = DEFAULT_WINDOW_S;
  if (preparedAt && expiresAt) {
    const span = new Date(expiresAt).getTime() - new Date(preparedAt).getTime();
    if (span > 0) windowSeconds = span / 1000;
  }

  const fraction = seconds === null ? 0 : Math.min(1, Math.max(0, seconds / windowSeconds));

  // Colour follows the clock, not a guess: under 30 minutes is the threshold
  // the spec calls out for urgent dispatch.
  const autoTone = expired ? 'critical' : minutes < 30 ? 'critical' : minutes < 90 ? 'high' : 'ok';
  const colour = `var(--${tone || autoTone})`;

  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={expired ? 'Expired' : `${label} until expiry`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          style={{ transition: 'stroke-dashoffset .9s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="mono text-[13px] font-semibold leading-none"
          style={{ color: colour }}
        >
          {expired ? '00:00' : label}
        </span>
        <span className="mt-0.5 text-[9px] leading-none" style={{ color: 'var(--text-faint)' }}>
          {expired ? 'expired' : 'left'}
        </span>
      </div>
    </div>
  );
}
