"""
database.py
------------
One shared MongoDB connection for the whole backend.
We use plain, synchronous PyMongo (not Motor/async) on purpose -- it's
simpler to read, debug, and reason about for a 4-hour build, and FastAPI
runs sync route functions in a threadpool automatically, so this is fine
for a hackathon prototype's traffic levels.
"""

from pymongo import MongoClient
from config import MONGO_URL, DB_NAME

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# One collection handle per entity, imported wherever needed.
users_collection = db["users"]
providers_collection = db["providers"]
ngos_collection = db["ngos"]
volunteers_collection = db["volunteers"]
food_collection = db["food_donations"]
deliveries_collection = db["deliveries"]
