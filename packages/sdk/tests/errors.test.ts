import { describe, it, expect } from 'vitest';
import { WeaponXApiError } from '../src/errors';

describe('WeaponXApiError', () => {
  it('should set status, errorCode, and message from body', () => {
    const err = new WeaponXApiError(409, { error: 'ConflictError', message: 'Already exists' });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('WeaponXApiError');
    expect(err.status).toBe(409);
    expect(err.errorCode).toBe('ConflictError');
    expect(err.message).toBe('Already exists');
    expect(err.details).toBeUndefined();
  });

  it('should fall back to error code when message is absent', () => {
    const err = new WeaponXApiError(500, { error: 'InternalError' });

    expect(err.message).toBe('InternalError');
  });

  it('should capture validation details when provided', () => {
    const details = [{ message: 'key is required', path: ['key'] }];
    const err = new WeaponXApiError(400, { error: 'ValidationError', message: 'Bad input', details });

    expect(err.details).toEqual(details);
    expect(err.details).toHaveLength(1);
  });
});
