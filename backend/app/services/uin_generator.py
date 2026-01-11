"""
SkyGuard India - UIN Generator Service
Unique Identification Number generation for drone registration (Form D-2)
"""

from datetime import datetime, date
from typing import Optional, List, Tuple
from uuid import UUID
import re
import hashlib
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.registry import Drone, TypeCertificate, DroneStatus, CertificationStatus


@dataclass
class UINGenerationRequest:
    """Request for UIN generation."""
    manufacturer_serial_number: str
    fcm_serial_number: str
    rps_serial_number: str
    type_certificate_id: UUID
    owner_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None


@dataclass
class UINGenerationResult:
    """Result of UIN generation."""
    success: bool
    uin: Optional[str] = None
    dan: Optional[str] = None
    drone_id: Optional[UUID] = None
    error_message: Optional[str] = None


@dataclass
class BatchUINResult:
    """Result of batch UIN generation."""
    total_requested: int
    successful: int
    failed: int
    results: List[UINGenerationResult]


class UINGenerator:
    """
    UIN (Unique Identification Number) Generator Service.
    
    Generates UINs for drones following DGCA format:
    - Format: UA-XXXXX-YYYYYYY
    - UA: Prefix for Unmanned Aircraft
    - XXXXX: Type Certificate reference (5 chars)
    - YYYYYYY: Sequential number (7 digits)
    
    Also generates DAN (Drone Acknowledgement Number) for pre-registration.
    """
    
    UIN_PREFIX = "UA"
    DAN_PREFIX = "DAN"
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def generate_uin(self, request: UINGenerationRequest) -> UINGenerationResult:
        """
        Generate UIN for a single drone.
        
        Args:
            request: UIN generation request details
            
        Returns:
            UINGenerationResult with UIN or error message
        """
        # Validate type certificate
        tc = await self._get_type_certificate(request.type_certificate_id)
        if not tc:
            return UINGenerationResult(
                success=False,
                error_message="Type Certificate not found"
            )
        
        if tc.certification_status != CertificationStatus.CERTIFIED:
            return UINGenerationResult(
                success=False,
                error_message=f"Type Certificate is not certified (status: {tc.certification_status.value})"
            )
        
        # Validate serial numbers
        validation_error = await self._validate_serial_numbers(request)
        if validation_error:
            return UINGenerationResult(
                success=False,
                error_message=validation_error
            )
        
        # Check for duplicate serial numbers
        duplicate_error = await self._check_duplicates(request)
        if duplicate_error:
            return UINGenerationResult(
                success=False,
                error_message=duplicate_error
            )
        
        # Generate DAN first (acknowledges registration request)
        dan = await self._generate_dan()
        
        # Generate UIN
        uin = await self._generate_uin_code(tc)
        
        # Create drone record
        drone = Drone(
            uin=uin,
            dan=dan,
            manufacturer_serial_number=request.manufacturer_serial_number,
            fcm_serial_number=request.fcm_serial_number,
            rps_serial_number=request.rps_serial_number,
            type_certificate_id=request.type_certificate_id,
            owner_id=request.owner_id,
            organization_id=request.organization_id,
            status=DroneStatus.REGISTERED,
            registration_date=date.today()
        )
        
        self.db.add(drone)
        await self.db.flush()
        
        return UINGenerationResult(
            success=True,
            uin=uin,
            dan=dan,
            drone_id=drone.id
        )
    
    async def generate_batch(
        self,
        requests: List[UINGenerationRequest]
    ) -> BatchUINResult:
        """
        Generate UINs for a batch of drones.
        
        Args:
            requests: List of UIN generation requests
            
        Returns:
            BatchUINResult with all results
        """
        results: List[UINGenerationResult] = []
        successful = 0
        failed = 0
        
        for request in requests:
            result = await self.generate_uin(request)
            results.append(result)
            
            if result.success:
                successful += 1
            else:
                failed += 1
        
        return BatchUINResult(
            total_requested=len(requests),
            successful=successful,
            failed=failed,
            results=results
        )
    
    async def _get_type_certificate(self, tc_id: UUID) -> Optional[TypeCertificate]:
        """Fetch type certificate."""
        result = await self.db.execute(
            select(TypeCertificate).where(TypeCertificate.id == tc_id)
        )
        return result.scalar_one_or_none()
    
    async def _validate_serial_numbers(self, request: UINGenerationRequest) -> Optional[str]:
        """Validate serial number formats."""
        # Manufacturer serial must be non-empty alphanumeric
        if not request.manufacturer_serial_number:
            return "Manufacturer serial number is required"
        
        if not re.match(r'^[A-Za-z0-9\-_]+$', request.manufacturer_serial_number):
            return "Invalid manufacturer serial number format"
        
        # FCM serial is required (Rule 15 linkage)
        if not request.fcm_serial_number:
            return "FCM serial number is required (Rule 15)"
        
        # RPS serial is required (Rule 15 linkage)
        if not request.rps_serial_number:
            return "RPS serial number is required (Rule 15)"
        
        return None
    
    async def _check_duplicates(self, request: UINGenerationRequest) -> Optional[str]:
        """Check for duplicate serial numbers."""
        # Check manufacturer serial
        result = await self.db.execute(
            select(func.count(Drone.id))
            .where(Drone.manufacturer_serial_number == request.manufacturer_serial_number)
        )
        if result.scalar() > 0:
            return f"Manufacturer serial number '{request.manufacturer_serial_number}' already registered"
        
        # Check FCM serial (critical - each FCM must be unique)
        result = await self.db.execute(
            select(func.count(Drone.id))
            .where(Drone.fcm_serial_number == request.fcm_serial_number)
        )
        if result.scalar() > 0:
            return f"FCM serial number '{request.fcm_serial_number}' already registered"
        
        # Check RPS serial
        result = await self.db.execute(
            select(func.count(Drone.id))
            .where(Drone.rps_serial_number == request.rps_serial_number)
        )
        if result.scalar() > 0:
            return f"RPS serial number '{request.rps_serial_number}' already registered"
        
        return None
    
    async def _generate_dan(self) -> str:
        """Generate Drone Acknowledgement Number."""
        # Get current count for today
        today = date.today()
        date_str = today.strftime("%Y%m%d")
        
        # Count existing DANs for today
        result = await self.db.execute(
            select(func.count(Drone.id))
            .where(Drone.dan.like(f"{self.DAN_PREFIX}-{date_str}%"))
        )
        count = result.scalar() or 0
        
        # Format: DAN-YYYYMMDD-XXXXX
        return f"{self.DAN_PREFIX}-{date_str}-{str(count + 1).zfill(5)}"
    
    async def _generate_uin_code(self, tc: TypeCertificate) -> str:
        """Generate Unique Identification Number."""
        # Generate type certificate reference (5 chars from cert number or model)
        tc_ref = self._get_tc_reference(tc)
        
        # Get sequential number for this type certificate
        result = await self.db.execute(
            select(func.count(Drone.id))
            .where(Drone.type_certificate_id == tc.id)
        )
        count = result.scalar() or 0
        
        # Format: UA-XXXXX-YYYYYYY
        sequence = str(count + 1).zfill(7)
        return f"{self.UIN_PREFIX}-{tc_ref}-{sequence}"
    
    def _get_tc_reference(self, tc: TypeCertificate) -> str:
        """Get 5-character reference from type certificate."""
        if tc.certificate_number:
            # Use last 5 chars of certificate number
            return tc.certificate_number[-5:].upper().zfill(5)
        else:
            # Generate from model name hash
            model_hash = hashlib.md5(tc.model_name.encode()).hexdigest()[:5].upper()
            return model_hash
    
    async def update_drone_status(
        self,
        drone_id: UUID,
        new_status: DroneStatus
    ) -> bool:
        """Update drone status (e.g., from Registered to Active)."""
        result = await self.db.execute(
            select(Drone).where(Drone.id == drone_id)
        )
        drone = result.scalar_one_or_none()
        
        if not drone:
            return False
        
        drone.status = new_status
        await self.db.flush()
        
        return True
    
    async def get_uin_statistics(self, organization_id: Optional[UUID] = None) -> dict:
        """Get UIN generation statistics."""
        query = select(
            Drone.status,
            func.count(Drone.id).label('count')
        ).group_by(Drone.status)
        
        if organization_id:
            query = query.where(Drone.organization_id == organization_id)
        
        result = await self.db.execute(query)
        rows = result.all()
        
        stats = {
            "total": 0,
            "by_status": {}
        }
        
        for status, count in rows:
            stats["by_status"][status.value] = count
            stats["total"] += count
        
        return stats
    
    async def validate_uin_format(self, uin: str) -> Tuple[bool, Optional[str]]:
        """Validate UIN format."""
        # Expected format: UA-XXXXX-YYYYYYY
        pattern = r'^UA-[A-Z0-9]{5}-\d{7}$'
        
        if not re.match(pattern, uin):
            return False, f"Invalid UIN format. Expected: UA-XXXXX-YYYYYYY, got: {uin}"
        
        # Check if UIN exists
        result = await self.db.execute(
            select(Drone).where(Drone.uin == uin)
        )
        drone = result.scalar_one_or_none()
        
        if not drone:
            return False, f"UIN {uin} not found in registry"
        
        return True, None
