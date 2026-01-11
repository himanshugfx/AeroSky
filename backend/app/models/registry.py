"""
SkyGuard India - SQLAlchemy Models
Registry Module: Organizations, Users, Type Certificates, Drones, Pilots
"""

from datetime import datetime, date
from typing import Optional, List
from uuid import UUID, uuid4
import enum

from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Numeric, Date, DateTime,
    ForeignKey, Enum as SQLEnum, JSON, ARRAY
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, INET
from sqlalchemy.orm import relationship, Mapped, mapped_column
from geoalchemy2 import Geometry

from app.core.database import Base


# ============================================================================
# ENUMS
# ============================================================================

class DroneCategory(str, enum.Enum):
    AEROPLANE = "Aeroplane"
    ROTORCRAFT = "Rotorcraft"
    HYBRID = "Hybrid"


class DroneSubCategory(str, enum.Enum):
    RPAS = "RPAS"
    MODEL = "Model"
    AUTONOMOUS = "Autonomous"


class DroneClass(str, enum.Enum):
    NANO = "Nano"       # <250g
    MICRO = "Micro"     # 250g-2kg
    SMALL = "Small"     # 2-25kg
    MEDIUM = "Medium"   # 25-150kg
    LARGE = "Large"     # >150kg


class CertificationStatus(str, enum.Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    ATE_REVIEW = "ATE_Review"
    CERTIFIED = "Certified"
    SUSPENDED = "Suspended"
    REVOKED = "Revoked"


class DroneStatus(str, enum.Enum):
    DRAFT = "Draft"
    REGISTERED = "Registered"
    ACTIVE = "Active"
    TRANSFER_PENDING = "Transfer_Pending"
    DEREGISTERED = "Deregistered"
    LOST = "Lost"
    DAMAGED = "Damaged"


class PilotStatus(str, enum.Enum):
    ACTIVE = "Active"
    SUSPENDED = "Suspended"
    EXPIRED = "Expired"
    REVOKED = "Revoked"


class IDType(str, enum.Enum):
    PASSPORT = "Passport"
    VOTER_ID = "VoterID"
    RATION_CARD = "RationCard"
    DRIVING_LICENSE = "DrivingLicense"
    AADHAAR = "Aadhaar"


class OperationRating(str, enum.Enum):
    VLOS = "VLOS"    # Visual Line of Sight
    EVLOS = "EVLOS"  # Extended VLOS
    BVLOS = "BVLOS"  # Beyond VLOS


class UserRole(str, enum.Enum):
    MANUFACTURER = "Manufacturer"
    PILOT = "Pilot"
    TECHNICIAN = "Technician"
    FLEET_MANAGER = "Fleet_Manager"
    RPTO_ADMIN = "RPTO_Admin"
    DGCA_AUDITOR = "DGCA_Auditor"
    SYSTEM_ADMIN = "System_Admin"


# ============================================================================
# MODELS
# ============================================================================

class Organization(Base):
    """Organizations - Manufacturers, Service Providers, RPTOs."""
    __tablename__ = "organizations"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    legal_name: Mapped[Optional[str]] = mapped_column(String(255))
    gstin: Mapped[Optional[str]] = mapped_column(String(15))
    registration_number: Mapped[Optional[str]] = mapped_column(String(100))
    address: Mapped[Optional[str]] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    pincode: Mapped[Optional[str]] = mapped_column(String(10))
    country: Mapped[str] = mapped_column(String(100), default="India")
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    email: Mapped[Optional[str]] = mapped_column(String(255))
    website: Mapped[Optional[str]] = mapped_column(String(255))
    org_type: Mapped[Optional[str]] = mapped_column(String(50))
    is_government_entity: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="organization")
    type_certificates: Mapped[List["TypeCertificate"]] = relationship("TypeCertificate", back_populates="manufacturer")
    drones: Mapped[List["Drone"]] = relationship("Drone", back_populates="organization")


