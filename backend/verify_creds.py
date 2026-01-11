import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, async_session_maker
from app.core.security import verify_password
from app.models.registry import User

async def verify_login(email, password):
    async with async_session_maker() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"RESULT: USER_NOT_FOUND")
            return
        
        is_valid = verify_password(password, user.password_hash)
        print(f"RESULT: {email} | VALID: {is_valid}")

async def main():
    print("Verifying Admin...")
    await verify_login("admin@aerosky.in", "admin123")
    print("Verifying Pilot...")
    await verify_login("pilot@aerosky.in", "pilot123")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
