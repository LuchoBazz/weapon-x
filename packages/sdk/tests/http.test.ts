import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { WeaponXApiError } from '../src/errors';
import { createHttpClient } from '../src/http';

vi.mock('axios');

function setupMockAxios() {
  const interceptors = { response: { use: vi.fn() }, request: { use: vi.fn() } };
  const instance = { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn(), interceptors };
  (axios.create as any).mockReturnValue(instance);
  return instance;
}

describe('createHttpClient', () => {
  let mockInstance: ReturnType<typeof setupMockAxios>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInstance = setupMockAxios();
  });

  it('should create axios instance with trimmed baseURL and default headers', () => {
    createHttpClient({ baseUrl: 'http://localhost:3001/' });
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:3001',
      headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
    });
  });

  it('should merge custom headers', () => {
    createHttpClient({ baseUrl: 'http://api.test', headers: { Authorization: 'Bearer tok' } });
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://api.test',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok' },
    });
  });

  it('should register a response error interceptor', () => {
    createHttpClient({ baseUrl: 'http://localhost:3001' });
    expect(mockInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
  });

  describe('response error interceptor', () => {
    it('should map AxiosError to WeaponXApiError', () => {
      createHttpClient({ baseUrl: 'http://localhost:3001' });
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      const axiosError = {
        response: { status: 409, data: { error: 'ConflictError', message: 'Duplicate key' } },
        message: 'Request failed',
      };
      try { errorHandler(axiosError); } catch (e: any) {
        expect(e).toBeInstanceOf(WeaponXApiError);
        expect(e.status).toBe(409);
        expect(e.errorCode).toBe('ConflictError');
      }
    });

    it('should default to 500 when response is missing', () => {
      createHttpClient({ baseUrl: 'http://localhost:3001' });
      const errorHandler = mockInstance.interceptors.response.use.mock.calls[0][1];
      try { errorHandler({ response: undefined, message: 'ECONNREFUSED' }); } catch (e: any) {
        expect(e).toBeInstanceOf(WeaponXApiError);
        expect(e.status).toBe(500);
        expect(e.message).toBe('ECONNREFUSED');
      }
    });
  });
});
