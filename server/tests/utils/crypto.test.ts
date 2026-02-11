import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../src/utils/crypto';

describe('Crypto Utility', () => {
  const plaintext = 'my-super-secret-api-key-12345';

  it('should encrypt plaintext into a different string', () => {
    const ciphertext = encrypt(plaintext);
    expect(ciphertext).not.toBe(plaintext);
    expect(ciphertext.length).toBeGreaterThan(0);
  });

  it('should decrypt ciphertext back to original plaintext', () => {
    const ciphertext = encrypt(plaintext);
    const result = decrypt(ciphertext);
    expect(result).toBe(plaintext);
  });

  it('should produce deterministic output for the same input', () => {
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);
    expect(a).toBe(b);
  });

  it('should produce different ciphertext for different inputs', () => {
    const a = encrypt('secret-a');
    const b = encrypt('secret-b');
    expect(a).not.toBe(b);
  });

  it('should handle empty strings', () => {
    const ciphertext = encrypt('');
    const result = decrypt(ciphertext);
    expect(result).toBe('');
  });

  it('should handle special characters and unicode', () => {
    const special = 'p@$$w0rd!#%^&*() 日本語 émojis 🔐';
    const ciphertext = encrypt(special);
    expect(decrypt(ciphertext)).toBe(special);
  });

  it('should produce base64-encoded ciphertext', () => {
    const ciphertext = encrypt(plaintext);
    // Base64 chars: A-Z, a-z, 0-9, +, /, =
    expect(ciphertext).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});
