# BhojanSetu — Frontend

React + Vite frontend for BhojanSetu, a real-time food rescue and
redistribution platform. This is a client only: it talks to a separately
developed Python FastAPI + MongoDB backend and never invents its own API
endpoints, database, or matching logic. Match scores, statuses, and
assignment decisions always come from the backend response.

## Stack

- React 19 + Vite
- React Router (role-based routes: provider / ngo / volunteer)
- Tailwind CSS v4
- No extra state library — a small `AuthContext` holds the demo session,
  `useApiData` is a thin fetch hook with loading/error/refetch

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your FastAPI backend
npm run dev
```

The backend base URL is the only thing you configure — set
`VITE_API_BASE_URL` in `.env`. Nothing else in the app hardcodes a host;
every request goes through `src/services/api/client.js`.

## Project layout

```
src/
├── components/     shared UI: cards, badges, timeline, layout, state views
├── context/        AuthContext (demo session), DemoModeContext
├── hooks/          useApiData — fetch + loading/error/refetch + demo fallback
├── pages/
│   ├── provider/   post food, view own donations
│   ├── ngo/        available/matched food, claims + confirm receipt
│   └── volunteer/  assignments, accept, status progression
├── services/
│   ├── api/        one file per backend resource, matching the contract
│   │               exactly (field names, status values, endpoints)
│   └── mock/       fixture data, used only in demo mode
└── utils/          formatting helpers and shared constants (status enums,
                    demo coordinates around Vellore / Katpadi)
```

## Demo login

The backend's `POST /api/auth/demo-login` takes a `userId` and `role`
(`provider` | `ngo` | `volunteer`). `userId` must be a real seeded MongoDB
`_id` (from `python seed.py` on the backend) — there is no "type any string"
demo id. The login screen fetches `GET /api/auth/demo-accounts` on load and
lets you pick a real seeded account by name for the selected role; the role
switcher in the nav does the same (switches into the first seeded account for
that role). If no accounts are seeded yet (backend not seeded, or
unreachable), the screen falls back to a manual id field. The session is
stored in `localStorage`; every subsequent request sends `X-User-Id`
automatically (see `client.js`).

## Demo mode (backend-down fallback)

There's a "Use demo data if backend is down" checkbox in the nav and on the
login screen. It's off by default — the app always calls the real backend
first. If it's switched on and the API is unreachable, screens fall back to
fixture data in `src/services/mock/mockData.js` and show a visible
"Showing demo data" banner, so demo data is never mistaken for a live
response. This is for running the UI standalone during a walkthrough; it's
not a substitute for the real backend.

## Status values

Food status: `AVAILABLE → CLAIMED → DELIVERED`
Delivery status: `UNASSIGNED → ASSIGNED → ACCEPTED → PICKED_UP → IN_TRANSIT → DELIVERED`

These are rendered exactly as the backend sends them (see
`src/utils/constants.js`) — the frontend doesn't rename or reinterpret them.

## What's intentionally not here

Per the project spec: no separate backend, no second database, no
frontend-side matching logic (match score, distance, urgency are always
displayed as given by the backend), no complex auth, no map SDKs, no
payments.

## Known backend-contract gap

The spec doesn't define exactly what an "NGO unavailable" API response
looks like. `AvailableFood.jsx` currently treats a `403` from
`GET /api/ngo/food/available` as "NGO unavailable" and shows a dedicated
banner — adjust that check once the real response shape is confirmed with
the backend.

---

## Interface pass — dispatch board redesign

The earlier interface read as a generic SaaS dashboard. This pass re-grounds it
in the actual domain: food on a clock, moving between three roles.

### What changed visually

- **Palette.** Cream/serif/warm-clay is gone. Base is a cool slate-green
  (`#edf0ec` light, `#0e1512` dark). Signal colours — `critical` / `high` /
  `transit` / `ok` — are reserved for *state only* and never used as
  decoration. Mapped in one place: `src/utils/status.js`.
- **Type.** Archivo for text, IBM Plex Mono (tabular figures) for every
  time-sensitive number: countdowns, match scores, servings, delivery IDs.
  Numbers get their own voice because numbers are the product.
- **Chits, not cards.** `.chit` is a squared dispatch ticket with a state
  stripe down the leading edge, replacing identical rounded cards.
- **Layout.** Full-bleed console: left rail, command bar (role switcher,
  backend health, theme), main board, right board rail. The centred
  max-width column is gone.
- **Themes.** Light/dark toggle in the command bar, persisted, defaulting to
  the OS preference. `src/context/ThemeContext.jsx`.

### New behaviour

