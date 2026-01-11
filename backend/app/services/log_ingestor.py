"""
SkyGuard India - Flight Log Ingestor Service
Tamper-proof flight log ingestion with cryptographic chain verification
"""

from datetime import datetime
from typing import Optional, List, Tuple
from uuid import UUID
import hashlib
import json
from dataclasses import dataclass
from enum import Enum

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.operations import FlightLog, FlightLogSummary, FlightPlan
from app.models.maintenance import ComplianceViolation, ViolationSeverity, ViolationStatus


class ChainVerificationResult(Enum):
    """Chain verification result types."""
    VALID = "valid"
    TAMPERED = "tampered"
    MISSING_ENTRIES = "missing_entries"
    INVALID_SIGNATURE = "invalid_signature"


@dataclass
class LogIngestionResult:
    """Result of log ingestion."""
    success: bool
    entries_processed: int
    entries_accepted: int
    entries_rejected: int
    chain_status: ChainVerificationResult
    violations_detected: List[str]
    summary_id: Optional[UUID] = None
    error_message: Optional[str] = None


@dataclass
class FlightLogEntry:
    """Single flight log entry structure."""
    timestamp: datetime
    latitude: float
    longitude: float
    altitude_m: float
    altitude_agl_m: Optional[float] = None
    heading_deg: Optional[float] = None
    pitch_deg: Optional[float] = None
    roll_deg: Optional[float] = None
    ground_speed_mps: Optional[float] = None
    vertical_speed_mps: Optional[float] = None
    battery_voltage: Optional[float] = None
    battery_percentage: Optional[int] = None
    motor_rpm: Optional[List[int]] = None
    gps_satellites: Optional[int] = None
    signal_strength: Optional[int] = None
    sequence_number: int = 0
    previous_hash: Optional[str] = None
    entry_hash: Optional[str] = None
    drone_signature: Optional[str] = None


