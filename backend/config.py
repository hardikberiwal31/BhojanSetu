"""
config.py
---------
All tunable constants for BhojanSetu live here, in one place, so nothing
important is buried inside business logic.
"""

import os

# ---------------------------------------------------------------------------
# Database connection
# ---------------------------------------------------------------------------
# You can override these with environment variables when deploying
# (e.g. a MongoDB Atlas connection string), or just run locally with
# the defaults below.
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "bhojansetu")

# ---------------------------------------------------------------------------
# Urgency thresholds (minutes remaining until food expires)
# ---------------------------------------------------------------------------
# remaining < URGENCY_CRITICAL_MAX                          -> CRITICAL
# URGENCY_CRITICAL_MAX <= remaining < URGENCY_HIGH_MAX       -> HIGH
# URGENCY_HIGH_MAX     <= remaining < URGENCY_MEDIUM_MAX     -> MEDIUM
# remaining >= URGENCY_MEDIUM_MAX                            -> LOW
URGENCY_CRITICAL_MAX = 10
URGENCY_HIGH_MAX = 30
URGENCY_MEDIUM_MAX = 60

# ---------------------------------------------------------------------------
# Matching engine weights (must sum to 1.0)
# ---------------------------------------------------------------------------
WEIGHT_DISTANCE = 0.30
WEIGHT_QUANTITY = 0.20
WEIGHT_URGENCY = 0.30
WEIGHT_FOOD_COMPAT = 0.20

# Distance scoring: score drops by this many points per km away.
# e.g. 0 km -> 100, 5 km -> 50, 10+ km -> 0
DISTANCE_PENALTY_PER_KM = 10
