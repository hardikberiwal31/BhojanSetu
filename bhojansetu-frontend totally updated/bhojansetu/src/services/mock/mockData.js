// Fixture data shaped exactly like the backend contract in the project spec.
// Used only when demo mode is explicitly switched on (see DemoModeContext) —
// this never runs unless the person asks for it, and the UI always labels it
// clearly as demo data.
//
// Timestamps are relative to page load so the countdown clocks behave like
// live ones during a walkthrough, instead of showing everything as expired.

const minsFromNow = (m) => new Date(Date.now() + m * 60000).toISOString();
const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export const mockProviderFood = [
  {
    foodId: 'f1',
    foodName: 'Rice and dal',
    quantity: 75,
    foodType: 'veg',
    preparedAt: minsAgo(95),
    expiresAt: minsFromNow(24),
    urgency: 'HIGH',
    status: 'CLAIMED',
    ngo: 'Anbu Illam Trust',
    deliveryStatus: 'IN_TRANSIT',
  },
  {
    foodId: 'f2',
    foodName: 'Chicken biryani',
    quantity: 40,
    foodType: 'non-veg',
    preparedAt: minsAgo(40),
    expiresAt: minsFromNow(105),
    urgency: 'MEDIUM',
    status: 'AVAILABLE',
    ngo: null,
    deliveryStatus: null,
  },
  {
    foodId: 'f3',
    foodName: 'Mixed veg curry and chapati',
    quantity: 60,
    foodType: 'mixed',
    preparedAt: minsAgo(600),
    expiresAt: minsAgo(180),
    urgency: 'LOW',
    status: 'DELIVERED',
    ngo: 'Karunai Foundation',
    deliveryStatus: 'DELIVERED',
  },
];

export const mockAvailableFood = [
  {
    foodId: 'f2',
    foodName: 'Chicken biryani',
    quantity: 40,
    foodType: 'non-veg',
    description: 'Sealed trays, still hot, mildly spiced.',
    providerName: 'Hotel Sri Lakshmi',
    providerTrust: { score: 91, successfulPickups: 52, cancellationRate: 0.02, noShowRate: 0 },
    distanceKm: 2.1,
    preparedAt: minsAgo(40),
    expiresAt: minsFromNow(18),
    remainingMinutes: 18,
    urgency: 'HIGH',
    matchScore: 87,
    matchFactors: {
      distance: 'Very close',
      quantity: 'Excellent fit',
      urgency: 'High',
      foodCompatibility: 'Compatible',
    },
    matchReasons: [
      'Very close to the provider',
      'Quantity fits your capacity',
      'You accept this food type',
      'Food expires soon',
    ],
  },
  {
    foodId: 'f4',
    foodName: 'Vegetable pulao',
    quantity: 100,
    foodType: 'veg',
    description: 'Large batch from today\'s lunch service, no nuts.',
    providerName: 'VIT Vellore canteen',
    providerTrust: { score: 78, successfulPickups: 21, cancellationRate: 0.06, noShowRate: 0.02 },
    distanceKm: 5.4,
    preparedAt: minsAgo(20),
    expiresAt: minsFromNow(140),
    remainingMinutes: 140,
    urgency: 'LOW',
    matchScore: 61,
    matchFactors: {
      distance: 'Moderate',
      quantity: 'Good fit',
      urgency: 'Low',
      foodCompatibility: 'Compatible',
    },
    matchReasons: ['You accept this food type', 'Quantity fits your capacity'],
  },
  {
    foodId: 'f5',
    foodName: 'Sambar rice and curd rice',
    quantity: 55,
    foodType: 'veg',
    description: 'Packed in banana leaves, ready to serve.',
    providerName: 'Sree Annapoorna Mess',
    providerTrust: { score: 96, successfulPickups: 88, cancellationRate: 0.01, noShowRate: 0 },
    distanceKm: 0.8,
    preparedAt: minsAgo(70),
    expiresAt: minsFromNow(52),
    remainingMinutes: 52,
    urgency: 'MEDIUM',
    matchScore: 74,
    matchFactors: {
      distance: 'Walking distance',
      quantity: 'Good fit',
      urgency: 'Medium',
      foodCompatibility: 'Compatible',
    },
    matchReasons: ['Under a kilometre away', 'You accept this food type'],
  },
];

export const mockClaims = [
  {
    deliveryId: 'd1',
    foodName: 'Rice and dal',
    quantity: 75,
    providerName: 'Hotel Sri Lakshmi',
    deliveryStatus: 'IN_TRANSIT',
    volunteer: 'Arjun K.',
    volunteerTrust: { score: 94, successfulPickups: 37, cancellationRate: 0.02, noShowRate: 0 },
  },
  {
    deliveryId: 'd2',
    foodName: 'Idli and chutney',
    quantity: 30,
    providerName: 'Katpadi Junction Cafe',
    deliveryStatus: 'UNASSIGNED',
    volunteer: null,
    volunteerTrust: null,
  },
];

export const mockAssignments = [
  {
    deliveryId: 'd1',
    foodName: 'Rice and dal',
    quantity: 75,
    foodType: 'veg',
    pickupLocation: 'Hotel Sri Lakshmi, Katpadi',
    dropLocation: 'Anbu Illam Trust, Gandhi Nagar',
    deliveryStatus: 'ACCEPTED',
    expiresAt: minsFromNow(24),
    ngoTrust: { score: 96, successfulPickups: 140, cancellationRate: 0.01, noShowRate: 0 },
  },
  {
    deliveryId: 'd3',
    foodName: 'Vegetable pulao',
    quantity: 100,
    foodType: 'veg',
    pickupLocation: 'VIT Vellore canteen, gate 2',
    dropLocation: 'Karunai Foundation, Bagayam',
    deliveryStatus: 'ASSIGNED',
    expiresAt: minsFromNow(140),
    ngoTrust: { score: 62, successfulPickups: 14, cancellationRate: 0.12, noShowRate: 0.05 },
  },
];

export const mockDashboardStats = {
  totalDonations: 18,
  totalMealsRescued: 940,
  availableCount: 3,
  claimedCount: 2,
  deliveredCount: 13,
  activeNgos: 6,
  activeVolunteers: 9,
  completedDeliveries: 13,
};
