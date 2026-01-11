"""
SkyGuard India - Flight Operations API
Flight planning, NPNT validation, and flight log management
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.registry import User, UserRole
from app.models.operations import FlightPlan, FlightStatus, PermissionArtifact, FlightLogSummary, ZoneType
from app.schemas.operations import (
    FlightPlanCreate,
    FlightPlanUpdate,
    FlightPlanResponse,
    FlightPlanListResponse,
    NPNTValidationRequest,
    NPNTValidationResponse,
    ValidationCheckResponse,
    PermissionArtifactResponse,
    FlightLogBatchCreate,
    FlightLogIngestionResponse,
    FlightLogSummaryResponse,
    ZoneValidationRequest,
    ZoneValidationResponse
)
from app.services.npnt_validator import NPNTValidator, ValidationResult
from app.services.log_ingestor import FlightLogIngestor, FlightLogEntry
from app.api.auth import get_current_user, require_roles

router = APIRouter(prefix="/flights", tags=["Flight Operations"])


# ============================================================================
# FLIGHT PLANS
# ============================================================================

@router.get("/plans", response_model=FlightPlanListResponse)
async def list_flight_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[FlightStatus] = None,
    drone_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List flight plans with optional filtering."""
    query = select(FlightPlan)
    
    # Filter by organization for non-admin users
    if current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.DGCA_AUDITOR]:
        if current_user.organization_id:
            query = query.where(FlightPlan.organization_id == current_user.organization_id)
    
    if status:
        query = query.where(FlightPlan.status == status)
    
    if drone_id:
        query = query.where(FlightPlan.drone_id == drone_id)
    
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()
    
    # Get paginated results
    query = query.offset(skip).limit(limit).order_by(FlightPlan.created_at.desc())
    result = await db.execute(query)
    plans = result.scalars().all()
    
    return FlightPlanListResponse(total=total, items=plans)


