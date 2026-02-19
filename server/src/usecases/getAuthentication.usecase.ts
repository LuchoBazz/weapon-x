import type { IAuthenticationRepository } from '../repository/authentication/interfaces';
import type { AuthenticationEntity } from '../types';
import { NotFoundError } from '../errors';

export class GetAuthenticationUseCase {
  constructor(private authRepo: IAuthenticationRepository) {}

  async execute(id: string): Promise<AuthenticationEntity> {
    const auth = await this.authRepo.findById(id);
    if (!auth) {
      throw new NotFoundError(`Authentication record with id "${id}" not found.`);
    }
    return auth;
  }
}

export class ListAuthenticationsByProjectUseCase {
  constructor(private authRepo: IAuthenticationRepository) {}

  async execute(projectReference: string): Promise<AuthenticationEntity[]> {
    return this.authRepo.findAllByProject(projectReference);
  }
}
