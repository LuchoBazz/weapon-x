import type { IProjectRepository } from '../repository/project/interfaces';
import type { ProjectEntity, UpdateProjectDTO } from '../types';
import { NotFoundError } from '../errors';

export class UpdateProjectUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(reference: string, data: UpdateProjectDTO): Promise<ProjectEntity> {
    const existing = await this.projectRepo.findByReference(reference);
    if (!existing) {
      throw new NotFoundError(`Project with reference "${reference}" not found.`);
    }
    return this.projectRepo.update(reference, data);
  }
}
