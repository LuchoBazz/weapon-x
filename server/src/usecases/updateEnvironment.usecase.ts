import type { IEnvironmentRepository } from '../repository/environment/interfaces';
import type { EnvironmentEntity, UpdateEnvironmentDTO } from '../types';
import { NotFoundError } from '../errors';

export class UpdateEnvironmentUseCase {
  constructor(private repo: IEnvironmentRepository) {}

  async execute(id: string, data: UpdateEnvironmentDTO): Promise<EnvironmentEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Environment with id "${id}" not found.`);
    }
    return this.repo.update(id, data);
  }
}
