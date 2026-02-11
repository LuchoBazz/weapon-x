import { AdminClient } from './admin-client';
import { EvaluationClient } from './evaluation-client';
import type { WeaponXClientOptions } from './types';

/**
 * Facade that exposes both admin and evaluation clients.
 * Preserved for backward compatibility.
 *
 * @deprecated Prefer using `AdminClient` and `EvaluationClient` directly for better separation of concerns.
 */
export class WeaponXClient {
  public readonly admin: AdminClient;
  public readonly evaluation: EvaluationClient;

  constructor(options: WeaponXClientOptions) {
    this.admin = new AdminClient(options);
    this.evaluation = new EvaluationClient(options);
  }
}
