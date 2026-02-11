export interface Condition {
  attribute: string;
  operator: string;
  value: string;
}

export interface Rule {
  id: string;
  name: string;
  return_value: boolean | string | Record<string, unknown>;
  conditions: Condition[];
  rollout_percentage?: number;
}

export interface Config {
  id?: string;
  project_reference: string;
  key: string;
  description: string;
  type: 'BOOLEAN' | 'JSON' | 'STRING' | 'SECRET';
  is_active: boolean;
  default_value: boolean | string | Record<string, unknown>;
  validation_schema: Record<string, unknown>;
  rules: Rule[];
  created_at?: string;
  updated_at?: string;
}

export interface Filters {
  search: string;
  project: string;
  type: string;
}

export interface EvaluationResult {
  value: unknown;
  rule_id: string | null;
  reason: string;
}

export type ViewType = 'dashboard' | 'edit' | 'simulate';
