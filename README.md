# BhojanSetu — Backend

One FastAPI backend + one MongoDB database, serving three role-based frontends
(Provider, NGO, Volunteer). This repo contains **only the backend**; the
frontend team builds the three UIs separately and talks to these APIs over
HTTP. See `frontend/README.md` for the paired frontend.

> **v1.1 note:** this revision adds `routers/auth.py` (demo login/account
> list) and enriches several responses with human-readable names instead of
> raw ids, to match what the already-built frontend actually expects. See
> "What changed" at the bottom.

---

## 1. Setup

```bash
cd backend
pip install -r requirements.txt

# Make sure MongoDB is running locally (default: mongodb://localhost:27017)
# or set MONGO_URL to a remote connection string (e.g. MongoDB Atlas):
export MONGO_URL="mongodb://localhost:27017"
export DB_NAME="bhojansetu"

# Load demo data (run this once before the demo)
python seed.py
```

Then start the server:

```bash
uvicorn main:app --reload --port 8000
```

Interactive docs: **http://localhost:8000/docs**

---

## 2. Authentication (demo-only)

Every protected endpoint requires a header:

```
X-User-Id: <a mongo _id from a users document>
```

The backend looks up that user's role in MongoDB and authorizes the request
accordingly. No password, session, or token.

Two endpoints exist specifically to support the frontend's login screen and
are **not** behind `X-User-Id` (they run before a session exists):

- **`GET /api/auth/demo-accounts`** → every seeded user, so the frontend can
  show a "pick your account" list instead of asking someone to paste a raw id.
- **`POST /api/auth/demo-login`** `{ userId, role }` → validates the id and
  returns `{ userId, role, name }`, with `role` coming from the database
  (authoritative — overrides whatever the login form had selected).

---

## 3. Roles & what they can do

| Role | Can do |
|---|---|
| **provider** | Post food donations, view own donations + delivery progress |
| **ngo** | View matched/scored available food, claim it, view claims, confirm receipt |
| **volunteer** | View assigned deliveries, accept, update status step by step |

A request to an endpoint requiring a role the caller doesn't have returns `403`.
An NGO with `isAvailable: false` also gets `403` from the NGO food endpoints.

---

## 4. Food donation lifecycle

```
AVAILABLE → CLAIMED → DELIVERED
```

## 5. Delivery lifecycle

```
UNASSIGNED → ASSIGNED → ACCEPTED → PICKED_UP → IN_TRANSIT → DELIVERED
```

`UNASSIGNED` only happens if no volunteer was free at claim time — the claim
still succeeds, the NGO isn't blocked, it just waits for a volunteer.

---

## 6. API Reference

### Auth

**`GET /api/auth/demo-accounts`**
```json
[{ "userId": "...", "role": "provider", "name": "Hotel Meridian" }, ...]
```

**`POST /api/auth/demo-login`**
```json
{ "userId": "...", "role": "provider" }
```
→ `{ "userId": "...", "role": "provider", "name": "Hotel Meridian" }`
→ `401` if the id doesn't match a real seeded user.

---

### Provider

**`POST /api/provider/food`**
```json
{
  "foodName": "Rice and Dal",
  "quantity": 75,
  "foodType": "veg",
  "preparedAt": "2026-09-16T08:00:00",
  "expiresAt": "2026-09-16T10:30:00",
  "location": { "lat": 12.9698, "lng": 79.1559 }
}
```
→ returns the created food donation (status `AVAILABLE`).

