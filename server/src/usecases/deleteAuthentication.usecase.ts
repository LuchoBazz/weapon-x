import { IAuthenticationRepository } from '../repository/authentication/interfaces';
import { NotFoundError } from '../errors';

export class DeleteAuthenticationUseCase {
  constructor(private authRepo: IAuthenticationRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.authRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Authentication record with id "${id}" not found.`);
    }
    await this.authRepo.softDelete(id);
  }
}
