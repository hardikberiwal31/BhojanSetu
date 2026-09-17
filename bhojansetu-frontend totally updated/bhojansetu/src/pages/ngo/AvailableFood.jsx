import { useState } from 'react';
import AppShell from '../../components/AppShell';
import FoodMatchChit from '../../components/FoodMatchChit';
import RescueRadar from '../../components/RescueRadar';
import ActivityRail from '../../components/ActivityRail';
import ActionBanner from '../../components/ActionBanner';
import { MetricCard } from '../../components/ui/Primitives';
import {
  LoadingChits,
  EmptyState,
  ErrorBanner,
  DemoBanner,
  UnavailableNotice,
} from '../../components/StateViews';
import { useApiData } from '../../hooks/useApiData';
import { getAvailableFood, claimFood } from '../../services/api/ngo';
import { mockAvailableFood } from '../../services/mock/mockData';
import { ApiError } from '../../services/api/client';
import { ngoActivity } from '../../utils/activity';

export default function AvailableFood() {
  const { data, loading, error, usedMock, updatedAt, refetch, refreshing } = useApiData(
    getAvailableFood,
    mockAvailableFood,
  );
  const [claimingId, setClaimingId] = useState(null);
  const [claimError, setClaimError] = useState(null);

  // Ranking is the backend's matchScore. Sorting by it is presentation only —
  // no score is recomputed here.
  const sorted = data ? [...data].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)) : null;

  const expiringSoon = (sorted || []).filter(
    (f) => f.remainingMinutes !== null && f.remainingMinutes !== undefined && f.remainingMinutes < 30,
  );
  const topScore = sorted?.length ? sorted[0].matchScore : null;
  const totalServings = (sorted || []).reduce((sum, f) => sum + (f.quantity || 0), 0);

  async function handleClaim(foodId) {
    setClaimError(null);
    setClaimingId(foodId);
    try {
      await claimFood(foodId);
      await refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setClaimError({ foodId, message: 'Another NGO claimed this first.' });
        refetch();
      } else if (err.name === 'NetworkUnavailableError') {
        setClaimError({ foodId, message: 'No response from the API — the claim did not go through.' });
      } else {
        setClaimError({ foodId, message: err.message || 'The claim did not go through.' });
      }
    } finally {
      setClaimingId(null);
    }
  }

  const unavailable = error?.status === 403;

  return (
    <AppShell
      title="Matched to you"
      subtitle="Ranked by the backend matching engine. Distance, quantity fit, urgency and food compatibility are the engine's own numbers."
      actions={
        <button type="button" onClick={refetch} className="btn btn-quiet" disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      }
      rail={
        <div className="space-y-4">
          {sorted && sorted.length > 0 && <RescueRadar items={sorted} centreLabel="Your NGO" />}
          <ActivityRail
            entries={ngoActivity(sorted || [], [])}
            updatedAt={updatedAt}
            loading={refreshing}
          />
        </div>
      }
    >
      {usedMock && <DemoBanner />}

      {!loading && !unavailable && sorted && sorted.length > 0 && (
        <>
          {expiringSoon.length > 0 && (
            <ActionBanner
              tone="critical"
              message={`${expiringSoon.length} ${expiringSoon.length === 1 ? 'item expires' : 'items expire'} in under 30 minutes. Claim now or the food is lost.`}
            />
          )}

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Open matches" value={sorted.length} />
            <MetricCard label="Servings on offer" value={totalServings} />
            <MetricCard label="Best match score" value={topScore ?? '—'} tone="ok" />
          </div>
        </>
      )}

      {unavailable && <UnavailableNotice />}
      {error && !unavailable && <ErrorBanner error={error} onRetry={refetch} />}

      {loading && <LoadingChits count={3} />}

      {!loading && !error && (!sorted || sorted.length === 0) && (
        <EmptyState
          title="No matches on the board"
          hint="Nothing nearby fits your capacity and food preferences right now. New donations are matched as providers post them."
        />
      )}

      {!loading && !error && sorted && sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((food) => (
            <FoodMatchChit
              key={food.foodId}
              food={food}
              claiming={claimingId === food.foodId}
              onClaim={() => handleClaim(food.foodId)}
              error={claimError?.foodId === food.foodId ? claimError.message : null}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
