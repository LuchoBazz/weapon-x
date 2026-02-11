import { IProjectRepository } from '../repository/project/interfaces';
import { ProjectEntity, CreateProjectDTO } from '../types';
import { ConflictError } from '../errors';

export class CreateProjectUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(data: CreateProjectDTO): Promise<ProjectEntity> {
    const existing = await this.projectRepo.findByReference(data.reference);
    if (existing) {
      throw new ConflictError(`Project with reference "${data.reference}" already exists.`);
    }
    return this.projectRepo.create(data);
  }
}
