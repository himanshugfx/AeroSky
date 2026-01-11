"""
SkyGuard India - Pydantic Schemas
Schema exports
"""

from app.schemas.registry import (
    # User
    UserBase,
    UserCreate,
    UserResponse,
    UserLogin,
    # Organization
    OrganizationBase,
    OrganizationCreate,
    OrganizationResponse,
    # Type Certificate
    TypeCertificateBase,
    TypeCertificateCreate,
    TypeCertificateUpdate,
    TypeCertificateResponse,
    # Drone
    DroneBase,
    DroneCreate,
    DroneUpdate,
    DroneResponse,
    DroneListResponse,
    # Pilot
    PilotBase,
    PilotCreate,
    PilotUpdate,
    PilotResponse,
    # UIN
    UINGenerationRequest,
    UINGenerationResponse,
    BatchUINRequest,
    BatchUINResponse,
)

from app.schemas.operations import (
    # Flight Plan
    FlightPlanBase,
    FlightPlanCreate,
    FlightPlanUpdate,
    FlightPlanResponse,
    FlightPlanListResponse,
    # NPNT
    NPNTValidationRequest,
    NPNTValidationResponse,
    ValidationCheckResponse,
    # Permission Artifact
    PermissionArtifactResponse,
    # Flight Log
    FlightLogEntryCreate,
    FlightLogBatchCreate,
    FlightLogIngestionResponse,
    FlightLogSummaryResponse,
    # Zone
    ZoneValidationRequest,
    ZoneValidationResponse,
)

__all__ = [
    # User
    "UserBase",
    "UserCreate",
    "UserResponse",
    "UserLogin",
    # Organization
    "OrganizationBase",
    "OrganizationCreate",
    "OrganizationResponse",
    # Type Certificate
    "TypeCertificateBase",
    "TypeCertificateCreate",
    "TypeCertificateUpdate",
    "TypeCertificateResponse",
    # Drone
    "DroneBase",
    "DroneCreate",
    "DroneUpdate",
    "DroneResponse",
    "DroneListResponse",
    # Pilot
    "PilotBase",
    "PilotCreate",
    "PilotUpdate",
    "PilotResponse",
    # UIN
    "UINGenerationRequest",
    "UINGenerationResponse",
    "BatchUINRequest",
    "BatchUINResponse",
    # Flight Plan
    "FlightPlanBase",
    "FlightPlanCreate",
    "FlightPlanUpdate",
    "FlightPlanResponse",
    "FlightPlanListResponse",
    # NPNT
    "NPNTValidationRequest",
    "NPNTValidationResponse",
    "ValidationCheckResponse",
    # Permission Artifact
    "PermissionArtifactResponse",
    # Flight Log
    "FlightLogEntryCreate",
    "FlightLogBatchCreate",
    "FlightLogIngestionResponse",
    "FlightLogSummaryResponse",
    # Zone
    "ZoneValidationRequest",
    "ZoneValidationResponse",
]
