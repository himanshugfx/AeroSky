"""
SkyGuard India - Drones API
Drone registration and UIN management (Form D-2)
"""

from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.rbac import Permission, has_permission, UserRole as RBACRole
from app.models.registry import Drone, User, UserRole, DroneStatus
from app.schemas.registry import (
    DroneCreate,
    DroneUpdate,
    DroneResponse,
    DroneListResponse,
    UINGenerationRequest as UINRequest,
    UINGenerationResponse,
    BatchUINRequest,
    BatchUINResponse
)
from app.services.uin_generator import (
    UINGenerator,
    UINGenerationRequest
)
from app.api.auth import get_current_user, require_roles

router = APIRouter(prefix="/drones", tags=["Drones"])


@router.get("", response_model=DroneListResponse)
async def list_drones(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[DroneStatus] = None,
    organization_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List drones with optional filtering."""
    query = select(Drone)
    
    # Filter by organization for non-admin users
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.DGCA_AUDITOR]:
        if current_user.organization_id:
            query = query.where(Drone.organization_id == current_user.organization_id)
        else:
            query = query.where(Drone.owner_id == current_user.id)
    elif organization_id:
        query = query.where(Drone.organization_id == organization_id)
    
    if status:
        query = query.where(Drone.status == status)
    
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # Get paginated results
    query = query.offset(skip).limit(limit).order_by(Drone.created_at.desc())
    result = await db.execute(query)
    drones = result.scalars().all()
    
    return DroneListResponse(total=total, items=drones)


@router.get("/{drone_id}", response_model=DroneResponse)
async def get_drone(
    drone_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get drone by ID."""
    result = await db.execute(
        select(Drone)
        .options(selectinload(Drone.type_certificate))
        .where(Drone.id == drone_id)
    )
    drone = result.scalar_one_or_none()
    
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drone not found"
        )
    
    # Check access permissions
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.DGCA_AUDITOR]:
        if drone.organization_id != current_user.organization_id and drone.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return drone


@router.post("", response_model=DroneResponse, status_code=status.HTTP_201_CREATED)
async def create_drone(
    drone_data: DroneCreate,
    current_user: User = Depends(require_roles(UserRole.MANUFACTURER, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Create a new drone (without UIN - use /generate-uin for full registration)."""
    drone = Drone(
        manufacturer_serial_number=drone_data.manufacturer_serial_number,
        fcm_serial_number=drone_data.fcm_serial_number,
        rps_serial_number=drone_data.rps_serial_number,
        type_certificate_id=drone_data.type_certificate_id,
        owner_id=drone_data.owner_id or current_user.id,
        organization_id=drone_data.organization_id or current_user.organization_id,
        status=DroneStatus.DRAFT,
        created_by=current_user.id
    )
    
    db.add(drone)
    await db.flush()
    await db.refresh(drone)
    
    return drone


@router.patch("/{drone_id}", response_model=DroneResponse)
async def update_drone(
    drone_id: UUID,
    drone_data: DroneUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update drone details."""
    result = await db.execute(
        select(Drone).where(Drone.id == drone_id)
    )
    drone = result.scalar_one_or_none()
    
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drone not found"
        )
    
    # Check permissions
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.MANUFACTURER]:
        if drone.organization_id != current_user.organization_id and drone.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Update fields
    update_data = drone_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(drone, field, value)
    
    await db.flush()
    await db.refresh(drone)
    
    return drone


@router.post("/generate-uin", response_model=UINGenerationResponse)
async def generate_uin(
    request: UINRequest,
    current_user: User = Depends(require_roles(UserRole.MANUFACTURER, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Generate UIN for a drone (Form D-2 submission)."""
    generator = UINGenerator(db)
    
    uin_request = UINGenerationRequest(
        manufacturer_serial_number=request.manufacturer_serial_number,
        fcm_serial_number=request.fcm_serial_number,
        rps_serial_number=request.rps_serial_number,
        type_certificate_id=request.type_certificate_id,
        owner_id=request.owner_id,
        organization_id=request.organization_id or current_user.organization_id
    )
    
    result = await generator.generate_uin(uin_request)
    
    return UINGenerationResponse(
        success=result.success,
        uin=result.uin,
        dan=result.dan,
        drone_id=result.drone_id,
        error_message=result.error_message
    )


@router.post("/generate-uin/batch", response_model=BatchUINResponse)
async def generate_uin_batch(
    request: BatchUINRequest,
    current_user: User = Depends(require_roles(UserRole.MANUFACTURER, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Generate UINs for multiple drones in batch."""
    generator = UINGenerator(db)
    
    uin_requests = [
        UINGenerationRequest(
            manufacturer_serial_number=r.manufacturer_serial_number,
            fcm_serial_number=r.fcm_serial_number,
            rps_serial_number=r.rps_serial_number,
            type_certificate_id=r.type_certificate_id,
            owner_id=r.owner_id,
            organization_id=r.organization_id or current_user.organization_id
        )
        for r in request.requests
    ]
    
    result = await generator.generate_batch(uin_requests)
    
    return BatchUINResponse(
        total_requested=result.total_requested,
        successful=result.successful,
        failed=result.failed,
        results=[
            UINGenerationResponse(
                success=r.success,
                uin=r.uin,
                dan=r.dan,
                drone_id=r.drone_id,
                error_message=r.error_message
            )
            for r in result.results
        ]
    )


@router.get("/{drone_id}/uin", response_model=dict)
async def get_uin_details(
    drone_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get UIN details and registration status for a drone."""
    result = await db.execute(
        select(Drone)
        .options(selectinload(Drone.type_certificate))
        .where(Drone.id == drone_id)
    )
    drone = result.scalar_one_or_none()
    
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drone not found"
        )
    
    return {
        "drone_id": str(drone.id),
        "uin": drone.uin,
        "dan": drone.dan,
        "status": drone.status.value,
        "registration_date": str(drone.registration_date) if drone.registration_date else None,
        "manufacturer_serial": drone.manufacturer_serial_number,
        "fcm_serial": drone.fcm_serial_number,
        "rps_serial": drone.rps_serial_number,
        "type_certificate": {
            "model_name": drone.type_certificate.model_name if drone.type_certificate else None,
            "certificate_number": drone.type_certificate.certificate_number if drone.type_certificate else None
        } if drone.type_certificate else None
    }


@router.post("/{drone_id}/activate", response_model=DroneResponse)
async def activate_drone(
    drone_id: UUID,
    current_user: User = Depends(require_roles(UserRole.MANUFACTURER, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Activate a registered drone (sets status to Active)."""
    result = await db.execute(
        select(Drone).where(Drone.id == drone_id)
    )
    drone = result.scalar_one_or_none()
    
    if not drone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Drone not found"
        )
    
    if not drone.uin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Drone must have a UIN before activation"
        )
    
    if drone.status not in [DroneStatus.REGISTERED, DroneStatus.DRAFT]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot activate drone with status '{drone.status.value}'"
        )
    
    drone.status = DroneStatus.ACTIVE
    await db.flush()
    await db.refresh(drone)
    
    return drone
