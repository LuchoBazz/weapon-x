import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthenticationController } from '../../src/controllers/authentication.controller';
import { Request, Response, NextFunction } from 'express';

function mockReqResNext(overrides: Partial<Request> = {}) {
  const req = { body: {}, params: {}, headers: {}, ...overrides } as unknown as Request;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('AuthenticationController.introspect', () => {
  let introspectUseCase: { execute: ReturnType<typeof vi.fn> };
  let controller: AuthenticationController;

  beforeEach(() => {
    introspectUseCase = { execute: vi.fn() };
    controller = new AuthenticationController(
      { execute: vi.fn() } as any, { execute: vi.fn() } as any,
      { execute: vi.fn() } as any, { execute: vi.fn() } as any,
      { execute: vi.fn() } as any, introspectUseCase as any,
    );
  });

  it('should return active:true with exp for valid token', async () => {
    introspectUseCase.execute.mockResolvedValue({ active: true, exp: 1712345678 });
    const { req, res, next } = mockReqResNext({ headers: { authorization: 'Bearer sk_valid' } as any });
    await controller.introspect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ active: true, exp: 1712345678 });
  });

  it('should return active:false for invalid token', async () => {
    introspectUseCase.execute.mockResolvedValue({ active: false });
    const { req, res, next } = mockReqResNext({ headers: { authorization: 'Bearer sk_bad' } as any });
    await controller.introspect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ active: false });
  });

  it('should return 401 when no Authorization header', async () => {
    const { req, res, next } = mockReqResNext({ headers: {} as any });
    await controller.introspect(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should call next on error', async () => {
    const err = new Error('db down');
    introspectUseCase.execute.mockRejectedValue(err);
    const { req, res, next } = mockReqResNext({ headers: { authorization: 'Bearer sk_x' } as any });
    await controller.introspect(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
