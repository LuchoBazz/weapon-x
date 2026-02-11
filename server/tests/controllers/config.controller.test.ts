import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigController } from '../../src/controllers/config.controller';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationEntity } from '../../src/types';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_CONFIG = { id: 'cfg-1', project_reference: 'PROJ_A', key: 'flag', type: 'BOOLEAN', is_active: true, default_value: false };
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

describe('ConfigController', () => {
  let createUseCase: { execute: ReturnType<typeof vi.fn> };
  let auditService: { log: ReturnType<typeof vi.fn> };
  let controller: ConfigController;

  beforeEach(() => {
    createUseCase = { execute: vi.fn() };
    auditService = { log: vi.fn() };
    controller = new ConfigController(createUseCase as any, auditService as any);
  });

  it('should return 201 with created config on success', async () => {
    createUseCase.execute.mockResolvedValue(MOCK_CONFIG);
    const { req, res, next } = mockReqResNext({
      body: { project_reference: 'PROJ_A', key: 'flag', type: 'BOOLEAN', is_active: true, default_value: false } as any,
      auth: MOCK_AUTH,
    } as any);
    await controller.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: MOCK_CONFIG });
  });

  it('should trigger audit log when auth is present', async () => {
    createUseCase.execute.mockResolvedValue(MOCK_CONFIG);
    const { req, res, next } = mockReqResNext({
      body: { project_reference: 'PROJ_A', key: 'flag' } as any,
      auth: MOCK_AUTH,
    } as any);
    await controller.create(req, res, next);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ auth: MOCK_AUTH, projectReference: 'PROJ_A' }),
      'CREATE', 'CONFIGURATION', 'cfg-1',
      {}, MOCK_CONFIG,
    );
  });

  it('should not trigger audit log when auth is absent', async () => {
    createUseCase.execute.mockResolvedValue(MOCK_CONFIG);
    const { req, res, next } = mockReqResNext({ body: {} as any });
    await controller.create(req, res, next);
    expect(auditService.log).not.toHaveBeenCalled();
  });

  it('should call next with error when use case throws', async () => {
    const error = new Error('conflict');
    createUseCase.execute.mockRejectedValue(error);
    const { req, res, next } = mockReqResNext({ body: {} as any });
    await controller.create(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
