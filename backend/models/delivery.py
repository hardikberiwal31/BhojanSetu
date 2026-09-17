"""
models/delivery.py
-------------------
Request schema for PATCH /api/volunteer/delivery/{delivery_id}/status
"""

from pydantic import BaseModel


class DeliveryStatusUpdate(BaseModel):
    status: str  # "PICKED_UP" | "IN_TRANSIT" | "DELIVERED"
