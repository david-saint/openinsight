import React from 'react';
import type { Position } from '../positioning.js';

interface TriggerButtonProps {
  position: Position;
  onTrigger: () => void;
}

export const TriggerButton = React.memo(({ position, onTrigger }: TriggerButtonProps) => {
  return (
    <button
      onClick={onTrigger}
      data-testid="trigger-button"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        position: 'absolute',
      }}
      className="z-[9999] flex items-center justify-center p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all transform hover:scale-110 active:scale-95 group"
      aria-label="Analyze with OpenInsight"
    >
      <img
        src="data:image/png;base64,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"
        className="w-[16px] h-[16px]"
      />
    </button>
  );
});

TriggerButton.displayName = 'TriggerButton';
