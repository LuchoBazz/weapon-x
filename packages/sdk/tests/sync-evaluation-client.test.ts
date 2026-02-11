import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { SyncEvaluationClient } from '../src/sync-evaluation-client';
import type { Config, Rule, Condition } from '../src/types';

vi.mock('axios');

function setupMockAxios() {
  const interceptors = { response: { use: vi.fn() }, request: { use: vi.fn() } };
  const instance = { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn(), interceptors };
  (axios.create as any).mockReturnValue(instance);
  return instance;
}

function makeConfig(overrides: Partial<Config> = {}): Config {
  return {
    id: 'cfg-1', project_reference: 'PROJ_A', key: 'feature_x', description: '',
    type: 'BOOLEAN', is_active: true, default_value: false, validation_schema: {},
    created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z', rules: [],
    ...overrides,
  };
}

function makeRule(overrides: Partial<Rule> & { conditions?: Condition[] } = {}): Rule {
  return {
    id: 'rule-1', configuration_id: 'cfg-1', name: 'R', priority: 0, rollout_percentage: 100,
    conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'vip' }],
    return_value: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('SyncEvaluationClient', () => {
  let mockHttp: ReturnType<typeof setupMockAxios>;
  let client: SyncEvaluationClient;

  beforeEach(() => {
    vi.clearAllMocks();
    SyncEvaluationClient.resetInstance();
    mockHttp = setupMockAxios();
    client = SyncEvaluationClient.getInstance({ baseUrl: 'http://localhost:3001' });
  });

  // ── Singleton ──

  it('should return the same instance on repeated calls', () => {
    const a = SyncEvaluationClient.getInstance({ baseUrl: 'http://localhost:3001' });
    const b = SyncEvaluationClient.getInstance({ baseUrl: 'http://localhost:3001' });
    expect(a).toBe(b);
  });

  it('should return a new instance after resetInstance', () => {
    const a = SyncEvaluationClient.getInstance({ baseUrl: 'http://localhost:3001' });
    SyncEvaluationClient.resetInstance();
    mockHttp = setupMockAxios();
    const b = SyncEvaluationClient.getInstance({ baseUrl: 'http://localhost:3001' });
    expect(a).not.toBe(b);
  });

  // ── Sync ──

  it('should fetch configs and populate cache on sync', async () => {
    const configs = [makeConfig({ key: 'flag_a' }), makeConfig({ key: 'flag_b' })];
    mockHttp.get.mockResolvedValue({ data: { data: configs } });

    expect(client.isInitialized()).toBe(false);
    await client.sync('PROJ_A');
    expect(client.isInitialized()).toBe(true);
    expect(client.getCachedConfigs().size).toBe(2);
    expect(mockHttp.get).toHaveBeenCalledWith('/v1/admin/projects/PROJ_A/configs');
  });

  // ── Evaluation: synchronous contract ──

  it('evaluate should return synchronously (not a Promise)', async () => {
    mockHttp.get.mockResolvedValue({ data: { data: [makeConfig()] } });
    await client.sync('P');

    const result = client.evaluate({ filters: {}, keys: ['feature_x'] });
    // Must NOT be a Promise
    expect(result).not.toBeInstanceOf(Promise);
    expect(result['feature_x']).toBeDefined();
  });

  // ── Evaluation: Disabled ──

  it('should return DISABLED for inactive configs', async () => {
    mockHttp.get.mockResolvedValue({ data: { data: [makeConfig({ is_active: false })] } });
    await client.sync('P');

    const result = client.evaluate({ filters: {}, keys: ['feature_x'] });
    expect(result['feature_x']).toEqual({ value: null, rule_id: 'none', reason: 'DISABLED' });
  });

  // ── Evaluation: Fallback ──

  it('should return FALLBACK when no rules match', async () => {
    mockHttp.get.mockResolvedValue({
      data: { data: [makeConfig({ default_value: false, rules: [makeRule({ conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }] })] })] },
    });
    await client.sync('P');

    const result = client.evaluate({ filters: { tier: 'basic' }, keys: ['feature_x'] });
    expect(result['feature_x']).toEqual({ value: false, rule_id: 'default', reason: 'FALLBACK' });
  });

  it('should return FALLBACK for unknown keys', async () => {
    mockHttp.get.mockResolvedValue({ data: { data: [] } });
    await client.sync('P');

    const result = client.evaluate({ filters: {}, keys: ['unknown_key'] });
    expect(result['unknown_key']).toEqual({ value: null, rule_id: 'none', reason: 'FALLBACK' });
  });

  // ── Evaluation: Match ──

  it('should return MATCH when rule conditions are met', async () => {
    mockHttp.get.mockResolvedValue({ data: { data: [makeConfig({ rules: [makeRule()] })] } });
    await client.sync('P');

    const result = client.evaluate({ filters: { tier: 'VIP' }, keys: ['feature_x'] });
    expect(result['feature_x']).toEqual({ value: true, rule_id: 'rule-1', reason: 'MATCH' });
  });

  it('should stop at the first matching rule (waterfall)', async () => {
    mockHttp.get.mockResolvedValue({
      data: { data: [makeConfig({
        rules: [
          makeRule({ id: 'rule-1', priority: 0, conditions: [{ attribute: 'c', operator: 'EQUALS', value: 'x' }], return_value: 'first' }),
          makeRule({ id: 'rule-2', priority: 1, conditions: [{ attribute: 'c', operator: 'EQUALS', value: 'x' }], return_value: 'second' }),
        ],
      })] },
    });
    await client.sync('P');

    const result = client.evaluate({ filters: { c: 'x' }, keys: ['feature_x'] });
    expect(result['feature_x'].rule_id).toBe('rule-1');
  });

  // ── Operators ──

  it.each([
    ['NOT_EQUALS', { attribute: 'env', operator: 'NOT_EQUALS', value: 'prod' }, { env: 'staging' }, 'MATCH'],
    ['IN', { attribute: 'country', operator: 'IN', value: ['CO', 'MX'] }, { country: 'CO' }, 'MATCH'],
    ['NOT_IN', { attribute: 'country', operator: 'NOT_IN', value: ['US', 'UK'] }, { country: 'CO' }, 'MATCH'],
    ['CONTAINS', { attribute: 'email', operator: 'CONTAINS', value: '@vip.com' }, { email: 'user@vip.com' }, 'MATCH'],
    ['GREATER_THAN', { attribute: 'age', operator: 'GREATER_THAN', value: '18' }, { age: '25' }, 'MATCH'],
    ['LESS_THAN', { attribute: 'score', operator: 'LESS_THAN', value: '50' }, { score: '30' }, 'MATCH'],
    ['REGEX', { attribute: 'email', operator: 'REGEX', value: '^admin@' }, { email: 'admin@example.com' }, 'MATCH'],
  ] as const)('should handle %s operator', async (_, condition, filters, expectedReason) => {
    mockHttp.get.mockResolvedValue({
      data: { data: [makeConfig({ rules: [makeRule({ conditions: [condition as Condition] })] })] },
    });
    await client.sync('P');

    const result = client.evaluate({ filters, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe(expectedReason);
  });

  it('should return FALLBACK for invalid REGEX', async () => {
    mockHttp.get.mockResolvedValue({
      data: { data: [makeConfig({ rules: [makeRule({ conditions: [{ attribute: 'x', operator: 'REGEX', value: '[invalid(' }] })] })] },
    });
    await client.sync('P');

    const result = client.evaluate({ filters: { x: 'anything' }, keys: ['feature_x'] });
    expect(result['feature_x'].reason).toBe('FALLBACK');
  });

  // ── Rollout ──

  describe('rollout percentage', () => {
    it('should always match at 100%', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [makeConfig({ rules: [makeRule({ rollout_percentage: 100 })] })] } });
      await client.sync('P');

      const result = client.evaluate({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-123' });
      expect(result['feature_x'].reason).toBe('MATCH');
    });

    it('should always fallback at 0%', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [makeConfig({ rules: [makeRule({ rollout_percentage: 0 })] })] } });
      await client.sync('P');

      const result = client.evaluate({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-123' });
      expect(result['feature_x'].reason).toBe('FALLBACK');
    });

    it('should be deterministic for same identifier', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [makeConfig({ rules: [makeRule({ rollout_percentage: 50 })] })] } });
      await client.sync('P');

      const r1 = client.evaluate({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-abc' });
      const r2 = client.evaluate({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-abc' });
      expect(r1['feature_x'].reason).toBe(r2['feature_x'].reason);
    });

    it('should produce different outcomes for different identifiers', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [makeConfig({ rules: [makeRule({ rollout_percentage: 50 })] })] } });
      await client.sync('P');

      const reasons = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const r = client.evaluate({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: `user-${i}` });
        reasons.add(r['feature_x'].reason);
      }
      expect(reasons.has('MATCH')).toBe(true);
      expect(reasons.has('FALLBACK')).toBe(true);
    });

    it('should skip to next rule when excluded by rollout', async () => {
      mockHttp.get.mockResolvedValue({
        data: { data: [makeConfig({
          rules: [
            makeRule({ id: 'rule-1', priority: 0, rollout_percentage: 0, return_value: 'first' }),
            makeRule({ id: 'rule-2', priority: 1, rollout_percentage: 100, return_value: 'second' }),
          ],
        })] },
      });
      await client.sync('P');

      const result = client.evaluate({ filters: { tier: 'VIP' }, keys: ['feature_x'], identifier: 'user-1' });
      expect(result['feature_x'].rule_id).toBe('rule-2');
    });

    it('should prefer filters.identifier over top-level identifier', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [makeConfig({ rules: [makeRule({ rollout_percentage: 50 })] })] } });
      await client.sync('P');

      const rFilters = client.evaluate({ filters: { tier: 'VIP', identifier: 'filters-user' }, keys: ['feature_x'], identifier: 'top-level-user' });
      const rDirect = client.evaluate({ filters: { tier: 'VIP', identifier: 'filters-user' }, keys: ['feature_x'] });
      expect(rFilters['feature_x'].reason).toBe(rDirect['feature_x'].reason);
    });

    it('computeRolloutHash should return 0-99', () => {
      for (let i = 0; i < 200; i++) {
        const hash = client.computeRolloutHash(`user-${i}`, `rule-${i}`);
        expect(hash).toBeGreaterThanOrEqual(0);
        expect(hash).toBeLessThan(100);
      }
    });
  });

  // ── Multi-condition (AND) ──

  it('should require ALL conditions to match', async () => {
    mockHttp.get.mockResolvedValue({
      data: { data: [makeConfig({
        rules: [makeRule({
          conditions: [
            { attribute: 'country', operator: 'EQUALS', value: 'CO' },
            { attribute: 'tier', operator: 'EQUALS', value: 'VIP' },
          ],
        })],
      })] },
    });
    await client.sync('P');

    expect(client.evaluate({ filters: { country: 'CO', tier: 'basic' }, keys: ['feature_x'] })['feature_x'].reason).toBe('FALLBACK');
    expect(client.evaluate({ filters: { country: 'CO', tier: 'VIP' }, keys: ['feature_x'] })['feature_x'].reason).toBe('MATCH');
  });

  // ── Multiple configs ──

  it('should evaluate multiple configs independently', async () => {
    mockHttp.get.mockResolvedValue({
      data: { data: [
        makeConfig({ key: 'flag_a', is_active: false }),
        makeConfig({ key: 'flag_b', default_value: 42, rules: [] }),
      ] },
    });
    await client.sync('P');

    const result = client.evaluate({ filters: {}, keys: ['flag_a', 'flag_b'] });
    expect(result['flag_a'].reason).toBe('DISABLED');
    expect(result['flag_b'].value).toBe(42);
  });

  // ── SECRET type ──

  it('should cache and evaluate a SECRET config like any other type', async () => {
    mockHttp.get.mockResolvedValue({
      data: { data: [makeConfig({
        key: 'db_password',
        type: 'SECRET',
        default_value: 'plaintext-secret',
        rules: [makeRule({ return_value: 'secret-for-vip' })],
      })] },
    });
    await client.sync('P');

    const result = client.evaluate({ filters: { tier: 'VIP' }, keys: ['db_password'] });
    expect(result['db_password'].reason).toBe('MATCH');
    expect(result['db_password'].value).toBe('secret-for-vip');
  });

  it('should return SECRET default_value on FALLBACK', async () => {
    mockHttp.get.mockResolvedValue({
      data: { data: [makeConfig({
        key: 'api_token',
        type: 'SECRET',
        default_value: 'default-secret-token',
        rules: [],
      })] },
    });
    await client.sync('P');

    const result = client.evaluate({ filters: {}, keys: ['api_token'] });
    expect(result['api_token'].reason).toBe('FALLBACK');
    expect(result['api_token'].value).toBe('default-secret-token');
  });
});
