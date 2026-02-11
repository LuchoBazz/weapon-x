import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EvaluateUseCase } from '../../src/usecases/evaluate.usecase';
import { IConfigRepository } from '../../src/repository/config/interfaces';
import { ConfigEntity, EvaluateDTO } from '../../src/types';

const NOW = new Date('2025-01-01T00:00:00Z');

function makeConfig(overrides: Partial<ConfigEntity> = {}): ConfigEntity {
  return {
    id: 'cfg-1',
    project_reference: 'PROJ_A',
    key: 'feature_x',
    description: '',
    type: 'BOOLEAN',
    is_active: true,
    default_value: false,
    validation_schema: {},
    created_at: NOW,
    updated_at: NOW,
    rules: [],
    ...overrides,
  };
}

function makeRule(overrides: any = {}) {
  return {
    id: 'rule-1',
    configuration_id: 'cfg-1',
    name: 'R',
    priority: 0,
    rollout_percentage: 100,
    conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'vip' }],
    return_value: true,
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  };
}

function createMockConfigRepo(): IConfigRepository {
  return {
    create: vi.fn(),
    findByKey: vi.fn(),
    findAll: vi.fn(),
    findByKeyWithRules: vi.fn(),
    findManyByKeysWithRules: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe('EvaluateUseCase', () => {
  let repo: ReturnType<typeof createMockConfigRepo>;
  let useCase: EvaluateUseCase;

  beforeEach(() => {
    repo = createMockConfigRepo();
    useCase = new EvaluateUseCase(repo);
  });

  // ── Disabled configs ──

  it('should return DISABLED for inactive configs', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ is_active: false }),
    ]);

    const result = await useCase.execute({ filters: {}, keys: ['feature_x'] });
    expect(result['feature_x']).toEqual({ value: null, rule_id: 'none', reason: 'DISABLED' });
  });

  // ── Fallback ──

  it('should return FALLBACK with default_value when no rules match', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({
        default_value: false,
        rules: [makeRule({ conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }] })],
      }),
    ]);

    const result = await useCase.execute({ filters: { tier: 'basic' }, keys: ['feature_x'] });
    expect(result['feature_x']).toEqual({ value: false, rule_id: 'default', reason: 'FALLBACK' });
  });

  it('should return FALLBACK when config has no rules', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ default_value: { color: 'blue' } }),
    ]);

    const result = await useCase.execute({ filters: {}, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe('FALLBACK');
    expect(result['feature_x'].value).toEqual({ color: 'blue' });
  });

  // ── Rule matching ──

  it('should return MATCH when rule conditions are met (EQUALS)', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule()] }),
    ]);

    const result = await useCase.execute({ filters: { tier: 'VIP' }, keys: ['feature_x'] });
    expect(result['feature_x']).toEqual({ value: true, rule_id: 'rule-1', reason: 'MATCH' });
  });

  it('should stop at the first matching rule (priority order)', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({
        rules: [
          makeRule({ id: 'rule-1', name: 'First', priority: 0, conditions: [{ attribute: 'country', operator: 'EQUALS', value: 'CO' }], return_value: 'first' }),
          makeRule({ id: 'rule-2', name: 'Second', priority: 1, conditions: [{ attribute: 'country', operator: 'EQUALS', value: 'CO' }], return_value: 'second' }),
        ],
      }),
    ]);

    const result = await useCase.execute({ filters: { country: 'CO' }, keys: ['feature_x'] });
    expect(result['feature_x'].rule_id).toBe('rule-1');
    expect(result['feature_x'].value).toBe('first');
  });

  // ── Operators ──

  it('should handle NOT_EQUALS operator', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'env', operator: 'NOT_EQUALS', value: 'prod' }] })] }),
    ]);
    const result = await useCase.execute({ filters: { env: 'staging' }, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe('MATCH');
  });

  it('should handle IN operator', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'country', operator: 'IN', value: ['CO', 'MX'] }] })] }),
    ]);

    const match = await useCase.execute({ filters: { country: 'CO' }, keys: ['feature_x'] });
    expect(match['feature_x'].reason).toBe('MATCH');

    const miss = await useCase.execute({ filters: { country: 'US' }, keys: ['feature_x'] });
    expect(miss['feature_x'].reason).toBe('FALLBACK');
  });

  it('should handle NOT_IN operator', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'country', operator: 'NOT_IN', value: ['US', 'UK'] }] })] }),
    ]);
    const result = await useCase.execute({ filters: { country: 'CO' }, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe('MATCH');
  });

  it('should handle CONTAINS operator', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'email', operator: 'CONTAINS', value: '@vip.com' }] })] }),
    ]);
    const result = await useCase.execute({ filters: { email: 'user@vip.com' }, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe('MATCH');
  });

  it('should handle GREATER_THAN operator', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'age', operator: 'GREATER_THAN', value: '18' }] })] }),
    ]);

    const match = await useCase.execute({ filters: { age: '25' }, keys: ['feature_x'] });
    expect(match['feature_x'].reason).toBe('MATCH');

    const miss = await useCase.execute({ filters: { age: '10' }, keys: ['feature_x'] });
    expect(miss['feature_x'].reason).toBe('FALLBACK');
  });

  it('should handle LESS_THAN operator', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'score', operator: 'LESS_THAN', value: '50' }] })] }),
    ]);
    const result = await useCase.execute({ filters: { score: '30' }, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe('MATCH');
  });

  it('should handle REGEX operator', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'email', operator: 'REGEX', value: '^admin@' }] })] }),
    ]);

    const match = await useCase.execute({ filters: { email: 'admin@example.com' }, keys: ['feature_x'] });
    expect(match['feature_x'].reason).toBe('MATCH');

    const miss = await useCase.execute({ filters: { email: 'user@example.com' }, keys: ['feature_x'] });
    expect(miss['feature_x'].reason).toBe('FALLBACK');
  });

  it('should return FALLBACK for invalid REGEX without throwing', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'x', operator: 'REGEX', value: '[invalid(' }] })] }),
    ]);
    const result = await useCase.execute({ filters: { x: 'anything' }, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe('FALLBACK');
  });

  it('should return FALLBACK for unknown operator', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'x', operator: 'UNKNOWN_OP' as any, value: 'y' }] })] }),
    ]);
    const result = await useCase.execute({ filters: { x: 'y' }, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe('FALLBACK');
  });

  // ── Multiple configs ──

  it('should evaluate multiple configs independently', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({ key: 'flag_a', is_active: false }),
      makeConfig({ key: 'flag_b', default_value: 42, rules: [] }),
    ]);

    const result = await useCase.execute({ filters: {}, keys: ['flag_a', 'flag_b'] });
    expect(result['flag_a'].reason).toBe('DISABLED');
    expect(result['flag_b'].reason).toBe('FALLBACK');
    expect(result['flag_b'].value).toBe(42);
  });

  // ── Multi-condition rules ──

  it('should require ALL conditions to match (AND logic)', async () => {
    (repo.findManyByKeysWithRules as any).mockResolvedValue([
      makeConfig({
        rules: [makeRule({
          conditions: [
            { attribute: 'country', operator: 'EQUALS', value: 'CO' },
            { attribute: 'tier', operator: 'EQUALS', value: 'VIP' },
          ],
        })],
      }),
    ]);

    const partial = await useCase.execute({ filters: { country: 'CO', tier: 'basic' }, keys: ['feature_x'] });
    expect(partial['feature_x'].reason).toBe('FALLBACK');

    const full = await useCase.execute({ filters: { country: 'CO', tier: 'VIP' }, keys: ['feature_x'] });
    expect(full['feature_x'].reason).toBe('MATCH');
  });

  // ── Error propagation ──

  it('should propagate repository errors', async () => {
    (repo.findManyByKeysWithRules as any).mockRejectedValue(new Error('DB down'));
    await expect(useCase.execute({ filters: {}, keys: ['x'] })).rejects.toThrow('DB down');
  });

  // ── Rollout percentage ──

  describe('rollout percentage', () => {
    it('should always match when rollout_percentage is 100', async () => {
      (repo.findManyByKeysWithRules as any).mockResolvedValue([
        makeConfig({ rules: [makeRule({ rollout_percentage: 100 })] }),
      ]);
      const result = await useCase.execute({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-123' });
      expect(result['feature_x'].reason).toBe('MATCH');
    });

    it('should always fallback when rollout_percentage is 0', async () => {
      (repo.findManyByKeysWithRules as any).mockResolvedValue([
        makeConfig({ rules: [makeRule({ rollout_percentage: 0 })] }),
      ]);
      const result = await useCase.execute({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-123' });
      expect(result['feature_x'].reason).toBe('FALLBACK');
    });

    it('should be deterministic — same identifier + rule yields same result', async () => {
      (repo.findManyByKeysWithRules as any).mockResolvedValue([
        makeConfig({ rules: [makeRule({ rollout_percentage: 50 })] }),
      ]);

      const r1 = await useCase.execute({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-abc' });
      const r2 = await useCase.execute({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-abc' });
      expect(r1['feature_x'].reason).toBe(r2['feature_x'].reason);
      expect(r1['feature_x'].value).toBe(r2['feature_x'].value);
    });

    it('should produce different outcomes for different identifiers', async () => {
      // With 50% rollout, statistically some users will be included and some excluded.
      // We test many identifiers to confirm it's not all-or-nothing.
      (repo.findManyByKeysWithRules as any).mockResolvedValue([
        makeConfig({ rules: [makeRule({ rollout_percentage: 50 })] }),
      ]);

      const reasons = new Set<string>();
      for (let i = 0; i < 100; i++) {
        (repo.findManyByKeysWithRules as any).mockResolvedValue([
          makeConfig({ rules: [makeRule({ rollout_percentage: 50 })] }),
        ]);
        const r = await useCase.execute({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: `user-${i}` });
        reasons.add(r['feature_x'].reason);
      }
      // With 50% rollout and 100 distinct identifiers, we should see both outcomes
      expect(reasons.has('MATCH')).toBe(true);
      expect(reasons.has('FALLBACK')).toBe(true);
    });

    it('should skip to next rule when excluded by rollout', async () => {
      // First rule has 0% rollout (always excluded), second has 100%
      (repo.findManyByKeysWithRules as any).mockResolvedValue([
        makeConfig({
          rules: [
            makeRule({ id: 'rule-1', priority: 0, rollout_percentage: 0, return_value: 'first' }),
            makeRule({ id: 'rule-2', priority: 1, rollout_percentage: 100, return_value: 'second' }),
          ],
        }),
      ]);

      const result = await useCase.execute({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-1' });
      expect(result['feature_x'].rule_id).toBe('rule-2');
      expect(result['feature_x'].value).toBe('second');
    });

    it('computeRolloutHash should return value between 0 and 99', () => {
      for (let i = 0; i < 200; i++) {
        const hash = useCase.computeRolloutHash(`user-${i}`, `rule-${i}`);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(100);
      }
    });

    it('computeRolloutHash should be consistent', () => {
      const h1 = useCase.computeRolloutHash('user-x', 'rule-y');
      const h2 = useCase.computeRolloutHash('user-x', 'rule-y');
      expect(h1).toBe(h2);
    });

    it('should prefer filters.identifier over top-level identifier', async () => {
      (repo.findManyByKeysWithRules as any).mockResolvedValue([
        makeConfig({ rules: [makeRule({ rollout_percentage: 50 })] }),
      ]);

      const rFilters = await useCase.execute({ filters: { tier: 'VIP', identifier: 'filters-user' }, keys: ['feature_x'], identifier: 'top-level-user' });
      const rDirect = await useCase.execute({ filters: { tier: 'VIP', identifier: 'filters-user' }, keys: ['feature_x'] });

      // Both should use filters.identifier and thus produce the same result
      expect(rFilters['feature_x'].reason).toBe(rDirect['feature_x'].reason);
    });
  });
});
