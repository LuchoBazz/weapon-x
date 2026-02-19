import type { AuditLogEntity, CreateAuditLogDTO } from '../../types';

export interface IAuditLogRepository {
  create(data: CreateAuditLogDTO): Promise<AuditLogEntity>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLogEntity[]>;
  findByProject(projectReference: string): Promise<AuditLogEntity[]>;
}
