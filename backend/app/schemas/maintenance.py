from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID

class MaintenanceLogBase(BaseModel):
    drone_id: UUID
    maintenance_type: str
    description: str
    technician_name: str
    maintenance_date: date
    next_due_date: Optional[date] = None
    status: str = "Completed"

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogResponse(MaintenanceLogBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class MaintenanceLogListResponse(BaseModel):
    total: int
    items: List[MaintenanceLogResponse]
