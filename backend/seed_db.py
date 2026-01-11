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
from app.models.registry import User, UserRole, Organization, IDType

async def seed_data():
    print("Starting database seeding...")
    
    async with engine.begin() as conn:
        # Create tables
        try:
            await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            print(f"Error during metadata.create_all: {e}")
            # Try to continue, maybe tables exist or it's a permission issue with extensions
    
    try:
        async with async_session_maker() as session:
            # 1. Create Organization
            result = await session.execute(select(Organization).where(Organization.name == "AeroSky India Corp"))
            org = result.scalar_one_or_none()
            
            if not org:
                org = Organization(
                    id=uuid4(),
                    name="AeroSky India Corp",
                    legal_name="AeroSky Aviation Solutions Pvt Ltd",
                    gstin="27AADCA1234A1Z1",
                    org_type="Manufacturer",
                    city="Pune",
                    state="Maharashtra"
                )
                session.add(org)
                print("Created Organization: AeroSky India Corp")
            
            await session.commit()
            await session.refresh(org)

            # 2. Create Admin User
            result = await session.execute(select(User).where(User.email == "admin@aerosky.in"))
            admin = result.scalar_one_or_none()
            
            if not admin:
                admin = User(
                    email="admin@aerosky.in",
                    password_hash=get_password_hash("admin123"),
                    full_name="AeroSky Administrator",
                    role=UserRole.SYSTEM_ADMIN,
                    organization_id=org.id,
                    is_active=True,
                    email_verified=True
                )
                session.add(admin)
                print("Created System Admin: admin@aerosky.in")
            
            # 3. Create Pilot User
            result = await session.execute(select(User).where(User.email == "pilot@aerosky.in"))
            pilot = result.scalar_one_or_none()
            
            if not pilot:
                pilot = User(
                    email="pilot@aerosky.in",
                    password_hash=get_password_hash("pilot123"),
                    full_name="Himanshu Pilot",
                    role=UserRole.PILOT,
                    organization_id=org.id,
                    is_active=True,
                    email_verified=True
                )
                session.add(pilot)
                print("Created Pilot: pilot@aerosky.in")

            await session.commit()
            print("Database seeding completed successfully!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Failed to seed database: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
