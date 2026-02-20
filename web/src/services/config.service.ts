import { Config, EvaluationResult } from '@/lib/types';
import { generateId } from '@/lib/constants';
import { INITIAL_DATA } from '@/lib/initial-data';
import { SDK_ENABLED, getAdminClient, getEvaluationClient } from '@/lib/sdk';
import { evaluateCondition } from '@/lib/evaluation';
import { getToken } from '@/lib/auth';

// ── Local Storage Helpers ──

function loadLocal(): Config[] {
  if (SDK_ENABLED) return [];
  const saved = localStorage.getItem('ff_dashboard_data');
  return saved ? JSON.parse(saved) : INITIAL_DATA;
}

function saveLocal(configs: Config[]): void {
  localStorage.setItem('ff_dashboard_data', JSON.stringify(configs));
}

// ── Public API ──

export function getInitialConfigs(): Config[] {
  return loadLocal();
}

export async function fetchConfigsForProject(reference: string): Promise<Config[]> {
  if (!SDK_ENABLED) return [];
  try {
    const admin = getAdminClient();
    const token = getToken();
    const project = await admin.getProject(reference, token);
    const configurations = project.configurations || [];
    
    // Defensive mapping to ensure frontend compatibility
    return configurations.map(c => ({
      ...c,
      rules: c.rules || [],
      description: c.description || '',
      project_reference: c.project_reference || reference,
    })) as unknown as Config[];
  } catch (err) {
    console.error(`[SDK] Failed to fetch configs for project ${reference}:`, err);
    return [];
  }
}

export async function createConfig(
  configs: Config[],
  config: Config
): Promise<Config[]> {
  const now = new Date().toISOString();
  const newConfig: Config = {
    ...config,
    id: generateId(),
    created_at: now,
    updated_at: now,
  };

  if (SDK_ENABLED) {
    try {
      const admin = getAdminClient();
      const created = await admin.createConfig({
        project_reference: config.project_reference,
        key: config.key,
        description: config.description,
        type: config.type,
        is_active: config.is_active,
        default_value: config.default_value,
        validation_schema: config.validation_schema,
      });
      // Use server-assigned id and timestamps
      const serverConfig: Config = {
        ...config,
        id: created.id,
        created_at: created.created_at,
        updated_at: created.updated_at,
        rules: config.rules || [],
      };
      const updated = [...configs, serverConfig];
      saveLocal(updated);
      return updated;
    } catch (err) {
      console.error('[SDK] createConfig failed, falling back to local:', err);
    }
  }

  const updated = [...configs, newConfig];
  saveLocal(updated);
  return updated;
}

export async function updateConfig(
  configs: Config[],
  config: Config
): Promise<Config[]> {
  // SDK doesn't support update yet – always local
  const updated = configs.map(c =>
    c.id === config.id ? { ...config, updated_at: new Date().toISOString() } : c
  );
  saveLocal(updated);
  return updated;
}

export async function deleteConfig(
  configs: Config[],
  id: string
): Promise<Config[]> {
  // SDK doesn't support delete yet – always local
  const updated = configs.filter(c => c.id !== id);
  saveLocal(updated);
  return updated;
}

export async function toggleConfigStatus(
  configs: Config[],
  id: string
): Promise<Config[]> {
  const updated = configs.map(c =>
    c.id === id ? { ...c, is_active: !c.is_active } : c
  );
  saveLocal(updated);
  return updated;
}

export async function evaluateConfigs(
  configs: Config[],
  context: Record<string, unknown>,
  selectedKeys: string[]
): Promise<Record<string, EvaluationResult>> {
  const targets = configs.filter(
    c => selectedKeys.length === 0 || selectedKeys.includes(c.key)
  );

  if (SDK_ENABLED) {
    try {
      const evaluator = getEvaluationClient();
      const res = await evaluator.evaluate({
        filters: context,
        keys: targets.map(c => c.key),
      });
      return res.data;
    } catch (err) {
      console.error('[SDK] evaluate failed, falling back to local:', err);
    }
  }

  // Local evaluation fallback
  const output: Record<string, EvaluationResult> = {};

  targets.forEach(config => {
    if (!config.is_active) {
      output[config.key] = { value: null, rule_id: null, reason: 'DISABLED' };
      return;
    }

    let matchedRule = null;
    for (const rule of config.rules) {
      const allMet = rule.conditions.every(cond => {
        const ctxVal = context[cond.attribute];
        return evaluateCondition(ctxVal, cond.operator, cond.value);
      });
      if (allMet) {
        matchedRule = rule;
        break;
      }
    }

    output[config.key] = matchedRule
      ? { value: matchedRule.return_value, rule_id: matchedRule.id, reason: 'MATCH' }
      : { value: config.default_value, rule_id: 'default', reason: 'FALLBACK' };
  });

  return output;
}
