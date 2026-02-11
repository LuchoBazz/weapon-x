import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IntrospectAuthenticationUseCase } from '../../src/usecases/introspectAuthentication.usecase';

const NOW = new Date('2025-01-01T00:00:00Z');
const FUTURE = new Date('2026-06-01T00:00:00Z');
const PAST = new Date('2024-01-01T00:00:00Z');
const MOCK_ROLE = { id: 'role-1', name: 'admin', permissions: ['read'], created_at: NOW, updated_at: NOW };

function mockAuth(overrides: Record<string, any> = {}) {
  return {
    id: 'auth-1', project_reference: 'PROJ_A', role_id: 'role-1', secret_key: 'sk_123',
    email: 'test@example.com', description: '', is_active: true, expiration_date: FUTURE,
    created_at: NOW, updated_at: NOW, removed_at: null, role: MOCK_ROLE, ...overrides,
  };
}

describe('IntrospectAuthenticationUseCase', () => {
  let repo: { findBySecretKey: ReturnType<typeof vi.fn> };
  let useCase: IntrospectAuthenticationUseCase;

  beforeEach(() => {
    repo = { findBySecretKey: vi.fn(), create: vi.fn(), findById: vi.fn(), findAllByProject: vi.fn(), update: vi.fn(), softDelete: vi.fn() } as any;
    useCase = new IntrospectAuthenticationUseCase(repo as any);
  });

  it('should return active:true with exp for valid token', async () => {
    repo.findBySecretKey.mockResolvedValue(mockAuth());
    const result = await useCase.execute('sk_123');
    expect(result.active).toBe(true);
    expect(result.exp).toBe(Math.floor(FUTURE.getTime() / 1000));
  });

  it('should return active:true without exp when no expiration_date', async () => {
    repo.findBySecretKey.mockResolvedValue(mockAuth({ expiration_date: null }));
    const result = await useCase.execute('sk_123');
    expect(result).toEqual({ active: true });
  });

  it('should return active:false for unknown token', async () => {
    repo.findBySecretKey.mockResolvedValue(null);
    expect(await useCase.execute('bad')).toEqual({ active: false });
  });

  it('should return active:false for inactive token', async () => {
    repo.findBySecretKey.mockResolvedValue(mockAuth({ is_active: false }));
    expect(await useCase.execute('sk_123')).toEqual({ active: false });
  });

  it('should return active:false for expired token', async () => {
    repo.findBySecretKey.mockResolvedValue(mockAuth({ expiration_date: PAST }));
    expect(await useCase.execute('sk_123')).toEqual({ active: false });
  });
});
