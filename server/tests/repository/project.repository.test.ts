import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaProjectRepository } from '../../src/repository/project/prisma/project.repository';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_RECORD = { reference: 'PROJ_A', name: 'Project Alpha', created_at: NOW, updated_at: NOW };

function createMockPrisma() {
  return { project: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() } } as any;
}

describe('PrismaProjectRepository', () => {
  let prisma: ReturnType<typeof createMockPrisma>;
  let repo: PrismaProjectRepository;
  beforeEach(() => { prisma = createMockPrisma(); repo = new PrismaProjectRepository(prisma); });

  it('create should return entity', async () => {
    prisma.project.create.mockResolvedValue(MOCK_RECORD);
    const result = await repo.create({ reference: 'PROJ_A', name: 'Project Alpha' });
    expect(result.reference).toBe('PROJ_A');
  });

  it('findByReference should return entity or null', async () => {
    prisma.project.findUnique.mockResolvedValue(MOCK_RECORD);
    expect((await repo.findByReference('PROJ_A'))!.name).toBe('Project Alpha');
    prisma.project.findUnique.mockResolvedValue(null);
    expect(await repo.findByReference('nope')).toBeNull();
  });

  it('findByReferenceWithRelations should include configs and auths', async () => {
    prisma.project.findUnique.mockResolvedValue({ ...MOCK_RECORD, configurations: [], authentications: [] });
    const result = await repo.findByReferenceWithRelations('PROJ_A');
    expect(prisma.project.findUnique).toHaveBeenCalledWith(expect.objectContaining({ include: expect.any(Object) }));
    expect(result!.configurations).toEqual([]);
  });

  it('findAll should order by name asc', async () => {
    prisma.project.findMany.mockResolvedValue([MOCK_RECORD]);
    const result = await repo.findAll();
    expect(prisma.project.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(result).toHaveLength(1);
  });

  it('update should only include provided fields', async () => {
    prisma.project.update.mockResolvedValue({ ...MOCK_RECORD, name: 'New Name' });
    await repo.update('PROJ_A', { name: 'New Name' });
    expect(prisma.project.update).toHaveBeenCalledWith({ where: { reference: 'PROJ_A' }, data: { name: 'New Name' } });
  });

  it('delete should call prisma.project.delete', async () => {
    prisma.project.delete.mockResolvedValue(MOCK_RECORD);
    await repo.delete('PROJ_A');
    expect(prisma.project.delete).toHaveBeenCalledWith({ where: { reference: 'PROJ_A' } });
  });
});
