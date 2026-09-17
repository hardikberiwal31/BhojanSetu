"""
models/common.py
-----------------
Small schemas shared across multiple request bodies.
"""

from pydantic import BaseModel


class Location(BaseModel):
    lat: float
    lng: float
