import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateConfigUseCase } from '../../src/usecases/createConfig.usecase';
import { IConfigRepository } from '../../src/repository/config/interfaces';
import { ConflictError } from '../../src/errors';
import { ConfigEntity, CreateConfigDTO } from '../../src/types';

const NOW = new Date('2025-01-01T00:00:00Z');

const MOCK_DTO: CreateConfigDTO = {
  project_reference: 'PROJ_A',
  key: 'feature_x',
  description: 'Test flag',
  type: 'BOOLEAN',
  is_active: true,
  default_value: false,
};

const MOCK_ENTITY: ConfigEntity = {
  id: 'cfg-1',
  project_reference: 'PROJ_A',
  key: 'feature_x',
  description: 'Test flag',
  type: 'BOOLEAN',
  is_active: true,
  default_value: false,
  validation_schema: {},
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

describe('CreateConfigUseCase', () => {
  let repo: ReturnType<typeof createMockConfigRepo>;
  let useCase: CreateConfigUseCase;

  beforeEach(() => {
    repo = createMockConfigRepo();
    useCase = new CreateConfigUseCase(repo);
  });

  it('should create a config when key does not exist', async () => {
    (repo.findByKey as any).mockResolvedValue(null);
    (repo.create as any).mockResolvedValue(MOCK_ENTITY);

    const result = await useCase.execute(MOCK_DTO);

    expect(repo.findByKey).toHaveBeenCalledWith('feature_x', 'PROJ_A');
    expect(repo.create).toHaveBeenCalledWith(MOCK_DTO);
    expect(result.id).toBe('cfg-1');
  });

  it('should throw ConflictError when key already exists', async () => {
    (repo.findByKey as any).mockResolvedValue(MOCK_ENTITY);

    await expect(useCase.execute(MOCK_DTO)).rejects.toThrow(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('should include key and project in ConflictError message', async () => {
    (repo.findByKey as any).mockResolvedValue(MOCK_ENTITY);

    await expect(useCase.execute(MOCK_DTO)).rejects.toThrow(/feature_x/);
    await expect(useCase.execute(MOCK_DTO)).rejects.toThrow(/PROJ_A/);
  });

  it('should propagate repository errors on create failure', async () => {
    (repo.findByKey as any).mockResolvedValue(null);
    (repo.create as any).mockRejectedValue(new Error('DB connection lost'));

    await expect(useCase.execute(MOCK_DTO)).rejects.toThrow('DB connection lost');
  });

  it('should propagate repository errors on findByKey failure', async () => {
    (repo.findByKey as any).mockRejectedValue(new Error('DB timeout'));

    await expect(useCase.execute(MOCK_DTO)).rejects.toThrow('DB timeout');
    expect(repo.create).not.toHaveBeenCalled();
  });
});
