import { SDK_ENABLED, getAdminClient } from './sdk';

const TOKEN_KEY = 'wx_auth_token';

const MOCK_EMAIL = 'test@test.com';
const MOCK_PASSWORD = '12345678';

export async function hashCreds(email: string, password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(`${email}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  if (SDK_ENABLED) {
    const hash = await hashCreds(email, password);
    const client = getAdminClient();
    const result = await client.introspect(hash);
    if (result.active) {
      localStorage.setItem(TOKEN_KEY, hash);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials or inactive account.' };
  }

  // Mock login
  if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
    localStorage.setItem(TOKEN_KEY, 'mock-token-authenticated');
    return { success: true };
  }
  return { success: false, error: 'Invalid email or password.' };
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}
