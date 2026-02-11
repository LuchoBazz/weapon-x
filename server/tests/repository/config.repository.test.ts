import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaConfigRepository } from '../../src/repository/config/prisma/config.repository';
import { CreateConfigDTO } from '../../src/types';

// ── Mock Prisma Client ──

function createMockPrisma() {
  return {
    configuration: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as any;
}

const NOW = new Date('2025-01-01T00:00:00Z');

const MOCK_DB_RECORD = {
  id: 'cfg-1',
  project_reference: 'PROJ_A',
  key: 'feature_x',
  description: 'A test flag',
  type: 'BOOLEAN',
  is_active: true,
  default_value: false,
  validation_schema: { type: 'boolean' },
  created_at: NOW,
  updated_at: NOW,
};

const MOCK_RULE_RECORD = {
  id: 'rule-1',
  configuration_id: 'cfg-1',
  name: 'VIP rule',
  conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }],
  return_value: true,
  priority: 0,
  created_at: NOW,
  updated_at: NOW,
};

describe('PrismaConfigRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaConfigRepository;

  beforeEach(() => {
    prisma = createMockPrisma();
    repo = new PrismaConfigRepository(prisma);
  });

  // ── create ──

  describe('create', () => {
    it('should call prisma.configuration.create with mapped data and return entity', async () => {
      prisma.configuration.create.mockResolvedValue(MOCK_DB_RECORD);

      const dto: CreateConfigDTO = {
        project_reference: 'PROJ_A',
        key: 'feature_x',
        description: 'A test flag',
        type: 'BOOLEAN',
        is_active: true,
        default_value: false,
        validation_schema: { type: 'boolean' },
      };

      const result = await repo.create(dto);

      expect(prisma.configuration.create).toHaveBeenCalledWith({
        data: {
          project_reference: 'PROJ_A',
          key: 'feature_x',
          description: 'A test flag',
          type: 'BOOLEAN',
          is_active: true,
          default_value: false,
          validation_schema: { type: 'boolean' },
        },
      });
      expect(result.id).toBe('cfg-1');
      expect(result.key).toBe('feature_x');
    });

    it('should default description to empty string when omitted', async () => {
      prisma.configuration.create.mockResolvedValue({ ...MOCK_DB_RECORD, description: '' });

      const dto: CreateConfigDTO = {
        project_reference: 'PROJ_A',
        key: 'feature_x',
        type: 'BOOLEAN',
        is_active: true,
        default_value: false,
      };

      await repo.create(dto);

      expect(prisma.configuration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ description: '' }),
        })
      );
    });

    it('should default validation_schema to empty object when omitted', async () => {
      prisma.configuration.create.mockResolvedValue(MOCK_DB_RECORD);

      const dto: CreateConfigDTO = {
        project_reference: 'PROJ_A',
        key: 'feature_x',
        type: 'BOOLEAN',
        is_active: true,
        default_value: false,
      };

      await repo.create(dto);

      expect(prisma.configuration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ validation_schema: {} }),
        })
      );
    });
  });

  // ── findByKey ──

  describe('findByKey', () => {
    it('should return entity when record exists', async () => {
      prisma.configuration.findFirst.mockResolvedValue(MOCK_DB_RECORD);

      const result = await repo.findByKey('feature_x', 'PROJ_A');

      expect(prisma.configuration.findFirst).toHaveBeenCalledWith({
        where: { key: 'feature_x', project_reference: 'PROJ_A' },
      });
      expect(result).not.toBeNull();
      expect(result!.key).toBe('feature_x');
    });

    it('should return null when record does not exist', async () => {
      prisma.configuration.findFirst.mockResolvedValue(null);

      const result = await repo.findByKey('nonexistent');
      expect(result).toBeNull();
    });

    it('should omit project_reference from where clause when not provided', async () => {
      prisma.configuration.findFirst.mockResolvedValue(MOCK_DB_RECORD);

      await repo.findByKey('feature_x');

      expect(prisma.configuration.findFirst).toHaveBeenCalledWith({
        where: { key: 'feature_x' },
      });
    });
  });

  // ── findAll ──

  describe('findAll', () => {
    it('should return all configs with no filters', async () => {
      prisma.configuration.findMany.mockResolvedValue([MOCK_DB_RECORD]);

      const result = await repo.findAll();

      expect(prisma.configuration.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { updated_at: 'desc' },
      });
      expect(result).toHaveLength(1);
    });

    it('should apply project_reference filter', async () => {
      prisma.configuration.findMany.mockResolvedValue([]);

      await repo.findAll({ project_reference: 'PROJ_A' });

      expect(prisma.configuration.findMany).toHaveBeenCalledWith({
        where: { project_reference: 'PROJ_A' },
        orderBy: { updated_at: 'desc' },
      });
    });

    it('should apply type filter', async () => {
      prisma.configuration.findMany.mockResolvedValue([]);

      await repo.findAll({ type: 'JSON' });

      expect(prisma.configuration.findMany).toHaveBeenCalledWith({
        where: { type: 'JSON' },
        orderBy: { updated_at: 'desc' },
      });
    });

    it('should apply both filters simultaneously', async () => {
      prisma.configuration.findMany.mockResolvedValue([]);

      await repo.findAll({ project_reference: 'PROJ_A', type: 'BOOLEAN' });

      expect(prisma.configuration.findMany).toHaveBeenCalledWith({
        where: { project_reference: 'PROJ_A', type: 'BOOLEAN' },
        orderBy: { updated_at: 'desc' },
      });
    });
  });

  // ── findByKeyWithRules ──

  describe('findByKeyWithRules', () => {
    it('should include rules ordered by priority', async () => {
      prisma.configuration.findFirst.mockResolvedValue({
        ...MOCK_DB_RECORD,
        rules: [MOCK_RULE_RECORD],
      });

      const result = await repo.findByKeyWithRules('feature_x', 'PROJ_A');

      expect(prisma.configuration.findFirst).toHaveBeenCalledWith({
        where: { key: 'feature_x', project_reference: 'PROJ_A' },
        include: { rules: { orderBy: { priority: 'asc' } } },
      });
      expect(result!.rules).toHaveLength(1);
      expect(result!.rules![0].name).toBe('VIP rule');
    });

    it('should return null when not found', async () => {
      prisma.configuration.findFirst.mockResolvedValue(null);

      const result = await repo.findByKeyWithRules('nope');
      expect(result).toBeNull();
    });
  });

  // ── findManyByKeysWithRules ──

  describe('findManyByKeysWithRules', () => {
    it('should query by key IN array and include rules', async () => {
      prisma.configuration.findMany.mockResolvedValue([
        { ...MOCK_DB_RECORD, rules: [MOCK_RULE_RECORD] },
      ]);

      const result = await repo.findManyByKeysWithRules(['feature_x']);

      expect(prisma.configuration.findMany).toHaveBeenCalledWith({
        where: { key: { in: ['feature_x'] } },
        include: { rules: { orderBy: { priority: 'asc' } } },
      });
      expect(result).toHaveLength(1);
      expect(result[0].rules).toHaveLength(1);
    });

    it('should return empty array for no matching keys', async () => {
      prisma.configuration.findMany.mockResolvedValue([]);

      const result = await repo.findManyByKeysWithRules(['nonexistent']);
      expect(result).toEqual([]);
    });
  });

  // ── update ──

  describe('update', () => {
    it('should only include provided fields in the update payload', async () => {
      prisma.configuration.update.mockResolvedValue({ ...MOCK_DB_RECORD, is_active: false });

      const result = await repo.update('cfg-1', { is_active: false });

      expect(prisma.configuration.update).toHaveBeenCalledWith({
        where: { id: 'cfg-1' },
        data: { is_active: false },
      });
      expect(result.is_active).toBe(false);
    });

    it('should handle updating multiple fields', async () => {
      prisma.configuration.findUnique.mockResolvedValue(MOCK_DB_RECORD);
      prisma.configuration.update.mockResolvedValue({
        ...MOCK_DB_RECORD,
        description: 'Updated',
        default_value: true,
      });

      await repo.update('cfg-1', { description: 'Updated', default_value: true });

      expect(prisma.configuration.update).toHaveBeenCalledWith({
        where: { id: 'cfg-1' },
        data: { description: 'Updated', default_value: true },
      });
    });

    it('should pass empty data object when no recognized fields provided', async () => {
      prisma.configuration.update.mockResolvedValue(MOCK_DB_RECORD);

      await repo.update('cfg-1', {});

      expect(prisma.configuration.update).toHaveBeenCalledWith({
        where: { id: 'cfg-1' },
        data: {},
      });
    });
  });

  // ── delete ──

  describe('delete', () => {
    it('should call prisma.configuration.delete with the id', async () => {
      prisma.configuration.delete.mockResolvedValue(MOCK_DB_RECORD);

      await repo.delete('cfg-1');

      expect(prisma.configuration.delete).toHaveBeenCalledWith({ where: { id: 'cfg-1' } });
    });
  });
});
