import type { PrismaClient } from '../../../generated/prisma/client';
import type { IEnvironmentRepository } from '../interfaces';
import type { EnvironmentEntity, CreateEnvironmentDTO, UpdateEnvironmentDTO } from '../../../types';

export class PrismaEnvironmentRepository implements IEnvironmentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateEnvironmentDTO): Promise<EnvironmentEntity> {
    const result = await this.prisma.environment.create({
      data: {
        id: data.id,
        label: data.label,
        region: data.region,
        api_base_url: data.api_base_url,
        api_key: data.api_key,
      },
    });
    return this.toEntity(result);
  }

  async findById(id: string): Promise<EnvironmentEntity | null> {
    const result = await this.prisma.environment.findUnique({ where: { id } });
    return result ? this.toEntity(result) : null;
  }

  async findAll(): Promise<EnvironmentEntity[]> {
    const results = await this.prisma.environment.findMany({ orderBy: { label: 'asc' } });
    return results.map(r => this.toEntity(r));
  }

  async update(id: string, data: UpdateEnvironmentDTO): Promise<EnvironmentEntity> {
    const result = await this.prisma.environment.update({
      where: { id },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.region !== undefined && { region: data.region }),
        ...(data.api_base_url !== undefined && { api_base_url: data.api_base_url }),
        ...(data.api_key !== undefined && { api_key: data.api_key }),
      },
    });
    return this.toEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.environment.delete({ where: { id } });
  }

  private toEntity(record: any): EnvironmentEntity {
    return {
      id: record.id,
      label: record.label,
      region: record.region,
      api_base_url: record.api_base_url,
      api_key: record.api_key,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }
}
