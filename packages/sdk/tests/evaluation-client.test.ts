import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { EvaluationClient } from '../src/evaluation-client';

vi.mock('axios');

function setupMockAxios() {
  const interceptors = { response: { use: vi.fn() }, request: { use: vi.fn() } };
  const instance = { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn(), interceptors };
  (axios.create as any).mockReturnValue(instance);
  return instance;
}

describe('EvaluationClient', () => {
  let mockHttp: ReturnType<typeof setupMockAxios>;
  let client: EvaluationClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttp = setupMockAxios();
    client = new EvaluationClient({ baseUrl: 'http://localhost:3001/' });
  });

  it('should create axios instance with trimmed baseURL', () => {
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({ baseURL: 'http://localhost:3001' }));
  });

  describe('evaluate', () => {
    it('should POST to /v1/evaluate and return full response', async () => {
      const response = {
        meta: { server_time: 123 },
        data: { flag: { value: true, rule_id: 'r1', reason: 'MATCH' } },
      };
      mockHttp.post.mockResolvedValue({ data: response });
      const result = await client.evaluate({ filters: { tier: 'VIP' }, keys: ['flag'] });
      expect(mockHttp.post).toHaveBeenCalledWith('/v1/evaluate', { filters: { tier: 'VIP' }, keys: ['flag'] });
      expect(result).toEqual(response);
    });

    it('should send identifier when provided for rollout hashing', async () => {
      const response = {
        meta: { server_time: 123 },
        data: { flag: { value: true, rule_id: 'r1', reason: 'MATCH' } },
      };
      mockHttp.post.mockResolvedValue({ data: response });
      await client.evaluate({ filters: { tier: 'VIP' }, keys: ['flag'], identifier: 'user-123' });
      expect(mockHttp.post).toHaveBeenCalledWith('/v1/evaluate', {
        filters: { tier: 'VIP' }, keys: ['flag'], identifier: 'user-123',
      });
    });

    it('should propagate errors from axios', async () => {
      mockHttp.post.mockRejectedValue(new Error('Network Error'));
      await expect(client.evaluate({ filters: {}, keys: ['k'] })).rejects.toThrow('Network Error');
    });
  });
});
