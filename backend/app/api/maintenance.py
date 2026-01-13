from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.maintenance import MaintenanceLog
from app.schemas.maintenance import MaintenanceLogResponse, MaintenanceLogCreate
from app.models.registry import UserRole
from app.api.auth import get_current_user, require_roles

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.get("", response_model=List[MaintenanceLogResponse])
async def list_maintenance_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.TECHNICIAN, UserRole.FLEET_MANAGER, UserRole.SYSTEM_ADMIN, UserRole.DGCA_AUDITOR, UserRole.MANUFACTURER))
):
    """List maintenance logs."""
    query = select(MaintenanceLog).offset(skip).limit(limit).order_by(MaintenanceLog.created_at.desc())
    result = await db.execute(query.offset(skip).limit(limit).order_by(MaintenanceLog.created_at.desc()))
    logs = result.scalars().all()
    return logs

@router.post("", response_model=MaintenanceLogResponse)
async def create_maintenance_log(
    log_data: MaintenanceLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_roles(UserRole.TECHNICIAN, UserRole.FLEET_MANAGER, UserRole.SYSTEM_ADMIN))
):
    """Create a new maintenance log."""
    log = MaintenanceLog(
        drone_id=log_data.drone_id,
        maintenance_type=log_data.maintenance_type,
        description=log_data.description,
        technician_name=log_data.technician_name,
        maintenance_date=log_data.maintenance_date,
        next_due_date=log_data.next_due_date,
        status=log_data.status
    )
    db.add(log)
    await db.flush()
    await db.refresh(log)
    return log