| Thing | Where | Notes |
|---|---|---|
| Live countdown ring | `components/CountdownRing.jsx`, `hooks/useCountdown.js` | Ticks every second between polls. Colour crosses to red under 30 min. |
| Range view | `components/RescueRadar.jsx` | Plain SVG. Plots real `distanceKm` on range rings. No external map API. |
| Board rail | `components/ActivityRail.jsx`, `utils/activity.js` | Derived from the same payload the page renders. |
| Polling | `hooks/useApiData.js` | 15s default, pauses when the tab is hidden. |
| Backend health | `context/HealthContext.jsx` | Driven by real request outcomes, not a simulated heartbeat. |
| Next-best-action | `components/ActionBanner.jsx` | Rule-based on real list state. |
| Skeletons | `components/ui/Primitives.jsx` | Shimmer placeholders on first load. |
| Role switcher | `components/AppShell.jsx` | Calls the real `POST /api/auth/demo-login`. |

### Backend contract — unchanged

No new endpoints, no renamed fields, no status values invented, no match score
computed on the client. Sorting by `matchScore` on the NGO board is
presentation only. `VITE_API_BASE_URL` remains the single source for the host.

### Deliberately not built

These were requested but have no backing in the current API contract. Building
them would mean faking data in a demo the judges will poke at:

- OTP handoff codes and photo/temperature verification at pickup
- Live driver GPS position, route path, traffic, and ETA countdown
- Multi-pickup batching and route optimisation
- Volunteer / NGO / provider profile panels (vehicle, KYC badge, languages,
  registration ID, gate codes, live intake capacity, reliability score)
- A true push activity stream with per-event timestamps

### Trust score — backend fields needed (not yet in the contract)

The UI now renders a trust readout (`components/TrustBadge.jsx`) wherever an
entity's reliability is relevant — a provider on a matched-food chit, a
volunteer on an NGO's claim, an NGO on a volunteer's run. It only renders
when the field is present; nothing is estimated or computed on the frontend.

To go live, the backend needs to add a `trust` object wherever it already
returns a provider/NGO/volunteer name:

```json
"trust": {
  "score": 94,               // 0-100
  "successfulPickups": 37,
  "cancellationRate": 0.02,  // 0-1
  "noShowRate": 0
}
```

Concretely: `providerTrust` on `GET /api/ngo/food/available` items,
`volunteerTrust` on `GET /api/ngo/claims` items, `ngoTrust` on
`GET /api/volunteer/assignments` items. Mock data in `mockData.js` already
uses this shape so the demo path renders correctly today.

**Important — ranking stays server-side.** The spec (section 9) is explicit
that the frontend must never calculate or override the backend's match
score. So even though trust is now visible, the frontend does **not**
combine trust + match score into its own ranking or re-sort the board by it
— it only displays whatever order the backend returns. If you want a rule
like "prefer the higher-trust NGO when match scores are close, unless
urgency is CRITICAL," that decision has to be made in the matching engine
and expressed back to the frontend as the order of the array (and, ideally,
a `matchReasons` entry like `"Preferred for reliability"` so the UI can
explain it without inventing the reason itself).

### Food description — backend field needed

`PostFood.jsx` now has an optional "Describe the food" textarea. It's sent
as `description` in the `POST /api/provider/food` body. This field is not
in the documented contract (spec section 13) — FastAPI/Pydantic will
silently drop it unless the backend model adds a matching `description: str
| None` field, so it currently won't persist or reach NGOs until that's
added. `matchScore` is now also shown with a `%` suffix for clarity, since
it's a 0–100 fit score most people read as a percentage.


---

## Integration pass — fixed against the live backend contract

Found by running the frontend and backend against each other end-to-end:

1. **Login / role switcher used fake ids.** Both `Login.jsx` and the nav's
   role switcher previously logged in with made-up strings like
   `demo-provider-1`. The backend's `X-User-Id` / `demo-login` always expects
   a real MongoDB `_id` (printed by `seed.py`), so every login attempt
   against the real backend failed with `400` unless demo mode silently
   papered over it with fixture data. Fixed: `AuthContext` now fetches
   `GET /api/auth/demo-accounts` once on load and exposes `accounts` /
   `accountsByRole(role)`; `Login.jsx` renders a picker of real seeded
   accounts (falling back to a manual id field only if none are seeded yet),
   and the role switcher in `AppShell.jsx` switches into the first real
   seeded account for the target role.
2. **`matchFactors.urgency` was read but never sent.** `FoodMatchChit.jsx`
   displays `matchFactors.urgency` alongside `distance` / `quantity` /
   `foodCompatibility`, but the backend only sent the first three as text
   labels (plus a separate numeric `urgencyScore`). The urgency row was
   silently disappearing on real data. Fixed on the backend side —
   `services/matching.py` now also returns `matchFactors.urgency` as a
   title-cased label (`"High"`, `"Critical"`, etc.), matching the shape the
   frontend already expected. See the paired backend README, "What changed".

Everything else — status vocabulary, field names, endpoint paths, the
provider/NGO/volunteer contract — already matched exactly.
