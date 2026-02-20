import type { IConfigRepository } from '../repository/config/interfaces';
import type { ConfigEntity, UpdateConfigDTO } from '../types';

export class UpdateConfigUseCase {
  constructor(private configRepo: IConfigRepository) {}

  async execute(id: string, data: UpdateConfigDTO): Promise<ConfigEntity> {
    return this.configRepo.update(id, data);
  }
}
