"""
models/food.py
---------------
Request schema for POST /api/provider/food
"""

from pydantic import BaseModel
from datetime import datetime
from models.common import Location


class FoodCreate(BaseModel):
    foodName: str
    quantity: int
    foodType: str  # "veg" | "non-veg" | "mixed"
    preparedAt: datetime
    expiresAt: datetime
    location: Location
