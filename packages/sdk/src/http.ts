import axios, { AxiosInstance, AxiosError } from 'axios';
import { WeaponXApiError } from './errors';
import type { WeaponXClientOptions, ApiErrorResponse } from './types';

export function createHttpClient(options: WeaponXClientOptions): AxiosInstance {
  const http = axios.create({
    baseURL: options.baseUrl.replace(/\/+$/, ''),
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  http.interceptors.response.use(
    (res) => res,
    (error: AxiosError<ApiErrorResponse>) => {
      const status = error.response?.status ?? 500;
      const body = error.response?.data ?? { error: 'UnknownError', message: error.message };
      throw new WeaponXApiError(status, body);
    },
  );

  return http;
}
