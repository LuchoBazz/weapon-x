import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authorize } from '../../src/middleware/authorization';
import { IAuthenticationRepository } from '../../src/repository/authentication/interfaces';
import { AuthenticationEntity } from '../../src/types';

const NOW = new Date('2025-01-01T00:00:00Z');

function makeAuth(overrides: Partial<AuthenticationEntity> = {}): AuthenticationEntity {
  return {
    id: 'auth-1', project_reference: 'PROJ', role_id: 'role-1',
    secret_key: 'sk_valid', description: '', is_active: true,
    expiration_date: null, created_at: NOW, updated_at: NOW, removed_at: null,
    role: { id: 'role-1', name: 'admin', permissions: ['configs:read', 'configs:write', 'rules:write'], created_at: NOW, updated_at: NOW },
    ...overrides,
  };
}

function mockReqResNext(headers: Record<string, string> = {}) {
  const req = { headers } as unknown as Request;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

function createMockRepo(): IAuthenticationRepository {
  return {
    create: vi.fn(), findById: vi.fn(), findBySecretKey: vi.fn(),
    findAllByProject: vi.fn(), update: vi.fn(), softDelete: vi.fn(),
  };
}

describe('authorize middleware', () => {
  let repo: ReturnType<typeof createMockRepo>;

  beforeEach(() => { repo = createMockRepo(); });

  it('should return 401 when Authorization header is missing', async () => {
    const { req, res, next } = mockReqResNext();
    await authorize(repo)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when header does not start with Bearer', async () => {
    const { req, res, next } = mockReqResNext({ authorization: 'Basic abc' });
    await authorize(repo)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 when token is empty', async () => {
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer ' });
    await authorize(repo)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 when token is not found in DB', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(null);
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer sk_invalid' });
    await authorize(repo)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Invalid') }));
  });

  it('should return 401 when API key is deactivated', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(makeAuth({ is_active: false }));
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer sk_valid' });
    await authorize(repo)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('deactivated') }));
  });

  it('should return 401 when API key has expired', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(makeAuth({ expiration_date: new Date('2020-01-01') }));
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer sk_valid' });
    await authorize(repo)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('expired') }));
  });

  it('should return 403 when role lacks required permissions', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(makeAuth({
      role: { id: 'r', name: 'viewer', permissions: ['configs:read'], created_at: NOW, updated_at: NOW },
    }));
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer sk_valid' });
    await authorize(repo, ['configs:write'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('configs:write') }));
  });

  it('should call next and attach auth when valid with required permissions', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(makeAuth());
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer sk_valid' });
    await authorize(repo, ['configs:read'])(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.auth).toBeDefined();
    expect(req.auth!.id).toBe('auth-1');
  });

  it('should call next when no permissions required and token is valid', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(makeAuth());
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer sk_valid' });
    await authorize(repo)(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next(error) on repository failure', async () => {
    (repo.findBySecretKey as any).mockRejectedValue(new Error('DB down'));
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer sk_valid' });
    await authorize(repo)(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should allow non-expired future keys', async () => {
    (repo.findBySecretKey as any).mockResolvedValue(makeAuth({ expiration_date: new Date('2030-01-01') }));
    const { req, res, next } = mockReqResNext({ authorization: 'Bearer sk_valid' });
    await authorize(repo, ['configs:read'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
