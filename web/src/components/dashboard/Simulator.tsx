import React, { useState, useMemo } from 'react';
import { Play, CheckCircle2, Box, FolderOpen, Search, Lock, Eye, EyeOff } from 'lucide-react';
import { Config, EvaluationResult } from '@/lib/types';
import { evaluateConfigs } from '@/services/config.service';
import { PROJECT_REFS } from '@/lib/constants';
import StatusBadge from './StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SimulatorProps {
  configs: Config[];
}

const Simulator: React.FC<SimulatorProps> = ({ configs }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState(`{
  "client_id": "VIP_01",
  "country": "CO",
  "email": "user@example.com",
  "device": "iOS"
}`);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, EvaluationResult> | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyFilter, setKeyFilter] = useState('');
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  const projectConfigs = useMemo(
    () => (selectedProject ? configs.filter(c => c.project_reference === selectedProject) : []),
    [configs, selectedProject]
  );

  const handleProjectChange = (project: string | null) => {
    setSelectedProject(project);
    setSelectedKeys([]);
    setResults(null);
  };

  const toggleKey = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setResults(null);

    try {
      const context = JSON.parse(contextInput);
      const output = await evaluateConfigs(projectConfigs, context, selectedKeys);
      setResults(output);
    } catch (e: unknown) {
      alert("Evaluation error: " + (e as Error).message);
    }
    setLoading(false);
  };

  // Derive available projects from actual configs
  const availableProjects = useMemo(() => {
    const fromConfigs = [...new Set(configs.map(c => c.project_reference))];
    const all = [...new Set([...fromConfigs, ...PROJECT_REFS])];
    return all.sort();
  }, [configs]);

  if (!selectedProject) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="bg-card border-b border-border px-6 py-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Play size={24} className="text-primary" /> Evaluation Simulator
          </h2>
          <p className="text-sm text-muted-foreground">Select a project to begin simulation.</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-sm">
            <FolderOpen size={56} strokeWidth={1} className="mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Choose a Project</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pick a project to load its configurations for testing.
              </p>
            </div>
            <Select onValueChange={handleProjectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project…" />
              </SelectTrigger>
              <SelectContent>
                {availableProjects.map(p => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Play size={24} className="text-primary" /> Evaluation Simulator
          </h2>
          <p className="text-sm text-muted-foreground">
            Project: <span className="font-mono text-foreground">{selectedProject}</span>
            {' · '}
            <button onClick={() => handleProjectChange(null)} className="text-primary hover:underline">
              Change
            </button>
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{projectConfigs.length} config(s)</span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Controls */}
        <div className="w-full md:w-1/3 border-r border-border bg-card p-6 overflow-y-auto flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Evaluation Context (JSON)</label>
            <textarea
              className="w-full h-48 font-mono text-xs p-3 border border-input rounded bg-surface-code text-foreground focus:ring-2 focus:ring-ring"
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium text-foreground">
              Target Keys <span className="text-muted-foreground font-normal">(Select none for all)</span>
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter keys…"
                value={keyFilter}
                onChange={(e) => setKeyFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-input rounded-md bg-card text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="border border-border rounded-md max-h-60 overflow-y-auto">
              {projectConfigs.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground text-center">No configs in this project.</p>
              ) : (
                (() => {
                  const filtered = projectConfigs
                    .filter(c => c.key.toLowerCase().includes(keyFilter.toLowerCase()))
                    .sort((a, b) => {
                      const aSelected = selectedKeys.includes(a.key);
                      const bSelected = selectedKeys.includes(b.key);
                      if (aSelected !== bSelected) return aSelected ? -1 : 1;
                      return a.key.localeCompare(b.key);
                    });
                  return filtered.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground text-center">No keys match "{keyFilter}"</p>
                  ) : (
                    filtered.map(c => (
                      <div
                        key={c.id}
                        onClick={() => toggleKey(c.key)}
                        className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer hover:bg-accent transition-colors ${
                          selectedKeys.includes(c.key) ? 'bg-accent text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        <span className="font-mono">{c.key}</span>
                        {selectedKeys.includes(c.key) && <CheckCircle2 size={14} />}
                      </div>
                    ))
                  );
                })()
              )}
            </div>
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading || projectConfigs.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors disabled:opacity-40"
          >
            {loading ? 'Evaluating...' : 'Run Simulation'}
          </button>
        </div>

        {/* Output */}
        <div className="flex-1 bg-background p-6 overflow-y-auto">
          {!results ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Box size={48} strokeWidth={1} className="mb-4" />
              <p>Run a simulation to see results here.</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-wide">
                <span>Results</span>
                <span>{Object.keys(results).length} Flags Evaluated</span>
              </div>

              {Object.entries(results).map(([key, res]) => {
                const configForKey = projectConfigs.find(c => c.key === key);
                const isSecret = configForKey?.type === 'SECRET';
                const isRevealed = revealedSecrets[key];

                return (
                <div key={key} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <div>
                      <h4 className="font-mono font-medium text-primary flex items-center gap-2">
                        {isSecret && <Lock size={14} className="text-muted-foreground" />}
                        {key}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge color={res.reason === 'MATCH' ? 'green' : res.reason === 'DISABLED' ? 'red' : 'yellow'}>
                          {res.reason}
                        </StatusBadge>
                        <span className="text-xs text-muted-foreground">Rule: {res.rule_id}</span>
                      </div>
                    </div>
                    {isSecret && (
                      <button
                        onClick={() => setRevealedSecrets(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title={isRevealed ? 'Hide secret' : 'Reveal secret'}
                      >
                        {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  <div className="bg-surface-code p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-foreground">
                      {isSecret && !isRevealed ? '••••••••••••••••' : JSON.stringify(res.value, null, 2)}
                    </pre>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulator;
