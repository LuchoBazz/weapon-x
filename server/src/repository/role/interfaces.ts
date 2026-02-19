import type { RoleEntity, CreateRoleDTO, UpdateRoleDTO } from '../../types';

export interface IRoleRepository {
  create(data: CreateRoleDTO): Promise<RoleEntity>;
  findById(id: string): Promise<RoleEntity | null>;
  findByName(name: string): Promise<RoleEntity | null>;
  findAll(): Promise<RoleEntity[]>;
  update(id: string, data: UpdateRoleDTO): Promise<RoleEntity>;
  delete(id: string): Promise<void>;
}
