import { IAuthenticationRepository } from '../repository/authentication/interfaces';
import { AuthenticationEntity, CreateAuthenticationDTO } from '../types';
import { ConflictError } from '../errors';

export class CreateAuthenticationUseCase {
  constructor(private authRepo: IAuthenticationRepository) {}

  async execute(data: CreateAuthenticationDTO): Promise<AuthenticationEntity> {
    const existing = await this.authRepo.findBySecretKey(data.secret_key);
    if (existing) {
      throw new ConflictError('An authentication record with this secret key already exists.');
    }
    return this.authRepo.create(data);
  }
}
