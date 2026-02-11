import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateAuthenticationUseCase } from '../../src/usecases/createAuthentication.usecase';
import { GetAuthenticationUseCase, ListAuthenticationsByProjectUseCase } from '../../src/usecases/getAuthentication.usecase';
import { UpdateAuthenticationUseCase } from '../../src/usecases/updateAuthentication.usecase';
import { DeleteAuthenticationUseCase } from '../../src/usecases/deleteAuthentication.usecase';
import { IAuthenticationRepository } from '../../src/repository/authentication/interfaces';
import { ConflictError, NotFoundError } from '../../src/errors';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_AUTH = {
  id: 'auth-1', project_reference: 'PROJ_A', role_id: 'role-1', secret_key: 'sk_123',
  email: 'test@example.com', description: '', is_active: true, expiration_date: null,
  created_at: NOW, updated_at: NOW, removed_at: null,
};

function createMockRepo(): IAuthenticationRepository {
  return {
    create: vi.fn(), findById: vi.fn(), findBySecretKey: vi.fn(),
    findAllByProject: vi.fn(), update: vi.fn(), softDelete: vi.fn(),
  };
}

describe('CreateAuthenticationUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>;
  let uc: CreateAuthenticationUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new CreateAuthenticationUseCase(repo); });

  it('should create when secret key is unique', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(null);
    (repo.create as any).mockResolvedValue(MOCK_AUTH);
    const result = await uc.execute({ project_reference: 'PROJ_A', role_id: 'role-1', secret_key: 'sk_123', email: 'test@example.com' });
    expect(result.id).toBe('auth-1');
  });

  it('should throw ConflictError on duplicate secret key', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(MOCK_AUTH);
    await expect(uc.execute({ project_reference: 'P', role_id: 'r', secret_key: 'sk_123', email: 'dup@example.com' })).rejects.toThrow(ConflictError);
  });
});

describe('GetAuthenticationUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>;
  let uc: GetAuthenticationUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new GetAuthenticationUseCase(repo); });

  it('should return entity when found', async () => {
    (repo.findById as any).mockResolvedValue(MOCK_AUTH);
    expect((await uc.execute('auth-1')).id).toBe('auth-1');
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findById as any).mockResolvedValue(null);
    await expect(uc.execute('nope')).rejects.toThrow(NotFoundError);
  });
});

describe('ListAuthenticationsByProjectUseCase', () => {
  it('should return all auths for a project', async () => {
    const repo = createMockRepo();
    (repo.findAllByProject as any).mockResolvedValue([MOCK_AUTH]);
    const uc = new ListAuthenticationsByProjectUseCase(repo);
    const result = await uc.execute('PROJ_A');
    expect(result).toHaveLength(1);
  });
});

describe('UpdateAuthenticationUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>;
  let uc: UpdateAuthenticationUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new UpdateAuthenticationUseCase(repo); });

  it('should update when record exists', async () => {
    (repo.findById as any).mockResolvedValue(MOCK_AUTH);
    (repo.update as any).mockResolvedValue({ ...MOCK_AUTH, is_active: false });
    const result = await uc.execute('auth-1', { is_active: false });
    expect(result.is_active).toBe(false);
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findById as any).mockResolvedValue(null);
    await expect(uc.execute('nope', { is_active: false })).rejects.toThrow(NotFoundError);
  });
});

describe('DeleteAuthenticationUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>;
  let uc: DeleteAuthenticationUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new DeleteAuthenticationUseCase(repo); });

  it('should soft-delete when record exists', async () => {
    (repo.findById as any).mockResolvedValue(MOCK_AUTH);
    (repo.softDelete as any).mockResolvedValue(undefined);
    await uc.execute('auth-1');
    expect(repo.softDelete).toHaveBeenCalledWith('auth-1');
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findById as any).mockResolvedValue(null);
    await expect(uc.execute('nope')).rejects.toThrow(NotFoundError);
  });
});
