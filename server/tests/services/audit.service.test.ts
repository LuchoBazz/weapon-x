import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditService } from '../../src/services/audit.service';
import { IAuditLogRepository } from '../../src/repository/audit/interfaces';
import { AuthenticationEntity } from '../../src/types';

const NOW = new Date('2025-01-01T00:00:00Z');

const MOCK_AUTH: AuthenticationEntity = {
  id: 'auth-1', project_reference: 'PROJ_A', role_id: 'role-1',
  secret_key: 'sk_123', email: 'admin@example.com', description: '',
  is_active: true, expiration_date: null,
  created_at: NOW, updated_at: NOW, removed_at: null,
};

function createMockRepo(): IAuditLogRepository {
  return {
    create: vi.fn().mockResolvedValue({ id: 'log-1' }),
    findByEntity: vi.fn(),
    findByProject: vi.fn(),
  };
}

describe('AuditService', () => {
  let repo: ReturnType<typeof createMockRepo>;
  let service: AuditService;

  beforeEach(() => { repo = createMockRepo(); service = new AuditService(repo); });

  it('should call repo.create with correct params', async () => {
    service.log(
      { auth: MOCK_AUTH, projectReference: 'PROJ_A' },
      'CREATE', 'CONFIGURATION', 'cfg-1', {}, { key: 'flag' },
    );
    // Let the microtask settle
    await new Promise(r => setTimeout(r, 10));
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
      project_reference: 'PROJ_A',
      authentication_id: 'auth-1',
      action: 'CREATE',
      entity_type: 'CONFIGURATION',
      entity_id: 'cfg-1',
      actor_email: 'admin@example.com',
    }));
  });

  it('should not throw when repo.create fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (repo.create as any).mockRejectedValue(new Error('DB down'));
    service.log(
      { auth: MOCK_AUTH, projectReference: 'PROJ_A' },
      'DELETE', 'RULE', 'rule-1',
    );
    await new Promise(r => setTimeout(r, 10));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[AuditService]'), expect.any(Error));
    consoleSpy.mockRestore();
  });
});
