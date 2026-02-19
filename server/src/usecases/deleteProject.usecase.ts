import type { IProjectRepository } from '../repository/project/interfaces';
import { NotFoundError } from '../errors';

export class DeleteProjectUseCase {
  constructor(private projectRepo: IProjectRepository) {}

  async execute(reference: string): Promise<void> {
    const existing = await this.projectRepo.findByReference(reference);
    if (!existing) {
      throw new NotFoundError(`Project with reference "${reference}" not found.`);
    }
    await this.projectRepo.delete(reference);
  }
}
