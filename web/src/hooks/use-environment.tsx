import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  type SdkEnvironment,
  fetchEnvironments,
  loadPersistedEnvironmentId,
  persistEnvironmentId,
} from '@/lib/environment-sdk';

interface EnvironmentContextValue {
  environment: SdkEnvironment | null;
  environments: SdkEnvironment[];
  setEnvironment: (id: string) => void;
  loading: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [environments, setEnvironments] = useState<SdkEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [envId, setEnvId] = useState<string | null>(loadPersistedEnvironmentId);

  useEffect(() => {
    let mounted = true;
    fetchEnvironments()
      .then(envs => {
        if (!mounted) return;
        setEnvironments(envs);
        setLoading(false);

        // Auto-select valid fallback if persisted one is not found or none persisted
        if (envs.length > 0) {
          if (!envId || !envs.find(e => e.id === envId)) {
            const fallbackId = envs[0].id;
            setEnvId(fallbackId);
            persistEnvironmentId(fallbackId);
          }
        }
      })
      .catch(err => {
        console.error('[EnvironmentProvider] Failed to fetch environments:', err);
        if (mounted) {
          setLoading(false);
        }
      });
      
    return () => {
      mounted = false;
    };
  }, []); // Only fetch on mount

  const environment = useMemo(() => {
    return environments.find(e => e.id === envId) || null;
  }, [environments, envId]);

  const setEnvironment = useCallback((id: string) => {
    persistEnvironmentId(id);
    setEnvId(id);
  }, []);

  const value = useMemo(
    () => ({ environment, environments, setEnvironment, loading }),
    [environment, environments, setEnvironment, loading],
  );

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export function useEnvironment(): EnvironmentContextValue {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error('useEnvironment must be used within EnvironmentProvider');
  return ctx;
}
