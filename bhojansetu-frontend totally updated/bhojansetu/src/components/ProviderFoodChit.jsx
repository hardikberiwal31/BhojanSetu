import CountdownRing from './CountdownRing';
import StatusPill from './StatusPill';
import UrgencyBadge from './UrgencyBadge';
import DeliveryTrack from './DeliveryTrack';
import { Chip, Fact } from './ui/Primitives';
import { FOOD_STATUS_TONE } from '../utils/status';
import { formatTime, foodTypeLabel } from '../utils/format';

/** One donation the provider posted, with its live status from the backend. */
export default function ProviderFoodChit({ food }) {
  const {
    foodName,
    quantity,
    foodType,
    preparedAt,
    expiresAt,
    urgency,
    status,
    ngo,
    deliveryStatus,
  } = food;

  const tone = FOOD_STATUS_TONE[status] || 'idle';
  const settled = status === 'DELIVERED';

  return (
    <article
      className="chit p-4"
      style={{ '--stripe': `var(--${tone})`, boxShadow: 'var(--shadow)' }}
    >
      <div className="flex items-start gap-4">
        {!settled && (
          <CountdownRing expiresAt={expiresAt} preparedAt={preparedAt} size={54} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="h-board text-[16px]">{foodName}</h3>
            <Chip>{foodTypeLabel(foodType)}</Chip>
            {!settled && <UrgencyBadge urgency={urgency} />}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
            <Fact label="Servings" value={quantity ?? '—'} mono />
            <Fact label="Expires" value={formatTime(expiresAt)} mono />
            <Fact label="Claimed by" value={ngo || 'Not claimed yet'} />
          </div>
        </div>

        <StatusPill status={status} kind="food" />
      </div>

      {deliveryStatus && (
        <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
          <DeliveryTrack status={deliveryStatus} />
        </div>
      )}
    </article>
  );
}
