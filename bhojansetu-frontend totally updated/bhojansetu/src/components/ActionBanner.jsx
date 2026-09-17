/**
 * Rule-based prompt shown above a board when its current state implies one
 * obvious next move. Conditions are evaluated by the page from real API
 * data — this component only renders the result.
 */
export default function ActionBanner({ tone = 'high', message, actionLabel, onAction, to, Link }) {
  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[3px] border-l-[3px] px-4 py-3"
      style={{
        background: `var(--${tone}-bg)`,
        borderColor: `var(--${tone})`,
        borderLeftColor: `var(--${tone})`,
      }}
    >
      <p className="text-[13px] font-medium" style={{ color: `var(--${tone})` }}>
        {message}
      </p>
      {actionLabel && (Link && to ? (
        <Link to={to} className="btn btn-primary">{actionLabel}</Link>
      ) : (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      ))}
    </div>
  );
}
