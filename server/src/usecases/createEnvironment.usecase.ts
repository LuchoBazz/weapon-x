import type { IEnvironmentRepository } from '../repository/environment/interfaces';
import type { EnvironmentEntity, CreateEnvironmentDTO } from '../types';
import { ConflictError } from '../errors';

export class CreateEnvironmentUseCase {
  constructor(private repo: IEnvironmentRepository) {}

  async execute(data: CreateEnvironmentDTO): Promise<EnvironmentEntity> {
    const existing = await this.repo.findById(data.id);
    if (existing) {
      throw new ConflictError(`Environment with id "${data.id}" already exists.`);
    }
    return this.repo.create(data);
  }
}
