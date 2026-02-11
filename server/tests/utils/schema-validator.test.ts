import { describe, it, expect } from 'vitest';
import { validateAgainstSchema } from '../../src/utils/schema-validator';

describe('validateAgainstSchema', () => {
  const schema = {
    type: 'object',
    properties: {
      color: { type: 'string' },
      size: { type: 'number', minimum: 1 },
      enabled: { type: 'boolean' },
    },
    required: ['color', 'size'],
    additionalProperties: false,
  };

  it('should return valid for a conforming value', () => {
    const result = validateAgainstSchema(schema, { color: 'red', size: 10, enabled: true });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return valid when optional fields are omitted', () => {
    const result = validateAgainstSchema(schema, { color: 'blue', size: 5 });
    expect(result.valid).toBe(true);
  });

  it('should return errors for missing required fields', () => {
    const result = validateAgainstSchema(schema, { color: 'red' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(e => e.message.includes('size'))).toBe(true);
  });

  it('should return errors for wrong types', () => {
    const result = validateAgainstSchema(schema, { color: 123, size: 'big' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should return errors for additional properties', () => {
    const result = validateAgainstSchema(schema, { color: 'red', size: 5, extra: true });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('additional'))).toBe(true);
  });

  it('should return errors for constraint violations', () => {
    const result = validateAgainstSchema(schema, { color: 'red', size: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path === '/size')).toBe(true);
  });

  it('should handle simple type schemas', () => {
    const stringSchema = { type: 'string', minLength: 3 };
    expect(validateAgainstSchema(stringSchema, 'hello').valid).toBe(true);
    expect(validateAgainstSchema(stringSchema, 'ab').valid).toBe(false);
  });

  it('should handle empty objects against permissive schemas', () => {
    const permissive = { type: 'object' };
    expect(validateAgainstSchema(permissive, {}).valid).toBe(true);
  });
});
