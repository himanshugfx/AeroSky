"""
SkyGuard India - SQLAlchemy Models
Operations Module: Flight Plans, Permission Artifacts, Flight Logs
"""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID, uuid4
import enum

from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Numeric, Date, DateTime,
    ForeignKey, Enum as SQLEnum, JSON, BigInteger
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from geoalchemy2 import Geometry

from app.core.database import Base


# ============================================================================
# ENUMS
# ============================================================================

class FlightStatus(str, enum.Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    IN_PROGRESS = "InProgress"
    COMPLETED = "Completed"
    ABORTED = "Aborted"


class PermissionStatus(str, enum.Enum):
    VALID = "Valid"
    USED = "Used"
    EXPIRED = "Expired"
    REVOKED = "Revoked"


class ZoneType(str, enum.Enum):
    GREEN = "Green"
    YELLOW = "Yellow"
    RED = "Red"


# ============================================================================
# MODELS
# ============================================================================

class FlightPlan(Base):
    """Flight Plans with geospatial data."""
    __tablename__ = "flight_plans"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Core References
    drone_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("drones.id"), nullable=False)
    pilot_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("pilots.id"), nullable=False)
    organization_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Flight Area (PostGIS) - stored as WKT string for compatibility
    flight_polygon_wkt: Mapped[Optional[str]] = mapped_column(Text)  # WKT format
    takeoff_lat: Mapped[Optional[float]] = mapped_column(Numeric(10, 8))
    takeoff_lon: Mapped[Optional[float]] = mapped_column(Numeric(11, 8))
    landing_lat: Mapped[Optional[float]] = mapped_column(Numeric(10, 8))
    landing_lon: Mapped[Optional[float]] = mapped_column(Numeric(11, 8))
    
    # Time Window
    planned_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    planned_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    actual_start: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    actual_end: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Altitude
    min_altitude_ft: Mapped[int] = mapped_column(Integer, default=0)
    max_altitude_ft: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Zone Validation
    zone_status: Mapped[Optional[ZoneType]] = mapped_column(SQLEnum(ZoneType))
    zone_validated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    zone_validation_details: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Purpose
    flight_purpose: Mapped[Optional[str]] = mapped_column(String(255))
    payload_description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Pre-flight Checklist
    preflight_checklist_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    preflight_checklist_data: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Status & Workflow
    status: Mapped[FlightStatus] = mapped_column(SQLEnum(FlightStatus), default=FlightStatus.DRAFT)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text)
    
    # Audit Fields
    created_by: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    drone: Mapped["Drone"] = relationship("Drone", back_populates="flight_plans")
    pilot: Mapped["Pilot"] = relationship("Pilot", back_populates="flight_plans")
    permission_artifact: Mapped[Optional["PermissionArtifact"]] = relationship("PermissionArtifact", back_populates="flight_plan", uselist=False)
    flight_log_summary: Mapped[Optional["FlightLogSummary"]] = relationship("FlightLogSummary", back_populates="flight_plan", uselist=False)


# Import Drone and Pilot from registry for relationship type hints
from app.models.registry import Drone, Pilot


class PermissionArtifact(Base):
    """Permission Artifacts - NPNT (No Permission No Takeoff)."""
    __tablename__ = "permission_artifacts"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    flight_plan_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("flight_plans.id"), unique=True, nullable=False)
    
    # Artifact Content
    artifact_xml: Mapped[str] = mapped_column(Text, nullable=False)
    artifact_json: Mapped[Optional[dict]] = mapped_column(JSON)
    
    # Digital Signature
    dgca_signature: Mapped[str] = mapped_column(Text, nullable=False)
    signature_algorithm: Mapped[str] = mapped_column(String(50), default="RSA-SHA256")
    
    # Validity
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Usage
    status: Mapped[PermissionStatus] = mapped_column(SQLEnum(PermissionStatus), default=PermissionStatus.VALID)
    used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    revocation_reason: Mapped[Optional[str]] = mapped_column(Text)
    
    # Audit Fields
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    flight_plan: Mapped["FlightPlan"] = relationship("FlightPlan", back_populates="permission_artifact")


class FlightLog(Base):
    """Flight Logs - Time series data (Would be TimescaleDB in production)."""
    __tablename__ = "flight_logs"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    drone_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    flight_plan_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True))
    
    # Timestamp
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Position
    latitude: Mapped[float] = mapped_column(Numeric(10, 8), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(11, 8), nullable=False)
    altitude_m: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    altitude_agl_m: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    
    # Attitude
    heading_deg: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    pitch_deg: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    roll_deg: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    
    # Velocity
    ground_speed_mps: Mapped[Optional[float]] = mapped_column(Numeric(8, 2))
    vertical_speed_mps: Mapped[Optional[float]] = mapped_column(Numeric(8, 2))
    
    # System Status
    battery_voltage: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    battery_percentage: Mapped[Optional[int]] = mapped_column(Integer)
    motor_rpm: Mapped[Optional[dict]] = mapped_column(JSON)  # Array stored as JSON
    gps_satellites: Mapped[Optional[int]] = mapped_column(Integer)
    signal_strength: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Log Chaining (Tamper-proof)
    sequence_number: Mapped[int] = mapped_column(BigInteger, nullable=False)
    previous_hash: Mapped[Optional[str]] = mapped_column(String(64))  # SHA-256
    entry_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    
    # Signature
    drone_signature: Mapped[Optional[str]] = mapped_column(Text)


class FlightLogSummary(Base):
    """Flight Log Summary - Aggregated statistics per flight."""
    __tablename__ = "flight_log_summaries"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    flight_plan_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("flight_plans.id"), unique=True, nullable=False)
    drone_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("drones.id"), nullable=False)
    pilot_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("pilots.id"), nullable=False)
    
    # Time
    takeoff_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    landing_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    total_flight_duration_sec: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Distance
    total_distance_km: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    max_distance_from_home_km: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    
    # Altitude
    max_altitude_m: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    avg_altitude_m: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    
    # Speed
    max_speed_mps: Mapped[Optional[float]] = mapped_column(Numeric(8, 2))
    avg_speed_mps: Mapped[Optional[float]] = mapped_column(Numeric(8, 2))
    
    # Battery
    battery_start_percentage: Mapped[Optional[int]] = mapped_column(Integer)
    battery_end_percentage: Mapped[Optional[int]] = mapped_column(Integer)
    battery_consumed_mah: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Compliance
    geofence_breaches: Mapped[int] = mapped_column(Integer, default=0)
    altitude_violations: Mapped[int] = mapped_column(Integer, default=0)
    permission_artifact_valid: Mapped[Optional[bool]] = mapped_column(Boolean)
    
    # Log Integrity
    total_log_entries: Mapped[Optional[int]] = mapped_column(BigInteger)
    first_entry_hash: Mapped[Optional[str]] = mapped_column(String(64))
    last_entry_hash: Mapped[Optional[str]] = mapped_column(String(64))
    chain_verified: Mapped[Optional[bool]] = mapped_column(Boolean)
    
    # Audit Fields
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    flight_plan: Mapped["FlightPlan"] = relationship("FlightPlan", back_populates="flight_log_summary")
