import type { EnvironmentEntity, CreateEnvironmentDTO, UpdateEnvironmentDTO } from '../../types';

export interface IEnvironmentRepository {
  create(data: CreateEnvironmentDTO): Promise<EnvironmentEntity>;
  findById(id: string): Promise<EnvironmentEntity | null>;
  findAll(): Promise<EnvironmentEntity[]>;
  update(id: string, data: UpdateEnvironmentDTO): Promise<EnvironmentEntity>;
  delete(id: string): Promise<void>;
}
