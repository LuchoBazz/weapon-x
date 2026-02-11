import React, { useState, useEffect, useRef } from 'react';

interface ProgressBarProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  colorClass?: string;
  onChange?: (value: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  size = 'md',
  colorClass = 'bg-primary',
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const percentage = Math.min(100, Math.max(0, value));
  const isInteractive = !!onChange;

  const heights = { sm: 'h-2', md: 'h-4', lg: 'h-6' };
  const heightClass = heights[size] || heights.md;

  const calculateValue = (clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.round(Math.min(100, Math.max(0, (x / rect.width) * 100)));
  };

  const handleStart = (clientX: number) => {
    if (!isInteractive) return;
    setIsDragging(true);
    onChange?.(calculateValue(clientX));
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      onChange?.(calculateValue(clientX));
    };
    const handleEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, onChange]);

  return (
    <div
      className={`w-full select-none py-2 ${isInteractive ? 'cursor-pointer' : ''}`}
      onMouseDown={(e) => handleStart(e.clientX)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
    >
      <div
        ref={containerRef}
        className={`w-full bg-secondary rounded-full ${heightClass} relative overflow-hidden`}
      >
        <div
          className={`${colorClass} rounded-full h-full ${isDragging ? 'duration-0' : 'transition-all duration-300 ease-out'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
