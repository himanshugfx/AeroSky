"""
SkyGuard India - NPNT Validator Service
No Permission No Takeoff - Core safety system
"""

from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from uuid import UUID
import hashlib
import json
import base64
from dataclasses import dataclass
from enum import Enum

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.registry import Drone, Pilot, DroneStatus, PilotStatus
from app.models.operations import FlightPlan, PermissionArtifact, FlightStatus, ZoneType, PermissionStatus
from app.models.maintenance import MaintenanceLog, MaintenanceStatus


class ValidationResult(Enum):
    """Validation result types."""
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"


@dataclass
class ValidationCheck:
    """Individual validation check result."""
    check_name: str
    result: ValidationResult
    message: str
    details: Optional[dict] = None


@dataclass
class NPNTValidationResult:
    """Complete NPNT validation result."""
    is_valid: bool
    checks: List[ValidationCheck]
    permission_artifact: Optional[str] = None
    error_message: Optional[str] = None


class NPNTValidator:
    """
    NPNT (No Permission No Takeoff) Validation Engine.
    
    Implements the compliance checks required before a drone can fly:
    1. Drone UIN status is 'Active'
    2. Pilot RPC is valid and not expired
    3. Insurance is active
    4. No overdue critical maintenance
    5. Zone validation (Green/Yellow/Red)
    6. Type Certificate is valid
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def validate_flight(
        self,
        drone_id: UUID,
        pilot_id: UUID,
        flight_plan_id: UUID
    ) -> NPNTValidationResult:
        """
        Perform complete NPNT validation for a flight.
        
        Args:
            drone_id: UUID of the drone
            pilot_id: UUID of the pilot
            flight_plan_id: UUID of the flight plan
            
        Returns:
            NPNTValidationResult with all check results
        """
        checks: List[ValidationCheck] = []
        
        # Fetch all required data
        drone = await self._get_drone(drone_id)
        pilot = await self._get_pilot(pilot_id)
        flight_plan = await self._get_flight_plan(flight_plan_id)
        
        if not drone:
            return NPNTValidationResult(
                is_valid=False,
                checks=[],
                error_message=f"Drone with ID {drone_id} not found"
            )
        
        if not pilot:
            return NPNTValidationResult(
                is_valid=False,
                checks=[],
                error_message=f"Pilot with ID {pilot_id} not found"
            )
        
        if not flight_plan:
            return NPNTValidationResult(
                is_valid=False,
                checks=[],
                error_message=f"Flight Plan with ID {flight_plan_id} not found"
            )
        
        # Run all validation checks
        checks.append(await self._check_drone_status(drone))
        checks.append(await self._check_uin_valid(drone))
        checks.append(await self._check_type_certificate(drone))
        checks.append(await self._check_pilot_rpc(pilot))
        checks.append(await self._check_insurance(drone))
        checks.append(await self._check_maintenance(drone))
        checks.append(await self._check_zone_status(flight_plan))
        checks.append(await self._check_altitude_limits(drone, flight_plan))
        checks.append(await self._check_pilot_rating(pilot, drone))
        
        # Determine overall validity
        failed_checks = [c for c in checks if c.result == ValidationResult.FAILED]
        is_valid = len(failed_checks) == 0
        
        # Generate permission artifact if valid
        permission_artifact = None
        if is_valid:
            permission_artifact = await self._generate_permission_artifact(
                drone, pilot, flight_plan
            )
        
        return NPNTValidationResult(
            is_valid=is_valid,
            checks=checks,
            permission_artifact=permission_artifact,
            error_message=None if is_valid else f"Failed {len(failed_checks)} validation checks"
        )
    
    async def _get_drone(self, drone_id: UUID) -> Optional[Drone]:
        """Fetch drone with type certificate."""
        result = await self.db.execute(
            select(Drone)
            .options(selectinload(Drone.type_certificate))
            .where(Drone.id == drone_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_pilot(self, pilot_id: UUID) -> Optional[Pilot]:
        """Fetch pilot."""
        result = await self.db.execute(
            select(Pilot).where(Pilot.id == pilot_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_flight_plan(self, flight_plan_id: UUID) -> Optional[FlightPlan]:
        """Fetch flight plan."""
        result = await self.db.execute(
            select(FlightPlan).where(FlightPlan.id == flight_plan_id)
        )
        return result.scalar_one_or_none()
    
    async def _check_drone_status(self, drone: Drone) -> ValidationCheck:
        """Check if drone status is Active."""
        if drone.status == DroneStatus.ACTIVE:
            return ValidationCheck(
                check_name="Drone Status",
                result=ValidationResult.PASSED,
                message="Drone is active and operational"
            )
        else:
            return ValidationCheck(
                check_name="Drone Status",
                result=ValidationResult.FAILED,
                message=f"Drone status is '{drone.status.value}', must be 'Active'",
                details={"current_status": drone.status.value}
            )
    
    async def _check_uin_valid(self, drone: Drone) -> ValidationCheck:
        """Check if drone has valid UIN."""
        if drone.uin and len(drone.uin) > 0:
            return ValidationCheck(
                check_name="UIN Registration",
                result=ValidationResult.PASSED,
                message=f"Valid UIN: {drone.uin}"
            )
        else:
            return ValidationCheck(
                check_name="UIN Registration",
                result=ValidationResult.FAILED,
                message="Drone does not have a valid UIN",
                details={"uin": drone.uin}
            )
    
    async def _check_type_certificate(self, drone: Drone) -> ValidationCheck:
        """Check if drone's type certificate is valid and NPNT compliant."""
        tc = drone.type_certificate
        if not tc:
            return ValidationCheck(
                check_name="Type Certificate",
                result=ValidationResult.FAILED,
                message="Drone has no linked Type Certificate"
            )
        
        if tc.certification_status.value != "Certified":
            return ValidationCheck(
                check_name="Type Certificate",
                result=ValidationResult.FAILED,
                message=f"Type Certificate status is '{tc.certification_status.value}'",
                details={"tc_status": tc.certification_status.value}
            )
        
        if not tc.npnt_compliant:
            return ValidationCheck(
                check_name="Type Certificate",
                result=ValidationResult.FAILED,
                message="Drone model is not NPNT compliant",
                details={"npnt_compliant": False}
            )
        
        return ValidationCheck(
            check_name="Type Certificate",
            result=ValidationResult.PASSED,
            message=f"Type Certificate {tc.certificate_number} is valid and NPNT compliant"
        )
    
    async def _check_pilot_rpc(self, pilot: Pilot) -> ValidationCheck:
        """Check if pilot has valid RPC (Remote Pilot Certificate)."""
        if pilot.status != PilotStatus.ACTIVE:
            return ValidationCheck(
                check_name="Pilot RPC Status",
                result=ValidationResult.FAILED,
                message=f"Pilot RPC status is '{pilot.status.value}'",
                details={"rpc_status": pilot.status.value}
            )
        
        if not pilot.rpc_number:
            return ValidationCheck(
                check_name="Pilot RPC Status",
                result=ValidationResult.FAILED,
                message="Pilot does not have an RPC number"
            )
        
        # Check expiry
        if pilot.expiry_date:
            now = datetime.now().date()
            if pilot.expiry_date < now:
                return ValidationCheck(
                    check_name="Pilot RPC Status",
                    result=ValidationResult.FAILED,
                    message=f"Pilot RPC expired on {pilot.expiry_date}",
                    details={"expiry_date": str(pilot.expiry_date)}
                )
            
            # Warning if expiring within 60 days (Rule 35)
            days_until_expiry = (pilot.expiry_date - now).days
            if days_until_expiry <= 60:
                return ValidationCheck(
                    check_name="Pilot RPC Status",
                    result=ValidationResult.WARNING,
                    message=f"Pilot RPC expires in {days_until_expiry} days",
                    details={"expiry_date": str(pilot.expiry_date), "days_remaining": days_until_expiry}
                )
        
        return ValidationCheck(
            check_name="Pilot RPC Status",
            result=ValidationResult.PASSED,
            message=f"Pilot RPC {pilot.rpc_number} is valid"
        )
    
    async def _check_insurance(self, drone: Drone) -> ValidationCheck:
        """Check if drone has valid insurance (Section 10, Drone Rules 2021)."""
        if not drone.insurance_policy_number:
            return ValidationCheck(
                check_name="Insurance",
                result=ValidationResult.FAILED,
                message="Drone does not have insurance policy"
            )
        
        if drone.insurance_expiry_date:
            now = datetime.now().date()
            if drone.insurance_expiry_date < now:
                return ValidationCheck(
                    check_name="Insurance",
                    result=ValidationResult.FAILED,
                    message=f"Insurance expired on {drone.insurance_expiry_date}",
                    details={"expiry_date": str(drone.insurance_expiry_date)}
                )
        
        return ValidationCheck(
            check_name="Insurance",
            result=ValidationResult.PASSED,
            message=f"Insurance policy {drone.insurance_policy_number} is valid"
        )
    
    async def _check_maintenance(self, drone: Drone) -> ValidationCheck:
        """Check for overdue critical maintenance."""
        # Get open/overdue maintenance logs
        result = await self.db.execute(
            select(MaintenanceLog)
            .where(MaintenanceLog.drone_id == drone.id)
            .where(MaintenanceLog.status.in_([MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS]))
            .where(MaintenanceLog.next_due_date < datetime.now().date())
        )
        overdue_maintenance = result.scalars().all()
        
        if overdue_maintenance:
            return ValidationCheck(
                check_name="Maintenance Status",
                result=ValidationResult.FAILED,
                message=f"Drone has {len(overdue_maintenance)} overdue maintenance items",
                details={"overdue_count": len(overdue_maintenance)}
            )
        
        return ValidationCheck(
            check_name="Maintenance Status",
            result=ValidationResult.PASSED,
            message="No overdue maintenance items"
        )
    
    async def _check_zone_status(self, flight_plan: FlightPlan) -> ValidationCheck:
        """Check airspace zone status (Rules 19-24)."""
        if not flight_plan.zone_status:
            return ValidationCheck(
                check_name="Zone Status",
                result=ValidationResult.WARNING,
                message="Zone validation not yet performed"
            )
        
        if flight_plan.zone_status == ZoneType.RED:
            return ValidationCheck(
                check_name="Zone Status",
                result=ValidationResult.FAILED,
                message="Flight plan is in RED (No-Fly) zone",
                details={"zone": "Red"}
            )
        
        if flight_plan.zone_status == ZoneType.YELLOW:
            return ValidationCheck(
                check_name="Zone Status",
                result=ValidationResult.WARNING,
                message="Flight plan is in YELLOW zone - additional permissions may be required",
                details={"zone": "Yellow"}
            )
        
        return ValidationCheck(
            check_name="Zone Status",
            result=ValidationResult.PASSED,
            message="Flight plan is in GREEN zone"
        )
    
    async def _check_altitude_limits(self, drone: Drone, flight_plan: FlightPlan) -> ValidationCheck:
        """Check if flight altitude is within type certificate limits."""
        tc = drone.type_certificate
        if not tc:
            return ValidationCheck(
                check_name="Altitude Limits",
                result=ValidationResult.WARNING,
                message="Cannot verify altitude limits - no type certificate"
            )
        
        if tc.max_altitude_ft and flight_plan.max_altitude_ft > tc.max_altitude_ft:
            return ValidationCheck(
                check_name="Altitude Limits",
                result=ValidationResult.FAILED,
                message=f"Planned altitude ({flight_plan.max_altitude_ft}ft) exceeds type certificate limit ({tc.max_altitude_ft}ft)",
                details={
                    "planned_altitude": flight_plan.max_altitude_ft,
                    "max_allowed": tc.max_altitude_ft
                }
            )
        
        return ValidationCheck(
            check_name="Altitude Limits",
            result=ValidationResult.PASSED,
            message=f"Altitude {flight_plan.max_altitude_ft}ft is within limits"
        )
    
    async def _check_pilot_rating(self, pilot: Pilot, drone: Drone) -> ValidationCheck:
        """Check if pilot's rating matches drone class."""
        tc = drone.type_certificate
        if not tc:
            return ValidationCheck(
                check_name="Pilot Rating",
                result=ValidationResult.WARNING,
                message="Cannot verify pilot rating - no type certificate"
            )
        
        if pilot.class_rating and tc.weight_class:
            # Define class hierarchy
            class_order = ["Nano", "Micro", "Small", "Medium", "Large"]
            pilot_idx = class_order.index(pilot.class_rating.value) if pilot.class_rating.value in class_order else -1
            drone_idx = class_order.index(tc.weight_class.value) if tc.weight_class.value in class_order else -1
            
            if pilot_idx < drone_idx:
                return ValidationCheck(
                    check_name="Pilot Rating",
                    result=ValidationResult.FAILED,
                    message=f"Pilot rated for {pilot.class_rating.value} cannot fly {tc.weight_class.value} drone",
                    details={
                        "pilot_rating": pilot.class_rating.value,
                        "drone_class": tc.weight_class.value
                    }
                )
        
        return ValidationCheck(
            check_name="Pilot Rating",
            result=ValidationResult.PASSED,
            message="Pilot rating is appropriate for drone class"
        )
    
    async def _generate_permission_artifact(
        self,
        drone: Drone,
        pilot: Pilot,
        flight_plan: FlightPlan
    ) -> str:
        """
        Generate a Permission Artifact for the flight.
        
        In production, this would be cryptographically signed by DGCA.
        This mock implementation generates a valid structure.
        """
        now = datetime.utcnow()
        artifact = {
            "version": "1.0",
            "artifact_id": str(flight_plan.id),
            "issued_at": now.isoformat(),
            "valid_from": flight_plan.planned_start.isoformat(),
            "valid_until": flight_plan.planned_end.isoformat(),
            "drone": {
                "uin": drone.uin,
                "serial_number": drone.manufacturer_serial_number,
                "fcm_serial": drone.fcm_serial_number
            },
            "pilot": {
                "rpc_number": pilot.rpc_number,
                "name": pilot.full_name
            },
            "flight_plan": {
                "id": str(flight_plan.id),
                "max_altitude_ft": flight_plan.max_altitude_ft,
                "planned_start": flight_plan.planned_start.isoformat(),
                "planned_end": flight_plan.planned_end.isoformat()
            },
            "permissions": {
                "takeoff_allowed": True,
                "zone_clearance": flight_plan.zone_status.value if flight_plan.zone_status else "Pending"
            }
        }
        
        # Generate real RSA signature
        try:
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.asymmetric import padding
            from cryptography.hazmat.primitives import serialization
            from app.core.config import get_settings
            
            settings = get_settings()
            
            with open(settings.npnt_private_key_path, "rb") as key_file:
                private_key = serialization.load_pem_private_key(
                    key_file.read(),
                    password=None,
                )
            
            artifact_json_bytes = json.dumps(artifact, sort_keys=True).encode()
            signature = private_key.sign(
                artifact_json_bytes,
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            artifact["dgca_signature"] = base64.b64encode(signature).decode()
        except Exception as e:
            # Fallback for dev if keys are missing, but log it
            print(f"Error signing artifact: {e}")
            artifact_json = json.dumps(artifact, sort_keys=True)
            mock_signature = hashlib.sha256(artifact_json.encode()).hexdigest()
            artifact["dgca_signature"] = f"MOCK-SIG-{mock_signature[:32]}"
        
        return json.dumps(artifact, indent=2)
    
    async def create_permission_artifact_record(
        self,
        flight_plan: FlightPlan,
        artifact_json: str
    ) -> PermissionArtifact:
        """Save permission artifact to database."""
        artifact_data = json.loads(artifact_json)
        
        pa = PermissionArtifact(
            flight_plan_id=flight_plan.id,
            artifact_xml=artifact_json,  # Using JSON format
            artifact_json=artifact_data,
            dgca_signature=artifact_data.get("dgca_signature", ""),
            issued_at=datetime.utcnow(),
            valid_from=flight_plan.planned_start,
            valid_until=flight_plan.planned_end,
            status=PermissionStatus.VALID
        )
        
        self.db.add(pa)
        await self.db.flush()
        
        return pa
