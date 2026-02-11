import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  Environment,
  ENVIRONMENTS,
  getEnvironmentById,
  loadPersistedEnvironmentId,
  persistEnvironmentId,
} from '@/lib/environments';

interface EnvironmentContextValue {
  environment: Environment;
  environments: Environment[];
  setEnvironment: (id: string) => void;
}

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [envId, setEnvId] = useState(loadPersistedEnvironmentId);

  const environment = useMemo(() => getEnvironmentById(envId), [envId]);

  const setEnvironment = useCallback((id: string) => {
    persistEnvironmentId(id);
    setEnvId(id);
  }, []);

  const value = useMemo(
    () => ({ environment, environments: ENVIRONMENTS, setEnvironment }),
    [environment, setEnvironment],
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
