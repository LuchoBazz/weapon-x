export interface Environment {
  id: string;
  label: string;
  region: string;
  apiBaseUrl: string;
  /** Bearer token or API key for this environment */
  apiKey: string;
}

export const ENVIRONMENTS: Environment[] = [
  {
    id: 'unified_jennet',
    label: 'UNIFIED_JENNET',
    region: 'eu-central-1',
    apiBaseUrl: 'https://api.eu-central-1.weapon-x.io',
    apiKey: '',
  },
  {
    id: 'special_sailfish',
    label: 'SPECIAL_SAILFISH',
    region: 'eu-west-1',
    apiBaseUrl: 'https://api.eu-west-1.weapon-x.io',
    apiKey: '',
  },
  {
    id: 'production_america',
    label: 'PRODUCTION_AMERICA',
    region: 'us-east-1',
    apiBaseUrl: 'https://api.us-east-1.weapon-x.io',
    apiKey: '',
  },
];

const STORAGE_KEY = 'wx_active_environment';

export function loadPersistedEnvironmentId(): string {
  return localStorage.getItem(STORAGE_KEY) || ENVIRONMENTS[0].id;
}

export function persistEnvironmentId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

export function getEnvironmentById(id: string): Environment {
  return ENVIRONMENTS.find(e => e.id === id) || ENVIRONMENTS[0];
}
