import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaAuthenticationRepository } from '../../src/repository/authentication/prisma/authentication.repository';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_ROLE = { id: 'role-1', name: 'admin', permissions: ['read', 'write'], created_at: NOW, updated_at: NOW };
const MOCK_RECORD = {
  id: 'auth-1', project_reference: 'PROJ_A', role_id: 'role-1', secret_key: 'sk_123',
  email: 'test@example.com', description: 'Test key', is_active: true, expiration_date: null,
  created_at: NOW, updated_at: NOW, removed_at: null, role: MOCK_ROLE,
};

function createMockPrisma() {
  return {
    authentication: {
      create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(),
    },
  } as any;
}

describe('PrismaAuthenticationRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaAuthenticationRepository;

  beforeEach(() => { prisma = createMockPrisma(); repo = new PrismaAuthenticationRepository(prisma); });

  it('create should include role and return entity', async () => {
    prisma.authentication.create.mockResolvedValue(MOCK_RECORD);
    const result = await repo.create({ project_reference: 'PROJ_A', role_id: 'role-1', secret_key: 'sk_123', email: 'test@example.com' });
    expect(prisma.authentication.create).toHaveBeenCalledWith(expect.objectContaining({ include: { role: true } }));
    expect(result.role?.name).toBe('admin');
  });

  it('findById should filter out soft-deleted records', async () => {
    prisma.authentication.findFirst.mockResolvedValue(MOCK_RECORD);
    await repo.findById('auth-1');
    expect(prisma.authentication.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'auth-1', removed_at: null } }));
  });

  it('findById should return null when not found', async () => {
    prisma.authentication.findFirst.mockResolvedValue(null);
    expect(await repo.findById('nope')).toBeNull();
  });

  it('findBySecretKey should filter out soft-deleted', async () => {
    prisma.authentication.findFirst.mockResolvedValue(MOCK_RECORD);
    await repo.findBySecretKey('sk_123');
    expect(prisma.authentication.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { secret_key: 'sk_123', removed_at: null } }));
  });

  it('findAllByProject should order by created_at desc', async () => {
    prisma.authentication.findMany.mockResolvedValue([MOCK_RECORD]);
    const result = await repo.findAllByProject('PROJ_A');
    expect(prisma.authentication.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { created_at: 'desc' } }));
    expect(result).toHaveLength(1);
  });

  it('update should only include provided fields', async () => {
    prisma.authentication.update.mockResolvedValue({ ...MOCK_RECORD, is_active: false });
    await repo.update('auth-1', { is_active: false });
    expect(prisma.authentication.update).toHaveBeenCalledWith(expect.objectContaining({ data: { is_active: false } }));
  });

  it('softDelete should set removed_at and deactivate', async () => {
    prisma.authentication.update.mockResolvedValue(MOCK_RECORD);
    await repo.softDelete('auth-1');
    expect(prisma.authentication.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'auth-1' },
      data: expect.objectContaining({ is_active: false }),
    }));
  });
});
