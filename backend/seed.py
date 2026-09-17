"""
seed.py
-------
Wipes the database and inserts demo data for the hackathon walkthrough:
3 providers, 3 NGOs, 4 volunteers, 5 food donations, all placed around
the Vellore / Katpadi area with varying distances so the matching engine
produces visibly different scores.

Run once before the demo:
    python seed.py

IMPORTANT: this prints out the X-User-Id value for every seeded user.
The frontend team needs these values -- each one is what gets sent in the
`X-User-Id` header to "log in" as that provider / NGO / volunteer.
"""

from datetime import timedelta

from database import (
    users_collection,
    providers_collection,
    ngos_collection,
    volunteers_collection,
    food_collection,
    deliveries_collection,
)
from utils import now_utc


def clear_all():
    for collection in [
        users_collection,
        providers_collection,
        ngos_collection,
        volunteers_collection,
        food_collection,
        deliveries_collection,
    ]:
        collection.delete_many({})


def seed():
    clear_all()
    print("=" * 70)
    print("BhojanSetu seed data — X-User-Id values for testing each role")
    print("=" * 70)

    # -----------------------------------------------------------------
    # PROVIDERS
    # -----------------------------------------------------------------
    providers_data = [
        {"name": "Hotel Meridian", "phone": "9000000001", "area": "Vellore Town",
         "location": {"lat": 12.9698, "lng": 79.1559}},
        {"name": "Spice Route Caterers", "phone": "9000000002", "area": "Bagayam",
         "location": {"lat": 12.9250, "lng": 79.1350}},
        {"name": "Green Leaf Canteen", "phone": "9000000003", "area": "Katpadi",
         "location": {"lat": 13.0100, "lng": 79.1700}},
    ]
    provider_ids = []
    print("\n-- PROVIDERS --")
    for p in providers_data:
        user_id = users_collection.insert_one({
            "name": p["name"], "role": "provider", "phone": p["phone"], "createdAt": now_utc(),
        }).inserted_id
        provider_id = providers_collection.insert_one({
            "userId": user_id, "name": p["name"], "area": p["area"], "location": p["location"],
        }).inserted_id
        provider_ids.append(provider_id)
        print(f"  {p['name']:22s} X-User-Id: {user_id}")

    # -----------------------------------------------------------------
    # NGOs
    # -----------------------------------------------------------------
    ngos_data = [
        {"name": "Hope Foundation", "phone": "9100000001", "area": "Katpadi",
         "location": {"lat": 12.9716, "lng": 79.1462},
         "foodPreferences": ["veg", "mixed"], "capacity": 100},
        {"name": "Sunrise Shelter", "phone": "9100000002", "area": "Bagayam",
         "location": {"lat": 12.9280, "lng": 79.1400},
         "foodPreferences": ["non-veg", "mixed"], "capacity": 50},
        {"name": "Anna Seva Trust", "phone": "9100000003", "area": "Gandhi Nagar, Vellore",
         "location": {"lat": 13.0000, "lng": 79.1650},
         "foodPreferences": ["veg", "non-veg", "mixed"], "capacity": 200},
    ]
    ngo_ids = []
    print("\n-- NGOs --")
    for n in ngos_data:
        user_id = users_collection.insert_one({
            "name": n["name"], "role": "ngo", "phone": n["phone"], "createdAt": now_utc(),
        }).inserted_id
        ngo_id = ngos_collection.insert_one({
            "userId": user_id,
            "name": n["name"],
            "area": n["area"],
            "location": n["location"],
            "foodPreferences": n["foodPreferences"],
            "capacity": n["capacity"],
            "isAvailable": True,
        }).inserted_id
        ngo_ids.append(ngo_id)
        print(f"  {n['name']:22s} X-User-Id: {user_id}")

    # -----------------------------------------------------------------
    # VOLUNTEERS
    # -----------------------------------------------------------------
    volunteers_data = [
        {"name": "Ravi Kumar", "phone": "9200000001", "location": {"lat": 12.9700, "lng": 79.1500}},
        {"name": "Priya S", "phone": "9200000002", "location": {"lat": 12.9300, "lng": 79.1380}},
        {"name": "Arjun M", "phone": "9200000003", "location": {"lat": 13.0050, "lng": 79.1680}},
        {"name": "Fatima N", "phone": "9200000004", "location": {"lat": 12.9500, "lng": 79.1600}},
    ]
    print("\n-- VOLUNTEERS --")
    for v in volunteers_data:
        user_id = users_collection.insert_one({
            "name": v["name"], "role": "volunteer", "phone": v["phone"], "createdAt": now_utc(),
        }).inserted_id
        volunteers_collection.insert_one({
            "userId": user_id,
            "name": v["name"],
            "location": v["location"],
            "currentStatus": "AVAILABLE",
        })
        print(f"  {v['name']:22s} X-User-Id: {user_id}")

    # -----------------------------------------------------------------
    # FOOD DONATIONS
    # (deliberately varied: distance, quantity, type, urgency)
    # -----------------------------------------------------------------
    foods_data = [
        {"providerId": provider_ids[0], "foodName": "Rice & Dal", "quantity": 75,
         "foodType": "veg", "preparedMinsAgo": 120, "expiresInMins": 32,
         "location": providers_data[0]["location"]},
        {"providerId": provider_ids[1], "foodName": "Chicken Biryani", "quantity": 40,
         "foodType": "non-veg", "preparedMinsAgo": 60, "expiresInMins": 55,
         "location": providers_data[1]["location"]},
        {"providerId": provider_ids[2], "foodName": "Mixed Snacks", "quantity": 120,
         "foodType": "mixed", "preparedMinsAgo": 180, "expiresInMins": 8,
         "location": providers_data[2]["location"]},
        {"providerId": provider_ids[0], "foodName": "Veg Thali", "quantity": 30,
         "foodType": "veg", "preparedMinsAgo": 30, "expiresInMins": 90,
         "location": providers_data[0]["location"]},
        {"providerId": provider_ids[1], "foodName": "Non-veg Curry", "quantity": 200,
         "foodType": "non-veg", "preparedMinsAgo": 45, "expiresInMins": 20,
         "location": providers_data[1]["location"]},
    ]
    print("\n-- FOOD DONATIONS --")
    for f in foods_data:
        food_collection.insert_one({
            "providerId": f["providerId"],
            "foodName": f["foodName"],
            "quantity": f["quantity"],
            "foodType": f["foodType"],
            "preparedAt": now_utc() - timedelta(minutes=f["preparedMinsAgo"]),
            "expiresAt": now_utc() + timedelta(minutes=f["expiresInMins"]),
            "location": f["location"],
            "status": "AVAILABLE",
            "claimedByNgoId": None,
            "createdAt": now_utc(),
        })
        print(f"  {f['foodName']:20s} {f['quantity']:>4} meals   expires in {f['expiresInMins']} min")

    print("\n" + "=" * 70)
    print("Seed complete. Use the X-User-Id values above to test each role.")
    print("(The frontend's login screen can also fetch these automatically")
    print(" from GET /api/auth/demo-accounts once the server is running.)")
    print("=" * 70)


if __name__ == "__main__":
    seed()
