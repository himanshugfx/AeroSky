"""
SkyGuard India - Role-Based Access Control (RBAC)
Permission management for different user roles
"""

from enum import Enum
from typing import List, Set
from functools import wraps

from fastapi import HTTPException, status


class UserRole(str, Enum):
    """User roles in the system."""
    MANUFACTURER = "Manufacturer"
    PILOT = "Pilot"
    TECHNICIAN = "Technician"
    FLEET_MANAGER = "Fleet_Manager"
    RPTO_ADMIN = "RPTO_Admin"
    DGCA_AUDITOR = "DGCA_Auditor"
    SYSTEM_ADMIN = "System_Admin"


class Permission(str, Enum):
    """System permissions."""
    # Type Certificates
    TYPE_CERT_CREATE = "type_cert:create"
    TYPE_CERT_READ = "type_cert:read"
    TYPE_CERT_UPDATE = "type_cert:update"
    TYPE_CERT_DELETE = "type_cert:delete"
    
    # Drones
    DRONE_CREATE = "drone:create"
    DRONE_READ = "drone:read"
    DRONE_UPDATE = "drone:update"
    DRONE_DELETE = "drone:delete"
    DRONE_TRANSFER = "drone:transfer"
    
    # Pilots
    PILOT_CREATE = "pilot:create"
    PILOT_READ = "pilot:read"
    PILOT_UPDATE = "pilot:update"
    PILOT_REVOKE = "pilot:revoke"
    
    # Flight Operations
    FLIGHT_PLAN_CREATE = "flight:create"
    FLIGHT_PLAN_READ = "flight:read"
    FLIGHT_PLAN_APPROVE = "flight:approve"
    FLIGHT_LOG_READ = "flight_log:read"
    FLIGHT_LOG_WRITE = "flight_log:write"
    
    # Maintenance
    MAINTENANCE_CREATE = "maintenance:create"
    MAINTENANCE_READ = "maintenance:read"
    MAINTENANCE_VERIFY = "maintenance:verify"
    
    # Manufacturing
    PRODUCTION_CREATE = "production:create"
    PRODUCTION_READ = "production:read"
    BOM_MANAGE = "bom:manage"
    
    # RPTO
    RPTO_MANAGE = "rpto:manage"
    RPC_ISSUE = "rpc:issue"
    
    # Audit & Compliance
    AUDIT_READ = "audit:read"
    VIOLATIONS_MANAGE = "violations:manage"
    TIME_TRAVEL_QUERY = "time_travel:query"
    
    # System
    USERS_MANAGE = "users:manage"
    SETTINGS_MANAGE = "settings:manage"


# Role to Permission Mapping
ROLE_PERMISSIONS: dict[UserRole, Set[Permission]] = {
    UserRole.SYSTEM_ADMIN: set(Permission),  # All permissions
    
    UserRole.MANUFACTURER: {
        Permission.TYPE_CERT_CREATE,
        Permission.TYPE_CERT_READ,
        Permission.TYPE_CERT_UPDATE,
        Permission.DRONE_CREATE,
        Permission.DRONE_READ,
        Permission.DRONE_UPDATE,
        Permission.DRONE_TRANSFER,
        Permission.MAINTENANCE_READ,
        Permission.PRODUCTION_CREATE,
        Permission.PRODUCTION_READ,
        Permission.BOM_MANAGE,
    },
    
    UserRole.PILOT: {
        Permission.DRONE_READ,
        Permission.FLIGHT_PLAN_CREATE,
        Permission.FLIGHT_PLAN_READ,
        Permission.FLIGHT_LOG_READ,
        Permission.FLIGHT_LOG_WRITE,
        Permission.MAINTENANCE_READ,
        Permission.PILOT_READ,
    },
    
    UserRole.TECHNICIAN: {
        Permission.DRONE_READ,
        Permission.MAINTENANCE_CREATE,
        Permission.MAINTENANCE_READ,
        Permission.FLIGHT_LOG_READ,
    },
    
    UserRole.FLEET_MANAGER: {
        Permission.DRONE_READ,
        Permission.DRONE_UPDATE,
        Permission.DRONE_TRANSFER,
        Permission.PILOT_READ,
        Permission.FLIGHT_PLAN_CREATE,
        Permission.FLIGHT_PLAN_READ,
        Permission.FLIGHT_PLAN_APPROVE,
        Permission.FLIGHT_LOG_READ,
        Permission.MAINTENANCE_CREATE,
        Permission.MAINTENANCE_READ,
        Permission.MAINTENANCE_VERIFY,
    },
    
    UserRole.RPTO_ADMIN: {
        Permission.RPTO_MANAGE,
        Permission.RPC_ISSUE,
        Permission.PILOT_CREATE,
        Permission.PILOT_READ,
        Permission.PILOT_UPDATE,
        Permission.DRONE_READ,
        Permission.FLIGHT_LOG_READ,
    },
    
    UserRole.DGCA_AUDITOR: {
        Permission.TYPE_CERT_READ,
        Permission.DRONE_READ,
        Permission.PILOT_READ,
        Permission.FLIGHT_PLAN_READ,
        Permission.FLIGHT_LOG_READ,
        Permission.MAINTENANCE_READ,
        Permission.PRODUCTION_READ,
        Permission.AUDIT_READ,
        Permission.VIOLATIONS_MANAGE,
        Permission.TIME_TRAVEL_QUERY,
    },
}


def has_permission(role: UserRole, permission: Permission) -> bool:
    """Check if a role has a specific permission."""
    return permission in ROLE_PERMISSIONS.get(role, set())


def has_any_permission(role: UserRole, permissions: List[Permission]) -> bool:
    """Check if a role has any of the specified permissions."""
    role_perms = ROLE_PERMISSIONS.get(role, set())
    return any(p in role_perms for p in permissions)


def has_all_permissions(role: UserRole, permissions: List[Permission]) -> bool:
    """Check if a role has all of the specified permissions."""
    role_perms = ROLE_PERMISSIONS.get(role, set())
    return all(p in role_perms for p in permissions)


class RBACChecker:
    """Dependency for checking permissions in route handlers."""
    
    def __init__(self, required_permissions: List[Permission]):
        self.required_permissions = required_permissions
    
    def __call__(self, current_user) -> bool:
        """Check if current user has required permissions."""
        user_role = UserRole(current_user.role)
        
        if not has_any_permission(user_role, self.required_permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return True


# Convenience permission checkers
require_manufacturer = RBACChecker([Permission.TYPE_CERT_CREATE, Permission.DRONE_CREATE])
require_pilot = RBACChecker([Permission.FLIGHT_PLAN_CREATE])
require_technician = RBACChecker([Permission.MAINTENANCE_CREATE])
require_fleet_manager = RBACChecker([Permission.FLIGHT_PLAN_APPROVE])
require_auditor = RBACChecker([Permission.AUDIT_READ])
require_admin = RBACChecker([Permission.USERS_MANAGE])
