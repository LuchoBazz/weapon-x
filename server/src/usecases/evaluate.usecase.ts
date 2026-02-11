import { createHash } from 'crypto';
import { IConfigRepository } from '../repository/config/interfaces';
import { Condition, EvaluateDTO, EvaluationResult } from '../types';

export class EvaluateUseCase {
  constructor(private configRepo: IConfigRepository) {}

  async execute(data: EvaluateDTO): Promise<Record<string, EvaluationResult>> {
    const configs = await this.configRepo.findManyByKeysWithRules(data.keys);
    const results: Record<string, EvaluationResult> = {};

    for (const config of configs) {
      if (!config.is_active) {
        results[config.key] = { value: null, rule_id: 'none', reason: 'DISABLED' };
        continue;
      }

      let matched = false;

      for (const rule of config.rules || []) {
        const allMet = rule.conditions.every((cond: Condition) => {
          const ctxVal = data.filters[cond.attribute];
          return this.evaluateCondition(ctxVal, cond.operator, cond.value);
        });

        if (allMet) {
          // Check rollout percentage after conditions match
          const rollout = rule.rollout_percentage ?? 100;
          if (rollout < 100) {
            const identifier = String(data.filters.identifier || data.identifier || '');
            const hash = this.computeRolloutHash(identifier, rule.id);
            if (hash >= rollout) {
              // Excluded by rollout — skip this rule, try next
              continue;
            }
          }
          results[config.key] = { value: rule.return_value, rule_id: rule.id, reason: 'MATCH' };
          matched = true;
          break;
        }
      }

      if (!matched) {
        results[config.key] = { value: config.default_value, rule_id: 'default', reason: 'FALLBACK' };
      }
    }

    return results;
  }

  /**
   * Deterministic hash: SHA-256 of identifier+ruleId, mapped to 0-99.
   * Same inputs always produce the same bucket.
   */
  computeRolloutHash(identifier: string, ruleId: string): number {
    const digest = createHash('sha256')
      .update(`${identifier}:${ruleId}`)
      .digest('hex');
    const slice = parseInt(digest.substring(0, 8), 16);
    return slice % 100;
  }

  private evaluateCondition(contextValue: unknown, operator: string, conditionValue: string | string[]): boolean {
    const cv = String(contextValue || '').toLowerCase();
    const list = Array.isArray(conditionValue)
      ? conditionValue.map(s => s.toLowerCase())
      : String(conditionValue).split(',').map(s => s.trim().toLowerCase());
    const scalarVal = Array.isArray(conditionValue) ? conditionValue[0]?.toLowerCase() ?? '' : String(conditionValue).toLowerCase();

    switch (operator) {
      case 'EQUALS': return cv === scalarVal;
      case 'NOT_EQUALS': return cv !== scalarVal;
      case 'IN': return list.includes(cv);
      case 'NOT_IN': return !list.includes(cv);
      case 'CONTAINS': return cv.includes(scalarVal);
      case 'GREATER_THAN': return parseFloat(cv) > parseFloat(scalarVal);
      case 'LESS_THAN': return parseFloat(cv) < parseFloat(scalarVal);
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
