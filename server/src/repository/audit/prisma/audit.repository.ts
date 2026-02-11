import { PrismaClient } from '../../../generated/prisma/client';
import { IAuditLogRepository } from '../interfaces';
import { AuditLogEntity, CreateAuditLogDTO } from '../../../types';

export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAuditLogDTO): Promise<AuditLogEntity> {
    const result = await this.prisma.auditLog.create({
      data: {
        project_reference: data.project_reference,
        authentication_id: data.authentication_id,
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        actor_email: data.actor_email,
        previous_value: (data.previous_value ?? {}) as any,
        new_value: (data.new_value ?? {}) as any,
        metadata: (data.metadata ?? {}) as any,
      },
    });
    return this.toEntity(result);
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLogEntity[]> {
    const results = await this.prisma.auditLog.findMany({
      where: { entity_type: entityType as any, entity_id: entityId },
      orderBy: { created_at: 'desc' },
    });
    return results.map(r => this.toEntity(r));
  }

  async findByProject(projectReference: string): Promise<AuditLogEntity[]> {
    const results = await this.prisma.auditLog.findMany({
      where: { project_reference: projectReference },
      orderBy: { created_at: 'desc' },
    });
    return results.map(r => this.toEntity(r));
  }

  private toEntity(record: any): AuditLogEntity {
    return {
      id: record.id,
      project_reference: record.project_reference,
      authentication_id: record.authentication_id,
      action: record.action,
      entity_type: record.entity_type,
      entity_id: record.entity_id,
      actor_email: record.actor_email,
      previous_value: record.previous_value,
      new_value: record.new_value,
      metadata: record.metadata,
      created_at: record.created_at,
    };
  }
}