class User(Base):
    """Users of the system."""
    __tablename__ = "users"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.PILOT)
    organization_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("organizations.id"))
    aadhaar_number: Mapped[Optional[str]] = mapped_column(String(12))  # Encrypted
    id_type: Mapped[Optional[IDType]] = mapped_column(SQLEnum(IDType))
    id_number: Mapped[Optional[str]] = mapped_column(String(50))
    address: Mapped[Optional[str]] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    pincode: Mapped[Optional[str]] = mapped_column(String(10))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="users")
    pilot_profile: Mapped[Optional["Pilot"]] = relationship("Pilot", back_populates="user", uselist=False)
    owned_drones: Mapped[List["Drone"]] = relationship("Drone", foreign_keys="Drone.owner_id", back_populates="owner")


class TypeCertificate(Base):
    """Type Certificates - Form D-1 (The DNA of each drone model)."""
    __tablename__ = "type_certificates"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Manufacturer Details
    manufacturer_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    model_name: Mapped[str] = mapped_column(String(255), nullable=False)
    model_number: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Classification (Rule 5)
    category: Mapped[DroneCategory] = mapped_column(SQLEnum(DroneCategory), nullable=False)
    sub_category: Mapped[DroneSubCategory] = mapped_column(SQLEnum(DroneSubCategory), nullable=False)
    weight_class: Mapped[DroneClass] = mapped_column(SQLEnum(DroneClass), nullable=False)
    
    # Physical Specifications
    max_takeoff_weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    empty_weight_kg: Mapped[Optional[float]] = mapped_column(Numeric(10, 3))
    payload_capacity_kg: Mapped[Optional[float]] = mapped_column(Numeric(10, 3))
    length_mm: Mapped[Optional[int]] = mapped_column(Integer)
    width_mm: Mapped[Optional[int]] = mapped_column(Integer)
    height_mm: Mapped[Optional[int]] = mapped_column(Integer)
    rotor_diameter_mm: Mapped[Optional[int]] = mapped_column(Integer)
    wing_span_mm: Mapped[Optional[int]] = mapped_column(Integer)
    num_rotors: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Performance Specifications
    max_endurance_min: Mapped[Optional[int]] = mapped_column(Integer)
    max_range_km: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    max_speed_mps: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    max_altitude_ft: Mapped[Optional[int]] = mapped_column(Integer)
    operating_altitude_min_ft: Mapped[int] = mapped_column(Integer, default=0)
    operating_altitude_max_ft: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Propulsion
    engine_type: Mapped[Optional[str]] = mapped_column(String(100))
    motor_type: Mapped[Optional[str]] = mapped_column(String(100))
    power_rating_kw: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    num_engines: Mapped[int] = mapped_column(Integer, default=1)
    battery_capacity_mah: Mapped[Optional[int]] = mapped_column(Integer)
    battery_type: Mapped[Optional[str]] = mapped_column(String(50))
    fuel_capacity_kg: Mapped[Optional[float]] = mapped_column(Numeric(10, 3))
    
    # Control Systems
    fcm_make: Mapped[Optional[str]] = mapped_column(String(100))
    fcm_model: Mapped[Optional[str]] = mapped_column(String(100))
    rps_make: Mapped[Optional[str]] = mapped_column(String(100))
    rps_model: Mapped[Optional[str]] = mapped_column(String(100))
    gcs_software_version: Mapped[Optional[str]] = mapped_column(String(50))
    frequency_band: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Safety Features (Mandatory Checks)
    npnt_compliant: Mapped[bool] = mapped_column(Boolean, default=False)
    geofencing_capable: Mapped[bool] = mapped_column(Boolean, default=False)
    return_to_home: Mapped[bool] = mapped_column(Boolean, default=False)
    obstacle_avoidance: Mapped[bool] = mapped_column(Boolean, default=False)
    tracking_beacon: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Compatible Payloads (JSONB)
    compatible_payloads: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    
    # Documentation
    operating_manual_url: Mapped[Optional[str]] = mapped_column(Text)
    maintenance_guidelines_url: Mapped[Optional[str]] = mapped_column(Text)
    maintenance_schedule_hours: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Images
    front_view_image_url: Mapped[Optional[str]] = mapped_column(Text)
    top_view_image_url: Mapped[Optional[str]] = mapped_column(Text)
    
    # Certification
    certificate_number: Mapped[Optional[str]] = mapped_column(String(50), unique=True)
    certification_status: Mapped[CertificationStatus] = mapped_column(SQLEnum(CertificationStatus), default=CertificationStatus.DRAFT)
    certified_date: Mapped[Optional[date]] = mapped_column(Date)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Audit Fields
    created_by: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    manufacturer: Mapped["Organization"] = relationship("Organization", back_populates="type_certificates")
    drones: Mapped[List["Drone"]] = relationship("Drone", back_populates="type_certificate")


