import { AdminClient, EvaluationClient } from '../../../packages/sdk/src';
import { getEnvironmentById, loadPersistedEnvironmentId } from './environments';

export const SDK_ENABLED = import.meta.env.VITE_ENABLE_SDK_INTEGRATION === 'true';

let _admin: AdminClient | null = null;
let _evaluation: EvaluationClient | null = null;
let _currentEnvId: string | null = null;

function resolveBaseUrl(): { baseUrl: string; envId: string; apiKey: string } {
  const envId = loadPersistedEnvironmentId();
  const env = getEnvironmentById(envId);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || env.apiBaseUrl;
  return { baseUrl, envId, apiKey: env.apiKey };
}

function ensureClients(envId: string, baseUrl: string, apiKey: string) {
  if (_currentEnvId !== envId) {
    const headers: Record<string, string> = apiKey
      ? { Authorization: `Bearer ${apiKey}` }
      : {};
    _admin = new AdminClient({ baseUrl, headers });
    _evaluation = new EvaluationClient({ baseUrl, headers });
    _currentEnvId = envId;
  }
}

export function getAdminClient(): AdminClient {
  const { baseUrl, envId, apiKey } = resolveBaseUrl();
  ensureClients(envId, baseUrl, apiKey);
  return _admin!;
}

export function getEvaluationClient(): EvaluationClient {
  const { baseUrl, envId, apiKey } = resolveBaseUrl();
  ensureClients(envId, baseUrl, apiKey);
  return _evaluation!;
}

/** Force-reset cached clients (call on environment switch). */
export function resetClients(): void {
  _admin = null;
  _evaluation = null;
  _currentEnvId = null;
}
