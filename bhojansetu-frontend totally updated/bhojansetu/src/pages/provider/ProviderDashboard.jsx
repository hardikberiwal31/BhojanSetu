import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import ProviderFoodChit from '../../components/ProviderFoodChit';
import ActivityRail from '../../components/ActivityRail';
import ActionBanner from '../../components/ActionBanner';
import { MetricCard } from '../../components/ui/Primitives';
import { LoadingChits, EmptyState, ErrorBanner, DemoBanner } from '../../components/StateViews';
import { useApiData } from '../../hooks/useApiData';
import { getProviderFood } from '../../services/api/provider';
import { mockProviderFood } from '../../services/mock/mockData';
import { providerActivity } from '../../utils/activity';

export default function ProviderDashboard() {
  const { data, loading, error, usedMock, updatedAt, refreshing, refetch } = useApiData(
    getProviderFood,
    mockProviderFood,
  );

  const foods = data || [];
  const open = foods.filter((f) => f.status === 'AVAILABLE');
  const inFlight = foods.filter((f) => f.status === 'CLAIMED');
  const servingsDelivered = foods
    .filter((f) => f.status === 'DELIVERED')
    .reduce((s, f) => s + (f.quantity || 0), 0);

  const unclaimedAndUrgent = open.filter((f) => f.urgency === 'HIGH' || f.urgency === 'CRITICAL');

  return (
    <AppShell
      title="Your donations"
      subtitle="Everything you've posted, from the moment it goes live to the moment an NGO confirms it arrived."
      actions={
        <div className="flex gap-2">
          <button type="button" onClick={refetch} className="btn btn-quiet" disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link to="/provider/post" className="btn btn-primary">
            Post surplus food
          </Link>
        </div>
      }
      rail={
        <ActivityRail entries={providerActivity(foods)} updatedAt={updatedAt} loading={refreshing} />
      }
    >
      {usedMock && <DemoBanner />}

      {!loading && !error && foods.length > 0 && (
        <>
          {unclaimedAndUrgent.length > 0 && (
            <ActionBanner
              tone="critical"
              message={`${unclaimedAndUrgent.length} urgent ${unclaimedAndUrgent.length === 1 ? 'post is' : 'posts are'} still unclaimed. No NGO has taken them yet.`}
            />
          )}
          {open.length === 0 && inFlight.length === 0 && (
            <ActionBanner
              tone="high"
              message="Your board is clear. Post surplus while there's still time on the clock."
              actionLabel="Post surplus food"
              to="/provider/post"
              Link={Link}
            />
          )}

          <div className="mb-5 grid gap-3 sm:grid-cols-4">
            <MetricCard label="Posted" value={foods.length} />
            <MetricCard label="Awaiting a claim" value={open.length} tone={open.length ? 'high' : undefined} />
            <MetricCard label="In delivery" value={inFlight.length} tone={inFlight.length ? 'transit' : undefined} />
            <MetricCard label="Servings delivered" value={servingsDelivered} tone="ok" />
          </div>
        </>
      )}

      {error && <ErrorBanner error={error} onRetry={refetch} />}
      {loading && <LoadingChits count={3} />}

      {!loading && !error && foods.length === 0 && (
        <EmptyState
          title="Nothing posted yet"
          hint="Post a batch of surplus and the matching engine puts it in front of nearby NGOs within seconds."
          action={
            <Link to="/provider/post" className="btn btn-primary">
              Post surplus food
            </Link>
          }
        />
      )}

      {!loading && !error && foods.length > 0 && (
        <div className="space-y-3">
          {foods.map((food) => (
            <ProviderFoodChit key={food.foodId} food={food} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
