import React from 'react';
import { Sparkles } from 'lucide-react';
import { Position } from '../positioning';

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
      className="z-[9999] flex items-center justify-center p-2 rounded-lg bg-white shadow-lg border border-slate-200 hover:bg-slate-50 transition-all transform hover:scale-110 active:scale-95 group"
      aria-label="Analyze with OpenInsight"
    >
      <Sparkles className="w-4 h-4 text-slate-700 group-hover:text-teal-500 transition-colors" />
    </button>
  );
};
