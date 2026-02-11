import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticationController } from '../../src/controllers/authentication.controller';
import { Request, Response, NextFunction } from 'express';

const NOW = new Date('2025-01-01T00:00:00Z');
const MOCK_ROLE = { id: 'role-1', name: 'admin', permissions: ['read', 'write'], created_at: NOW, updated_at: NOW };
const MOCK_AUTH = {
  id: 'auth-1', project_reference: 'PROJ_A', role_id: 'role-1', secret_key: 'sk_123',
  email: 'test@example.com', description: 'Test key', is_active: true, expiration_date: null,
  created_at: NOW, updated_at: NOW, removed_at: null, role: MOCK_ROLE,
};

function mockReqResNext(overrides: Partial<Request> = {}) {
  const req = { body: {}, params: {}, ...overrides } as unknown as Request;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

function createMockUseCases() {
  return {
    createAuth: { execute: vi.fn() },
    getAuth: { execute: vi.fn() },
    listAuths: { execute: vi.fn() },
    updateAuth: { execute: vi.fn() },
    deleteAuth: { execute: vi.fn() },
  };
}

describe('AuthenticationController', () => {
  let uc: ReturnType<typeof createMockUseCases>;
  let controller: AuthenticationController;

  beforeEach(() => {
    uc = createMockUseCases();
    controller = new AuthenticationController(
      uc.createAuth as any, uc.getAuth as any, uc.listAuths as any,
      uc.updateAuth as any, uc.deleteAuth as any
    );
  });

  // ── create ──
  it('create should return 201 with data', async () => {
    uc.createAuth.execute.mockResolvedValue(MOCK_AUTH);
    const { req, res, next } = mockReqResNext({ body: { project_reference: 'PROJ_A', role_id: 'role-1', secret_key: 'sk_123', email: 'test@example.com' } as any });
    await controller.create(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: MOCK_AUTH });
  });

  it('create should call next on error', async () => {
    const err = new Error('conflict');
    uc.createAuth.execute.mockRejectedValue(err);
    const { req, res, next } = mockReqResNext({ body: {} as any });
    await controller.create(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // ── getOne ──
  it('getOne should return 200 with auth including role', async () => {
    uc.getAuth.execute.mockResolvedValue(MOCK_AUTH);
    const { req, res, next } = mockReqResNext({ params: { id: 'auth-1' } as any });
    await controller.getOne(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: MOCK_AUTH });
    expect((res.json as any).mock.calls[0][0].data.role).toBeDefined();
  });

  it('getOne should call next on error', async () => {
    const err = new Error('not found');
    uc.getAuth.execute.mockRejectedValue(err);
    const { req, res, next } = mockReqResNext({ params: { id: 'nope' } as any });
    await controller.getOne(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // ── listByProject ──
  it('listByProject should return 200 with array', async () => {
    uc.listAuths.execute.mockResolvedValue([MOCK_AUTH]);
    const { req, res, next } = mockReqResNext({ params: { projectReference: 'PROJ_A' } as any });
    await controller.listByProject(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [MOCK_AUTH] });
  });

  it('listByProject should call next on error', async () => {
    const err = new Error('fail');
    uc.listAuths.execute.mockRejectedValue(err);
    const { req, res, next } = mockReqResNext({ params: { projectReference: 'X' } as any });
    await controller.listByProject(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // ── update ──
  it('update should return 200 with updated data', async () => {
    const updated = { ...MOCK_AUTH, is_active: false };
    uc.updateAuth.execute.mockResolvedValue(updated);
    const { req, res, next } = mockReqResNext({ params: { id: 'auth-1' } as any, body: { is_active: false } as any });
    await controller.update(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: updated });
  });

  it('update should call next on error', async () => {
    const err = new Error('not found');
    uc.updateAuth.execute.mockRejectedValue(err);
    const { req, res, next } = mockReqResNext({ params: { id: 'nope' } as any, body: {} as any });
    await controller.update(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // ── remove ──
  it('remove should return 204', async () => {
    uc.deleteAuth.execute.mockResolvedValue(undefined);
    const { req, res, next } = mockReqResNext({ params: { id: 'auth-1' } as any });
    await controller.remove(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('remove should call next on error', async () => {
    const err = new Error('not found');
    uc.deleteAuth.execute.mockRejectedValue(err);
    const { req, res, next } = mockReqResNext({ params: { id: 'nope' } as any });
    await controller.remove(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
