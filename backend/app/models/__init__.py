"""
SkyGuard India - SQLAlchemy Models
Model exports
"""

from app.models.registry import (
    Organization,
    User,
    TypeCertificate,
    Drone,
    Pilot,
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

from app.models.operations import (
    FlightPlan,
    PermissionArtifact,
    FlightLog,
    FlightLogSummary,
    FlightStatus,
    PermissionStatus,
    ZoneType
)

from app.models.maintenance import (
    Component,
    DroneComponent,
    MaintenanceLog,
    MaintenanceSchedule,
    ComplianceViolation,
    AuditLog,
    MaintenanceStatus,
    MaintenanceType,
    ViolationSeverity,
    ViolationStatus
)

__all__ = [
    # Registry
    "Organization",
    "User",
    "TypeCertificate",
    "Drone",
    "Pilot",
    "DroneCategory",
    "DroneSubCategory",
    "DroneClass",
    "CertificationStatus",
    "DroneStatus",
    "PilotStatus",
    "IDType",
    "OperationRating",
    "UserRole",
    # Operations
    "FlightPlan",
    "PermissionArtifact",
    "FlightLog",
    "FlightLogSummary",
    "FlightStatus",
    "PermissionStatus",
    "ZoneType",
    # Maintenance
    "Component",
    "DroneComponent",
    "MaintenanceLog",
    "MaintenanceSchedule",
    "ComplianceViolation",
    "AuditLog",
    "MaintenanceStatus",
    "MaintenanceType",
    "ViolationSeverity",
    "ViolationStatus",
]
