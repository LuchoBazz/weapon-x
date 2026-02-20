import type { PrismaClient } from '../../../generated/prisma/client';
import type { IConfigRepository } from '../interfaces';
import type { ConfigEntity, CreateConfigDTO } from '../../../types';
import { encrypt, decrypt } from '../../../utils/crypto';

export class PrismaConfigRepository implements IConfigRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateConfigDTO): Promise<ConfigEntity> {
    const defaultValue = data.type === 'SECRET'
      ? encrypt(String(data.default_value))
      : data.default_value;

    const result = await this.prisma.configuration.create({
      data: {
        project_reference: data.project_reference,
        key: data.key,
        description: data.description || '',
        type: data.type,
        is_active: data.is_active,
        default_value: defaultValue as any,
        validation_schema: (data.validation_schema || {}) as any,
      },
    });
    return this.toEntity(result);
  }

  async findById(id: string): Promise<ConfigEntity | null> {
    const result = await this.prisma.configuration.findUnique({ where: { id } });
    return result ? this.toEntity(result) : null;
  }

  async findByKey(key: string, projectReference?: string): Promise<ConfigEntity | null> {
    const where: any = { key };
    if (projectReference) where.project_reference = projectReference;

    const result = await this.prisma.configuration.findFirst({ where });
    return result ? this.toEntity(result) : null;
  }

  async findAll(filters?: { project_reference?: string; type?: string }): Promise<ConfigEntity[]> {
    const where: any = {};
    if (filters?.project_reference) where.project_reference = filters.project_reference;
    if (filters?.type) where.type = filters.type;

    const results = await this.prisma.configuration.findMany({ where, orderBy: { updated_at: 'desc' } });
    return results.map(r => this.toEntity(r));
  }

  async findByKeyWithRules(key: string, projectReference?: string): Promise<ConfigEntity | null> {
    const where: any = { key };
    if (projectReference) where.project_reference = projectReference;

    const result = await this.prisma.configuration.findFirst({
      where,
      include: { rules: { orderBy: { priority: 'asc' } } },
    });
    return result ? this.toEntity(result) : null;
  }

  async findManyByKeysWithRules(keys: string[]): Promise<ConfigEntity[]> {
    const results = await this.prisma.configuration.findMany({
      where: { key: { in: keys } },
      include: { rules: { orderBy: { priority: 'asc' } } },
    });
    return results.map(r => this.toEntity(r));
  }

  async update(id: string, data: Partial<CreateConfigDTO>): Promise<ConfigEntity> {
    // If updating default_value on a SECRET config, we need to encrypt it.
    // We must fetch the current record to check its type.
    let defaultValue = data.default_value;
    if (data.default_value !== undefined) {
      const existing = await this.prisma.configuration.findUnique({ where: { id }, select: { type: true } });
      if (existing?.type === 'SECRET') {
        defaultValue = encrypt(String(data.default_value));
      }
    }

    const result = await this.prisma.configuration.update({
      where: { id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        ...(defaultValue !== undefined && { default_value: defaultValue as any }),
        ...(data.validation_schema !== undefined && { validation_schema: data.validation_schema as any }),
      },
    });
    return this.toEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.configuration.delete({ where: { id } });
  }

  private toEntity(record: any): ConfigEntity {
    const isSecret = record.type === 'SECRET';
    return {
      id: record.id,
      project_reference: record.project_reference,
      key: record.key,
      description: record.description,
      type: record.type,
      is_active: record.is_active,
      default_value: isSecret ? decrypt(String(record.default_value)) : record.default_value,
      validation_schema: record.validation_schema as Record<string, unknown>,
      created_at: record.created_at,
      updated_at: record.updated_at,
      rules: record.rules?.map((r: any) => ({
        id: r.id,
        configuration_id: r.configuration_id,
        name: r.name,
        conditions: r.conditions,
        return_value: isSecret ? decrypt(String(r.return_value)) : r.return_value,
        priority: r.priority,
        rollout_percentage: r.rollout_percentage,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    };
  }
}
