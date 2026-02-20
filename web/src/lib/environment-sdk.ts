import type { Environment as SdkEnvironment } from '../../../packages/sdk/src/types';
import { getAdminClient } from './sdk';

export type { SdkEnvironment };

const STORAGE_KEY = 'wx_active_environment';

export function loadPersistedEnvironmentId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function persistEnvironmentId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

/** Fetch environments from the API. */
export async function fetchEnvironments(): Promise<SdkEnvironment[]> {
  try {
    const client = getAdminClient();
    return await client.listEnvironments();
  } catch (error) {
    console.error('[environment-sdk] Failed to fetch environments:', error);
    return [];
  }
}

/** Fetch a single environment by ID. */
export async function fetchEnvironmentById(id: string): Promise<SdkEnvironment | null> {
  try {
    const client = getAdminClient();
    return await client.getEnvironment(id);
  } catch (error) {
    console.error(`[environment-sdk] Failed to fetch environment ${id}:`, error);
    return null;
  }
}
