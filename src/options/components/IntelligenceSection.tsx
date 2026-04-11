import React, { useState } from 'react';
import { Cpu, ChevronDown, Settings2, MoreHorizontal, Sparkles } from 'lucide-react';
import type { Settings, STYLE_PRESETS } from '../../lib/settings.js';
import { STYLE_PRESETS as stylePresets } from '../../lib/settings.js';
import type { LLMSettings, OpenRouterModel } from '../../lib/types.js';
import type { StylePreference } from '../../lib/prompt-manager.js';
import { ModelManager } from '../../lib/model-manager.js';

interface IntelligenceSectionProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  models: { id: string, name: string }[];
  allModels?: OpenRouterModel[];
  onBrowseModels?: (context: 'explain' | 'factCheck' | 'areaCapture') => void;
}

const ModelSettings: React.FC<{
  idPrefix: string;
  label: string;
  modelId: string;
  llmSettings: LLMSettings;
  models: { id: string, name: string }[];
  onModelChange: (id: string) => void;
  onSettingsChange: (s: LLMSettings) => void;
  onBrowseMore?: (() => void) | undefined;
  hasMoreModels?: boolean | undefined;
}> = ({ idPrefix, label, modelId, llmSettings, models, onModelChange, onSettingsChange, onBrowseMore, hasMoreModels }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Check if current model is in the default list
  const currentModelInList = models.some(m => m.id === modelId);
  const displayModels = currentModelInList 
    ? models 
    : [...models, { id: modelId, name: modelId.split('/').pop()?.replace(':free', '') || modelId }];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label htmlFor={`${idPrefix}-model`} className="text-sm font-medium opacity-90">{label} Model</label>
        
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-56">
            <select
              id={`${idPrefix}-model`}
              className="w-full appearance-none px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-none rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent-500 text-slate-900 dark:text-white transition-colors"
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
              title="Browse all models"
              aria-label="Browse all models"
              className="flex items-center justify-center p-1.5 text-accent-600 dark:text-accent-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <MoreHorizontal size={14} />
            </button>
          )}

          <button 
            onClick={() => setIsOpen(!isOpen)}
            title="Advanced Settings"
            aria-label="Advanced Settings"
            aria-expanded={isOpen}
            className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
              isOpen 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor={`${idPrefix}-temp`} className="text-xs font-medium opacity-70 whitespace-nowrap">Temperature</label>
            <div className="flex items-center gap-3 flex-1 max-w-[200px]">
              <input 
                id={`${idPrefix}-temp`}
                type="range"
                min="0"
                max="2"
                step="0.1"
                className="w-full accent-accent-500 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                value={llmSettings.temperature}
                onChange={(e) => onSettingsChange({ ...llmSettings, temperature: parseFloat(e.target.value) })}
              />
              <span className="text-[10px] font-mono opacity-50 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded w-8 text-center">{llmSettings.temperature}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label htmlFor={`${idPrefix}-tokens`} className="text-xs font-medium opacity-70 whitespace-nowrap">Max Tokens</label>
            <div className="flex items-center gap-3 flex-1 max-w-[200px]">
              <input 
                id={`${idPrefix}-tokens`}
                type="range"
                min="64"
                max="4096"
                step="64"
                className="w-full accent-accent-500 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                value={llmSettings.max_tokens}
                onChange={(e) => onSettingsChange({ ...llmSettings, max_tokens: parseInt(e.target.value) })}
              />
              <span className="text-[10px] font-mono opacity-50 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded w-8 text-center">{llmSettings.max_tokens}</span>
            </div>
          </div>
        </div>
      )}
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
  const defaultImageCapableModels = models.filter((model) => /gemini|vision|vl|gpt-4o/i.test(model.id));
  const areaCaptureHasMoreModels = !!allModels
    && ModelManager.filterImageInputModels(allModels).length > defaultImageCapableModels.length;

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
                  areaCaptureSettings: { ...settings.areaCaptureSettings, ...preset },
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

      <div className="space-y-6">
        <ModelSettings 
          idPrefix="explain"
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
          idPrefix="fact-check"
          label="Fact-Check"
          modelId={settings.factCheckModel}
          llmSettings={settings.factCheckSettings}
          models={models}
          onModelChange={(id) => onSave({ ...settings, factCheckModel: id })}
          onSettingsChange={(s) => onSave({ ...settings, factCheckSettings: s })}
          onBrowseMore={onBrowseModels ? () => onBrowseModels('factCheck') : undefined}
          hasMoreModels={hasMoreModels}
        />

        <ModelSettings 
          idPrefix="area-capture"
          label="Area Capture"
          modelId={settings.areaCaptureModel}
          llmSettings={settings.areaCaptureSettings}
          models={defaultImageCapableModels}
          onModelChange={(id) => onSave({ ...settings, areaCaptureModel: id })}
          onSettingsChange={(s) => onSave({ ...settings, areaCaptureSettings: s })}
          onBrowseMore={onBrowseModels ? () => onBrowseModels('areaCapture') : undefined}
          hasMoreModels={areaCaptureHasMoreModels}
        />
      </div>
    </div>
  );
};
