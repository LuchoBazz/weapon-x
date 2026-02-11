import React from 'react';
import { LayoutDashboard, Play, Settings, ToggleRight, Sun, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ViewType } from '@/lib/types';
import { useTheme } from '@/hooks/use-theme';
import { logout } from '@/lib/auth';
import EnvironmentSelector from '@/components/dashboard/EnvironmentSelector';

interface SidebarProps {
  view: ViewType;
  onViewChange: (v: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, onViewChange }) => {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-fg flex flex-col shadow-xl shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sidebar-fg-active text-lg">
            <ToggleRight className="text-sidebar-accent" />
            <span>Weapon-X</span>
          </div>
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-sidebar-fg hover:text-sidebar-fg-active hover:bg-sidebar-hover transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
      <div className="p-4 border-b border-sidebar-border">
        <EnvironmentSelector />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
            view === 'dashboard' || view === 'edit'
              ? 'bg-sidebar-active text-sidebar-fg-active shadow-md'
              : 'hover:bg-sidebar-hover text-sidebar-fg'
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </button>
        <button
          onClick={() => onViewChange('simulate')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
            view === 'simulate'
              ? 'bg-sidebar-active text-sidebar-fg-active shadow-md'
              : 'hover:bg-sidebar-hover text-sidebar-fg'
          }`}
        >
          <Play size={20} />
          <span>Simulator</span>
        </button>
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm text-sidebar-fg hover:text-destructive hover:bg-sidebar-hover transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm text-sidebar-fg hover:text-sidebar-fg-active hover:bg-sidebar-hover transition-colors">
          <Settings size={18} />
          <span>Admin Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
