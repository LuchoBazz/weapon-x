import type { ProjectEntity, CreateProjectDTO, UpdateProjectDTO } from '../../types';

export interface IProjectRepository {
  create(data: CreateProjectDTO): Promise<ProjectEntity>;
  findByReference(reference: string): Promise<ProjectEntity | null>;
  findByReferenceWithRelations(reference: string): Promise<ProjectEntity | null>;
  findAll(): Promise<ProjectEntity[]>;
  update(reference: string, data: UpdateProjectDTO): Promise<ProjectEntity>;
  delete(reference: string): Promise<void>;
}
