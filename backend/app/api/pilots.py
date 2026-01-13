from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.registry import Pilot, User, UserRole
from app.schemas.registry import PilotResponse, PilotCreate
from app.api.auth import get_current_user

router = APIRouter(prefix="/pilots", tags=["Pilots"])

@router.get("", response_model=List[PilotResponse])
async def list_pilots(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_roles(UserRole.TECHNICIAN, UserRole.FLEET_MANAGER, UserRole.RPTO_ADMIN, UserRole.DGCA_AUDITOR, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """List registered pilots."""
    query = select(Pilot)
    
    # Optional filtering by organization could be added here
    
    result = await db.execute(query.offset(skip).limit(limit))
    pilots = result.scalars().all()
    return pilots

@router.post("", response_model=PilotResponse, status_code=status.HTTP_201_CREATED)
async def create_pilot(
    pilot_data: PilotCreate,
    current_user: User = Depends(require_roles(UserRole.RPTO_ADMIN, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Register a new pilot."""
    pilot = Pilot(
        user_id=pilot_data.user_id,
        full_name=pilot_data.full_name,
        date_of_birth=pilot_data.date_of_birth,
        primary_id_type=pilot_data.primary_id_type,
        primary_id_number=pilot_data.primary_id_number,
        secondary_id_type=pilot_data.secondary_id_type,
        secondary_id_number=pilot_data.secondary_id_number,
        rpto_id=pilot_data.rpto_id,
        rpto_authorization_number=pilot_data.rpto_authorization_number,
        training_start_date=pilot_data.training_start_date,
        training_completion_date=pilot_data.training_completion_date,
        category_rating=pilot_data.category_rating,
        class_rating=pilot_data.class_rating,
        operation_rating=pilot_data.operation_rating,
        status="Active",
        total_flight_hours=0.0
    )
    
    db.add(pilot)
    await db.flush()
    await db.refresh(pilot)
    return pilot

@router.get("/{pilot_id}", response_model=PilotResponse)
async def get_pilot(
    pilot_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get pilot by ID."""
    result = await db.execute(select(Pilot).where(Pilot.id == pilot_id))
    pilot = result.scalar_one_or_none()
    
    if not pilot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pilot not found"
        )
    return pilot
