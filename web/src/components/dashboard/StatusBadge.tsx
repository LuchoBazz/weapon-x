import React from 'react';

interface StatusBadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ children, color = 'blue' }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-badge-blue-bg text-badge-blue-fg border-badge-blue-border',
    green: 'bg-badge-green-bg text-badge-green-fg border-badge-green-border',
    yellow: 'bg-badge-yellow-bg text-badge-yellow-fg border-badge-yellow-border',
    red: 'bg-badge-red-bg text-badge-red-fg border-badge-red-border',
    purple: 'bg-badge-purple-bg text-badge-purple-fg border-badge-purple-border',
    gray: 'bg-badge-gray-bg text-badge-gray-fg border-badge-gray-border',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorMap[color]}`}>
      {children}
    </span>
  );
};

export default StatusBadge;
