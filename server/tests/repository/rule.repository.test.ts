import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaRuleRepository } from '../../src/repository/rule/prisma/rule.repository';
import { CreateRuleDTO } from '../../src/types';

// ── Mock Prisma Client ──

function createMockPrisma() {
  return {
    rule: {
      aggregate: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  } as any;
}

const NOW = new Date('2025-01-01T00:00:00Z');

const MOCK_RULE_RECORD = {
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

describe('PrismaRuleRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaRuleRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaRuleRepository(prisma);
  });

  // ── create ──

  describe('create', () => {
    const dto: CreateRuleDTO = {
      project_reference: 'PROJ_A',
      name: 'VIP rule',
      return_value: true,
      conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }],
    };

    it('should auto-assign priority as max + 1', async () => {
      prisma.rule.aggregate.mockResolvedValue({ _max: { priority: 2 } });
      prisma.rule.create.mockResolvedValue({ ...MOCK_RULE_RECORD, priority: 3 });

      const result = await repo.create('cfg-1', dto);

      expect(prisma.rule.aggregate).toHaveBeenCalledWith({
        where: { configuration_id: 'cfg-1' },
        _max: { priority: true },
      });
      expect(prisma.rule.create).toHaveBeenCalledWith({
        data: {
          configuration_id: 'cfg-1',
          name: 'VIP rule',
          conditions: dto.conditions,
          return_value: true,
          priority: 3,
          rollout_percentage: 100,
        },
      });
      expect(result.priority).toBe(3);
    });

    it('should default priority to 0 when no existing rules (max is null)', async () => {
      prisma.rule.aggregate.mockResolvedValue({ _max: { priority: null } });
      prisma.rule.create.mockResolvedValue({ ...MOCK_RULE_RECORD, priority: 0 });

      await repo.create('cfg-1', dto);

      expect(prisma.rule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: 0, rollout_percentage: 100 }),
        })
      );
    });

    it('should return a properly mapped RuleEntity', async () => {
      prisma.rule.aggregate.mockResolvedValue({ _max: { priority: null } });
      prisma.rule.create.mockResolvedValue(MOCK_RULE_RECORD);

      const result = await repo.create('cfg-1', dto);

      expect(result).toEqual({
        id: 'rule-1',
        configuration_id: 'cfg-1',
        name: 'VIP rule',
        conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }],
        return_value: true,
        priority: 0,
        rollout_percentage: 100,
        created_at: NOW,
        updated_at: NOW,
      });
    });
  });

  // ── findByConfigurationId ──

  describe('findByConfigurationId', () => {
    it('should query by configuration_id ordered by priority asc', async () => {
      const rule2 = { ...MOCK_RULE_RECORD, id: 'rule-2', priority: 1 };
      prisma.rule.findMany.mockResolvedValue([MOCK_RULE_RECORD, rule2]);

      const result = await repo.findByConfigurationId('cfg-1');

      expect(prisma.rule.findMany).toHaveBeenCalledWith({
        where: { configuration_id: 'cfg-1' },
        orderBy: { priority: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('rule-1');
      expect(result[1].id).toBe('rule-2');
    });

    it('should return empty array when no rules exist', async () => {
      prisma.rule.findMany.mockResolvedValue([]);

      const result = await repo.findByConfigurationId('cfg-no-rules');
      expect(result).toEqual([]);
    });
  });

  // ── delete ──

  describe('delete', () => {
    it('should call prisma.rule.delete with the id', async () => {
      prisma.rule.delete.mockResolvedValue(MOCK_RULE_RECORD);

      await repo.delete('rule-1');

      expect(prisma.rule.delete).toHaveBeenCalledWith({ where: { id: 'rule-1' } });
    });
  });
});
