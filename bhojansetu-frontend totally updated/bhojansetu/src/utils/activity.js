// Turns the current API payloads into a dispatcher-readable board feed.
//
// The backend contract has no event-log endpoint, so this is deliberately a
// *state* feed, not a fabricated event history: every line describes where an
// item stands right now, derived from the same response the page renders.
// Nothing here invents "2 minutes ago" timestamps the backend never sent.

import { DELIVERY_LABEL, DELIVERY_TONE, FOOD_STATUS_TONE, FOOD_STATUS_LABEL, URGENCY_TONE } from './status';

export function providerActivity(foods = []) {
  return foods.map((f) => ({
    id: f.foodId,
    title: f.foodName,
    detail: f.ngo
      ? `${FOOD_STATUS_LABEL[f.status] || f.status} by ${f.ngo}`
      : FOOD_STATUS_LABEL[f.status] || f.status,
    sub: f.deliveryStatus ? DELIVERY_LABEL[f.deliveryStatus] : null,
    tone: FOOD_STATUS_TONE[f.status] || 'idle',
    quantity: f.quantity,
    expiresAt: f.expiresAt,
  }));
}

export function ngoActivity(available = [], claims = []) {
  const openItems = available.map((f) => ({
    id: `a-${f.foodId}`,
    title: f.foodName,
    detail: `Match ${f.matchScore ?? '—'} from ${f.providerName || 'provider'}`,
    sub: null,
    tone: URGENCY_TONE[f.urgency] || 'idle',
    quantity: f.quantity,
    expiresAt: f.expiresAt,
  }));

  const claimed = claims.map((c) => ({
    id: `c-${c.deliveryId}`,
    title: c.foodName,
    detail: DELIVERY_LABEL[c.deliveryStatus] || c.deliveryStatus,
    sub: c.volunteer ? `Volunteer: ${c.volunteer}` : 'No volunteer assigned yet',
    tone: DELIVERY_TONE[c.deliveryStatus] || 'idle',
    quantity: c.quantity,
    expiresAt: null,
  }));

  return [...claimed, ...openItems];
}

export function volunteerActivity(tasks = []) {
  return tasks.map((t) => ({
    id: t.deliveryId,
    title: t.foodName,
    detail: DELIVERY_LABEL[t.deliveryStatus] || t.deliveryStatus,
    sub: t.pickupLocation ? `Pickup: ${t.pickupLocation}` : null,
    tone: DELIVERY_TONE[t.deliveryStatus] || 'idle',
    quantity: t.quantity,
    expiresAt: t.expiresAt || null,
  }));
}
