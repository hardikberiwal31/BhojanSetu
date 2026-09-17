import { api } from './client';

// GET /api/ngo/food/available — matched/recommended food for this NGO
export function getAvailableFood() {
  return api.get('/api/ngo/food/available');
}

// POST /api/ngo/food/{food_id}/claim
export function claimFood(foodId) {
  return api.post(`/api/ngo/food/${foodId}/claim`);
}

// GET /api/ngo/claims — claimed food + delivery info
export function getClaims() {
  return api.get('/api/ngo/claims');
}

// POST /api/ngo/delivery/{delivery_id}/confirm-receipt
export function confirmReceipt(deliveryId) {
  return api.post(`/api/ngo/delivery/${deliveryId}/confirm-receipt`);
}
