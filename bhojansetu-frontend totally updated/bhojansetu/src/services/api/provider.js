import { api } from './client';

// POST /api/provider/food
//
// `description` is NOT in the documented backend contract (spec section 13).
// It's included here so the field is ready the moment the backend adds
// support — sending it today is harmless (FastAPI/Pydantic silently drops
// unknown fields by default) but it will NOT be persisted or shown to NGOs
// until the backend model adds a matching field. See README.
export function postFood({ foodName, quantity, foodType, description, preparedAt, expiresAt, location }) {
  return api.post('/api/provider/food', {
    foodName,
    quantity,
    foodType,
    ...(description ? { description } : {}),
    preparedAt,
    expiresAt,
    location,
  });
}

// GET /api/provider/food — the provider's own donations
export function getProviderFood() {
  return api.get('/api/provider/food');
}
