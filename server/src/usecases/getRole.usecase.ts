import type { IRoleRepository } from '../repository/role/interfaces';
import type { RoleEntity } from '../types';
import { NotFoundError } from '../errors';

export class GetRoleUseCase {
  constructor(private roleRepo: IRoleRepository) {}

  async execute(id: string): Promise<RoleEntity> {
    const role = await this.roleRepo.findById(id);
    if (!role) {
      throw new NotFoundError(`Role with id "${id}" not found.`);
    }
    return role;
  }
}

export class ListRolesUseCase {
  constructor(private roleRepo: IRoleRepository) {}

  async execute(): Promise<RoleEntity[]> {
    return this.roleRepo.findAll();
  }
}
