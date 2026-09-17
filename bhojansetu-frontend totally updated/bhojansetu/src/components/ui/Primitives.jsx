import { toneVars } from '../../utils/status';

/** Small categorical label — food type, language, dietary tag. */
export function Chip({ children, tone }) {
  const style = tone
    ? { background: toneVars(tone).bg, color: toneVars(tone).fg, borderColor: 'transparent' }
    : { background: 'var(--surface-2)', color: 'var(--text-dim)', borderColor: 'var(--line)' };
  return (
    <span
      className="inline-flex items-center rounded-[2px] border px-1.5 py-0.5 text-[11px] font-medium"
      style={style}
    >
      {children}
    </span>
  );
}

/** A labelled fact. Replaces the "A · B · C" meta string with a real grid. */
export function Fact({ label, value, mono = false }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] leading-tight" style={{ color: 'var(--text-faint)' }}>
        {label}
      </div>
      <div className={`truncate text-[13px] font-medium ${mono ? 'mono' : ''}`}>{value}</div>
    </div>
  );
}

export function Skeleton({ h = 14, w = '100%', className = '' }) {
  return <div className={`skeleton ${className}`} style={{ height: h, width: w }} />;
}

export function SkeletonChit() {
  return (
    <div className="chit p-4" style={{ '--stripe': 'var(--line)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton h={18} w="45%" />
          <Skeleton h={12} w="65%" />
        </div>
        <Skeleton h={44} w={44} className="rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton h={9} w="70%" />
            <Skeleton h={13} w="85%" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A single headline number. `trend` and `note` are only rendered when the
 * caller actually has them — no invented "+18% this month" when the backend
 * doesn't return a trend.
 */
export function MetricCard({ label, value, note, tone, loading }) {
  return (
    <div className="panel p-4" style={{ boxShadow: 'var(--shadow)' }}>
      <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
        {label}
      </div>
      {loading ? (
        <div className="mt-2"><Skeleton h={28} w="55%" /></div>
      ) : (
        <div
          className="mono mt-1 text-2xl font-semibold leading-none"
          style={{ color: tone ? `var(--${tone})` : 'var(--text)' }}
        >
          {value}
        </div>
      )}
      {note && !loading && (
        <div className="mt-1.5 text-[11px]" style={{ color: 'var(--text-faint)' }}>
          {note}
        </div>
      )}
    </div>
  );
}