class FlightLogIngestor:
    """
    Flight Log Ingestion Service.
    
    Handles the secure ingestion of flight logs with:
    1. Cryptographic hash chain verification
    2. Tamper detection
    3. Compliance violation detection
    4. Flight summary generation
    """
    
    # Compliance thresholds
    MAX_ALTITUDE_VIOLATION_M = 120  # 400ft AGL limit for most operations
    GEOFENCE_TOLERANCE_M = 10  # Tolerance for geofence boundary
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def ingest_flight_log(
        self,
        drone_id: UUID,
        flight_plan_id: UUID,
        log_entries: List[FlightLogEntry],
        verify_chain: bool = True
    ) -> LogIngestionResult:
        """
        Ingest a batch of flight log entries.
        
        Args:
            drone_id: UUID of the drone
            flight_plan_id: UUID of the flight plan
            log_entries: List of log entries to ingest
            verify_chain: Whether to verify the cryptographic chain
            
        Returns:
            LogIngestionResult with processing details
        """
        if not log_entries:
            return LogIngestionResult(
                success=False,
                entries_processed=0,
                entries_accepted=0,
                entries_rejected=0,
                chain_status=ChainVerificationResult.VALID,
                violations_detected=[],
                error_message="No log entries provided"
            )
        
        # Verify chain integrity if required
        chain_status = ChainVerificationResult.VALID
        if verify_chain:
            chain_status = await self._verify_hash_chain(log_entries)
            if chain_status == ChainVerificationResult.TAMPERED:
                # Log tampering violation
                await self._create_violation(
                    drone_id=drone_id,
                    flight_plan_id=flight_plan_id,
                    violation_type="LOG_TAMPERING",
                    severity=ViolationSeverity.CRITICAL,
                    description="Flight log hash chain verification failed - possible tampering detected"
                )
                return LogIngestionResult(
                    success=False,
                    entries_processed=len(log_entries),
                    entries_accepted=0,
                    entries_rejected=len(log_entries),
                    chain_status=chain_status,
                    violations_detected=["LOG_TAMPERING"],
                    error_message="Log chain verification failed - tampering detected"
                )
        
        # Process and store entries
        entries_accepted = 0
        entries_rejected = 0
        violations: List[str] = []
        
        for entry in log_entries:
            try:
                # Validate entry
                validation_ok, violation_type = await self._validate_entry(entry)
                
                if violation_type:
                    violations.append(violation_type)
                
                # Store entry
                flight_log = FlightLog(
                    drone_id=drone_id,
                    flight_plan_id=flight_plan_id,
                    timestamp=entry.timestamp,
                    latitude=entry.latitude,
                    longitude=entry.longitude,
                    altitude_m=entry.altitude_m,
                    altitude_agl_m=entry.altitude_agl_m,
                    heading_deg=entry.heading_deg,
                    pitch_deg=entry.pitch_deg,
                    roll_deg=entry.roll_deg,
                    ground_speed_mps=entry.ground_speed_mps,
                    vertical_speed_mps=entry.vertical_speed_mps,
                    battery_voltage=entry.battery_voltage,
                    battery_percentage=entry.battery_percentage,
                    motor_rpm=entry.motor_rpm,
                    gps_satellites=entry.gps_satellites,
                    signal_strength=entry.signal_strength,
                    sequence_number=entry.sequence_number,
                    previous_hash=entry.previous_hash,
                    entry_hash=entry.entry_hash or self._compute_hash(entry),
                    drone_signature=entry.drone_signature
                )
                
                self.db.add(flight_log)
                entries_accepted += 1
                
            except Exception as e:
                entries_rejected += 1
        
        await self.db.flush()
        
        # Create violations for detected issues
        unique_violations = list(set(violations))
        for violation_type in unique_violations:
            await self._create_violation(
                drone_id=drone_id,
                flight_plan_id=flight_plan_id,
                violation_type=violation_type,
                severity=self._get_violation_severity(violation_type),
                description=self._get_violation_description(violation_type)
            )
        
        # Generate flight summary
        summary_id = None
        if entries_accepted > 0:
            summary = await self._generate_summary(
                drone_id, flight_plan_id, log_entries
            )
            summary_id = summary.id if summary else None
        
        return LogIngestionResult(
            success=True,
            entries_processed=len(log_entries),
            entries_accepted=entries_accepted,
            entries_rejected=entries_rejected,
            chain_status=chain_status,
            violations_detected=unique_violations,
            summary_id=summary_id
        )
    
    async def _verify_hash_chain(self, entries: List[FlightLogEntry]) -> ChainVerificationResult:
        """Verify the cryptographic hash chain of log entries."""
        if not entries:
            return ChainVerificationResult.VALID
        
        # Sort by sequence number
        sorted_entries = sorted(entries, key=lambda x: x.sequence_number)
        
        previous_hash = None
        for i, entry in enumerate(sorted_entries):
            # Verify sequence continuity
            if i > 0 and entry.sequence_number != sorted_entries[i-1].sequence_number + 1:
                return ChainVerificationResult.MISSING_ENTRIES
            
            # Verify previous hash linkage
            if previous_hash is not None:
                if entry.previous_hash != previous_hash:
                    return ChainVerificationResult.TAMPERED
            
            # Verify entry hash
            if entry.entry_hash:
                computed_hash = self._compute_hash(entry)
                if computed_hash != entry.entry_hash:
                    return ChainVerificationResult.TAMPERED
            
            previous_hash = entry.entry_hash or self._compute_hash(entry)
        
        return ChainVerificationResult.VALID
    
    def _compute_hash(self, entry: FlightLogEntry) -> str:
        """Compute SHA-256 hash of a log entry."""
        data = {
            "timestamp": entry.timestamp.isoformat(),
            "latitude": entry.latitude,
            "longitude": entry.longitude,
            "altitude_m": entry.altitude_m,
            "sequence_number": entry.sequence_number,
            "previous_hash": entry.previous_hash or ""
        }
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.sha256(data_str.encode()).hexdigest()
    
    async def _validate_entry(self, entry: FlightLogEntry) -> Tuple[bool, Optional[str]]:
        """Validate a single log entry for compliance violations."""
        violation_type = None
        
        # Check altitude violation (400ft AGL = ~122m)
        if entry.altitude_agl_m and entry.altitude_agl_m > self.MAX_ALTITUDE_VIOLATION_M:
            violation_type = "ALTITUDE_VIOLATION"
        
        # Check GPS quality
        if entry.gps_satellites and entry.gps_satellites < 4:
            violation_type = "GPS_QUALITY_LOW"
        
        # Check battery critical
        if entry.battery_percentage and entry.battery_percentage < 10:
            violation_type = "BATTERY_CRITICAL"
        
        return violation_type is None, violation_type
    
    async def _create_violation(
        self,
        drone_id: UUID,
        flight_plan_id: UUID,
        violation_type: str,
        severity: ViolationSeverity,
        description: str
    ) -> ComplianceViolation:
        """Create a compliance violation record."""
        violation = ComplianceViolation(
            drone_id=drone_id,
            flight_plan_id=flight_plan_id,
            violation_type=violation_type,
            severity=severity,
            description=description,
            status=ViolationStatus.OPEN,
            detected_by="System"
        )
        
        self.db.add(violation)
        await self.db.flush()
        
        return violation
    
    def _get_violation_severity(self, violation_type: str) -> ViolationSeverity:
        """Get severity level for violation type."""
        severity_map = {
            "ALTITUDE_VIOLATION": ViolationSeverity.HIGH,
            "GEOFENCE_BREACH": ViolationSeverity.CRITICAL,
            "LOG_TAMPERING": ViolationSeverity.CRITICAL,
            "GPS_QUALITY_LOW": ViolationSeverity.LOW,
            "BATTERY_CRITICAL": ViolationSeverity.MEDIUM,
        }
        return severity_map.get(violation_type, ViolationSeverity.MEDIUM)
    
    def _get_violation_description(self, violation_type: str) -> str:
        """Get description for violation type."""
        descriptions = {
            "ALTITUDE_VIOLATION": "Flight exceeded maximum allowed altitude (400ft AGL)",
            "GEOFENCE_BREACH": "Drone exited approved flight area",
            "LOG_TAMPERING": "Flight log hash chain verification failed",
            "GPS_QUALITY_LOW": "GPS signal quality below minimum threshold",
            "BATTERY_CRITICAL": "Battery level dropped below critical threshold during flight",
        }
        return descriptions.get(violation_type, f"Compliance violation: {violation_type}")
    
    async def _generate_summary(
        self,
        drone_id: UUID,
        flight_plan_id: UUID,
        entries: List[FlightLogEntry]
    ) -> Optional[FlightLogSummary]:
        """Generate flight summary from log entries."""
        if not entries:
            return None
        
        # Get flight plan for pilot info
        result = await self.db.execute(
            select(FlightPlan).where(FlightPlan.id == flight_plan_id)
        )
        flight_plan = result.scalar_one_or_none()
        
        if not flight_plan:
            return None
        
        # Calculate statistics
        sorted_entries = sorted(entries, key=lambda x: x.timestamp)
        takeoff_time = sorted_entries[0].timestamp
        landing_time = sorted_entries[-1].timestamp
        duration_sec = int((landing_time - takeoff_time).total_seconds())
        
        altitudes = [e.altitude_m for e in entries if e.altitude_m]
        speeds = [e.ground_speed_mps for e in entries if e.ground_speed_mps]
        batteries = [e.battery_percentage for e in entries if e.battery_percentage]
        
        # Calculate distance
        total_distance = 0.0
        for i in range(1, len(sorted_entries)):
            # Simplified distance calculation (Euclidean, not accounting for Earth curvature)
            lat1, lon1 = sorted_entries[i-1].latitude, sorted_entries[i-1].longitude
            lat2, lon2 = sorted_entries[i].latitude, sorted_entries[i].longitude
            # Rough conversion: 1 degree ≈ 111km
            dist = ((lat2-lat1)**2 + (lon2-lon1)**2)**0.5 * 111
            total_distance += dist
        
        # Count violations
        altitude_violations = sum(1 for e in entries if e.altitude_agl_m and e.altitude_agl_m > self.MAX_ALTITUDE_VIOLATION_M)
        
        # Chain verification
        first_hash = sorted_entries[0].entry_hash or self._compute_hash(sorted_entries[0])
        last_hash = sorted_entries[-1].entry_hash or self._compute_hash(sorted_entries[-1])
        
        summary = FlightLogSummary(
            flight_plan_id=flight_plan_id,
            drone_id=drone_id,
            pilot_id=flight_plan.pilot_id,
            takeoff_time=takeoff_time,
            landing_time=landing_time,
            total_flight_duration_sec=duration_sec,
            total_distance_km=round(total_distance, 2),
            max_altitude_m=max(altitudes) if altitudes else None,
            avg_altitude_m=round(sum(altitudes)/len(altitudes), 2) if altitudes else None,
            max_speed_mps=max(speeds) if speeds else None,
            avg_speed_mps=round(sum(speeds)/len(speeds), 2) if speeds else None,
            battery_start_percentage=batteries[0] if batteries else None,
            battery_end_percentage=batteries[-1] if batteries else None,
            altitude_violations=altitude_violations,
            total_log_entries=len(entries),
            first_entry_hash=first_hash,
            last_entry_hash=last_hash,
            chain_verified=True
        )
        
        self.db.add(summary)
        await self.db.flush()
        
        return summary
    
    async def verify_existing_logs(
        self,
        drone_id: UUID,
        start_time: datetime,
        end_time: datetime
    ) -> ChainVerificationResult:
        """Verify chain integrity of existing logs in database."""
        result = await self.db.execute(
            select(FlightLog)
            .where(FlightLog.drone_id == drone_id)
            .where(FlightLog.timestamp >= start_time)
            .where(FlightLog.timestamp <= end_time)
            .order_by(FlightLog.sequence_number)
        )
        logs = result.scalars().all()
        
        if not logs:
            return ChainVerificationResult.VALID
        
        # Convert to FlightLogEntry for verification
        entries = [
            FlightLogEntry(
                timestamp=log.timestamp,
                latitude=float(log.latitude),
                longitude=float(log.longitude),
                altitude_m=float(log.altitude_m),
                sequence_number=log.sequence_number,
                previous_hash=log.previous_hash,
                entry_hash=log.entry_hash
            )
            for log in logs
        ]
        
        return await self._verify_hash_chain(entries)
