// Centralized API configuration.
// The backend base URL is configurable via VITE_API_BASE_URL — never hardcode
// it anywhere else in the app. Everything talks to the backend through the
// helpers in this file, so switching hosts or adding a header only happens
// here.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

// Thrown specifically when the backend can't be reached at all (network
// failure), so screens can tell "server is down" apart from "server said no".
export class NetworkUnavailableError extends ApiError {
  constructor() {
    super('BhojanSetu backend is unreachable.', { status: 0 });
    this.name = 'NetworkUnavailableError';
  }
}

function getUserId() {
  try {
    return localStorage.getItem('bhojansetu:userId') || null;
  } catch {
    return null;
  }
}

/**
 * Low-level request helper. Adds X-User-Id automatically once a demo session
 * exists, parses JSON, and turns non-2xx responses / network failures into
 * typed errors the UI can branch on.
 */
export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const userId = getUserId();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(userId ? { 'X-User-Id': userId } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new NetworkUnavailableError();
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    const message =
      (payload && (payload.message || payload.detail || payload.error)) ||
      `Request failed (${response.status})`;
    throw new ApiError(message, { status: response.status, payload });
  }

  return payload;
}

export const api = {
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body }),
};
