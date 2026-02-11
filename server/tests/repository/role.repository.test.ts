import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaRoleRepository } from '../../src/repository/role/prisma/role.repository';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_RECORD = { id: 'role-1', name: 'admin', permissions: ['read', 'write'], created_at: NOW, updated_at: NOW, authentications: [] };

function createMockPrisma() {
  return { role: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() } } as any;
}

describe('PrismaRoleRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaRoleRepository;
  beforeEach(() => { prisma = createMockPrisma(); repo = new PrismaRoleRepository(prisma); });

  it('create should default permissions to empty array', async () => {
    prisma.role.create.mockResolvedValue(MOCK_RECORD);
    await repo.create({ name: 'admin' });
    expect(prisma.role.create).toHaveBeenCalledWith(expect.objectContaining({ data: { name: 'admin', permissions: [] } }));
  });

  it('findById should return entity or null', async () => {
    prisma.role.findUnique.mockResolvedValue(MOCK_RECORD);
    expect((await repo.findById('role-1'))!.name).toBe('admin');
    prisma.role.findUnique.mockResolvedValue(null);
    expect(await repo.findById('nope')).toBeNull();
  });

  it('findByName should query by unique name', async () => {
    prisma.role.findUnique.mockResolvedValue(MOCK_RECORD);
    await repo.findByName('admin');
    expect(prisma.role.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'admin' } }));
  });

  it('findAll should order by name asc', async () => {
    prisma.role.findMany.mockResolvedValue([MOCK_RECORD]);
    const result = await repo.findAll();
    expect(prisma.role.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { name: 'asc' } }));
    expect(result).toHaveLength(1);
  });

  it('update should only include provided fields', async () => {
    prisma.role.update.mockResolvedValue({ ...MOCK_RECORD, permissions: ['read'] });
    await repo.update('role-1', { permissions: ['read'] });
    expect(prisma.role.update).toHaveBeenCalledWith(expect.objectContaining({ data: { permissions: ['read'] } }));
  });

  it('delete should call prisma.role.delete', async () => {
    prisma.role.delete.mockResolvedValue(MOCK_RECORD);
    await repo.delete('role-1');
    expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 'role-1' } });
  });
});
