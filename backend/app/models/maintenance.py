"""
SkyGuard India - SQLAlchemy Models
Maintenance Module: Maintenance Logs, Components, Compliance Violations
"""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID, uuid4
import enum

from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Numeric, Date, DateTime,
    ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, INET
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.core.database import Base


# ============================================================================
# ENUMS
# ============================================================================

class MaintenanceStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "InProgress"
    COMPLETED = "Completed"
    VERIFIED = "Verified"


class MaintenanceType(str, enum.Enum):
    SCHEDULED = "Scheduled"
    UNSCHEDULED = "Unscheduled"
    INSPECTION = "Inspection"
    REPAIR = "Repair"
    CALIBRATION = "Calibration"


class ViolationSeverity(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class ViolationStatus(str, enum.Enum):
    OPEN = "Open"
    UNDER_REVIEW = "UnderReview"
    RESOLVED = "Resolved"
    ESCALATED = "Escalated"


# ============================================================================
# MODELS
# ============================================================================

class Component(Base):
    """Components - Parts catalog for drones."""
    __tablename__ = "components"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    part_number: Mapped[Optional[str]] = mapped_column(String(100))
    category: Mapped[Optional[str]] = mapped_column(String(100))  # Motor, Propeller, Battery, FCM, etc.
    manufacturer: Mapped[Optional[str]] = mapped_column(String(255))
    expected_lifespan_hours: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    is_critical: Mapped[bool] = mapped_column(Boolean, default=False)  # Affects airworthiness
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class DroneComponent(Base):
    """Drone Components - Parts installed on specific drones."""
    __tablename__ = "drone_components"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    drone_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("drones.id"), nullable=False)
    component_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("components.id"), nullable=False)
    serial_number: Mapped[Optional[str]] = mapped_column(String(100))
    installation_date: Mapped[date] = mapped_column(Date, nullable=False)
    installation_hours: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    current_hours: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="Active")  # Active, Replaced, Failed
    replaced_date: Mapped[Optional[date]] = mapped_column(Date)
    replaced_reason: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    component: Mapped["Component"] = relationship("Component")


class MaintenanceLog(Base):
    """Maintenance Logs - CA Form 19-10 equivalent."""
    __tablename__ = "maintenance_logs"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    drone_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("drones.id"), nullable=False)
    
    # Work Details
    work_order_number: Mapped[Optional[str]] = mapped_column(String(50))
    maintenance_type: Mapped[MaintenanceType] = mapped_column(SQLEnum(MaintenanceType), default=MaintenanceType.SCHEDULED)
    component_affected: Mapped[Optional[str]] = mapped_column(String(100))
    defect_observed: Mapped[Optional[str]] = mapped_column(Text)
    action_taken: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Parts Replaced (JSON array)
    parts_replaced: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    # Example: [{"component_id": "uuid", "old_serial": "X", "new_serial": "Y", "source": "OEM"}]
    
    # Technician (Mandatory per Draft Bill 2025)
    technician_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    technician_license_number: Mapped[Optional[str]] = mapped_column(String(50))
    technician_signature: Mapped[Optional[str]] = mapped_column(Text)  # Digital signature
    work_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Verification (dual sign-off for critical work)
    verifier_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    verifier_signature: Mapped[Optional[str]] = mapped_column(Text)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Next Due
    next_due_date: Mapped[Optional[date]] = mapped_column(Date)
    next_due_hours: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    next_due_type: Mapped[Optional[str]] = mapped_column(String(50))  # Inspection, Replacement, etc.
    
    # Status
    status: Mapped[MaintenanceStatus] = mapped_column(SQLEnum(MaintenanceStatus), default=MaintenanceStatus.OPEN)
    
    # Audit Fields
    created_by: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    drone: Mapped["Drone"] = relationship("Drone", back_populates="maintenance_logs")
    technician: Mapped["User"] = relationship("User", foreign_keys=[technician_id])
    verifier: Mapped[Optional["User"]] = relationship("User", foreign_keys=[verifier_id])
    creator: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by])


# Import Drone for relationship type hints
from app.models.registry import Drone


class MaintenanceSchedule(Base):
    """Maintenance Schedule Templates - Per Type Certificate."""
    __tablename__ = "maintenance_schedules"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    type_certificate_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("type_certificates.id"), nullable=False)
    component_category: Mapped[str] = mapped_column(String(100), nullable=False)
    maintenance_type: Mapped[str] = mapped_column(String(50), nullable=False)
    interval_hours: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    interval_days: Mapped[Optional[int]] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ComplianceViolation(Base):
    """Compliance Violations - Section 10A tracking (BVA 2024)."""
    __tablename__ = "compliance_violations"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Subject
    drone_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("drones.id"))
    pilot_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("pilots.id"))
    organization_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("organizations.id"))
    flight_plan_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("flight_plans.id"))
    
    # Violation Details
    violation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # Examples: NPNT_Bypass, Zone_Breach, Altitude_Violation, Expired_RPC, Overdue_Maintenance
    violation_code: Mapped[Optional[str]] = mapped_column(String(20))
    severity: Mapped[ViolationSeverity] = mapped_column(SQLEnum(ViolationSeverity), default=ViolationSeverity.MEDIUM)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Evidence
    evidence_data: Mapped[Optional[dict]] = mapped_column(JSON)
    flight_log_reference: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True))
    
    # Resolution
    status: Mapped[ViolationStatus] = mapped_column(SQLEnum(ViolationStatus), default=ViolationStatus.OPEN)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text)
    resolved_by: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    resolver: Mapped[Optional["User"]] = relationship("User", foreign_keys=[resolved_by])
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Penalties (BVA 2024 Section 45)
    penalty_amount: Mapped[Optional[float]] = mapped_column(Numeric(15, 2))
    penalty_section: Mapped[Optional[str]] = mapped_column(String(50))  # e.g., "Section 45 BVA 2024"
    
    # Audit Fields
    detected_by: Mapped[Optional[str]] = mapped_column(String(50))  # System, Manual, DGCA_Audit
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    """System Audit Log - Immutable record of all changes."""
    __tablename__ = "audit_log"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Who
    user_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[user_id])
    user_email: Mapped[Optional[str]] = mapped_column(String(255))
    user_role: Mapped[Optional[str]] = mapped_column(String(50))
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))  # IPv6 compatible
    
    # What
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[Optional[str]] = mapped_column(String(100))
    entity_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True))
    
    # Details
    old_values: Mapped[Optional[dict]] = mapped_column(JSON)
    new_values: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # When
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
