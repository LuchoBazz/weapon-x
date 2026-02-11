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
}

const ConfigList: React.FC<ConfigListProps> = ({ configs, filters, onFilter, onSelect, onToggleStatus }) => {
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

      {/* Table */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-accent border-b border-border">
            <tr>
              <th className="px-6 py-3 font-semibold text-foreground">Key / Description</th>
              <th className="px-6 py-3 font-semibold text-foreground">Project</th>
              <th className="px-6 py-3 font-semibold text-foreground">Type</th>
              <th className="px-6 py-3 font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 font-semibold text-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {configs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No configurations found matching your filters.
                </td>
              </tr>
            ) : configs.map(config => (
              <tr key={config.id} className="hover:bg-accent/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground font-mono">{config.key}</span>
                    <span className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{config.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge color="gray">{config.project_reference}</StatusBadge>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge color={config.type === 'BOOLEAN' ? 'purple' : config.type === 'STRING' ? 'green' : config.type === 'SECRET' ? 'yellow' : 'blue'}>
                    {config.type === 'SECRET' && <Lock size={10} className="inline mr-1 -mt-0.5" />}
                    {config.type}
                  </StatusBadge>
                </td>
                <td className="px-6 py-4">
                  <ToggleSwitch checked={config.is_active} onChange={() => handleToggle(config)} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSelect(config)}
                    className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-card text-foreground border border-input hover:bg-accent transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
