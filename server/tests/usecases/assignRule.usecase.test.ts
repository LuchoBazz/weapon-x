import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignRuleUseCase } from '../../src/usecases/assignRule.usecase';
import { IConfigRepository } from '../../src/repository/config/interfaces';
import { IRuleRepository } from '../../src/repository/rule/interfaces';
import { NotFoundError, ValidationError } from '../../src/errors';
import { ConfigEntity, RuleEntity, CreateRuleDTO } from '../../src/types';

const NOW = new Date('2025-01-01T00:00:00Z');

const MOCK_CONFIG: ConfigEntity = {
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
};

const JSON_CONFIG: ConfigEntity = {
  ...MOCK_CONFIG,
  id: 'cfg-2',
  key: 'theme_config',
  type: 'JSON',
  default_value: { color: 'blue', size: 10 },
  validation_schema: {
    type: 'object',
    properties: {
      color: { type: 'string' },
      size: { type: 'number', minimum: 1 },
    },
    required: ['color', 'size'],
    additionalProperties: false,
  },
};

const JSON_CONFIG_NO_SCHEMA: ConfigEntity = {
  ...MOCK_CONFIG,
  id: 'cfg-3',
  key: 'loose_json',
  type: 'JSON',
  default_value: {},
  validation_schema: {},
};

const MOCK_RULE_DTO: CreateRuleDTO = {
  project_reference: 'PROJ_A',
  name: 'VIP rule',
  return_value: true,
  conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }],
};

const MOCK_RULE_ENTITY: RuleEntity = {
  id: 'rule-1',
  configuration_id: 'cfg-1',
  name: 'VIP rule',
  conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }],
  return_value: true,
  priority: 0,
  rollout_percentage: 100,
  created_at: NOW,
  updated_at: NOW,
};

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

function createMockRuleRepo(): IRuleRepository {
  return {
    create: vi.fn(),
    findByConfigurationId: vi.fn(),
    delete: vi.fn(),
  };
}

describe('AssignRuleUseCase', () => {
  let configRepo: ReturnType<typeof createMockConfigRepo>;
  let ruleRepo: ReturnType<typeof createMockRuleRepo>;
  let useCase: AssignRuleUseCase;

  beforeEach(() => {
    configRepo = createMockConfigRepo();
    ruleRepo = createMockRuleRepo();
    useCase = new AssignRuleUseCase(configRepo, ruleRepo);
  });

  it('should assign a rule when config exists', async () => {
    (configRepo.findByKey as any).mockResolvedValue(MOCK_CONFIG);
    (ruleRepo.create as any).mockResolvedValue(MOCK_RULE_ENTITY);

    const result = await useCase.execute('feature_x', MOCK_RULE_DTO);

    expect(configRepo.findByKey).toHaveBeenCalledWith('feature_x', 'PROJ_A');
    expect(ruleRepo.create).toHaveBeenCalledWith('cfg-1', MOCK_RULE_DTO);
    expect(result.id).toBe('rule-1');
  });

  it('should throw NotFoundError when config does not exist', async () => {
    (configRepo.findByKey as any).mockResolvedValue(null);

    await expect(useCase.execute('feature_x', MOCK_RULE_DTO)).rejects.toThrow(NotFoundError);
    expect(ruleRepo.create).not.toHaveBeenCalled();
  });

  it('should include key and project in NotFoundError message', async () => {
    (configRepo.findByKey as any).mockResolvedValue(null);

    await expect(useCase.execute('feature_x', MOCK_RULE_DTO)).rejects.toThrow(/feature_x/);
    await expect(useCase.execute('feature_x', MOCK_RULE_DTO)).rejects.toThrow(/PROJ_A/);
  });

  it('should propagate repository errors from configRepo', async () => {
    (configRepo.findByKey as any).mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute('feature_x', MOCK_RULE_DTO)).rejects.toThrow('DB error');
    expect(ruleRepo.create).not.toHaveBeenCalled();
  });

  it('should propagate repository errors from ruleRepo', async () => {
    (configRepo.findByKey as any).mockResolvedValue(MOCK_CONFIG);
    (ruleRepo.create as any).mockRejectedValue(new Error('Insert failed'));

    await expect(useCase.execute('feature_x', MOCK_RULE_DTO)).rejects.toThrow('Insert failed');
  });

  // ── JSON schema validation ──

  it('should allow a valid return_value for a JSON config with schema', async () => {
    (configRepo.findByKey as any).mockResolvedValue(JSON_CONFIG);
    (ruleRepo.create as any).mockResolvedValue({ ...MOCK_RULE_ENTITY, return_value: { color: 'red', size: 5 } });

    const dto = { ...MOCK_RULE_DTO, return_value: { color: 'red', size: 5 } };
    const result = await useCase.execute('theme_config', dto);

    expect(ruleRepo.create).toHaveBeenCalled();
    expect(result.return_value).toEqual({ color: 'red', size: 5 });
  });

  it('should throw ValidationError when return_value violates the schema', async () => {
    (configRepo.findByKey as any).mockResolvedValue(JSON_CONFIG);

    const dto = { ...MOCK_RULE_DTO, return_value: { color: 123, size: 'big' } };

    await expect(useCase.execute('theme_config', dto)).rejects.toThrow(ValidationError);
    expect(ruleRepo.create).not.toHaveBeenCalled();
  });

  it('should include error details when schema validation fails', async () => {
    (configRepo.findByKey as any).mockResolvedValue(JSON_CONFIG);

    const dto = { ...MOCK_RULE_DTO, return_value: { color: 'red' } }; // missing required "size"

    try {
      await useCase.execute('theme_config', dto);
      expect.unreachable('Should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.details.length).toBeGreaterThan(0);
    }
  });

  it('should skip validation for BOOLEAN configs', async () => {
    (configRepo.findByKey as any).mockResolvedValue(MOCK_CONFIG);
    (ruleRepo.create as any).mockResolvedValue(MOCK_RULE_ENTITY);

    await useCase.execute('feature_x', MOCK_RULE_DTO);
    expect(ruleRepo.create).toHaveBeenCalled();
  });

  it('should skip validation for JSON configs with no schema', async () => {
    (configRepo.findByKey as any).mockResolvedValue(JSON_CONFIG_NO_SCHEMA);
    (ruleRepo.create as any).mockResolvedValue(MOCK_RULE_ENTITY);

    const dto = { ...MOCK_RULE_DTO, return_value: { anything: true } };
    await useCase.execute('loose_json', dto);
    expect(ruleRepo.create).toHaveBeenCalled();
  });

  it('should reject additional properties when schema disallows them', async () => {
    (configRepo.findByKey as any).mockResolvedValue(JSON_CONFIG);

    const dto = { ...MOCK_RULE_DTO, return_value: { color: 'red', size: 5, extra: true } };

    await expect(useCase.execute('theme_config', dto)).rejects.toThrow(ValidationError);
    expect(ruleRepo.create).not.toHaveBeenCalled();
  });
});
