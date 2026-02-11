import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaAuditLogRepository } from '../../src/repository/audit/prisma/audit.repository';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_LOG = {
  id: 'log-1', project_reference: 'PROJ_A', authentication_id: 'auth-1',
  action: 'CREATE', entity_type: 'CONFIGURATION', entity_id: 'cfg-1',
  actor_email: 'admin@example.com', previous_value: {}, new_value: { key: 'flag' },
  metadata: {}, created_at: NOW,
};

function createMockPrisma() {
  return {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  } as any;
}

describe('PrismaAuditLogRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaAuditLogRepository;

  beforeEach(() => { prisma = createMockPrisma(); repo = new PrismaAuditLogRepository(prisma); });

  it('create should persist and return entity', async () => {
    prisma.auditLog.create.mockResolvedValue(MOCK_LOG);
    const result = await repo.create({
      project_reference: 'PROJ_A', authentication_id: 'auth-1',
      action: 'CREATE', entity_type: 'CONFIGURATION', entity_id: 'cfg-1',
      actor_email: 'admin@example.com', new_value: { key: 'flag' },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: 'CREATE', entity_type: 'CONFIGURATION' }),
    }));
    expect(result.id).toBe('log-1');
    expect(result.actor_email).toBe('admin@example.com');
  });

  it('findByEntity should filter by entity_type and entity_id', async () => {
    prisma.auditLog.findMany.mockResolvedValue([MOCK_LOG]);
    const result = await repo.findByEntity('CONFIGURATION', 'cfg-1');
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { entity_type: 'CONFIGURATION', entity_id: 'cfg-1' },
    }));
    expect(result).toHaveLength(1);
  });

  it('findByProject should filter by project_reference', async () => {
    prisma.auditLog.findMany.mockResolvedValue([MOCK_LOG]);
    const result = await repo.findByProject('PROJ_A');
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { project_reference: 'PROJ_A' },
    }));
    expect(result).toHaveLength(1);
  });
});
