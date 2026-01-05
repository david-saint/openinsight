import React from 'react';
import { Palette } from 'lucide-react';
import type { Settings } from '../../lib/settings.js';
import { TabReorderList } from './TabReorderList.js';

interface AppearanceSectionProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  themeColors: Record<string, { name: string; ring: string; bg: string }>;
}

const ALL_TABS = [
  { id: 'explain', label: 'Explain' },
  { id: 'fact-check', label: 'Fact-check' },
];

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  settings,
  onSave,
  themeColors
}) => {
  return (
    <div className="p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 mb-6 opacity-50">
        <Palette size={14} />
        <h2 className="text-[10px] font-bold uppercase tracking-wider">Appearance</h2>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium opacity-90">Theme Mode</span>
          <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-900 transition-colors">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onSave({ ...settings, theme: mode })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  settings.theme === mode
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium opacity-90">Accent Color</span>
          <div className="flex gap-3">
            {Object.entries(themeColors).map(([id, color]) => (
              <button
                key={id}
                onClick={() => onSave({ ...settings, accentColor: id as any })}
                className={`w-6 h-6 rounded-full transition-all ring-offset-2 ${color.bg} ring-offset-white dark:ring-offset-slate-800 ${
                  settings.accentColor === id 
                    ? `ring-2 ${color.ring} scale-110` 
                    : 'hover:scale-110 opacity-70 hover:opacity-100'
                }`}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium opacity-90">Popover Tabs</span>
          </div>
          <TabReorderList 
            enabledTabs={settings.enabledTabs}
            onSave={(newTabs) => onSave({ ...settings, enabledTabs: newTabs })}
            allTabs={ALL_TABS}
          />
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Drag (coming soon) or use arrows to reorder. Toggle to show/hide.
          </p>
        </div>
      </div>
    </div>
  );
};
