"""
SkyGuard India - Core Configuration
Centralized configuration management using Pydantic Settings
"""

from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = Field(default="Aerosys Aviation")
    app_env: str = Field(default="development")
    debug: bool = Field(default=False)
    secret_key: str = Field(...)
    
    # Database
    database_url: str = Field(...)
    database_pool_size: int = Field(default=5)
    database_max_overflow: int = Field(default=10)
    
    # JWT Authentication
    jwt_secret_key: str = Field(...)
    jwt_algorithm: str = Field(default="HS256")
    jwt_access_token_expire_minutes: int = Field(default=30)
    jwt_refresh_token_expire_days: int = Field(default=7)
    
    # Digital Sky API (DGCA)
    digital_sky_api_url: str = Field(default="https://digitalsky.dgca.gov.in/api/v1")
    digital_sky_api_key: Optional[str] = Field(default=None)
    digital_sky_mock_mode: bool = Field(default=True)
    
    # DigiLocker API (KYC)
    digilocker_api_url: str = Field(default="https://api.digilocker.gov.in")
    digilocker_client_id: Optional[str] = Field(default=None)
    digilocker_client_secret: Optional[str] = Field(default=None)
    digilocker_mock_mode: bool = Field(default=True)
    
    # Map Provider
    map_provider: str = Field(default="mapbox")
    mapbox_access_token: Optional[str] = Field(default=None)
    
    # CORS
    cors_origins: List[str] = Field(default=["http://localhost:3000"])
    
    # Timezone
    timezone: str = Field(default="Asia/Kolkata")
    
    # Logging
    log_level: str = Field(default="INFO")
    log_format: str = Field(default="json")
    
    # NPNT Keys
    npnt_private_key_path: str = Field(default="./keys/npnt_private.pem")
    npnt_public_key_path: str = Field(default="./keys/npnt_public.pem")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
