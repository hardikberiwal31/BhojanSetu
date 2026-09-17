import { SkeletonChit } from './ui/Primitives';

export function LoadingChits({ count = 3 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonChit key={i} />
      ))}
    </div>
  );
}

/** An empty board is an invitation to act, not a shrug. */
export function EmptyState({ title, hint, action }) {
  return (
    <div
      className="rounded-[3px] border border-dashed px-6 py-12 text-center"
      style={{ borderColor: 'var(--line-strong)' }}
    >
      <p className="h-board text-[17px]">{title}</p>
      {hint && (
        <p className="mx-auto mt-1.5 max-w-[46ch] text-[13px]" style={{ color: 'var(--text-dim)' }}>
          {hint}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ error, onRetry }) {
  const isNetwork = error?.name === 'NetworkUnavailableError';
  return (
    <div
      className="flex flex-wrap items-start justify-between gap-4 rounded-[3px] border-l-[3px] px-4 py-3"
      style={{
        background: 'var(--critical-bg)',
        borderColor: 'var(--critical)',
        borderLeftColor: 'var(--critical)',
      }}
      role="alert"
    >
      <div style={{ color: 'var(--critical)' }}>
        <p className="text-[13px] font-semibold">
          {isNetwork ? 'No response from the BhojanSetu API.' : 'That request did not go through.'}
        </p>
        <p className="mt-0.5 text-[12px] opacity-90">
          {isNetwork
            ? 'Start the FastAPI server, or switch on demo data in the left rail to keep walking the flow.'
            : error?.message || 'Try again in a moment.'}
        </p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-quiet">
          Retry
        </button>
      )}
    </div>
  );
}

export function DemoBanner() {
  return (
    <div
      className="mb-4 rounded-[3px] border-l-[3px] px-4 py-2.5 text-[12px] font-semibold"
      style={{
        background: 'var(--high-bg)',
        borderColor: 'var(--high)',
        borderLeftColor: 'var(--high)',
        color: 'var(--high)',
      }}
    >
      Demo data — the live backend did not respond. Nothing here came from the API.
    </div>
  );
}

export function UnavailableNotice() {
  return (
    <div
      className="rounded-[3px] border-l-[3px] px-4 py-3"
      style={{
        background: 'var(--high-bg)',
        borderColor: 'var(--high)',
        borderLeftColor: 'var(--high)',
        color: 'var(--high)',
      }}
    >
      <p className="text-[13px] font-semibold">Your NGO is marked unavailable.</p>
      <p className="mt-0.5 text-[12px] opacity-90">
        The backend is holding back new matches until availability is switched back on.
      </p>
    </div>
  );
}
