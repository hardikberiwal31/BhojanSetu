import { DELIVERY_STATUS } from '../utils/constants';
import { DELIVERY_LABEL, DELIVERY_TONE } from '../utils/status';

/**
 * The delivery lifecycle as a segmented track rather than a numbered stepper.
 * The stages are a genuine sequence, so the ordering is the information; the
 * current stage is the only one labelled, which keeps a dense chit readable.
 */
export default function DeliveryTrack({ status, compact = false }) {
  const current = DELIVERY_STATUS.indexOf(status);
  const tone = DELIVERY_TONE[status] || 'idle';

  return (
    <div aria-label={`Delivery stage: ${DELIVERY_LABEL[status] || status || 'unknown'}`}>
      <div className="flex items-center gap-1" role="presentation">
        {DELIVERY_STATUS.map((step, i) => {
          const reached = current >= 0 && i <= current;
          const isCurrent = i === current;
          return (
            <div
              key={step}
              title={DELIVERY_LABEL[step]}
              className="h-1.5 flex-1 rounded-[1px]"
              style={{
                background: reached ? `var(--${tone})` : 'var(--surface-3)',
                opacity: reached && !isCurrent ? 0.55 : 1,
              }}
            />
          );
        })}
      </div>
      {!compact && (
        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <span style={{ color: 'var(--text-dim)' }}>
            {DELIVERY_LABEL[status] || status || 'Not started'}
          </span>
          <span className="mono" style={{ color: 'var(--text-faint)' }}>
            {current >= 0 ? current + 1 : 0}/{DELIVERY_STATUS.length}
          </span>
        </div>
      )}
    </div>
  );
}
