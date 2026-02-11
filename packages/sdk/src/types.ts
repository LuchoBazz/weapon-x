// ── Enums & Primitives ──

export type ConfigType = 'BOOLEAN' | 'JSON' | 'STRING' | 'SECRET';

export type Operator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'IN'
  | 'NOT_IN'
  | 'CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'REGEX';

export type EvaluationReason = 'MATCH' | 'FALLBACK' | 'DISABLED' | 'ROLLOUT_EXCLUDED';

export interface Condition {
  attribute: string;
  operator: Operator;
  value: string | string[];
}

export interface Rule {
  id: string;
  configuration_id: string;
  name: string;
  conditions: Condition[];
  return_value: unknown;
  priority: number;
  rollout_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Config {
  id: string;
  project_reference: string;
  key: string;
  description: string;
  type: ConfigType;
  is_active: boolean;
  default_value: unknown;
  validation_schema: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  rules?: Rule[];
}

export interface Project {
  reference: string;
  name: string;
  created_at: string;
  updated_at: string;
  configurations?: Config[];
  authentications?: Authentication[];
}

export interface CreateProjectRequest {
  reference: string;
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateRoleRequest {
  name: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  permissions?: string[];
}

export interface Authentication {
  id: string;
  project_reference: string;
  role_id: string;
  secret_key: string;
  email: string;
  description: string;
  is_active: boolean;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
  removed_at: string | null;
  role?: Role;
}

export interface CreateAuthenticationRequest {
  project_reference: string;
  role_id: string;
  secret_key: string;
  email: string;
  description?: string;
  is_active?: boolean;
  expiration_date?: string | null;
}

export interface UpdateAuthenticationRequest {
  description?: string;
  is_active?: boolean;
  expiration_date?: string | null;
  role_id?: string;
  email?: string;
}

export interface CreateConfigRequest {
  project_reference: string;
  key: string;
  description?: string;
  type: ConfigType;
  is_active: boolean;
  default_value: unknown;
  validation_schema?: Record<string, unknown>;
}

export interface CreateRuleRequest {
  project_reference: string;
  name: string;
  return_value: unknown;
  conditions: Condition[];
  rollout_percentage?: number;
}

export interface EvaluateRequest {
  filters: Record<string, unknown>;
  keys: string[];
  identifier?: string;
}

export interface ApiDataResponse<T> {
  data: T;
}

export interface EvaluationResult {
  value: unknown;
  rule_id: string;
  reason: EvaluationReason;
}

export interface EvaluateResponse {
  meta: { server_time: number };
  data: Record<string, EvaluationResult>;
}

export interface ApiValidationDetail {
  message: string;
  path: (string | number)[];
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: ApiValidationDetail[];
}

export interface IntrospectResponse {
  active: boolean;
  exp?: number;
}

export interface WeaponXClientOptions {
  /** Base URL of the Weapon-X API (e.g. "http://localhost:3001") */
  baseUrl: string;
  /** Optional headers merged into every request (e.g. Authorization) */
  headers?: Record<string, string>;
}
