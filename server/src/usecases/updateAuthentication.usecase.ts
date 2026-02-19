import type { IAuthenticationRepository } from '../repository/authentication/interfaces';
import type { AuthenticationEntity, UpdateAuthenticationDTO } from '../types';
import { NotFoundError } from '../errors';

export class UpdateAuthenticationUseCase {
  constructor(private authRepo: IAuthenticationRepository) {}

  async execute(id: string, data: UpdateAuthenticationDTO): Promise<AuthenticationEntity> {
    const existing = await this.authRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Authentication record with id "${id}" not found.`);
    }
    return this.authRepo.update(id, data);
  }
}
