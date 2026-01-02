import React, { useState } from 'react';
import { Cpu, ChevronDown, Settings2, MoreHorizontal, Sparkles } from 'lucide-react';
import type { Settings, STYLE_PRESETS } from '../../lib/settings.js';
import { STYLE_PRESETS as stylePresets } from '../../lib/settings.js';
import type { LLMSettings, OpenRouterModel } from '../../lib/types.js';
import type { StylePreference } from '../../lib/prompt-manager.js';

interface IntelligenceSectionProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  models: { id: string, name: string }[];
  allModels?: OpenRouterModel[];
  onBrowseModels?: (context: 'explain' | 'factCheck') => void;
}

const ModelSettings: React.FC<{
  label: string;
  modelId: string;
  llmSettings: LLMSettings;
  models: { id: string, name: string }[];
  onModelChange: (id: string) => void;
  onSettingsChange: (s: LLMSettings) => void;
  onBrowseMore?: (() => void) | undefined;
  hasMoreModels?: boolean | undefined;
}> = ({ label, modelId, llmSettings, models, onModelChange, onSettingsChange, onBrowseMore, hasMoreModels }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check if current model is in the default list
  const currentModelInList = models.some(m => m.id === modelId);
  const displayModels = currentModelInList 
    ? models 
    : [...models, { id: modelId, name: modelId.split('/').pop()?.replace(':free', '') || modelId }];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={`${label}-model`} className="text-xs font-medium opacity-70">{label} Model</label>
        <div className="relative">
          <select
            id={`${label}-model`}
            className="w-full appearance-none px-3 py-2.5 bg-transparent border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 border-slate-200 text-slate-900 dark:border-slate-600 dark:text-white transition-colors"
            value={modelId}
            onChange={(e) => onModelChange(e.target.value)}
          >
            {displayModels.map((m) => (
              <option key={m.id} value={m.id} className="bg-white dark:bg-slate-800">{m.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-50">
            <ChevronDown size={14} />
          </div>
        </div>
        {hasMoreModels && onBrowseMore && (
          <button
            type="button"
            onClick={onBrowseMore}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded-lg transition-colors"
          >
            <MoreHorizontal size={12} />
            Browse all models
          </button>
        )}
      </div>

      <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={12} />
            Advanced
          </div>
          <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor={`${label}-temp`} className="text-[10px] font-medium opacity-70 uppercase tracking-tight">Temperature</label>
                <span className="text-[10px] font-mono opacity-50">{llmSettings.temperature}</span>
              </div>
              <input 
                id={`${label}-temp`}
                type="range"
                min="0"
                max="2"
                step="0.1"
                className="w-full accent-accent-500 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                value={llmSettings.temperature}
                onChange={(e) => onSettingsChange({ ...llmSettings, temperature: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor={`${label}-tokens`} className="text-[10px] font-medium opacity-70 uppercase tracking-tight">Max Tokens</label>
                <span className="text-[10px] font-mono opacity-50">{llmSettings.max_tokens}</span>
              </div>
              <input 
                id={`${label}-tokens`}
                type="range"
                min="64"
                max="4096"
                step="64"
                className="w-full accent-accent-500 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                value={llmSettings.max_tokens}
                onChange={(e) => onSettingsChange({ ...llmSettings, max_tokens: parseInt(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const IntelligenceSection: React.FC<IntelligenceSectionProps> = ({
  settings,
  onSave,
  models,
  allModels,
  onBrowseModels
}) => {
  const hasMoreModels = allModels && allModels.length > models.length;

  return (
    <div className="p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 opacity-50">
          <Cpu size={14} />
          <h2 className="text-[10px] font-bold uppercase tracking-wider">Intelligence</h2>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
          <Sparkles size={12} className="text-accent-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Style</span>
          <div className="relative">
            <select
              className="appearance-none bg-transparent pr-5 text-[10px] font-bold focus:outline-none cursor-pointer text-accent-600 dark:text-accent-400"
              value={settings.stylePreference}
              onChange={(e) => {
                const newStyle = e.target.value as StylePreference;
                const preset = stylePresets[newStyle];
                onSave({ 
                  ...settings, 
                  stylePreference: newStyle,
                  explainSettings: { ...settings.explainSettings, ...preset },
                  factCheckSettings: { ...settings.factCheckSettings, ...preset },
                });
              }}
            >
              <option value="Concise">Concise</option>
              <option value="Detailed">Detailed</option>
            </select>
            <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ModelSettings 
          label="Explain"
          modelId={settings.explainModel}
          llmSettings={settings.explainSettings}
          models={models}
          onModelChange={(id) => onSave({ ...settings, explainModel: id })}
          onSettingsChange={(s) => onSave({ ...settings, explainSettings: s })}
          onBrowseMore={onBrowseModels ? () => onBrowseModels('explain') : undefined}
          hasMoreModels={hasMoreModels}
        />
        
        <ModelSettings 
          label="Fact-Check"
          modelId={settings.factCheckModel}
          llmSettings={settings.factCheckSettings}
          models={models}
          onModelChange={(id) => onSave({ ...settings, factCheckModel: id })}
          onSettingsChange={(s) => onSave({ ...settings, factCheckSettings: s })}
          onBrowseMore={onBrowseModels ? () => onBrowseModels('factCheck') : undefined}
          hasMoreModels={hasMoreModels}
        />
      </div>
    </div>
  );
};