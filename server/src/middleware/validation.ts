import Joi from 'joi';
import type { Request, Response, NextFunction } from 'express';

const conditionSchema = Joi.object({
  attribute: Joi.string().required(),
  operator: Joi.string().valid('EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'REGEX').required(),
  value: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
});

export const createConfigSchema = Joi.object({
  project_reference: Joi.string().max(100).required(),
  key: Joi.string().max(255).required(),
  description: Joi.string().allow('').optional(),
  type: Joi.string().valid('BOOLEAN', 'JSON', 'STRING', 'SECRET').required(),
  is_active: Joi.boolean().required(),
  default_value: Joi.any().required(),
  validation_schema: Joi.object().optional(),
});

export const createRuleSchema = Joi.object({
  project_reference: Joi.string().max(100).required(),
  name: Joi.string().max(255).required(),
  return_value: Joi.any().required().custom((value, helpers) => {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (serialized && serialized.length > 32768) {
      return helpers.error('string.max', { limit: 32768 });
    }
    return value;
  }, 'return_value length check'),
  conditions: Joi.array().items(conditionSchema).min(1).required(),
  rollout_percentage: Joi.number().integer().min(0).max(100).optional(),
});

export const evaluateSchema = Joi.object({
  filters: Joi.object().required(),
  keys: Joi.array().items(Joi.string()).min(1).required(),
  identifier: Joi.string().optional(),
});

export const createProjectSchema = Joi.object({
  reference: Joi.string().max(100).required(),
  name: Joi.string().max(255).required(),
});

export const updateProjectSchema = Joi.object({
  name: Joi.string().max(255).required(),
});

export const createRoleSchema2 = Joi.object({
  name: Joi.string().max(100).required(),
  permissions: Joi.array().items(Joi.string().max(100)).optional(),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  permissions: Joi.array().items(Joi.string().max(100)).optional(),
}).min(1);

export const createAuthenticationSchema = Joi.object({
  project_reference: Joi.string().max(100).required(),
  role_id: Joi.string().required(),
  secret_key: Joi.string().max(500).required(),
  email: Joi.string().email().max(255).required(),
  description: Joi.string().max(500).allow('').optional(),
  is_active: Joi.boolean().optional(),
  expiration_date: Joi.date().iso().allow(null).optional(),
});

export const updateAuthenticationSchema = Joi.object({
  description: Joi.string().max(500).allow('').optional(),
  is_active: Joi.boolean().optional(),
  expiration_date: Joi.date().iso().allow(null).optional(),
  role_id: Joi.string().optional(),
  email: Joi.string().email().max(255).optional(),
}).min(1);


export const createEnvironmentSchema = Joi.object({
  id: Joi.string().max(100).required(),
  label: Joi.string().max(255).required(),
  region: Joi.string().max(100).required(),
  api_base_url: Joi.string().max(500).uri().required(),
  api_key: Joi.string().max(512).required(),
});

export const updateEnvironmentSchema = Joi.object({
  label: Joi.string().max(255).optional(),
  region: Joi.string().max(100).optional(),
  api_base_url: Joi.string().max(500).uri().optional(),
  api_key: Joi.string().max(512).optional(),
}).min(1);

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(d => ({ message: d.message, path: d.path })),
      });
    }
    next();
  };
}
