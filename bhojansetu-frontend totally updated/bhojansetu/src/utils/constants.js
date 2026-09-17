// Exact backend vocabulary. Never invent or rename these — the UI only
// displays them.

export const FOOD_STATUS = ['AVAILABLE', 'CLAIMED', 'DELIVERED'];

export const DELIVERY_STATUS = [
  'UNASSIGNED',
  'ASSIGNED',
  'ACCEPTED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
];

export const URGENCY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const FOOD_TYPES = ['veg', 'non-veg', 'mixed'];

// Demo-only coordinates around Vellore / Katpadi, Tamil Nadu — for display
// and for pre-filling the post-food form. Not used for any real geolocation.
export const DEMO_LOCATIONS = [
  { label: 'Katpadi Junction area', lat: 12.9721, lng: 79.1416 },
  { label: 'VIT Vellore campus', lat: 12.9692, lng: 79.1559 },
  { label: 'Vellore Fort area', lat: 12.9165, lng: 79.1325 },
  { label: 'Gandhi Nagar, Vellore', lat: 12.9184, lng: 79.1391 },
  { label: 'Bagayam, Vellore', lat: 12.9553, lng: 79.1197 },
];
