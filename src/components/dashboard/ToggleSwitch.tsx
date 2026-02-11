import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, size = 'md' }) => {
  const dims = size === 'sm'
    ? { track: 'h-5 w-9', thumb: 'h-3 w-3', on: 'translate-x-5', off: 'translate-x-1' }
    : { track: 'h-6 w-11', thumb: 'h-4 w-4', on: 'translate-x-6', off: 'translate-x-1' };

  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex ${dims.track} items-center rounded-full transition-colors ${checked ? 'bg-toggle-active' : 'bg-toggle-inactive'}`}
    >
      <span className={`inline-block ${dims.thumb} transform rounded-full bg-primary-foreground transition-transform ${checked ? dims.on : dims.off}`} />
    </button>
  );
};

export default ToggleSwitch;
