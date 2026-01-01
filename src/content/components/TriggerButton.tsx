import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Position } from '../positioning.js';

interface TriggerButtonProps {
  position: Position;
  onTrigger: () => void;
}

export const TriggerButton: React.FC<TriggerButtonProps> = ({ position, onTrigger }) => {
  return (
    <button
      onClick={onTrigger}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        position: 'absolute',
      }}
      className="z-[9999] flex items-center justify-center p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-110 active:scale-95 group"
      aria-label="Analyze with OpenInsight"
    >
      <Sparkles className="w-4 h-4 text-slate-700 dark:text-slate-200 group-hover:text-accent-500 transition-colors" />
    </button>
  );
};
