import type { ErrorObject } from 'ajv';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

export interface SchemaValidationResult {
  valid: boolean;
  errors: { message: string; path: string }[];
}

/**
 * Validates a value against a JSON Schema.
 * Returns a result object with `valid` boolean and an array of error details.
 */
export function validateAgainstSchema(
  schema: Record<string, unknown>,
  value: unknown
): SchemaValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(value) as boolean;

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors ?? []).map((err: ErrorObject) => ({
    message: err.message ?? 'Unknown validation error',
    path: err.instancePath || '/',
  }));

  return { valid: false, errors };
}
