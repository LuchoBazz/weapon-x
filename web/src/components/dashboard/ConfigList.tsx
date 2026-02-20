import React, { useState } from 'react';
import { Search, Lock } from 'lucide-react';
import { Config, Filters } from '@/lib/types';
import StatusBadge from './StatusBadge';
import ToggleSwitch from './ToggleSwitch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfigListProps {
  configs: Config[];
  filters: Filters;
  onFilter: (f: Filters) => void;
  onSelect: (c: Config) => void;
  onToggleStatus: (id: string) => void;
  isLoading?: boolean;
}

const ConfigList: React.FC<ConfigListProps> = ({ configs, filters, onFilter, onSelect, onToggleStatus, isLoading }) => {
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const handleToggle = (config: Config) => {
    if (config.is_active) {
      setDeactivateId(config.id!);
    } else {
      onToggleStatus(config.id!);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search keys..."
            className="pl-10 w-full px-3 py-2 border border-input rounded-md text-sm bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none"
            value={filters.search}
            onChange={(e) => onFilter({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            className="px-3 py-2 border border-input rounded-md text-sm bg-card text-foreground focus:ring-2 focus:ring-ring"
            value={filters.type}
            onChange={(e) => onFilter({ ...filters, type: e.target.value })}
          >
            <option value="ALL">All Types</option>
            <option value="BOOLEAN">Boolean</option>
            <option value="JSON">JSON Config</option>
            <option value="STRING">String</option>
            <option value="SECRET">Secret</option>
          </select>
        </div>
      </div>

      {/* Table / Empty State Container */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto overflow-y-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-accent/30 sticky top-0 backdrop-blur-md z-10 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold text-foreground/80 uppercase tracking-widest text-[10px]">Key / Description</th>
                  <th className="px-6 py-4 font-bold text-foreground/80 uppercase tracking-widest text-[10px]">Project</th>
                  <th className="px-6 py-4 font-bold text-foreground/80 uppercase tracking-widest text-[10px]">Type</th>
                  <th className="px-6 py-4 font-bold text-foreground/80 uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold text-foreground/80 uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="h-4 bg-muted-foreground/10 rounded w-48 mb-2" />
                        <div className="h-3 bg-muted-foreground/5 rounded w-32" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-4 bg-muted-foreground/10 rounded w-20" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-6 bg-muted-foreground/10 rounded-full w-24" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-5 bg-muted-foreground/10 rounded-full w-10" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-8 bg-muted-foreground/10 rounded w-16 float-right" />
                      </td>
                    </tr>
                  ))
                ) : configs.map(config => (
                  <tr key={config.id} className="hover:bg-accent/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground font-mono tracking-tight group-hover:text-primary transition-colors">
                          {config.key}
                        </span>
                        <span className="text-muted-foreground text-xs mt-1 line-clamp-1 max-w-md italic">
                          {config.description || 'No description provided'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 uppercase tracking-tighter text-[11px] font-medium text-muted-foreground">
                      {config.project_reference}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge color={config.type === 'BOOLEAN' ? 'purple' : config.type === 'STRING' ? 'green' : config.type === 'SECRET' ? 'yellow' : 'blue'}>
                        {config.type === 'SECRET' && <Lock size={10} className="inline mr-1 -mt-0.5 whitespace-nowrap" />}
                        {config.type}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-5">
                      <ToggleSwitch checked={config.is_active} onChange={() => handleToggle(config)} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => onSelect(config)}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold bg-transparent text-foreground border border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-200"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && configs.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-accent/5">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative w-20 h-20 bg-card border border-border rounded-2xl flex items-center justify-center shadow-2xl rotate-3 transform transition-transform hover:rotate-0">
                  <Lock className="text-primary" size={32} strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No configurations found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm leading-relaxed">
                Connect your first feature flag or adjust your search filters to see results. 
                Start optimizing your release cycle today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-[11px] font-medium text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  SDK Integration Active
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-[11px] font-medium text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Project Connected
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deactivateId} onOpenChange={(open) => { if (!open) setDeactivateId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set the configuration to inactive. Users will receive the default value until it is re-enabled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deactivateId) { onToggleStatus(deactivateId); setDeactivateId(null); } }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConfigList;
