import { api } from './client';

// GET /api/volunteer/assignments
export function getAssignments() {
  return api.get('/api/volunteer/assignments');
}

// POST /api/volunteer/delivery/{delivery_id}/accept
export function acceptDelivery(deliveryId) {
  return api.post(`/api/volunteer/delivery/${deliveryId}/accept`);
}

// PATCH /api/volunteer/delivery/{delivery_id}/status  { status }
// status must be one of the backend's exact values: PICKED_UP | IN_TRANSIT | DELIVERED
export function updateDeliveryStatus(deliveryId, status) {
  return api.patch(`/api/volunteer/delivery/${deliveryId}/status`, { status });
}
