import type { IEnvironmentRepository } from '../repository/environment/interfaces';
import { NotFoundError } from '../errors';

export class DeleteEnvironmentUseCase {
  constructor(private repo: IEnvironmentRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Environment with id "${id}" not found.`);
    }
    await this.repo.delete(id);
  }
}
