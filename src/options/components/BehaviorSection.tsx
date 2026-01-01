import React from 'react';
import { Zap } from 'lucide-react';
import type { Settings } from '../../lib/settings.js';

interface BehaviorSectionProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

export const BehaviorSection: React.FC<BehaviorSectionProps> = ({
  settings,
  onSave
}) => {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6 opacity-50">
        <Zap size={14} />
        <h2 className="text-[10px] font-bold uppercase tracking-wider">Behavior</h2>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="block text-sm font-medium opacity-90 mb-1">Trigger Action</span>
          <span className="text-[10px] text-slate-400">
            {settings.triggerMode === 'icon' 
              ? 'Show icon when text is selected' 
              : 'Open immediately on selection'}
          </span>
        </div>
        
        <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-900 transition-colors">
          <button
            onClick={() => onSave({ ...settings, triggerMode: 'icon' })}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              settings.triggerMode === 'icon'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Icon
          </button>
          <button
            onClick={() => onSave({ ...settings, triggerMode: 'immediate' })}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              settings.triggerMode === 'immediate'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Immediate
          </button>
        </div>
      </div>
    </div>
  );
};
