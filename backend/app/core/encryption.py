"""
Aerosys Aviation - Encryption Service
Handles symmetric encryption for sensitive PII data.
"""

import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from app.core.config import get_settings

settings = get_settings()

class EncryptionService:
    """Service for encrypting and decrypting sensitive data."""
    
    _instance = None
    _fernet = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EncryptionService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize the Fernet cipher using the app SECRET_KEY."""
        # Derived key from SECRET_KEY for Fernet
        password = settings.secret_key.encode()
        salt = b'aerosys_aviation_salt' # In production, use a unique salt from env
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))
        self._fernet = Fernet(key)

    def encrypt(self, data: str) -> str:
        """Encrypt a string and return a base64 encoded string."""
        if not data:
            return data
        return self._fernet.encrypt(data.encode()).decode()

    def decrypt(self, encrypted_data: str) -> str:
        """Decrypt a base64 encoded string and return the original string."""
        if not encrypted_data:
            return encrypted_data
        try:
            return self._fernet.decrypt(encrypted_data.encode()).decode()
        except Exception:
            # Fallback for old plaintext data or decryption failure
            return encrypted_data

# Global instance
encryption_service = EncryptionService()
