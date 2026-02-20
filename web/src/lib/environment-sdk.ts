import type { 
  Environment as SdkEnvironment, 
  Project as SdkProject 
} from '../../../packages/sdk/src/types';
import { getToken } from './auth';
import { getAdminClient } from './sdk';

export type { SdkEnvironment, SdkProject };

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
    const token = getToken();
    const client = getAdminClient();
    return await client.listEnvironments(token);
  } catch (error) {
    console.error('[environment-sdk] Failed to fetch environments:', error);
    return [];
  }
}

/** Fetch projects from the API. */
export async function fetchProjects(): Promise<SdkProject[]> {
  try {
    const token = getToken();
    const client = getAdminClient();
    return await client.listProjects(token);
  } catch (error) {
    console.error('[environment-sdk] Failed to fetch projects:', error);
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
