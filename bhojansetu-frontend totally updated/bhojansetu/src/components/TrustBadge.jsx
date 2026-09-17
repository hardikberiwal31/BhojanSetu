/**
 * Trust/reliability readout for a provider, NGO or volunteer.
 *
 * NOT part of the backend contract yet. Renders only when the caller
 * actually has trust data — never fabricated, never estimated on the
 * frontend. See README "Trust score — backend fields needed" for the
 * exact shape the backend should return once this ships:
 *
 *   trust: {
 *     score: number,              // 0-100
 *     successfulPickups: number,
 *     cancellationRate: number,   // 0-1
 *     noShowRate: number,         // 0-1
 *   }
 */
export default function TrustBadge({ trust, compact = false }) {
  if (!trust || trust.score === null || trust.score === undefined) return null;

  const tone = trust.score >= 85 ? 'ok' : trust.score >= 60 ? 'high' : 'critical';
  const pct = (n) => (n === null || n === undefined ? '—' : `${Math.round(n * 100)}%`);

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 text-[11px] font-semibold"
        style={{ background: `var(--${tone}-bg)`, color: `var(--${tone})` }}
        title={`${trust.successfulPickups ?? 0} successful pickups · ${pct(trust.cancellationRate)} cancelled · ${pct(trust.noShowRate)} no-show`}
      >
        Trust {trust.score}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]" style={{ color: 'var(--text-dim)' }}>
      <span
        className="mono inline-flex items-center gap-1.5 rounded-[2px] px-2 py-0.5 font-semibold"
        style={{ background: `var(--${tone}-bg)`, color: `var(--${tone})` }}
      >
        Trust {trust.score}/100
      </span>
      {trust.successfulPickups !== undefined && <span>{trust.successfulPickups} pickups</span>}
      {trust.cancellationRate !== undefined && <span>{pct(trust.cancellationRate)} cancelled</span>}
      {trust.noShowRate !== undefined && <span>{pct(trust.noShowRate)} no-show</span>}
    </div>
  );
}
