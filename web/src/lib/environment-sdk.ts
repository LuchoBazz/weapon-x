import type { Environment as SdkEnvironment } from '../../../packages/sdk/src/types';
import { getAdminClient } from './sdk';

export type { SdkEnvironment };

// ── Mock data for local development fallback ──

export const MOCK_ENVIRONMENTS: SdkEnvironment[] = [
  {
    id: 'unified_jennet',
    label: 'UNIFIED_JENNET',
    region: 'eu-central-1',
    api_base_url: 'https://api.eu-central-1.weapon-x.io',
    api_key: 'mock_key_123',
    created_at: '2025-01-15T10:00:00.000Z',
    updated_at: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 'special_sailfish',
    label: 'SPECIAL_SAILFISH',
    region: 'eu-west-1',
    api_base_url: 'https://api.eu-west-1.weapon-x.io',
    api_key: 'mock_key_456',
    created_at: '2025-02-01T08:30:00.000Z',
    updated_at: '2025-02-01T08:30:00.000Z',
  },
  {
    id: 'production_america',
    label: 'PRODUCTION_AMERICA',
    region: 'us-east-1',
    api_base_url: 'https://api.us-east-1.weapon-x.io',
    api_key: 'mock_key_789',
    created_at: '2025-03-10T14:00:00.000Z',
    updated_at: '2025-03-10T14:00:00.000Z',
  },
];

const SDK_ENABLED = import.meta.env.VITE_ENABLE_SDK_INTEGRATION === 'true';

/** Fetch environments from the API or return mock data. */
export async function fetchEnvironments(): Promise<SdkEnvironment[]> {
  if (!SDK_ENABLED) {
    return MOCK_ENVIRONMENTS;
  }
  try {
    const client = getAdminClient();
    return await client.listEnvironments();
  } catch {
    console.warn('[environment-sdk] API unreachable, falling back to mock data');
    return MOCK_ENVIRONMENTS;
  }
}

/** Fetch a single environment by ID. */
export async function fetchEnvironmentById(id: string): Promise<SdkEnvironment | null> {
  if (!SDK_ENABLED) {
    return MOCK_ENVIRONMENTS.find(e => e.id === id) ?? null;
  }
  try {
    const client = getAdminClient();
    return await client.getEnvironment(id);
  } catch {
    return MOCK_ENVIRONMENTS.find(e => e.id === id) ?? null;
  }
}
