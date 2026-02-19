import type { ConfigEntity, CreateConfigDTO } from '../../types';

export interface IConfigRepository {
  create(data: CreateConfigDTO): Promise<ConfigEntity>;
  findByKey(key: string, projectReference?: string): Promise<ConfigEntity | null>;
  findAll(filters?: { project_reference?: string; type?: string }): Promise<ConfigEntity[]>;
  findByKeyWithRules(key: string, projectReference?: string): Promise<ConfigEntity | null>;
  findManyByKeysWithRules(keys: string[]): Promise<ConfigEntity[]>;
  update(id: string, data: Partial<CreateConfigDTO>): Promise<ConfigEntity>;
  delete(id: string): Promise<void>;
}
