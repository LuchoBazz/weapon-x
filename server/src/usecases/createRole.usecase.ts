import type { IRoleRepository } from '../repository/role/interfaces';
import type { RoleEntity, CreateRoleDTO } from '../types';
import { ConflictError } from '../errors';

export class CreateRoleUseCase {
  constructor(private roleRepo: IRoleRepository) {}

  async execute(data: CreateRoleDTO): Promise<RoleEntity> {
    const existing = await this.roleRepo.findByName(data.name);
    if (existing) {
      throw new ConflictError(`Role with name "${data.name}" already exists.`);
    }
    return this.roleRepo.create(data);
  }
}
