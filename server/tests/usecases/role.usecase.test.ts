import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateRoleUseCase } from '../../src/usecases/createRole.usecase';
import { GetRoleUseCase, ListRolesUseCase } from '../../src/usecases/getRole.usecase';
import { UpdateRoleUseCase } from '../../src/usecases/updateRole.usecase';
import { DeleteRoleUseCase } from '../../src/usecases/deleteRole.usecase';
import { IRoleRepository } from '../../src/repository/role/interfaces';
import { ConflictError, NotFoundError } from '../../src/errors';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_ROLE = { id: 'role-1', name: 'admin', permissions: ['read'], created_at: NOW, updated_at: NOW };

function createMockRepo(): IRoleRepository {
  return { create: vi.fn(), findById: vi.fn(), findByName: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn() };
}

describe('CreateRoleUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>; let uc: CreateRoleUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new CreateRoleUseCase(repo); });

  it('should create when name is unique', async () => {
    (repo.findByName as any).mockResolvedValue(null);
    (repo.create as any).mockResolvedValue(MOCK_ROLE);
    expect((await uc.execute({ name: 'admin' })).id).toBe('role-1');
  });

  it('should throw ConflictError on duplicate name', async () => {
    (repo.findByName as any).mockResolvedValue(MOCK_ROLE);
    await expect(uc.execute({ name: 'admin' })).rejects.toThrow(ConflictError);
  });
});

describe('GetRoleUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>; let uc: GetRoleUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new GetRoleUseCase(repo); });

  it('should return role when found', async () => {
    (repo.findById as any).mockResolvedValue(MOCK_ROLE);
    expect((await uc.execute('role-1')).name).toBe('admin');
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findById as any).mockResolvedValue(null);
    await expect(uc.execute('nope')).rejects.toThrow(NotFoundError);
  });
});

describe('ListRolesUseCase', () => {
  it('should return all roles', async () => {
    const repo = createMockRepo();
    (repo.findAll as any).mockResolvedValue([MOCK_ROLE]);
    expect(await new ListRolesUseCase(repo).execute()).toHaveLength(1);
  });
});

describe('UpdateRoleUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>; let uc: UpdateRoleUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new UpdateRoleUseCase(repo); });

  it('should update when exists', async () => {
    (repo.findById as any).mockResolvedValue(MOCK_ROLE);
    (repo.update as any).mockResolvedValue({ ...MOCK_ROLE, name: 'editor' });
    expect((await uc.execute('role-1', { name: 'editor' })).name).toBe('editor');
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findById as any).mockResolvedValue(null);
    await expect(uc.execute('nope', { name: 'x' })).rejects.toThrow(NotFoundError);
  });
});

describe('DeleteRoleUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>; let uc: DeleteRoleUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new DeleteRoleUseCase(repo); });

  it('should delete when exists', async () => {
    (repo.findById as any).mockResolvedValue(MOCK_ROLE);
    (repo.delete as any).mockResolvedValue(undefined);
    await uc.execute('role-1');
    expect(repo.delete).toHaveBeenCalledWith('role-1');
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findById as any).mockResolvedValue(null);
    await expect(uc.execute('nope')).rejects.toThrow(NotFoundError);
  });
});
