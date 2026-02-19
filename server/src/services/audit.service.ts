import type { IAuditLogRepository } from '../repository/audit/interfaces';
import type { AuditAction, AuditEntityType, AuthenticationEntity } from '../types';

export interface AuditContext {
  auth: AuthenticationEntity;
  projectReference: string;
}

export class AuditService {
  constructor(private auditRepo: IAuditLogRepository) {}

  /**
   * Logs an audit entry without blocking the caller.
   * Errors are caught and logged to stderr to avoid disrupting the main flow.
   */
  log(
    ctx: AuditContext,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    previousValue: unknown = {},
    newValue: unknown = {},
    metadata: unknown = {},
  ): void {
    this.auditRepo
      .create({
        project_reference: ctx.projectReference,
        authentication_id: ctx.auth.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        actor_email: ctx.auth.email,
        previous_value: previousValue,
        new_value: newValue,
        metadata,
      })
      .catch((err) => {
        console.error('[AuditService] Failed to create audit log:', err);
      });
  }
}
