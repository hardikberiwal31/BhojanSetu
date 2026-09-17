import { api } from './client';

// GET /api/dashboard/stats
export function getDashboardStats() {
  return api.get('/api/dashboard/stats');
}
