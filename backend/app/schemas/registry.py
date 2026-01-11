"""
SkyGuard India - Pydantic Schemas
API request/response models for Registry module
"""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr


# ============================================================================
# ENUMS (Pydantic compatible)
# ============================================================================

from app.models.registry import (
    DroneCategory,
    DroneSubCategory,
    DroneClass,
    CertificationStatus,
    DroneStatus,
    PilotStatus,
    IDType,
    OperationRating,
    UserRole
)


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.PILOT


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(min_length=8)
    organization_id: Optional[UUID] = None


class UserResponse(UserBase):
    """User response schema."""
    id: UUID
    is_active: bool
    email_verified: bool
    organization_id: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str


# ============================================================================
# ORGANIZATION SCHEMAS
# ============================================================================

class OrganizationBase(BaseModel):
    """Base organization schema."""
    name: str
    legal_name: Optional[str] = None
    gstin: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    org_type: Optional[str] = None
    is_government_entity: bool = False


class OrganizationCreate(OrganizationBase):
    """Organization creation schema."""
    pass


class OrganizationResponse(OrganizationBase):
    """Organization response schema."""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# TYPE CERTIFICATE SCHEMAS (Form D-1)
# ============================================================================

class TypeCertificateBase(BaseModel):
    """Base type certificate schema."""
    model_name: str
    model_number: Optional[str] = None
    category: DroneCategory
    sub_category: DroneSubCategory
    weight_class: DroneClass
    max_takeoff_weight_kg: float
    empty_weight_kg: Optional[float] = None
    payload_capacity_kg: Optional[float] = None
    length_mm: Optional[int] = None
    width_mm: Optional[int] = None
    height_mm: Optional[int] = None
    rotor_diameter_mm: Optional[int] = None
    wing_span_mm: Optional[int] = None
    num_rotors: Optional[int] = None
    max_endurance_min: Optional[int] = None
    max_range_km: Optional[float] = None
    max_speed_mps: Optional[float] = None
    max_altitude_ft: Optional[int] = None
    engine_type: Optional[str] = None
    motor_type: Optional[str] = None
    power_rating_kw: Optional[float] = None
    num_engines: int = 1
    battery_capacity_mah: Optional[int] = None
    battery_type: Optional[str] = None
    fcm_make: Optional[str] = None
    fcm_model: Optional[str] = None
    rps_make: Optional[str] = None
    rps_model: Optional[str] = None
    gcs_software_version: Optional[str] = None
    frequency_band: Optional[str] = None
    npnt_compliant: bool = False
    geofencing_capable: bool = False
    return_to_home: bool = False
    obstacle_avoidance: bool = False
    tracking_beacon: bool = False
    compatible_payloads: Optional[List[dict]] = None
    operating_manual_url: Optional[str] = None
    maintenance_guidelines_url: Optional[str] = None
    maintenance_schedule_hours: Optional[int] = None


class TypeCertificateCreate(TypeCertificateBase):
    """Type certificate creation schema."""
    manufacturer_id: UUID


class TypeCertificateUpdate(BaseModel):
    """Type certificate update schema."""
    certification_status: Optional[CertificationStatus] = None
    certificate_number: Optional[str] = None
    certified_date: Optional[date] = None
    expiry_date: Optional[date] = None


class TypeCertificateResponse(TypeCertificateBase):
    """Type certificate response schema."""
    id: UUID
    manufacturer_id: UUID
    certificate_number: Optional[str] = None
    certification_status: CertificationStatus
    certified_date: Optional[date] = None
    expiry_date: Optional[date] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# DRONE SCHEMAS (Form D-2)
# ============================================================================

class DroneBase(BaseModel):
    """Base drone schema."""
    manufacturer_serial_number: str
    fcm_serial_number: Optional[str] = None
    rps_serial_number: Optional[str] = None


class DroneCreate(DroneBase):
    """Drone creation schema."""
    type_certificate_id: UUID
    owner_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None


class DroneUpdate(BaseModel):
    """Drone update schema."""
    status: Optional[DroneStatus] = None
    assigned_pilot_id: Optional[UUID] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_coverage_amount: Optional[float] = None
    insurance_start_date: Optional[date] = None
    insurance_expiry_date: Optional[date] = None
    current_firmware_version: Optional[str] = None


class DroneResponse(DroneBase):
    """Drone response schema."""
    id: UUID
    uin: Optional[str] = None
    dan: Optional[str] = None
    type_certificate_id: UUID
    owner_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    status: DroneStatus
    registration_date: Optional[date] = None
    insurance_policy_number: Optional[str] = None
    insurance_expiry_date: Optional[date] = None
    current_firmware_version: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DroneListResponse(BaseModel):
    """Drone list response schema."""
    total: int
    items: List[DroneResponse]


# ============================================================================
# PILOT SCHEMAS (Form D-4)
# ============================================================================

class PilotBase(BaseModel):
    """Base pilot schema."""
    full_name: str
    date_of_birth: date
    primary_id_type: IDType
    primary_id_number: str
    secondary_id_type: Optional[IDType] = None
    secondary_id_number: Optional[str] = None


class PilotCreate(PilotBase):
    """Pilot creation schema."""
    user_id: UUID
    rpto_id: Optional[UUID] = None
    rpto_authorization_number: Optional[str] = None
    training_start_date: Optional[date] = None
    training_completion_date: Optional[date] = None
    category_rating: Optional[DroneCategory] = None
    class_rating: Optional[DroneClass] = None
    operation_rating: OperationRating = OperationRating.VLOS


class PilotUpdate(BaseModel):
    """Pilot update schema."""
    status: Optional[PilotStatus] = None
    category_rating: Optional[DroneCategory] = None
    class_rating: Optional[DroneClass] = None
    operation_rating: Optional[OperationRating] = None
    medical_certificate_number: Optional[str] = None
    medical_expiry_date: Optional[date] = None
    total_flight_hours: Optional[float] = None


class PilotResponse(PilotBase):
    """Pilot response schema."""
    id: UUID
    user_id: UUID
    rpc_number: Optional[str] = None
    rpto_id: Optional[UUID] = None
    category_rating: Optional[DroneCategory] = None
    class_rating: Optional[DroneClass] = None
    operation_rating: OperationRating
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: PilotStatus
    total_flight_hours: float
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# UIN GENERATION SCHEMAS
# ============================================================================

class UINGenerationRequest(BaseModel):
    """UIN generation request schema."""
    manufacturer_serial_number: str
    fcm_serial_number: str
    rps_serial_number: str
    type_certificate_id: UUID
    owner_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None


class UINGenerationResponse(BaseModel):
    """UIN generation response schema."""
    success: bool
    uin: Optional[str] = None
    dan: Optional[str] = None
    drone_id: Optional[UUID] = None
    error_message: Optional[str] = None


class BatchUINRequest(BaseModel):
    """Batch UIN generation request schema."""
    requests: List[UINGenerationRequest]


class BatchUINResponse(BaseModel):
    """Batch UIN generation response schema."""
    total_requested: int
    successful: int
    failed: int
    results: List[UINGenerationResponse]
