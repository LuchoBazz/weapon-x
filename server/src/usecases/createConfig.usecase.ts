import { IConfigRepository } from '../repository/config/interfaces';
import { ConfigEntity, CreateConfigDTO } from '../types';
import { ConflictError } from '../errors';

export class CreateConfigUseCase {
  constructor(private configRepo: IConfigRepository) {}

  async execute(data: CreateConfigDTO): Promise<ConfigEntity> {
    const existing = await this.configRepo.findByKey(data.key, data.project_reference);
    if (existing) {
      throw new ConflictError(`Configuration with key "${data.key}" already exists for project "${data.project_reference}".`);
    }
    return this.configRepo.create(data);
  }
}
