import sys
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# Manually recreate EncryptionService logic for pure verification
def test_encryption_logic():
    secret_key = "v7nK8m2PzL4qR9xW1bT5yS6hJ3vG0fD8cXzA"
    password = secret_key.encode()
    salt = b'aerosys_aviation_salt'
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))
    fernet = Fernet(key)
    
    test_data = "123456789012"
    encrypted = fernet.encrypt(test_data.encode()).decode()
    decrypted = fernet.decrypt(encrypted.encode()).decode()
    
    print(f"Original: {test_data}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")
    
    assert test_data == decrypted, "Encryption/Decryption logic failed!"
    print("Encryption logic test passed!")

if __name__ == "__main__":
    test_encryption_logic()
