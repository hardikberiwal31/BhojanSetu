import AppShell from '../components/AppShell';
import { MetricCard } from '../components/ui/Primitives';
import { ErrorBanner, DemoBanner } from '../components/StateViews';
import { useApiData } from '../hooks/useApiData';
import { getDashboardStats } from '../services/api/dashboard';
import { mockDashboardStats } from '../services/mock/mockData';

const PIPELINE = [
  { key: 'availableCount', label: 'Available', tone: 'high' },
  { key: 'claimedCount', label: 'Claimed', tone: 'transit' },
  { key: 'deliveredCount', label: 'Delivered', tone: 'ok' },
];

const NETWORK = [
  { key: 'totalDonations', label: 'Donations posted' },
  { key: 'activeNgos', label: 'Active NGOs' },
  { key: 'activeVolunteers', label: 'Active volunteers' },
  { key: 'completedDeliveries', label: 'Completed deliveries' },
];

export default function DashboardImpact() {
  const { data, loading, error, usedMock, refreshing, refetch } = useApiData(
    getDashboardStats,
    mockDashboardStats,
    [],
    { pollMs: 30000 },
  );

  const stats = data || {};
  const pipelineTotal = PIPELINE.reduce((s, p) => s + (stats[p.key] || 0), 0);

  return (
    <AppShell
      title="Impact"
      subtitle="Live totals from the backend, across every provider, NGO and volunteer on the network."
      actions={
        <button type="button" onClick={refetch} className="btn btn-quiet" disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      }
    >
      {usedMock && <DemoBanner />}
      {error && <ErrorBanner error={error} onRetry={refetch} />}

      {/* The headline is the only number most people came for. */}
      <div className="panel mb-5 p-6" style={{ boxShadow: 'var(--shadow)' }}>
        <div className="mono text-[56px] font-semibold leading-none" style={{ color: 'var(--ok)' }}>
          {loading ? '—' : (stats.totalMealsRescued ?? 0).toLocaleString('en-IN')}
        </div>
        <p className="mt-2 text-[13px]" style={{ color: 'var(--text-dim)' }}>
          meals rescued and delivered across the Vellore–Katpadi corridor
        </p>

        {/* Pipeline as one stacked bar — the three states are parts of a whole. */}
        {pipelineTotal > 0 && (
          <>
            <div
              className="mt-5 flex h-2.5 overflow-hidden rounded-[2px]"
              style={{ background: 'var(--surface-3)' }}
              role="img"
              aria-label="Donations by stage"
            >
              {PIPELINE.map((p) => (
                <div
                  key={p.key}
                  style={{
                    width: `${((stats[p.key] || 0) / pipelineTotal) * 100}%`,
                    background: `var(--${p.tone})`,
                  }}
                />
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
              {PIPELINE.map((p) => (
                <span key={p.key} className="flex items-center gap-1.5 text-[12px]">
                  <span
                    className="h-2 w-2 rounded-[1px]"
                    style={{ background: `var(--${p.tone})` }}
                    aria-hidden="true"
                  />
                  <span style={{ color: 'var(--text-dim)' }}>{p.label}</span>
                  <span className="mono font-semibold">{stats[p.key] ?? 0}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {NETWORK.map((c) => (
          <MetricCard key={c.key} label={c.label} value={stats[c.key] ?? '—'} loading={loading} />
        ))}
      </div>
    </AppShell>
  );
}
