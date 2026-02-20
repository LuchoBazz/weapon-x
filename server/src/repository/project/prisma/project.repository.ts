import type { PrismaClient } from '../../../generated/prisma/client';
import type { IProjectRepository } from '../interfaces';
import type { ProjectEntity, CreateProjectDTO, UpdateProjectDTO, ConfigEntity } from '../../../types';
import { decrypt } from '../../../utils/crypto';

export class PrismaProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProjectDTO): Promise<ProjectEntity> {
    const result = await this.prisma.project.create({
      data: { reference: data.reference, name: data.name },
    });
    return this.toEntity(result);
  }

  async findByReference(reference: string): Promise<ProjectEntity | null> {
    const result = await this.prisma.project.findUnique({ where: { reference } });
    return result ? this.toEntity(result) : null;
  }

  async findByReferenceWithRelations(reference: string): Promise<ProjectEntity | null> {
    const result = await this.prisma.project.findUnique({
      where: { reference },
      include: {
        configurations: { include: { rules: { orderBy: { priority: 'asc' } } }, orderBy: { updated_at: 'desc' } },
        authentications: { where: { removed_at: null }, include: { role: true }, orderBy: { created_at: 'desc' } },
      },
    });
    return result ? this.toEntity(result) : null;
  }

  async findAll(): Promise<ProjectEntity[]> {
    const results = await this.prisma.project.findMany({ orderBy: { name: 'asc' } });
    return results.map(r => this.toEntity(r));
  }

  async update(reference: string, data: UpdateProjectDTO): Promise<ProjectEntity> {
    const result = await this.prisma.project.update({
      where: { reference },
      data: { ...(data.name !== undefined && { name: data.name }) },
    });
    return this.toEntity(result);
  }

  async delete(reference: string): Promise<void> {
    await this.prisma.project.delete({ where: { reference } });
  }

  private toEntity(record: any): ProjectEntity {
    return {
      reference: record.reference,
      name: record.name,
      created_at: record.created_at,
      updated_at: record.updated_at,
      configurations: record.configurations?.map((c: any) => {
        const isSecret = c.type === 'SECRET';
        return {
          id: c.id,
          project_reference: c.project_reference,
          key: c.key,
          description: c.description,
          type: c.type,
          is_active: c.is_active,
          default_value: isSecret ? decrypt(String(c.default_value)) : c.default_value,
          validation_schema: c.validation_schema,
          created_at: c.created_at,
          updated_at: c.updated_at,
          rules: c.rules?.map((r: any) => ({
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
      }),
      authentications: record.authentications,
    };
  }
}
