import { AxiosInstance } from 'axios';
import { createHttpClient } from './http';
import type { WeaponXClientOptions, EvaluateRequest, EvaluateResponse } from './types';

export class EvaluationClient {
  private http: AxiosInstance;

  constructor(options: WeaponXClientOptions) {
    this.http = createHttpClient(options);
  }

  async evaluate(data: EvaluateRequest): Promise<EvaluateResponse> {
    const { data: res } = await this.http.post<EvaluateResponse>('/v1/evaluate', data);
    return res;
  }
}
