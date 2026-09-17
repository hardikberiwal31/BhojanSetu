import { useState } from 'react';
import AppShell from '../../components/AppShell';
import DeliveryChit from '../../components/DeliveryChit';
import ActivityRail from '../../components/ActivityRail';
import ActionBanner from '../../components/ActionBanner';
import { LoadingChits, EmptyState, ErrorBanner, DemoBanner } from '../../components/StateViews';
import { useApiData } from '../../hooks/useApiData';
import { getAssignments, acceptDelivery, updateDeliveryStatus } from '../../services/api/volunteer';
import { mockAssignments } from '../../services/mock/mockData';
import { volunteerActivity } from '../../utils/activity';

// The next step in the backend's delivery flow. These are the exact backend
// status values — the frontend never invents an intermediate state.
const NEXT_STEP = {
  ACCEPTED: { status: 'PICKED_UP', label: 'Mark picked up' },
  PICKED_UP: { status: 'IN_TRANSIT', label: 'Start the run' },
  IN_TRANSIT: { status: 'DELIVERED', label: 'Mark delivered' },
};

export default function Assignments() {
  const { data, loading, error, usedMock, updatedAt, refreshing, refetch } = useApiData(
    getAssignments,
    mockAssignments,
  );
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function run(deliveryId, fn, fallbackMessage) {
    setActionError(null);
    setBusyId(deliveryId);
    try {
      await fn();
      await refetch();
    } catch (err) {
      setActionError({ deliveryId, message: err.message || fallbackMessage });
    } finally {
      setBusyId(null);
    }
  }

  const tasks = data || [];
  const unaccepted = tasks.filter((t) => t.deliveryStatus === 'ASSIGNED');

  return (
    <AppShell
      title="Your runs"
      subtitle="The backend assigns these to you. Accept, collect, and close each one out from here."
      actions={
        <button type="button" onClick={refetch} className="btn btn-quiet" disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      }
      rail={
        <ActivityRail
          entries={volunteerActivity(tasks)}
          updatedAt={updatedAt}
          loading={refreshing}
        />
      }
    >
      {usedMock && <DemoBanner />}

      {unaccepted.length > 0 && (
        <ActionBanner
          tone="high"
          message={`${unaccepted.length} new ${unaccepted.length === 1 ? 'run is' : 'runs are'} waiting on your acceptance.`}
        />
      )}

      {error && <ErrorBanner error={error} onRetry={refetch} />}
      {loading && <LoadingChits count={2} />}

      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          title="Waiting for volunteer assignment"
          hint="Nothing is assigned to you right now. A run appears here as soon as an NGO claims food near you."
        />
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const next = NEXT_STEP[task.deliveryStatus];
            const busy = busyId === task.deliveryId;

            return (
              <DeliveryChit
                key={task.deliveryId}
                title={task.foodName}
                foodType={task.foodType}
                quantity={task.quantity}
                status={task.deliveryStatus}
                trust={task.ngoTrust}
                trustLabel="Drop-off org's track record"
                facts={[
                  { label: 'Collect from', value: task.pickupLocation || '—' },
                  { label: 'Deliver to', value: task.dropLocation || '—' },
                ]}
                error={actionError?.deliveryId === task.deliveryId ? actionError.message : null}
              >
                {task.deliveryStatus === 'ASSIGNED' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(task.deliveryId, () => acceptDelivery(task.deliveryId), 'Could not accept this run.')
                    }
                    className="btn btn-primary"
                  >
                    {busy ? 'Accepting…' : 'Accept this run'}
                  </button>
                )}

                {next && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(
                        task.deliveryId,
                        () => updateDeliveryStatus(task.deliveryId, next.status),
                        'Could not update the status.',
                      )
                    }
                    className="btn btn-go"
                  >
                    {busy ? 'Updating…' : next.label}
                  </button>
                )}

                {task.deliveryStatus === 'DELIVERED' && (
                  <span className="text-[12px] font-medium" style={{ color: 'var(--ok)' }}>
                    Dropped off. The NGO confirms receipt to close this out.
                  </span>
                )}
              </DeliveryChit>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
