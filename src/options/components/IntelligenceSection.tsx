import React from 'react';
import { Cpu, ChevronDown } from 'lucide-react';
import type { Settings } from '../../lib/settings.js';

interface IntelligenceSectionProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  models: { id: string, name: string }[];
}

export const IntelligenceSection: React.FC<IntelligenceSectionProps> = ({
  settings,
  onSave,
  models
}) => {
  return (
    <div className="p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 mb-6 opacity-50">
        <Cpu size={14} />
        <h2 className="text-[10px] font-bold uppercase tracking-wider">Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="explain-model" className="text-xs font-medium opacity-70">Explain Model</label>
          <div className="relative">
            <select
              id="explain-model"
              className="w-full appearance-none px-3 py-2.5 bg-transparent border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 border-slate-200 text-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              value={settings.explainModel}
              onChange={(e) => onSave({ ...settings, explainModel: e.target.value })}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-800">{m.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-50">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="fact-check-model" className="text-xs font-medium opacity-70">Fact-Check Model</label>
          <div className="relative">
            <select
              id="fact-check-model"
              className="w-full appearance-none px-3 py-2.5 bg-transparent border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 border-slate-200 text-slate-900 dark:border-slate-600 dark:text-white transition-colors"
              value={settings.factCheckModel}
              onChange={(e) => onSave({ ...settings, factCheckModel: e.target.value })}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-slate-800">{m.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-50">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