class Drone(Base):
    """Drones - Form D-2 (UIN Registration)."""
    __tablename__ = "drones"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Identification (Rule 15)
    uin: Mapped[Optional[str]] = mapped_column(String(20), unique=True)
    dan: Mapped[Optional[str]] = mapped_column(String(20))
    manufacturer_serial_number: Mapped[str] = mapped_column(String(100), nullable=False)
    fcm_serial_number: Mapped[Optional[str]] = mapped_column(String(100))
    rps_serial_number: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Relationships
    type_certificate_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("type_certificates.id"), nullable=False)
    owner_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    organization_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Status
    status: Mapped[DroneStatus] = mapped_column(SQLEnum(DroneStatus), default=DroneStatus.DRAFT)
    registration_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Insurance (Section 10, Drone Rules 2021)
    insurance_provider: Mapped[Optional[str]] = mapped_column(String(255))
    insurance_policy_number: Mapped[Optional[str]] = mapped_column(String(100))
    insurance_coverage_amount: Mapped[Optional[float]] = mapped_column(Numeric(15, 2))
    insurance_start_date: Mapped[Optional[date]] = mapped_column(Date)
    insurance_expiry_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Current Assignment
    assigned_pilot_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    # home_base_location: Mapped[Optional[str]] = mapped_column(Geometry("POINT", srid=4326))
    
    # Manufacturing Details (PLI tracking)
    manufacturing_date: Mapped[Optional[date]] = mapped_column(Date)
    manufacturing_batch: Mapped[Optional[str]] = mapped_column(String(50))
    local_content_percentage: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    
    # Firmware
    current_firmware_version: Mapped[Optional[str]] = mapped_column(String(50))
    last_firmware_update: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Audit Fields
    created_by: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    type_certificate: Mapped["TypeCertificate"] = relationship("TypeCertificate", back_populates="drones")
    owner: Mapped[Optional["User"]] = relationship("User", foreign_keys=[owner_id], back_populates="owned_drones")
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="drones")
    flight_plans: Mapped[List["FlightPlan"]] = relationship("FlightPlan", back_populates="drone")
    maintenance_logs: Mapped[List["MaintenanceLog"]] = relationship("MaintenanceLog", back_populates="drone")


class Pilot(Base):
    """Pilots - Form D-4 (Remote Pilot Certificate)."""
    __tablename__ = "pilots"
    
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Certificate Details
    rpc_number: Mapped[Optional[str]] = mapped_column(String(50), unique=True)
    
    # Personal Details
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Identity (2023 Amendment - expanded options)
    primary_id_type: Mapped[IDType] = mapped_column(SQLEnum(IDType), nullable=False)
    primary_id_number: Mapped[str] = mapped_column(String(50), nullable=False)
    secondary_id_type: Mapped[Optional[IDType]] = mapped_column(SQLEnum(IDType))
    secondary_id_number: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Training Details
    rpto_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("organizations.id"))
    rpto_authorization_number: Mapped[Optional[str]] = mapped_column(String(50))
    training_start_date: Mapped[Optional[date]] = mapped_column(Date)
    training_completion_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Ratings
    category_rating: Mapped[Optional[DroneCategory]] = mapped_column(SQLEnum(DroneCategory))
    class_rating: Mapped[Optional[DroneClass]] = mapped_column(SQLEnum(DroneClass))
    operation_rating: Mapped[OperationRating] = mapped_column(SQLEnum(OperationRating), default=OperationRating.VLOS)
    
    # Validity
    issue_date: Mapped[Optional[date]] = mapped_column(Date)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date)  # 10 years from issue
    status: Mapped[PilotStatus] = mapped_column(SQLEnum(PilotStatus), default=PilotStatus.ACTIVE)
    
    # Medical
    medical_certificate_number: Mapped[Optional[str]] = mapped_column(String(50))
    medical_expiry_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Flight Experience
    total_flight_hours: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    last_flight_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Audit Fields
    created_by: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="pilot_profile")
    flight_plans: Mapped[List["FlightPlan"]] = relationship("FlightPlan", back_populates="pilot")
