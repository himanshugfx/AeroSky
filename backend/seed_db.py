import asyncio
import sys
from uuid import uuid4
from datetime import datetime, date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Add parent directory to sys.path to import app
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, async_session_maker
from app.core.security import get_password_hash
from app.models.registry import (
    User, UserRole, Organization, IDType, 
    TypeCertificate, DroneCategory, DroneSubCategory, DroneClass, 
    CertificationStatus, Drone, DroneStatus, Pilot, PilotStatus, OperationRating
)

async def seed_data():
    print("Starting database seeding...")
    
    async with engine.begin() as conn:
        # Create tables
        try:
            await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            print(f"Error during metadata.create_all: {e}")
    
    try:
        async with async_session_maker() as session:
            # 1. Create Organization
            result = await session.execute(select(Organization).where(Organization.name == "Aerosys Aviation"))
            org = result.scalar_one_or_none()
            
            if not org:
                org = Organization(
                    id=uuid4(),
                    name="Aerosys Aviation",
                    legal_name="Aerosys Aviation India Private Limited",
                    gstin="09U73200UP2020PTC134883",
                    org_type="Manufacturer",
                    city="Noida",
                    state="Uttar Pradesh",
                    email="contact@aerosysaviation.com",
                    website="https://aerosysaviation.com"
                )
                session.add(org)
                print("Created Organization: Aerosys Aviation")
            
            await session.commit()
            await session.refresh(org)

            # 2. Create Admin User
            result = await session.execute(select(User).where(User.email == "admin@aerosysaviation.com"))
            admin = result.scalar_one_or_none()
            
            if not admin:
                admin = User(
                    email="admin@aerosysaviation.com",
                    password_hash=get_password_hash("admin123"),
                    full_name="Aerosys Administrator",
                    role=UserRole.SYSTEM_ADMIN,
                    organization_id=org.id,
                    is_active=True,
                    email_verified=True
                )
                session.add(admin)
                print("Created System Admin: admin@aerosysaviation.com")
            
            # 3. Create Pilot User
            result = await session.execute(select(User).where(User.email == "pilot@aerosysaviation.com"))
            pilot_user = result.scalar_one_or_none()
            
            if not pilot_user:
                pilot_user = User(
                    email="pilot@aerosysaviation.com",
                    password_hash=get_password_hash("pilot123"),
                    full_name="Sethuraj V",
                    role=UserRole.PILOT,
                    organization_id=org.id,
                    is_active=True,
                    email_verified=True
                )
                session.add(pilot_user)
                print("Created Pilot User: pilot@aerosysaviation.com")

            await session.commit()
            await session.refresh(pilot_user)

            # 4. Create Type Certificates (Vedansh & Shaurya)
            result = await session.execute(select(TypeCertificate).where(TypeCertificate.model_name == "VEDANSH"))
            tc_vedansh = result.scalar_one_or_none()
            if not tc_vedansh:
                tc_vedansh = TypeCertificate(
                    id=uuid4(),
                    manufacturer_id=org.id,
                    model_name="VEDANSH",
                    model_number="AS-V1-2024",
                    category=DroneCategory.ROTORCRAFT,
                    sub_category=DroneSubCategory.RPAS,
                    weight_class=DroneClass.SMALL,
                    max_takeoff_weight_kg=12.5,
                    empty_weight_kg=8.2,
                    payload_capacity_kg=4.3,
                    max_endurance_min=45,
                    max_range_km=10.0,
                    max_altitude_ft=400,
                    npnt_compliant=True,
                    geofencing_capable=True,
                    certification_status=CertificationStatus.CERTIFIED,
                    certificate_number="DGCA-TC-2024-001",
                    certified_date=date(2024, 1, 15)
                )
                session.add(tc_vedansh)
                print("Created Type Certificate: VEDANSH")

            result = await session.execute(select(TypeCertificate).where(TypeCertificate.model_name == "SHAURYA"))
            tc_shaurya = result.scalar_one_or_none()
            if not tc_shaurya:
                tc_shaurya = TypeCertificate(
                    id=uuid4(),
                    manufacturer_id=org.id,
                    model_name="SHAURYA",
                    model_number="AS-S1-2024",
                    category=DroneCategory.ROTORCRAFT,
                    sub_category=DroneSubCategory.RPAS,
                    weight_class=DroneClass.SMALL,
                    max_takeoff_weight_kg=15.0,
                    empty_weight_kg=9.5,
                    payload_capacity_kg=5.5,
                    max_endurance_min=40,
                    max_range_km=12.0,
                    max_altitude_ft=500,
                    npnt_compliant=True,
                    geofencing_capable=True,
                    certification_status=CertificationStatus.CERTIFIED,
                    certificate_number="DGCA-TC-2024-002",
                    certified_date=date(2024, 2, 20)
                )
                session.add(tc_shaurya)
                print("Created Type Certificate: SHAURYA")

            await session.commit()
            await session.refresh(tc_vedansh)
            await session.refresh(tc_shaurya)

            # 5. Create Drones
            result = await session.execute(select(Drone).where(Drone.manufacturer_serial_number == "ASV2024001"))
            drone1 = result.scalar_one_or_none()
            if not drone1:
                drone1 = Drone(
                    id=uuid4(),
                    uin="U0001V",
                    manufacturer_serial_number="ASV2024001",
                    type_certificate_id=tc_vedansh.id,
                    owner_id=admin.id,
                    organization_id=org.id,
                    status=DroneStatus.ACTIVE,
                    registration_date=date(2024, 1, 20),
                    assigned_pilot_id=pilot_user.id
                )
                session.add(drone1)
                print("Created Drone: VEDANSH-001")

            # 6. Create Pilot Profile
            result = await session.execute(select(Pilot).where(Pilot.user_id == pilot_user.id))
            pilot_profile = result.scalar_one_or_none()
            if not pilot_profile:
                pilot_profile = Pilot(
                    id=uuid4(),
                    user_id=pilot_user.id,
                    rpc_number="RPC-2024-AS-001",
                    full_name="Sethuraj V",
                    date_of_birth=date(1990, 5, 15),
                    primary_id_type=IDType.PASSPORT,
                    primary_id_number="A1234567",
                    category_rating=DroneCategory.ROTORCRAFT,
                    class_rating=DroneClass.SMALL,
                    operation_rating=OperationRating.VLOS,
                    issue_date=date(2024, 1, 1),
                    expiry_date=date(2034, 1, 1),
                    status=PilotStatus.ACTIVE
                )
                session.add(pilot_profile)
                print("Created Pilot Profile for Sethuraj V")

            await session.commit()
            print("Database seeding completed successfully!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Failed to seed database: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
