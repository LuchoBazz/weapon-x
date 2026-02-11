import { IRoleRepository } from '../repository/role/interfaces';
import { RoleEntity, UpdateRoleDTO } from '../types';
import { NotFoundError } from '../errors';

export class UpdateRoleUseCase {
  constructor(private roleRepo: IRoleRepository) {}

  async execute(id: string, data: UpdateRoleDTO): Promise<RoleEntity> {
    const existing = await this.roleRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Role with id "${id}" not found.`);
    }
    return this.roleRepo.update(id, data);
  }
}
