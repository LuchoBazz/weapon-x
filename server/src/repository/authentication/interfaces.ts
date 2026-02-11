import { AuthenticationEntity, CreateAuthenticationDTO, UpdateAuthenticationDTO } from '../../types';

export interface IAuthenticationRepository {
  create(data: CreateAuthenticationDTO): Promise<AuthenticationEntity>;
  findById(id: string): Promise<AuthenticationEntity | null>;
  findBySecretKey(secretKey: string): Promise<AuthenticationEntity | null>;
  findAllByProject(projectReference: string): Promise<AuthenticationEntity[]>;
  update(id: string, data: UpdateAuthenticationDTO): Promise<AuthenticationEntity>;
  softDelete(id: string): Promise<void>;
}
