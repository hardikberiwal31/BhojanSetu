// Maps the backend's exact status vocabulary onto the signal palette.
// Nothing here invents or renames a status — it only decides what colour
// each backend value is painted, in one place.

export const URGENCY_TONE = {
  CRITICAL: 'critical',
  HIGH: 'critical',
  MEDIUM: 'high',
  LOW: 'ok',
};

export const DELIVERY_TONE = {
  UNASSIGNED: 'idle',
  ASSIGNED: 'high',
  ACCEPTED: 'high',
  PICKED_UP: 'transit',
  IN_TRANSIT: 'transit',
  DELIVERED: 'ok',
};

export const FOOD_STATUS_TONE = {
  AVAILABLE: 'high',
  CLAIMED: 'transit',
  DELIVERED: 'ok',
};

// Plain-language labels. The raw enum stays visible in the mono readout on
// delivery chits; these are for everywhere a human just needs the meaning.
export const DELIVERY_LABEL = {
  UNASSIGNED: 'Waiting for a volunteer',
  ASSIGNED: 'Assigned to a volunteer',
  ACCEPTED: 'Volunteer accepted',
  PICKED_UP: 'Picked up',
  IN_TRANSIT: 'On the way',
  DELIVERED: 'Delivered',
};

export const FOOD_STATUS_LABEL = {
  AVAILABLE: 'Available',
  CLAIMED: 'Claimed',
  DELIVERED: 'Delivered',
};

export function toneVars(tone) {
  return { fg: `var(--${tone})`, bg: `var(--${tone}-bg)` };
}
