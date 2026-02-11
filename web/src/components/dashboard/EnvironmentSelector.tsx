import React from 'react';
import { Globe } from 'lucide-react';
import { useEnvironment } from '@/hooks/use-environment';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EnvironmentSelector: React.FC = () => {
  const { environment, environments, setEnvironment } = useEnvironment();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-sidebar-fg/60 px-1">
        <Globe size={14} />
        <span>Environment</span>
      </div>
      <Select value={environment.id} onValueChange={setEnvironment}>
        <SelectTrigger className="w-full bg-sidebar-hover border-sidebar-border text-sidebar-fg-active text-xs h-9 focus:ring-sidebar-accent-color">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {environments.map(env => (
            <SelectItem key={env.id} value={env.id} className="text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{env.label}</span>
                <span className="text-muted-foreground text-[10px]">{env.region}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnvironmentSelector;
