"""
SkyGuard India - Pydantic Schemas
API request/response models for Operations module
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.operations import FlightStatus, PermissionStatus, ZoneType


# ============================================================================
# FLIGHT PLAN SCHEMAS
# ============================================================================

class FlightPlanBase(BaseModel):
    """Base flight plan schema."""
    flight_polygon_wkt: Optional[str] = None  # WKT format
    takeoff_lat: Optional[float] = None
    takeoff_lon: Optional[float] = None
    landing_lat: Optional[float] = None
    landing_lon: Optional[float] = None
    planned_start: datetime
    planned_end: datetime
    min_altitude_ft: int = 0
    max_altitude_ft: int
    flight_purpose: Optional[str] = None
    payload_description: Optional[str] = None


class FlightPlanCreate(FlightPlanBase):
    """Flight plan creation schema."""
    drone_id: UUID
    pilot_id: UUID
    organization_id: Optional[UUID] = None


class FlightPlanUpdate(BaseModel):
    """Flight plan update schema."""
    status: Optional[FlightStatus] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    preflight_checklist_completed: Optional[bool] = None
    preflight_checklist_data: Optional[dict] = None
    rejection_reason: Optional[str] = None


class FlightPlanResponse(FlightPlanBase):
    """Flight plan response schema."""
    id: UUID
    drone_id: UUID
    pilot_id: UUID
    organization_id: Optional[UUID] = None
    zone_status: Optional[ZoneType] = None
    zone_validated_at: Optional[datetime] = None
    preflight_checklist_completed: bool
    status: FlightStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


class FlightPlanListResponse(BaseModel):
    """Flight plan list response schema."""
    total: int
    items: List[FlightPlanResponse]


# ============================================================================
# NPNT VALIDATION SCHEMAS
# ============================================================================

class NPNTValidationRequest(BaseModel):
    """NPNT validation request schema."""
    drone_id: UUID
    pilot_id: UUID
    flight_plan_id: UUID


class ValidationCheckResponse(BaseModel):
    """Individual validation check response."""
    check_name: str
    result: str  # 'passed', 'failed', 'warning'
    message: str
    details: Optional[dict] = None


class NPNTValidationResponse(BaseModel):
    """NPNT validation response schema."""
    is_valid: bool
    checks: List[ValidationCheckResponse]
    permission_artifact: Optional[str] = None
    error_message: Optional[str] = None


# ============================================================================
# PERMISSION ARTIFACT SCHEMAS
# ============================================================================

class PermissionArtifactResponse(BaseModel):
    """Permission artifact response schema."""
    id: UUID
    flight_plan_id: UUID
    artifact_json: Optional[dict] = None
    dgca_signature: str
    issued_at: datetime
    valid_from: datetime
    valid_until: datetime
    status: PermissionStatus
    
    class Config:
        from_attributes = True


# ============================================================================
# FLIGHT LOG SCHEMAS
# ============================================================================

class FlightLogEntryCreate(BaseModel):
    """Flight log entry creation schema."""
    timestamp: datetime
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    altitude_m: float
    altitude_agl_m: Optional[float] = None
    heading_deg: Optional[float] = Field(default=None, ge=0, le=360)
    pitch_deg: Optional[float] = Field(default=None, ge=-90, le=90)
    roll_deg: Optional[float] = Field(default=None, ge=-180, le=180)
    ground_speed_mps: Optional[float] = None
    vertical_speed_mps: Optional[float] = None
    battery_voltage: Optional[float] = None
    battery_percentage: Optional[int] = Field(default=None, ge=0, le=100)
    motor_rpm: Optional[List[int]] = None
    gps_satellites: Optional[int] = None
    signal_strength: Optional[int] = None
    sequence_number: int
    previous_hash: Optional[str] = None
    entry_hash: Optional[str] = None
    drone_signature: Optional[str] = None


class FlightLogBatchCreate(BaseModel):
    """Batch flight log creation schema."""
    drone_id: UUID
    flight_plan_id: UUID
    entries: List[FlightLogEntryCreate]
    verify_chain: bool = True


class FlightLogIngestionResponse(BaseModel):
    """Flight log ingestion response schema."""
    success: bool
    entries_processed: int
    entries_accepted: int
    entries_rejected: int
    chain_status: str  # 'valid', 'tampered', 'missing_entries', 'invalid_signature'
    violations_detected: List[str]
    summary_id: Optional[UUID] = None
    error_message: Optional[str] = None


# ============================================================================
# FLIGHT LOG SUMMARY SCHEMAS
# ============================================================================

class FlightLogSummaryResponse(BaseModel):
    """Flight log summary response schema."""
    id: UUID
    flight_plan_id: UUID
    drone_id: UUID
    pilot_id: UUID
    takeoff_time: Optional[datetime] = None
    landing_time: Optional[datetime] = None
    total_flight_duration_sec: Optional[int] = None
    total_distance_km: Optional[float] = None
    max_altitude_m: Optional[float] = None
    avg_altitude_m: Optional[float] = None
    max_speed_mps: Optional[float] = None
    avg_speed_mps: Optional[float] = None
    battery_start_percentage: Optional[int] = None
    battery_end_percentage: Optional[int] = None
    geofence_breaches: int = 0
    altitude_violations: int = 0
    permission_artifact_valid: Optional[bool] = None
    total_log_entries: Optional[int] = None
    chain_verified: Optional[bool] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# ZONE VALIDATION SCHEMAS
# ============================================================================

class ZoneValidationRequest(BaseModel):
    """Zone validation request schema."""
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    altitude_ft: Optional[int] = None


class ZoneValidationResponse(BaseModel):
    """Zone validation response schema."""
    zone_type: ZoneType
    is_flyable: bool
    restrictions: Optional[List[str]] = None
    additional_permissions_required: bool = False
    message: str
