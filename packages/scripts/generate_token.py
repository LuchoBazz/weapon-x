import hashlib

def hash_creds(email: str, password: str) -> str:
    # 1. Concatenate just like in JS
    combined = f"{email}:{password}"
    # 2. Encode to bytes (equivalent to TextEncoder)
    encoded_bytes = combined.encode('utf-8')
    # 3. Create SHA-256 hash and get the hexadecimal string
    return hashlib.sha256(encoded_bytes).hexdigest()

if __name__ == "__main__":
    # Usage example:
    email = "user@example.com"
    password = "my_password"
    print(f"Generated Hash: [{hash_creds(email, password)}]")
