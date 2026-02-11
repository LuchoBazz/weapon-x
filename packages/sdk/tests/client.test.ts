import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { WeaponXClient } from '../src/client';

vi.mock('axios');

function setupMockAxios() {
  const interceptors = { response: { use: vi.fn() }, request: { use: vi.fn() } };
  const instance = { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn(), interceptors };
  (axios.create as any).mockReturnValue(instance);
  return instance;
}

describe('WeaponXClient (facade)', () => {
  it('should expose admin and evaluation sub-clients', () => {
    setupMockAxios();
    const client = new WeaponXClient({ baseUrl: 'http://localhost:3001' });
    expect(client.admin).toBeDefined();
    expect(client.evaluation).toBeDefined();
    expect(typeof client.admin.createConfig).toBe('function');
    expect(typeof client.admin.createProject).toBe('function');
    expect(typeof client.admin.createRole).toBe('function');
    expect(typeof client.admin.createAuthentication).toBe('function');
    expect(typeof client.evaluation.evaluate).toBe('function');
  });
});