**`GET /api/provider/food`**
→ this provider's donations, each including `foodId`, `remainingMinutes`,
`urgency`, `deliveryStatus`, and `ngo` (the claiming NGO's name, or `null`).

---

### NGO

**`GET /api/ngo/food/available`**
→ all `AVAILABLE` donations, scored for this NGO, sorted best-match first:
```json
[
  {
    "foodId": "...",
    "foodName": "Rice & Dal",
    "quantity": 75,
    "foodType": "veg",
    "providerId": "...",
    "providerName": "Hotel Meridian",
    "expiresAt": "...",
    "matchScore": 94.0,
    "matchFactors": {
      "distanceScore": 92.0,
      "quantityScore": 100.0,
      "urgencyScore": 75,
      "foodCompatibilityScore": 100.0,
      "distance": "Very close",
      "quantity": "Excellent fit",
      "foodCompatibility": "Compatible",
      "urgency": "High"
    },
    "matchReasons": ["Very close distance", "Quantity fits NGO capacity", "Compatible food type", "Urgent rescue needed"],
    "distanceKm": 1.4,
    "remainingMinutes": 32,
    "urgency": "HIGH"
  }
]
```
Returns `403` if this NGO is marked unavailable.

**`POST /api/ngo/food/{food_id}/claim`**
→ `200` with `{ food, delivery }` (raw Mongo-shaped docs) on success.
→ `409` if another NGO already claimed it. → `403` if this NGO is unavailable.

**`GET /api/ngo/claims`**
→ flat, frontend-ready list:
```json
[
  {
    "deliveryId": "...",
    "foodId": "...",
    "foodName": "Rice & Dal",
    "quantity": 75,
    "foodType": "veg",
    "providerName": "Hotel Meridian",
    "status": "CLAIMED",
    "deliveryStatus": "IN_TRANSIT",
    "volunteer": "Ravi Kumar",
    "expiresAt": "..."
  }
]
```

**`POST /api/ngo/delivery/{delivery_id}/confirm-receipt`**
→ only allowed once the volunteer has marked the delivery `DELIVERED`.

---

### Volunteer

**`GET /api/volunteer/assignments`**
→ flat, frontend-ready list:
```json
[
  {
    "deliveryId": "...",
    "foodId": "...",
    "foodName": "Rice & Dal",
    "quantity": 75,
    "foodType": "veg",
    "pickupLocation": "Hotel Meridian, Vellore Town",
    "dropLocation": "Hope Foundation, Katpadi",
    "deliveryStatus": "ASSIGNED"
  }
]
```

**`POST /api/volunteer/delivery/{delivery_id}/accept`**
→ `ASSIGNED → ACCEPTED`

**`PATCH /api/volunteer/delivery/{delivery_id}/status`**
```json
{ "status": "PICKED_UP" }
```
→ must follow the sequence `ACCEPTED → PICKED_UP → IN_TRANSIT → DELIVERED`;
skipping a step returns `400`. Reaching `DELIVERED` automatically marks the
food `DELIVERED` and frees the volunteer.

---

### Dashboard (any role)

**`GET /api/dashboard/stats`**
```json
{
  "totalDonations": 5,
  "totalMealsRescued": 0,
  "availableCount": 5,
  "claimedCount": 0,
  "deliveredCount": 0,
  "activeNgos": 3,
  "activeVolunteers": 4,
  "completedDeliveries": 0
}
```

---

## 7. File structure

```
backend/
├── main.py              # FastAPI app, CORS, router mounting
├── database.py           # MongoDB connection + collection handles
├── config.py              # thresholds, weights, DB name
├── auth.py                 # X-User-Id -> role resolution
├── utils.py                  # UTC time helpers, Mongo doc -> JSON
├── seed.py                    # demo data loader (prints X-User-Id values)
├── requirements.txt
├── models/                    # Pydantic request schemas
│   ├── common.py                # Location
│   ├── food.py                   # FoodCreate
│   └── delivery.py                # DeliveryStatusUpdate
├── routers/                    # HTTP endpoints, grouped by role
│   ├── auth.py                   # demo-accounts, demo-login
│   ├── provider.py
│   ├── ngo.py
│   ├── volunteer.py
│   └── dashboard.py
└── services/                    # business logic (the "smart" parts)
    ├── distance.py                # Haversine
    ├── urgency.py                  # expiry -> urgency label
    ├── matching.py                  # match score + explainability
    ├── claim.py                      # atomic claim (no double-claims)
    ├── assignment.py                  # nearest-volunteer auto-assignment
    └── lookup.py                       # id -> name / readable-label helpers
```

---

## 8. What changed in this revision

Found by diffing the already-built frontend's expectations against the
original backend responses:

1. Added `routers/auth.py` — the frontend called `POST /api/auth/demo-login`
   which never existed; login was silently failing every time.
2. `GET /api/ngo/food/available` now includes `providerName`.
3. `GET /api/provider/food` now includes `foodId` and `ngo` (claiming NGO's name).
4. `GET /api/ngo/claims` — rebuilt as a flat, enriched shape (was raw nested Mongo docs).
5. `GET /api/volunteer/assignments` — rebuilt as a flat, enriched shape with
   readable `pickupLocation`/`dropLocation` strings (was raw lat/lng objects).
6. `matchFactors` now also includes short text labels (`distance`,
   `quantity`, `foodCompatibility`, `urgency`) alongside the original numeric scores.
7. `seed.py` — providers/NGOs now also store an `area` string, used to build
   the readable pickup/drop labels above.

No endpoint paths, methods, status vocabulary, or the claim/assignment logic
changed — only response payload shape was enriched.
