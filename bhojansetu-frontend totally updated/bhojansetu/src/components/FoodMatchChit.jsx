import CountdownRing from './CountdownRing';
import UrgencyBadge from './UrgencyBadge';
import TrustBadge from './TrustBadge';
import { Chip, Fact } from './ui/Primitives';
import { useCountdown } from '../hooks/useCountdown';
import { URGENCY_TONE } from '../utils/status';
import { formatDistance, formatTime, foodTypeLabel } from '../utils/format';

/**
 * One matched food item, as a dispatch chit.
 *
 * Every number shown here — matchScore, distanceKm, urgency, matchFactors,
 * matchReasons — is rendered exactly as the backend sent it. The frontend
 * does not score, rank, or re-derive anything.
 */
export default function FoodMatchChit({ food, onClaim, claiming, disabled, disabledReason, error }) {
  const {
    foodName,
    quantity,
    foodType,
    providerName,
    distanceKm,
    expiresAt,
    preparedAt,
    remainingMinutes,
    urgency,
    matchScore,
    matchFactors = {},
    matchReasons = [],
    providerTrust,
  } = food;

  const { minutes, expired } = useCountdown(expiresAt, remainingMinutes);
  const tone = URGENCY_TONE[urgency] || 'idle';
  const critical = !expired && minutes !== null && minutes < 30;

  const factorRows = [
    ['Distance', matchFactors.distance],
    ['Quantity', matchFactors.quantity],
    ['Urgency', matchFactors.urgency],
    ['Compatibility', matchFactors.foodCompatibility],
  ].filter(([, v]) => v);

  return (
    <article
      className={`chit p-4 ${critical ? 'chit-expiring' : ''}`}
      style={{ '--stripe': `var(--${tone})`, boxShadow: 'var(--shadow)' }}
    >
      <div className="flex items-start gap-4">
        <CountdownRing
          expiresAt={expiresAt}
          preparedAt={preparedAt}
          remainingMinutes={remainingMinutes}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="h-board text-[17px]">{foodName}</h3>
            <UrgencyBadge urgency={urgency} />
            <Chip>{foodTypeLabel(foodType)}</Chip>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-4">
            <Fact label="Servings" value={quantity ?? '—'} mono />
            <Fact label="Distance" value={formatDistance(distanceKm)} mono />
            <Fact label="From" value={providerName || '—'} />
            <Fact label="Expires" value={formatTime(expiresAt)} mono />
          </div>
        </div>

        {/* Match score, shown as the backend's own number. */}
        <div className="shrink-0 text-right">
          <div
            className="mono text-[30px] font-semibold leading-none"
            style={{ color: 'var(--text)' }}
          >
            {matchScore ?? '—'}{matchScore !== null && matchScore !== undefined ? '%' : ''}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
            match score
          </div>
          <div
            className="mt-1.5 h-1 w-14 overflow-hidden rounded-[1px]"
            style={{ background: 'var(--surface-3)' }}
          >
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, Math.max(0, matchScore ?? 0))}%`,
                background: 'var(--ok)',
              }}
            />
          </div>
        </div>
      </div>

      {(matchReasons.length > 0 || factorRows.length > 0) && (
        <div
          className="mt-4 grid gap-4 border-t pt-3 sm:grid-cols-2"
          style={{ borderColor: 'var(--line)' }}
        >
          {matchReasons.length > 0 && (
            <div>
              <p className="mb-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                Why the engine picked this
              </p>
              <ul className="space-y-1">
                {matchReasons.map((reason, i) => (
                  <li key={i} className="flex gap-1.5 text-[12px]">
                    <span style={{ color: 'var(--ok)' }} aria-hidden="true">
                      ✓
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {factorRows.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 self-start">
              {factorRows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    {k}
                  </dt>
                  <dd className="text-[12px] font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {food.description && (
        <p
          className="mt-3 border-t pt-3 text-[12px] leading-snug"
          style={{ borderColor: 'var(--line)', color: 'var(--text-dim)' }}
        >
          {food.description}
        </p>
      )}

      {providerTrust && (
        <div className="mt-3">
          <p className="mb-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {providerName || 'Provider'}&rsquo;s track record
          </p>
          <TrustBadge trust={providerTrust} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onClaim}
          disabled={disabled || claiming || expired}
          title={disabled ? disabledReason : undefined}
          className={`btn ${critical ? 'btn-urgent' : 'btn-go'}`}
        >
          {claiming ? 'Claiming…' : expired ? 'Expired' : `Claim ${quantity ?? ''} servings`}
        </button>
        {critical && (
          <span className="text-[12px] font-medium" style={{ color: 'var(--critical)' }}>
            Under 30 minutes — claim now or it goes to waste.
          </span>
        )}
        {error && (
          <span className="text-[12px] font-medium" style={{ color: 'var(--critical)' }}>
            {error}
          </span>
        )}
      </div>
    </article>
  );
}
