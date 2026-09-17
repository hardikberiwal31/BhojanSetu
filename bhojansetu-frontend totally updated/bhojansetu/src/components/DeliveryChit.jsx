import StatusPill from './StatusPill';
import DeliveryTrack from './DeliveryTrack';
import TrustBadge from './TrustBadge';
import { Chip, Fact } from './ui/Primitives';
import { DELIVERY_TONE } from '../utils/status';
import { foodTypeLabel } from '../utils/format';

/**
 * Shared chit for anything mid-delivery — used by both the volunteer board
 * and the NGO claims board. Actions are passed in by the page, because the
 * two roles call different endpoints.
 */
export default function DeliveryChit({
  title,
  foodType,
  quantity,
  facts = [],
  status,
  trust,
  trustLabel,
  children,
  error,
}) {
  const tone = DELIVERY_TONE[status] || 'idle';

  return (
    <article
      className="chit p-4"
      style={{ '--stripe': `var(--${tone})`, boxShadow: 'var(--shadow)' }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="h-board text-[16px]">{title}</h3>
            {foodType && <Chip>{foodTypeLabel(foodType)}</Chip>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5 sm:grid-cols-3">
            <Fact label="Servings" value={quantity ?? '—'} mono />
            {facts.map((f) => (
              <Fact key={f.label} label={f.label} value={f.value} mono={f.mono} />
            ))}
          </div>
        </div>
        <StatusPill status={status} showRaw />
      </div>

      <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
        <DeliveryTrack status={status} />
      </div>

      {trust && (
        <div className="mt-3">
          <p className="mb-1 text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {trustLabel || 'Track record'}
          </p>
          <TrustBadge trust={trust} />
        </div>
      )}

      {(children || error) && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {children}
          {error && (
            <span className="text-[12px] font-medium" style={{ color: 'var(--critical)' }}>
              {error}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
