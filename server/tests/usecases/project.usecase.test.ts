import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateProjectUseCase } from '../../src/usecases/createProject.usecase';
import { GetProjectUseCase, ListProjectsUseCase } from '../../src/usecases/getProject.usecase';
import { UpdateProjectUseCase } from '../../src/usecases/updateProject.usecase';
import { DeleteProjectUseCase } from '../../src/usecases/deleteProject.usecase';
import { IProjectRepository } from '../../src/repository/project/interfaces';
import { ConflictError, NotFoundError } from '../../src/errors';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK = { reference: 'PROJ_A', name: 'Alpha', created_at: NOW, updated_at: NOW };

function createMockRepo(): IProjectRepository {
  return { create: vi.fn(), findByReference: vi.fn(), findByReferenceWithRelations: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn() };
}

describe('CreateProjectUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>; let uc: CreateProjectUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new CreateProjectUseCase(repo); });

  it('should create when reference is unique', async () => {
    (repo.findByReference as any).mockResolvedValue(null);
    (repo.create as any).mockResolvedValue(MOCK);
    expect((await uc.execute({ reference: 'PROJ_A', name: 'Alpha' })).reference).toBe('PROJ_A');
  });

  it('should throw ConflictError on duplicate reference', async () => {
    (repo.findByReference as any).mockResolvedValue(MOCK);
    await expect(uc.execute({ reference: 'PROJ_A', name: 'Alpha' })).rejects.toThrow(ConflictError);
  });
});

describe('GetProjectUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>; let uc: GetProjectUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new GetProjectUseCase(repo); });

  it('should return project with relations when found', async () => {
    (repo.findByReferenceWithRelations as any).mockResolvedValue(MOCK);
    expect((await uc.execute('PROJ_A')).name).toBe('Alpha');
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findByReferenceWithRelations as any).mockResolvedValue(null);
    await expect(uc.execute('nope')).rejects.toThrow(NotFoundError);
  });
});

describe('ListProjectsUseCase', () => {
  it('should return all projects', async () => {
    const repo = createMockRepo();
    (repo.findAll as any).mockResolvedValue([MOCK]);
    expect(await new ListProjectsUseCase(repo).execute()).toHaveLength(1);
  });
});

describe('UpdateProjectUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>; let uc: UpdateProjectUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new UpdateProjectUseCase(repo); });

  it('should update when exists', async () => {
    (repo.findByReference as any).mockResolvedValue(MOCK);
    (repo.update as any).mockResolvedValue({ ...MOCK, name: 'Beta' });
    expect((await uc.execute('PROJ_A', { name: 'Beta' })).name).toBe('Beta');
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findByReference as any).mockResolvedValue(null);
    await expect(uc.execute('nope', { name: 'x' })).rejects.toThrow(NotFoundError);
  });
});

describe('DeleteProjectUseCase', () => {
  let repo: ReturnType<typeof createMockRepo>; let uc: DeleteProjectUseCase;
  beforeEach(() => { repo = createMockRepo(); uc = new DeleteProjectUseCase(repo); });

  it('should delete when exists', async () => {
    (repo.findByReference as any).mockResolvedValue(MOCK);
    (repo.delete as any).mockResolvedValue(undefined);
    await uc.execute('PROJ_A');
    expect(repo.delete).toHaveBeenCalledWith('PROJ_A');
  });

  it('should throw NotFoundError when missing', async () => {
    (repo.findByReference as any).mockResolvedValue(null);
    await expect(uc.execute('nope')).rejects.toThrow(NotFoundError);
  });
});
