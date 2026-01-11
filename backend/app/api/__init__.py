"""
SkyGuard India - API Router
Main API route aggregation
"""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.drones import router as drones_router
from app.api.flights import router as flights_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(drones_router)
api_router.include_router(flights_router)

__all__ = ["api_router"]
