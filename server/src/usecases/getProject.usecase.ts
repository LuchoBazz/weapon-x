import type { IProjectRepository } from '../repository/project/interfaces';
import type { ProjectEntity } from '../types';
import { NotFoundError } from '../errors';

export class GetProjectUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(reference: string): Promise<ProjectEntity> {
    const project = await this.projectRepo.findByReferenceWithRelations(reference);
    if (!project) {
      throw new NotFoundError(`Project with reference "${reference}" not found.`);
    }
    return project;
  }
}

export class ListProjectsUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(): Promise<ProjectEntity[]> {
    return this.projectRepo.findAll();
  }
}
