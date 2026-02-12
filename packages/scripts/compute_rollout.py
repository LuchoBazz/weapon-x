import hashlib

def compute_rollout(identifier: str, rule_id: str) -> int:
    """
    Computes a deterministic hash for feature rollouts based on 
    an identifier and a rule ID.
    """
    # 1. Combine inputs with a colon separator
    combined_string = f"{identifier}:{rule_id}"
    
    # 2. Generate SHA256 hex digest
    # We encode the string to bytes (utf-8) before hashing
    digest = hashlib.sha256(combined_string.encode('utf-8')).hexdigest()
    
    # 3. Extract the first 8 characters and convert from hex to integer
    slice_val = int(digest[:8], 16)
    
    # 4. Return the remainder of division by 100
    return slice_val % 100

if __name__ == "__main__":
    # Usage example:
    identifier = "user@example.com"
    rule_id = "bf6c5e57-304e-461a-a290-4290a669d577"
    
    # Calculation
    percentage = compute_rollout(identifier, rule_id)
    
    # Formatted Output
    print("-" * 30)
    print(f"{'ROLLOUT CALCULATION':^30}")
    print("-" * 30)
    print(f"{'Identifier:':<12} [{identifier}]")
    print(f"{'Rule ID:':<12} [{rule_id}]")
    print(f"{'Result:':<12} [{percentage}%]")
