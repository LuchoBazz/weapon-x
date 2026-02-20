import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, FolderOpen, ToggleRight, LayoutDashboard, Play } from 'lucide-react';
import { Config, Filters, ViewType } from '@/lib/types';
import { PROJECT_REFS } from '@/lib/constants';
import { useEnvironment } from '@/hooks/use-environment';
import { SDK_ENABLED, resetClients } from '@/lib/sdk';
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
  fetchConfigsForProject,
  createConfig,
  updateConfig,
  deleteConfig,
  toggleConfigStatus,
} from '@/services/config.service';

const Index = () => {
  const { environment, projects } = useEnvironment();
  const [configs, setConfigs] = useState<Config[]>(getInitialConfigs);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard');
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: '', project: 'ALL', type: 'ALL' });
  const prevEnvRef = useRef(environment?.id);

  // Re-fetch data when environment changes
  useEffect(() => {
    if (environment?.id && prevEnvRef.current !== environment.id) {
      prevEnvRef.current = environment.id;
      resetClients();
      setConfigs(getInitialConfigs());
      setSelectedProject(null);
      setSelectedConfigId(null);
      setFilters({ search: '', project: 'ALL', type: 'ALL' });
      setView('dashboard');
    }
  }, [environment?.id]);

  useEffect(() => {
    if (SDK_ENABLED && selectedProject) {
      const load = async () => {
        setConfigsLoading(true);
        try {
          const data = await fetchConfigsForProject(selectedProject);
          setConfigs(data);
        } finally {
          setConfigsLoading(false);
        }
      };
      load();
    }
  }, [selectedProject]);

  const availableProjects = useMemo(() => {
    const fromConfigs = [...new Set(configs.map(c => c.project_reference))];
    const sdkProjects = projects.map(p => p.reference);
    const all = [...new Set([...fromConfigs, ...(SDK_ENABLED ? sdkProjects : PROJECT_REFS)])];
    return all.sort();
  }, [configs, projects]);

  const filteredConfigs = useMemo(() => {
    if (!selectedProject || configsLoading) return [];
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
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-background relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
          
          <div className="relative text-center space-y-8 max-w-md w-full">
            <div className="space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-20 h-20 bg-card border border-border rounded-3xl flex items-center justify-center shadow-xl">
                  <FolderOpen size={40} strokeWidth={1.5} className="text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold tracking-tight text-foreground">
                  Select your workspace
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Choose a project to manage its feature flags and configurations in <strong>{environment?.label}</strong>.
                </p>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-md border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <Select onValueChange={handleProjectChange}>
                <SelectTrigger className="w-full h-12 bg-background border-border hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Search or select a project…" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableProjects.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                      No Projects Found
                    </div>
                  ) : availableProjects.map(p => (
                    <SelectItem key={p} value={p} className="h-10 text-sm focus:bg-primary/10">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold text-center">
                Project environment: {environment?.region}
              </p>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-4">
               <div className="p-4 bg-muted/30 border border-border/50 rounded-xl text-left space-y-1">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Integration</p>
                 <p className="text-xs font-semibold text-foreground">SDK Connected</p>
               </div>
               <div className="p-4 bg-muted/30 border border-border/50 rounded-xl text-left space-y-1">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase">Status</p>
                 <p className="text-xs font-semibold text-foreground">All Systems GO</p>
               </div>
            </div>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="flex-1 flex flex-col min-h-0 bg-background/50">
          {/* Dashboard Header */}
          <div className="px-8 py-8 border-b border-border bg-card/30 backdrop-blur-sm">
            <div className="flex justify-between items-start gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Configurations
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                    Active
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Manage and monitor feature flags for{' '}
                  <span className="font-semibold text-foreground inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/50 border border-border">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {selectedProject}
                  </span>
                  {' · '}
                  <button 
                    onClick={() => setSelectedProject(null)} 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Switch Project
                  </button>
                </p>
              </div>
              <button
                onClick={() => { setSelectedConfigId(null); setView('edit'); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                <Plus size={18} strokeWidth={2.5} /> 
                <span>Create Configuration</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                { label: 'Total Configurations', value: configs.length, icon: ToggleRight, color: 'text-blue-500' },
                { label: 'Active Flags', value: configs.filter(c => c.is_active).length, icon: LayoutDashboard, color: 'text-green-500' },
                { label: 'Project Health', value: '100%', icon: Play, color: 'text-primary' },
              ].map((stat, i) => (
                <div key={i} className="bg-card/50 border border-border/50 p-4 rounded-xl flex items-center gap-4 hover:bg-accent/10 transition-colors">
                  <div className={`p-2.5 rounded-lg bg-background border border-border shadow-inner ${stat.color}`}>
                    <stat.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground tracking-tight">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div className="space-y-8 h-full flex flex-col">
              <ConfigList
                configs={filteredConfigs}
                filters={filters}
                onFilter={setFilters}
                onSelect={(c) => { setSelectedConfigId(c.id!); setView('edit'); }}
                onToggleStatus={handleToggleStatus}
                isLoading={configsLoading}
              />
            </div>
          </div>
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
