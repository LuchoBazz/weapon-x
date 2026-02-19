export interface Condition {
  attribute: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'REGEX';
  value: string | string[];
}

export interface CreateConfigDTO {
  project_reference: string;
  key: string;
  description?: string;
  type: 'BOOLEAN' | 'JSON' | 'STRING' | 'SECRET';
  is_active: boolean;
  default_value: unknown;
  validation_schema?: Record<string, unknown>;
}

export interface CreateRuleDTO {
  project_reference: string;
  name: string;
  return_value: unknown;
  conditions: Condition[];
  rollout_percentage?: number;
}

export interface EvaluateDTO {
  filters: Record<string, unknown>;
  keys: string[];
  identifier?: string;
}

export interface EvaluationResult {
  value: unknown;
  rule_id: string;
  reason: 'MATCH' | 'FALLBACK' | 'DISABLED' | 'ROLLOUT_EXCLUDED';
}

export interface ConfigEntity {
  id: string;
  project_reference: string;
  key: string;
  description: string;
  type: 'BOOLEAN' | 'JSON' | 'STRING' | 'SECRET';
  is_active: boolean;
  default_value: unknown;
  validation_schema: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  rules?: RuleEntity[];
}

export interface RuleEntity {
  id: string;
  configuration_id: string;
  name: string;
  conditions: Condition[];
  return_value: unknown;
  priority: number;
  rollout_percentage: number;
  created_at: Date;
  updated_at: Date;
}

// ── Authentication ──

export interface RoleEntity {
  id: string;
  name: string;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

export interface AuthenticationEntity {
  id: string;
  project_reference: string;
  role_id: string;
  secret_key: string;
  email: string;
  description: string;
  is_active: boolean;
  expiration_date: Date | null;
  created_at: Date;
  updated_at: Date;
  removed_at: Date | null;
  role?: RoleEntity;
}

export interface CreateAuthenticationDTO {
  project_reference: string;
  role_id: string;
  secret_key: string;
  email: string;
  description?: string;
  is_active?: boolean;
  expiration_date?: Date | null;
}

export interface UpdateAuthenticationDTO {
  description?: string;
  is_active?: boolean;
  expiration_date?: Date | null;
  role_id?: string;
  email?: string;
}

// ── Role ──

export interface CreateRoleDTO {
  name: string;
  permissions?: string[];
}

export interface UpdateRoleDTO {
  name?: string;
  permissions?: string[];
}

// ── Project ──

export interface ProjectEntity {
  reference: string;
  name: string;
  environment_id?: string | null;
  created_at: Date;
  updated_at: Date;
  configurations?: ConfigEntity[];
  authentications?: AuthenticationEntity[];
}

// ── Environment ──

export interface EnvironmentEntity {
  id: string;
  label: string;
  region: string;
  api_base_url: string;
  api_key: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEnvironmentDTO {
  id: string;
  label: string;
  region: string;
  api_base_url: string;
  api_key: string;
}

export interface UpdateEnvironmentDTO {
  label?: string;
  region?: string;
  api_base_url?: string;
  api_key?: string;
}

export interface CreateProjectDTO {
  reference: string;
  name: string;
}

export interface UpdateProjectDTO {
  name?: string;
}

// ── Audit Log ──

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditEntityType = 'CONFIGURATION' | 'RULE';

export interface AuditLogEntity {
  id: string;
  project_reference: string;
  authentication_id: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  actor_email: string;
  previous_value: unknown;
  new_value: unknown;
  metadata: unknown;
  created_at: Date;
}

export interface CreateAuditLogDTO {
  project_reference: string;
  authentication_id: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  actor_email: string;
  previous_value?: unknown;
  new_value?: unknown;
  metadata?: unknown;
}
