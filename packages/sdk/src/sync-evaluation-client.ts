import type { AxiosInstance } from 'axios';
import { createHttpClient } from './http';
import { computeRolloutHash } from './sha256';
import type {
  WeaponXClientOptions,
  Config,
  Condition,
  EvaluateRequest,
  EvaluationResult,
  ApiDataResponse,
} from './types';

export class SyncEvaluationClient {
  private static instance: SyncEvaluationClient | null = null;

  private http: AxiosInstance;
  private cache: Map<string, Config> = new Map();
  private initialized = false;

  private constructor(options: WeaponXClientOptions) {
    this.http = createHttpClient(options);
  }

  static getInstance(options: WeaponXClientOptions): SyncEvaluationClient {
    if (!SyncEvaluationClient.instance) {
      SyncEvaluationClient.instance = new SyncEvaluationClient(options);
    }
    return SyncEvaluationClient.instance;
  }

  static resetInstance(): void {
    SyncEvaluationClient.instance = null;
  }

  async sync(projectReference: string): Promise<void> {
    const { data: res } = await this.http.get<ApiDataResponse<Config[]>>(
      `/v1/admin/projects/${encodeURIComponent(projectReference)}/configs`,
    );
    this.cache.clear();
    for (const config of res.data) {
      this.cache.set(config.key, config);
    }
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getCachedConfigs(): ReadonlyMap<string, Config> {
    return this.cache;
  }

  evaluate(data: EvaluateRequest): Record<string, EvaluationResult> {
    const results: Record<string, EvaluationResult> = {};

    for (const key of data.keys) {
      const config = this.cache.get(key);

      if (!config) {
        results[key] = { value: null, rule_id: 'none', reason: 'FALLBACK' };
        continue;
      }

      if (!config.is_active) {
        results[key] = { value: null, rule_id: 'none', reason: 'DISABLED' };
        continue;
      }

      let matched = false;

      for (const rule of config.rules || []) {
        const allMet = rule.conditions.every((cond: Condition) => {
          const ctxVal = data.filters[cond.attribute];
          return this.evaluateCondition(ctxVal, cond.operator, cond.value);
        });

        if (allMet) {
          const rollout = rule.rollout_percentage ?? 100;
          if (rollout < 100) {
            const identifier = String(data.filters.identifier || data.identifier || '');
            const hash = this.computeRolloutHash(identifier, rule.id);
            if (hash >= rollout) {
              continue;
            }
          }

          results[key] = { value: rule.return_value, rule_id: rule.id, reason: 'MATCH' };
          matched = true;
          break;
        }
      }

      if (!matched) {
        results[key] = { value: config.default_value, rule_id: 'default', reason: 'FALLBACK' };
      }
    }

    return results;
  }

  computeRolloutHash(identifier: string, ruleId: string): number {
    return computeRolloutHash(identifier, ruleId);
  }

  private evaluateCondition(contextValue: unknown, operator: string, conditionValue: string | string[]): boolean {
    const cv = String(contextValue || '').toLowerCase();
    const list = Array.isArray(conditionValue)
      ? conditionValue.map(s => s.toLowerCase())
      : String(conditionValue).split(',').map(s => s.trim().toLowerCase());
    const scalarVal = Array.isArray(conditionValue)
      ? conditionValue[0]?.toLowerCase() ?? ''
      : String(conditionValue).toLowerCase();

    switch (operator) {
      case 'EQUALS':       return cv === scalarVal;
      case 'NOT_EQUALS':   return cv !== scalarVal;
      case 'IN':           return list.includes(cv);
      case 'NOT_IN':       return !list.includes(cv);
      case 'CONTAINS':     return cv.includes(scalarVal);
      case 'GREATER_THAN': return parseFloat(cv) > parseFloat(scalarVal);
      case 'LESS_THAN':    return parseFloat(cv) < parseFloat(scalarVal);
      case 'REGEX':
        try {
          const pattern = Array.isArray(conditionValue) ? conditionValue[0] : conditionValue;
          return new RegExp(pattern).test(String(contextValue));
        } catch {
          return false;
        }
      default: return false;
    }
  }
}
