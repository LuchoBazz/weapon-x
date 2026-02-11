import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { Config, Filters, ViewType } from '@/lib/types';
import { PROJECT_REFS } from '@/lib/constants';
import { useEnvironment } from '@/hooks/use-environment';
import { resetClients } from '@/lib/sdk';
import Sidebar from '@/components/dashboard/Sidebar';
import ConfigList from '@/components/dashboard/ConfigList';
import Editor from '@/components/dashboard/Editor';
import Simulator from '@/components/dashboard/Simulator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getInitialConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  toggleConfigStatus,
} from '@/services/config.service';

const Index = () => {
  const { environment } = useEnvironment();
  const [configs, setConfigs] = useState<Config[]>(getInitialConfigs);
  const [view, setView] = useState<ViewType>('dashboard');
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: '', project: 'ALL', type: 'ALL' });
  const prevEnvRef = useRef(environment.id);

  // Re-fetch data when environment changes
  useEffect(() => {
    if (prevEnvRef.current !== environment.id) {
      prevEnvRef.current = environment.id;
      resetClients();
      setConfigs(getInitialConfigs());
      setSelectedProject(null);
      setSelectedConfigId(null);
      setView('dashboard');
    }
  }, [environment.id]);

  const availableProjects = useMemo(() => {
    const fromConfigs = [...new Set(configs.map(c => c.project_reference))];
    const all = [...new Set([...fromConfigs, ...PROJECT_REFS])];
    return all.sort();
  }, [configs]);

  const filteredConfigs = useMemo(() => {
    if (!selectedProject) return [];
    return configs.filter(c => {
      const matchProject = c.project_reference === selectedProject;
      const matchSearch = c.key.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchType = filters.type === 'ALL' || c.type === filters.type;
      return matchProject && matchSearch && matchType;
    });
  }, [configs, selectedProject, filters]);

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    setFilters({ search: '', project: 'ALL', type: 'ALL' });
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await toggleConfigStatus(configs, id);
    setConfigs(updated);
  };

  const handleSaveConfig = async (config: Config) => {
    if (config.id) {
      const updated = await updateConfig(configs, config);
      setConfigs(updated);
    } else {
      const updated = await createConfig(configs, config);
      setConfigs(updated);
    }
    setView('dashboard');
    setSelectedConfigId(null);
  };

  const handleDeleteConfig = async (id: string) => {
    if (confirm("Are you sure you want to delete this configuration?")) {
      const updated = await deleteConfig(configs, id);
      setConfigs(updated);
      setView('dashboard');
      setSelectedConfigId(null);
    }
  };

  let content;
  if (view === 'dashboard') {
    if (!selectedProject) {
      content = (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-sm">
            <FolderOpen size={56} strokeWidth={1} className="mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Choose a Project</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select a project to view and manage its configurations.
              </p>
            </div>
            <Select onValueChange={handleProjectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project…" />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurations</h1>
              <p className="text-muted-foreground mt-1">
                Project: <span className="font-mono text-foreground">{selectedProject}</span>
                {' · '}
                <button onClick={() => setSelectedProject(null)} className="text-primary hover:underline">
                  Change
                </button>
              </p>
            </div>
            <button
              onClick={() => { setSelectedConfigId(null); setView('edit'); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
            >
              <Plus size={16} /> Create New
            </button>
          </div>
          <ConfigList
            configs={filteredConfigs}
            filters={filters}
            onFilter={setFilters}
            onSelect={(c) => { setSelectedConfigId(c.id!); setView('edit'); }}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      );
    }
  } else if (view === 'edit') {
    content = (
      <Editor
        config={configs.find(c => c.id === selectedConfigId)}
        onSave={handleSaveConfig}
        onCancel={() => setView('dashboard')}
        onDelete={handleDeleteConfig}
      />
    );
  } else {
    content = <Simulator configs={configs} />;
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground">
      <Sidebar view={view} onViewChange={setView} />
      <main className="flex-1 overflow-auto flex flex-col">{content}</main>
    </div>
  );
};

export default Index;
