import type { IAuthenticationRepository } from '../repository/authentication/interfaces';

export interface IntrospectResult {
  active: boolean;
  exp?: number;
}

export class IntrospectAuthenticationUseCase {
  constructor(private authRepo: IAuthenticationRepository) {}

  async execute(token: string): Promise<IntrospectResult> {
    const auth = await this.authRepo.findBySecretKey(token);

    if (!auth || !auth.is_active) {
      return { active: false };
    }

    if (auth.expiration_date && new Date(auth.expiration_date) < new Date()) {
      return { active: false };
    }

    const exp = auth.expiration_date
      ? Math.floor(new Date(auth.expiration_date).getTime() / 1000)
      : undefined;

    return { active: true, ...(exp !== undefined && { exp }) };
  }
}
