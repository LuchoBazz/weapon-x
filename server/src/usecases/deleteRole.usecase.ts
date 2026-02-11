import { IRoleRepository } from '../repository/role/interfaces';
import { NotFoundError } from '../errors';

export class DeleteRoleUseCase {
  constructor(private roleRepo: IRoleRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.roleRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Role with id "${id}" not found.`);
    }
    await this.roleRepo.delete(id);
  }
}
