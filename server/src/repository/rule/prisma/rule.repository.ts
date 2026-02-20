import type { PrismaClient } from '../../../generated/prisma/client';
import type { IRuleRepository } from '../interfaces';
import type { RuleEntity, CreateRuleDTO, UpdateRuleDTO } from '../../../types';

export class PrismaRuleRepository implements IRuleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(configurationId: string, data: CreateRuleDTO): Promise<RuleEntity> {
    const maxPriority = await this.prisma.rule.aggregate({
      where: { configuration_id: configurationId },
      _max: { priority: true },
    });

    const result = await this.prisma.rule.create({
      data: {
        configuration_id: configurationId,
        name: data.name,
        conditions: data.conditions as any,
        return_value: data.return_value as any,
        priority: (maxPriority._max.priority ?? -1) + 1,
        rollout_percentage: data.rollout_percentage ?? 100,
      },
    });

    return this.toEntity(result);
  }

  async findById(id: string): Promise<RuleEntity | null> {
    const result = await this.prisma.rule.findUnique({ where: { id } });
    return result ? this.toEntity(result) : null;
  }

  async findByConfigurationId(configurationId: string): Promise<RuleEntity[]> {
    const results = await this.prisma.rule.findMany({
      where: { configuration_id: configurationId },
      orderBy: { priority: 'asc' },
    });
    return results.map(r => this.toEntity(r));
  }

  async update(id: string, data: UpdateRuleDTO): Promise<RuleEntity> {
    const result = await this.prisma.rule.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.conditions !== undefined && { conditions: data.conditions as any }),
        ...(data.return_value !== undefined && { return_value: data.return_value as any }),
        ...(data.rollout_percentage !== undefined && { rollout_percentage: data.rollout_percentage }),
        ...(data.priority !== undefined && { priority: data.priority }),
      },
    });
    return this.toEntity(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.rule.delete({ where: { id } });
  }

  private toEntity(record: any): RuleEntity {
    return {
      id: record.id,
      configuration_id: record.configuration_id,
      name: record.name,
      conditions: record.conditions,
      return_value: record.return_value,
      priority: record.priority,
      rollout_percentage: record.rollout_percentage,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }
}
