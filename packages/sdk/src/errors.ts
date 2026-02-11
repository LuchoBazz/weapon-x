import type { ApiErrorResponse, ApiValidationDetail } from './types';

export class WeaponXApiError extends Error {
  public readonly status: number;
  public readonly errorCode: string;
  public readonly details?: ApiValidationDetail[];

  constructor(status: number, body: ApiErrorResponse) {
    super(body.message || body.error);
    this.name = 'WeaponXApiError';
    this.status = status;
    this.errorCode = body.error;
    this.details = body.details;
  }
}
