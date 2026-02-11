import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { AdminClient } from '../src/admin-client';

vi.mock('axios');

function setupMockAxios() {
  const interceptors = { response: { use: vi.fn() }, request: { use: vi.fn() } };
  const instance = { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn(), interceptors };
  (axios.create as any).mockReturnValue(instance);
  return instance;
}

describe('AdminClient', () => {
  let mockHttp: ReturnType<typeof setupMockAxios>;
  let client: AdminClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttp = setupMockAxios();
    client = new AdminClient({ baseUrl: 'http://localhost:3001/' });
  });

  it('should create axios instance with trimmed baseURL', () => {
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({ baseURL: 'http://localhost:3001' }));
  });

  describe('createConfig', () => {
    it('should POST to /v1/admin/configs and return unwrapped data', async () => {
      const config = { id: 'cfg-1', key: 'flag' };
      mockHttp.post.mockResolvedValue({ data: { data: config } });
      const result = await client.createConfig({
        project_reference: 'PROJ', key: 'flag', type: 'BOOLEAN', is_active: true, default_value: false,
      });
      expect(mockHttp.post).toHaveBeenCalledWith('/v1/admin/configs', expect.objectContaining({ key: 'flag' }));
      expect(result).toEqual(config);
    });

    it('should accept SECRET as a valid config type', async () => {
      const config = { id: 'cfg-s1', key: 'api_key', type: 'SECRET', default_value: 'decrypted-value' };
      mockHttp.post.mockResolvedValue({ data: { data: config } });
      const result = await client.createConfig({
        project_reference: 'PROJ', key: 'api_key', type: 'SECRET', is_active: true, default_value: 'my-secret',
      });
      expect(mockHttp.post).toHaveBeenCalledWith('/v1/admin/configs', expect.objectContaining({ type: 'SECRET' }));
      expect(result.type).toBe('SECRET');
      expect(result.default_value).toBe('decrypted-value');
    });
  });

  describe('assignRule', () => {
    it('should POST to /v1/admin/configs/:key/rules', async () => {
      const rule = { id: 'rule-1', name: 'VIP', rollout_percentage: 100 };
      mockHttp.post.mockResolvedValue({ data: { data: rule } });
      const result = await client.assignRule('my_flag', {
        project_reference: 'PROJ', name: 'VIP', return_value: true,
        conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }],
      });
      expect(mockHttp.post).toHaveBeenCalledWith('/v1/admin/configs/my_flag/rules', expect.any(Object));
      expect(result).toEqual(rule);
    });

    it('should send rollout_percentage when provided', async () => {
      const rule = { id: 'rule-1', name: 'VIP', rollout_percentage: 50 };
      mockHttp.post.mockResolvedValue({ data: { data: rule } });
      const result = await client.assignRule('my_flag', {
        project_reference: 'PROJ', name: 'VIP', return_value: true,
        conditions: [{ attribute: 'tier', operator: 'EQUALS', value: 'VIP' }],
        rollout_percentage: 50,
      });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/v1/admin/configs/my_flag/rules',
        expect.objectContaining({ rollout_percentage: 50 }),
      );
      expect(result.rollout_percentage).toBe(50);
    });

    it('should encode special characters in configKey', async () => {
      mockHttp.post.mockResolvedValue({ data: { data: {} } });
      await client.assignRule('key/with spaces', {
        project_reference: 'P', name: 'R', return_value: true,
        conditions: [{ attribute: 'a', operator: 'EQUALS', value: 'b' }],
      });
      expect(mockHttp.post).toHaveBeenCalledWith(`/v1/admin/configs/${encodeURIComponent('key/with spaces')}/rules`, expect.any(Object));
    });
  });

  describe('createProject', () => {
    it('should POST and return data', async () => {
      mockHttp.post.mockResolvedValue({ data: { data: { reference: 'P1' } } });
      const result = await client.createProject({ reference: 'P1', name: 'Test' });
      expect(mockHttp.post).toHaveBeenCalledWith('/v1/admin/projects', { reference: 'P1', name: 'Test' });
      expect(result.reference).toBe('P1');
    });
  });

  describe('getProject', () => {
    it('should GET /v1/admin/projects/:ref', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: { reference: 'P1' } } });
      const result = await client.getProject('P1');
      expect(mockHttp.get).toHaveBeenCalledWith('/v1/admin/projects/P1');
      expect(result.reference).toBe('P1');
    });

    it('should encode special characters', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: {} } });
      await client.getProject('my/proj');
      expect(mockHttp.get).toHaveBeenCalledWith(`/v1/admin/projects/${encodeURIComponent('my/proj')}`);
    });
  });

  describe('listProjects', () => {
    it('should GET /v1/admin/projects', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [{ reference: 'P1' }] } });
      const result = await client.listProjects();
      expect(mockHttp.get).toHaveBeenCalledWith('/v1/admin/projects');
      expect(result).toHaveLength(1);
    });
  });

  describe('updateProject', () => {
    it('should PUT /v1/admin/projects/:ref', async () => {
      mockHttp.put.mockResolvedValue({ data: { data: { reference: 'P1', name: 'New' } } });
      const result = await client.updateProject('P1', { name: 'New' });
      expect(mockHttp.put).toHaveBeenCalledWith('/v1/admin/projects/P1', { name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('deleteProject', () => {
    it('should DELETE /v1/admin/projects/:ref', async () => {
      mockHttp.delete.mockResolvedValue({});
      await client.deleteProject('P1');
      expect(mockHttp.delete).toHaveBeenCalledWith('/v1/admin/projects/P1');
    });
  });

  describe('createRole', () => {
    it('should POST and return data', async () => {
      mockHttp.post.mockResolvedValue({ data: { data: { id: 'r1', name: 'admin' } } });
      const result = await client.createRole({ name: 'admin', permissions: ['read'] });
      expect(mockHttp.post).toHaveBeenCalledWith('/v1/admin/roles', { name: 'admin', permissions: ['read'] });
      expect(result.name).toBe('admin');
    });
  });

  describe('getRole', () => {
    it('should GET /v1/admin/roles/:id', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: { id: 'r1' } } });
      await client.getRole('r1');
      expect(mockHttp.get).toHaveBeenCalledWith('/v1/admin/roles/r1');
    });
  });

  describe('listRoles', () => {
    it('should GET /v1/admin/roles', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [] } });
      await client.listRoles();
      expect(mockHttp.get).toHaveBeenCalledWith('/v1/admin/roles');
    });
  });

  describe('updateRole', () => {
    it('should PUT /v1/admin/roles/:id', async () => {
      mockHttp.put.mockResolvedValue({ data: { data: { id: 'r1', name: 'editor' } } });
      const result = await client.updateRole('r1', { name: 'editor' });
      expect(mockHttp.put).toHaveBeenCalledWith('/v1/admin/roles/r1', { name: 'editor' });
      expect(result.name).toBe('editor');
    });
  });

  describe('deleteRole', () => {
    it('should DELETE /v1/admin/roles/:id', async () => {
      mockHttp.delete.mockResolvedValue({});
      await client.deleteRole('r1');
      expect(mockHttp.delete).toHaveBeenCalledWith('/v1/admin/roles/r1');
    });
  });

  describe('createAuthentication', () => {
    it('should POST and return data with role', async () => {
      const auth = { id: 'a1', email: 'user@example.com', role: { id: 'r1', name: 'admin' } };
      mockHttp.post.mockResolvedValue({ data: { data: auth } });
      const result = await client.createAuthentication({ project_reference: 'P', role_id: 'r1', secret_key: 'sk', email: 'user@example.com' });
      expect(mockHttp.post).toHaveBeenCalledWith('/v1/admin/authentications', expect.objectContaining({ secret_key: 'sk', email: 'user@example.com' }));
      expect(result.role).toBeDefined();
      expect(result.email).toBe('user@example.com');
    });
  });

  describe('getAuthentication', () => {
    it('should GET /v1/admin/authentications/:id', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: { id: 'a1' } } });
      await client.getAuthentication('a1');
      expect(mockHttp.get).toHaveBeenCalledWith('/v1/admin/authentications/a1');
    });
  });

  describe('listAuthenticationsByProject', () => {
    it('should GET /v1/admin/projects/:ref/authentications', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [] } });
      await client.listAuthenticationsByProject('PROJ');
      expect(mockHttp.get).toHaveBeenCalledWith('/v1/admin/projects/PROJ/authentications');
    });

    it('should encode special characters', async () => {
      mockHttp.get.mockResolvedValue({ data: { data: [] } });
      await client.listAuthenticationsByProject('my/proj');
      expect(mockHttp.get).toHaveBeenCalledWith(`/v1/admin/projects/${encodeURIComponent('my/proj')}/authentications`);
    });
  });

  describe('updateAuthentication', () => {
    it('should PUT /v1/admin/authentications/:id', async () => {
      mockHttp.put.mockResolvedValue({ data: { data: { id: 'a1', is_active: false } } });
      const result = await client.updateAuthentication('a1', { is_active: false });
      expect(mockHttp.put).toHaveBeenCalledWith('/v1/admin/authentications/a1', { is_active: false });
      expect(result.is_active).toBe(false);
    });
  });

  describe('deleteAuthentication', () => {
    it('should DELETE /v1/admin/authentications/:id', async () => {
      mockHttp.delete.mockResolvedValue({});
      await client.deleteAuthentication('a1');
      expect(mockHttp.delete).toHaveBeenCalledWith('/v1/admin/authentications/a1');
    });
  });

  describe('introspect', () => {
    it('should POST /v1/auth/introspect with token header and return response', async () => {
      const response = { active: true, exp: 1712345678 };
      mockHttp.post.mockResolvedValue({ data: response });

      const result = await client.introspect('my-token');

      expect(mockHttp.post).toHaveBeenCalledWith('/v1/auth/introspect', undefined, {
        headers: { Authorization: 'Bearer my-token' },
      });
      expect(result).toEqual(response);
    });

    it('should return { active: false } on network error', async () => {
      mockHttp.post.mockRejectedValue(new Error('Network Error'));

      const result = await client.introspect('bad-token');

      expect(result).toEqual({ active: false });
    });
  });
});
