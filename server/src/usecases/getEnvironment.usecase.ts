import type { IEnvironmentRepository } from '../repository/environment/interfaces';
import type { EnvironmentEntity } from '../types';
import { NotFoundError } from '../errors';

export class GetEnvironmentUseCase {
  constructor(private repo: IEnvironmentRepository) {}

  async execute(id: string): Promise<EnvironmentEntity> {
    const env = await this.repo.findById(id);
    if (!env) {
      throw new NotFoundError(`Environment with id "${id}" not found.`);
    }
    return env;
  }
}

export class ListEnvironmentsUseCase {
  constructor(private repo: IEnvironmentRepository) {}

  async execute(): Promise<EnvironmentEntity[]> {
    return this.repo.findAll();
  }
}
