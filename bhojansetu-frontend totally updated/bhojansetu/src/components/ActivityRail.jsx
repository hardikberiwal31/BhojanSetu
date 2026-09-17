import { useCountdown } from '../hooks/useCountdown';
import { formatRelative } from '../utils/format';

function RailRow({ entry }) {
  const { label, expired } = useCountdown(entry.expiresAt);
  return (
    <li
      className="border-b px-4 py-3 last:border-b-0"
      style={{ borderColor: 'var(--line)' }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
          style={{ background: `var(--${entry.tone})` }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[13px] font-semibold">{entry.title}</p>
            {entry.expiresAt && (
              <span
                className="mono shrink-0 text-[11px]"
                style={{ color: expired ? 'var(--critical)' : 'var(--text-faint)' }}
              >
                {label}
              </span>
            )}
          </div>
          <p className="truncate text-[12px]" style={{ color: 'var(--text-dim)' }}>
            {entry.detail}
          </p>
          {entry.sub && (
            <p className="truncate text-[11px]" style={{ color: 'var(--text-faint)' }}>
              {entry.sub}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Right-hand rail showing where every item on the board currently stands.
 * It refreshes with the page's polling cycle; the header states when, so
 * nobody reads it as a push stream it isn't.
 */
export default function ActivityRail({ entries = [], updatedAt, loading }) {
  return (
    <aside
      className="panel flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden"
      style={{ boxShadow: 'var(--shadow)' }}
    >
      <header
        className="flex items-baseline justify-between gap-2 border-b px-4 py-3"
        style={{ borderColor: 'var(--line)' }}
      >
        <h2 className="text-[13px] font-semibold">Board</h2>
        <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
          {loading ? 'refreshing' : updatedAt ? `updated ${formatRelative(updatedAt)}` : ''}
        </span>
      </header>

      {entries.length === 0 ? (
        <p className="px-4 py-6 text-[12px]" style={{ color: 'var(--text-faint)' }}>
          Nothing on the board yet. Items appear here the moment the backend returns them.
        </p>
      ) : (
        <ul className="thin-scroll flex-1 overflow-y-auto">
          {entries.map((e) => (
            <RailRow key={e.id} entry={e} />
          ))}
        </ul>
      )}
    </aside>
  );
}
