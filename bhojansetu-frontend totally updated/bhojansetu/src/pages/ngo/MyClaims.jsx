import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import DeliveryChit from '../../components/DeliveryChit';
import ActivityRail from '../../components/ActivityRail';
import { LoadingChits, EmptyState, ErrorBanner, DemoBanner } from '../../components/StateViews';
import { useApiData } from '../../hooks/useApiData';
import { getClaims, confirmReceipt } from '../../services/api/ngo';
import { mockClaims } from '../../services/mock/mockData';
import { ngoActivity } from '../../utils/activity';

export default function MyClaims() {
  const { data, loading, error, usedMock, updatedAt, refreshing, refetch } = useApiData(
    getClaims,
    mockClaims,
  );
  const [confirmingId, setConfirmingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function handleConfirm(deliveryId) {
    setActionError(null);
    setConfirmingId(deliveryId);
    try {
      await confirmReceipt(deliveryId);
      await refetch();
    } catch (err) {
      setActionError({ deliveryId, message: err.message || 'Confirmation did not go through.' });
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <AppShell
      title="Your claims"
      subtitle="Every claim you've made, and where its delivery currently stands."
      actions={
        <button type="button" onClick={refetch} className="btn btn-quiet" disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      }
      rail={
        <ActivityRail
          entries={ngoActivity([], data || [])}
          updatedAt={updatedAt}
          loading={refreshing}
        />
      }
    >
      {usedMock && <DemoBanner />}
      {error && <ErrorBanner error={error} onRetry={refetch} />}
      {loading && <LoadingChits count={2} />}

      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState
          title="You haven't claimed anything yet"
          hint="Matched food appears on your matches board the moment a nearby provider posts surplus."
          action={
            <Link to="/ngo" className="btn btn-primary">
              Open matches
            </Link>
          }
        />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((claim) => {
            const awaitingVolunteer =
              !claim.deliveryStatus || claim.deliveryStatus === 'UNASSIGNED';
            const arrived = claim.deliveryStatus === 'DELIVERED';

            return (
              <DeliveryChit
                key={claim.deliveryId}
                title={claim.foodName}
                quantity={claim.quantity}
                status={claim.deliveryStatus}
                trust={claim.volunteerTrust}
                trustLabel={claim.volunteer ? `${claim.volunteer}'s track record` : 'Volunteer track record'}
                facts={[
                  { label: 'Provider', value: claim.providerName || '—' },
                  {
                    label: 'Volunteer',
                    value: claim.volunteer || 'Waiting for volunteer assignment',
                  },
                ]}
                error={actionError?.deliveryId === claim.deliveryId ? actionError.message : null}
              >
                {awaitingVolunteer && (
                  <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>
                    The backend assigns a volunteer — nothing to do here yet.
                  </span>
                )}
                {!awaitingVolunteer && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(claim.deliveryId)}
                    disabled={confirmingId === claim.deliveryId || !arrived}
                    title={arrived ? undefined : 'Available once the volunteer marks this delivered'}
                    className="btn btn-go"
                  >
                    {confirmingId === claim.deliveryId ? 'Confirming…' : 'Confirm receipt'}
                  </button>
                )}
              </DeliveryChit>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