@router.get("/plans/{plan_id}", response_model=FlightPlanResponse)
async def get_flight_plan(
    plan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get flight plan by ID."""
    result = await db.execute(
        select(FlightPlan)
        .options(
            selectinload(FlightPlan.drone),
            selectinload(FlightPlan.pilot),
            selectinload(FlightPlan.permission_artifact)
        )
        .where(FlightPlan.id == plan_id)
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight plan not found"
        )
    
    return plan


@router.post("/plans", response_model=FlightPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_flight_plan(
    plan_data: FlightPlanCreate,
    current_user: User = Depends(require_roles(UserRole.PILOT, UserRole.FLEET_MANAGER, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Create a new flight plan."""
    plan = FlightPlan(
        drone_id=plan_data.drone_id,
        pilot_id=plan_data.pilot_id,
        organization_id=plan_data.organization_id or current_user.organization_id,
        flight_polygon_wkt=plan_data.flight_polygon_wkt,
        takeoff_lat=plan_data.takeoff_lat,
        takeoff_lon=plan_data.takeoff_lon,
        landing_lat=plan_data.landing_lat,
        landing_lon=plan_data.landing_lon,
        planned_start=plan_data.planned_start,
        planned_end=plan_data.planned_end,
        min_altitude_ft=plan_data.min_altitude_ft,
        max_altitude_ft=plan_data.max_altitude_ft,
        flight_purpose=plan_data.flight_purpose,
        payload_description=plan_data.payload_description,
        status=FlightStatus.DRAFT,
        created_by=current_user.id
    )
    
    db.add(plan)
    await db.flush()
    await db.refresh(plan)
    
    return plan


@router.patch("/plans/{plan_id}", response_model=FlightPlanResponse)
async def update_flight_plan(
    plan_id: UUID,
    plan_data: FlightPlanUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update flight plan."""
    result = await db.execute(
        select(FlightPlan).where(FlightPlan.id == plan_id)
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight plan not found"
        )
    
    # Update fields
    update_data = plan_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    await db.flush()
    await db.refresh(plan)
    
    return plan


# ============================================================================
# NPNT VALIDATION
# ============================================================================

@router.post("/validate-npnt", response_model=NPNTValidationResponse)
async def validate_npnt(
    request: NPNTValidationRequest,
    current_user: User = Depends(require_roles(UserRole.PILOT, UserRole.FLEET_MANAGER, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """
    Validate flight for NPNT compliance.
    
    This is the core safety check that must pass before a drone can take off.
    """
    validator = NPNTValidator(db)
    
    result = await validator.validate_flight(
        drone_id=request.drone_id,
        pilot_id=request.pilot_id,
        flight_plan_id=request.flight_plan_id
    )
    
    # Convert checks to response format
    checks = [
        ValidationCheckResponse(
            check_name=c.check_name,
            result=c.result.value,
            message=c.message,
            details=c.details
        )
        for c in result.checks
    ]
    
    # If valid, create permission artifact record
    if result.is_valid and result.permission_artifact:
        # Get flight plan
        plan_result = await db.execute(
            select(FlightPlan).where(FlightPlan.id == request.flight_plan_id)
        )
        plan = plan_result.scalar_one_or_none()
        
        if plan:
            await validator.create_permission_artifact_record(
                flight_plan=plan,
                artifact_json=result.permission_artifact
            )
            
            # Update flight plan status
            plan.status = FlightStatus.APPROVED
            plan.zone_validated_at = datetime.utcnow()
            await db.flush()
    
    return NPNTValidationResponse(
        is_valid=result.is_valid,
        checks=checks,
        permission_artifact=result.permission_artifact,
        error_message=result.error_message
    )


@router.get("/plans/{plan_id}/permission-artifact", response_model=PermissionArtifactResponse)
async def get_permission_artifact(
    plan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get permission artifact for a flight plan."""
    result = await db.execute(
        select(PermissionArtifact).where(PermissionArtifact.flight_plan_id == plan_id)
    )
    artifact = result.scalar_one_or_none()
    
    if not artifact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission artifact not found"
        )
    
    return artifact


# ============================================================================
# ZONE VALIDATION
# ============================================================================

@router.post("/validate-zone", response_model=ZoneValidationResponse)
async def validate_zone(
    request: ZoneValidationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Validate airspace zone at given coordinates.
    
    In production, this would query the DGCA Digital Sky API.
    This mock implementation returns based on simple rules.
    """
    # Mock zone validation logic
    # In production: call Digital Sky API
    
    # Simple mock rules:
    # - Near airports (example coords) = RED
    # - Near military areas = RED
    # - Near protected areas = YELLOW
    # - Otherwise = GREEN
    
    lat, lon = request.latitude, request.longitude
    
    # Example restricted areas (mock)
    restricted_areas = [
        {"lat": 28.5562, "lon": 77.1000, "radius_km": 5, "type": "RED", "name": "IGI Airport"},
        {"lat": 19.0896, "lon": 72.8656, "radius_km": 5, "type": "RED", "name": "Mumbai Airport"},
        {"lat": 28.6139, "lon": 77.2090, "radius_km": 2, "type": "YELLOW", "name": "New Delhi Center"},
    ]
    
    def haversine_distance(lat1, lon1, lat2, lon2):
        """Approximate distance in km."""
        return ((lat2-lat1)**2 + (lon2-lon1)**2)**0.5 * 111
    
    for area in restricted_areas:
        dist = haversine_distance(lat, lon, area["lat"], area["lon"])
        if dist < area["radius_km"]:
            zone_type = ZoneType.RED if area["type"] == "RED" else ZoneType.YELLOW
            return ZoneValidationResponse(
                zone_type=zone_type,
                is_flyable=zone_type != ZoneType.RED,
                restrictions=[f"Near {area['name']}"],
                additional_permissions_required=zone_type == ZoneType.YELLOW,
                message=f"Location is within {area['name']} restricted zone"
            )
    
    return ZoneValidationResponse(
        zone_type=ZoneType.GREEN,
        is_flyable=True,
        restrictions=None,
        additional_permissions_required=False,
        message="Location is in GREEN zone - no restrictions"
    )


# ============================================================================
# FLIGHT LOGS
# ============================================================================

@router.post("/logs/ingest", response_model=FlightLogIngestionResponse)
async def ingest_flight_logs(
    request: FlightLogBatchCreate,
    current_user: User = Depends(require_roles(UserRole.PILOT, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest flight log data.
    
    Validates cryptographic hash chain and detects compliance violations.
    """
    ingestor = FlightLogIngestor(db)
    
    # Convert to service format
    entries = [
        FlightLogEntry(
            timestamp=e.timestamp,
            latitude=e.latitude,
            longitude=e.longitude,
            altitude_m=e.altitude_m,
            altitude_agl_m=e.altitude_agl_m,
            heading_deg=e.heading_deg,
            pitch_deg=e.pitch_deg,
            roll_deg=e.roll_deg,
            ground_speed_mps=e.ground_speed_mps,
            vertical_speed_mps=e.vertical_speed_mps,
            battery_voltage=e.battery_voltage,
            battery_percentage=e.battery_percentage,
            motor_rpm=e.motor_rpm,
            gps_satellites=e.gps_satellites,
            signal_strength=e.signal_strength,
            sequence_number=e.sequence_number,
            previous_hash=e.previous_hash,
            entry_hash=e.entry_hash,
            drone_signature=e.drone_signature
        )
        for e in request.entries
    ]
    
    result = await ingestor.ingest_flight_log(
        drone_id=request.drone_id,
        flight_plan_id=request.flight_plan_id,
        log_entries=entries,
        verify_chain=request.verify_chain
    )
    
    return FlightLogIngestionResponse(
        success=result.success,
        entries_processed=result.entries_processed,
        entries_accepted=result.entries_accepted,
        entries_rejected=result.entries_rejected,
        chain_status=result.chain_status.value,
        violations_detected=result.violations_detected,
        summary_id=result.summary_id,
        error_message=result.error_message
    )


@router.get("/plans/{plan_id}/summary", response_model=FlightLogSummaryResponse)
async def get_flight_summary(
    plan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get flight log summary for a flight plan."""
    result = await db.execute(
        select(FlightLogSummary).where(FlightLogSummary.flight_plan_id == plan_id)
    )
    summary = result.scalar_one_or_none()
    
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight summary not found"
        )
    
    return summary


@router.post("/plans/{plan_id}/start", response_model=FlightPlanResponse)
async def start_flight(
    plan_id: UUID,
    current_user: User = Depends(require_roles(UserRole.PILOT, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Mark flight as started (in progress)."""
    result = await db.execute(
        select(FlightPlan).where(FlightPlan.id == plan_id)
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight plan not found"
        )
    
    if plan.status != FlightStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start flight with status '{plan.status.value}'. Must be 'Approved'."
        )
    
    plan.status = FlightStatus.IN_PROGRESS
    plan.actual_start = datetime.utcnow()
    await db.flush()
    await db.refresh(plan)
    
    return plan


@router.post("/plans/{plan_id}/complete", response_model=FlightPlanResponse)
async def complete_flight(
    plan_id: UUID,
    current_user: User = Depends(require_roles(UserRole.PILOT, UserRole.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db)
):
    """Mark flight as completed."""
    result = await db.execute(
        select(FlightPlan).where(FlightPlan.id == plan_id)
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight plan not found"
        )
    
    if plan.status != FlightStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete flight with status '{plan.status.value}'. Must be 'InProgress'."
        )
    
    plan.status = FlightStatus.COMPLETED
    plan.actual_end = datetime.utcnow()
    await db.flush()
    await db.refresh(plan)
    
    return plan
