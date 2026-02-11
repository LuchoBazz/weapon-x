import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RuleController } from '../../src/controllers/rule.controller';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationEntity } from '../../src/types';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_RULE = { id: 'rule-1', name: 'VIP', configuration_id: 'cfg-1', priority: 0, rollout_percentage: 100 };
const MOCK_AUTH: AuthenticationEntity = {
  id: 'auth-1', project_reference: 'PROJ_A', role_id: 'role-1',
  secret_key: 'sk', email: 'admin@test.com', description: '',
  is_active: true, expiration_date: null,
  created_at: NOW, updated_at: NOW, removed_at: null,
};

function mockReqResNext(overrides: Partial<Request> = {}) {
  const req = { body: {}, params: {}, ...overrides } as unknown as Request;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('RuleController', () => {
  let assignUseCase: { execute: ReturnType<typeof vi.fn> };
  let auditService: { log: ReturnType<typeof vi.fn> };
  let controller: RuleController;

  beforeEach(() => {
    assignUseCase = { execute: vi.fn() };
    auditService = { log: vi.fn() };
    controller = new RuleController(assignUseCase as any, auditService as any);
  });

  it('should return 201 with created rule on success', async () => {
    assignUseCase.execute.mockResolvedValue(MOCK_RULE);
    const { req, res, next } = mockReqResNext({
      params: { key: 'flag' } as any,
      body: { project_reference: 'PROJ_A', name: 'VIP', return_value: true, conditions: [] } as any,
      auth: MOCK_AUTH,
    } as any);
    await controller.assign(req, res, next);
    expect(assignUseCase.execute).toHaveBeenCalledWith('flag', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: MOCK_RULE });
  });

  it('should trigger audit log when auth is present', async () => {
    assignUseCase.execute.mockResolvedValue(MOCK_RULE);
    const { req, res, next } = mockReqResNext({
      params: { key: 'flag' } as any,
      body: { project_reference: 'PROJ_A', name: 'VIP' } as any,
      auth: MOCK_AUTH,
    } as any);
    await controller.assign(req, res, next);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ auth: MOCK_AUTH, projectReference: 'PROJ_A' }),
      'CREATE', 'RULE', 'rule-1',
      {}, MOCK_RULE,
    );
  });

  it('should call next with error when use case throws', async () => {
    const error = new Error('not found');
    assignUseCase.execute.mockRejectedValue(error);
    const { req, res, next } = mockReqResNext({ params: { key: 'flag' } as any, body: {} as any });
    await controller.assign(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
