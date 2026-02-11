import { PrismaClient } from '../../../generated/prisma/client';
import { IRoleRepository } from '../interfaces';
import { RoleEntity, CreateRoleDTO, UpdateRoleDTO } from '../../../types';

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateRoleDTO): Promise<RoleEntity> {
    const result = await this.prisma.role.create({
      data: {
        name: data.name,
        permissions: data.permissions ?? [],
      },
      include: { authentications: true },
    });
    return this.toEntity(result);
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const result = await this.prisma.role.findUnique({
      where: { id },
      include: { authentications: true },
    });
    return result ? this.toEntity(result) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const result = await this.prisma.role.findUnique({
      where: { name },
      include: { authentications: true },
    });
    return result ? this.toEntity(result) : null;
  }

  async findAll(): Promise<RoleEntity[]> {
    const results = await this.prisma.role.findMany({
      include: { authentications: true },
      orderBy: { name: 'asc' },
    });
    return results.map(r => this.toEntity(r));
  }

  async update(id: string, data: UpdateRoleDTO): Promise<RoleEntity> {
    const result = await this.prisma.role.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.permissions !== undefined && { permissions: data.permissions }),
      },
      include: { authentications: true },
    });
    return this.toEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  private toEntity(record: any): RoleEntity {
    return {
      id: record.id,
      name: record.name,
      permissions: record.permissions,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }
}
