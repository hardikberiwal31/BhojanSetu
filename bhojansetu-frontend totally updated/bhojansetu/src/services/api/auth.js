import { api } from './client';

// POST /api/auth/demo-login  { userId, role } -> demo session
export function demoLogin(userId, role) {
  return api.post('/api/auth/demo-login', { userId, role });
}

// GET /api/auth/demo-accounts -> [{ userId, role, name }]
// Every seeded user. The backend's userId values are real MongoDB _id
// strings (from seed.py) — not guessable — so the login screen and role
// switcher fetch this list instead of asking anyone to type or invent one.
export function listDemoAccounts() {
  return api.get('/api/auth/demo-accounts');
}
