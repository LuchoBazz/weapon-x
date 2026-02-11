export { AdminClient } from './admin-client';
export { EvaluationClient } from './evaluation-client';
export { SyncEvaluationClient } from './sync-evaluation-client';
export { WeaponXClient } from './client';
export { WeaponXApiError } from './errors';
export { createHttpClient } from './http';
export type {
  // Options
  WeaponXClientOptions,
  // Domain models
  Config,
  Rule,
  Condition,
  ConfigType,
  Operator,
  EvaluationReason,
  Project,
  Role,
  Authentication,
  // Request DTOs
  CreateConfigRequest,
  CreateRuleRequest,
  EvaluateRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateAuthenticationRequest,
  UpdateAuthenticationRequest,
  // Response types
  ApiDataResponse,
  EvaluateResponse,
  EvaluationResult,
  ApiErrorResponse,
  ApiValidationDetail,
  IntrospectResponse,
} from './types';
