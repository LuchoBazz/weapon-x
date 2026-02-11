import { PrismaClient } from '../../../generated/prisma/client';
import { IAuthenticationRepository } from '../interfaces';
import { AuthenticationEntity, CreateAuthenticationDTO, UpdateAuthenticationDTO } from '../../../types';

const INCLUDE_ROLE = { role: true } as const;

export class PrismaAuthenticationRepository implements IAuthenticationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAuthenticationDTO): Promise<AuthenticationEntity> {
    const result = await this.prisma.authentication.create({
      data: {
        project_reference: data.project_reference,
        role_id: data.role_id,
        secret_key: data.secret_key,
        email: data.email,
        description: data.description || '',
        is_active: data.is_active ?? true,
        expiration_date: data.expiration_date ?? null,
      },
      include: INCLUDE_ROLE,
    });
    return this.toEntity(result);
  }

  async findById(id: string): Promise<AuthenticationEntity | null> {
    const result = await this.prisma.authentication.findFirst({
      where: { id, removed_at: null },
      include: INCLUDE_ROLE,
    });
    return result ? this.toEntity(result) : null;
  }

  async findBySecretKey(secretKey: string): Promise<AuthenticationEntity | null> {
    const result = await this.prisma.authentication.findFirst({
      where: { secret_key: secretKey, removed_at: null },
      include: INCLUDE_ROLE,
    });
    return result ? this.toEntity(result) : null;
  }

  async findAllByProject(projectReference: string): Promise<AuthenticationEntity[]> {
    const results = await this.prisma.authentication.findMany({
      where: { project_reference: projectReference, removed_at: null },
      include: INCLUDE_ROLE,
      orderBy: { created_at: 'desc' },
    });
    return results.map(r => this.toEntity(r));
  }

  async update(id: string, data: UpdateAuthenticationDTO): Promise<AuthenticationEntity> {
    const result = await this.prisma.authentication.update({
      where: { id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(data.expiration_date !== undefined && { expiration_date: data.expiration_date }),
        ...(data.role_id !== undefined && { role_id: data.role_id }),
        ...(data.email !== undefined && { email: data.email }),
      },
      include: INCLUDE_ROLE,
    });
    return this.toEntity(result);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.authentication.update({
      where: { id },
      data: { removed_at: new Date(), is_active: false },
    });
  }

  private toEntity(record: any): AuthenticationEntity {
    return {
      id: record.id,
      project_reference: record.project_reference,
      role_id: record.role_id,
      secret_key: record.secret_key,
      email: record.email,
      description: record.description,
      is_active: record.is_active,
      expiration_date: record.expiration_date,
      created_at: record.created_at,
      updated_at: record.updated_at,
      removed_at: record.removed_at,
      role: record.role
        ? {
            id: record.role.id,
            name: record.role.name,
            permissions: record.role.permissions,
            created_at: record.role.created_at,
            updated_at: record.role.updated_at,
          }
        : undefined,
    };
  }
}
