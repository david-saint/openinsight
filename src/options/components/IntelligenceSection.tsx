import React, { useState } from 'react';
import { Cpu, ChevronDown, Settings2 } from 'lucide-react';
import type { Settings } from '../../lib/settings.js';
import type { LLMSettings } from '../../lib/types.js';

interface IntelligenceSectionProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  models: { id: string, name: string }[];
}

const ModelSettings: React.FC<{
  label: string;
  modelId: string;
  llmSettings: LLMSettings;
  models: { id: string, name: string }[];
  onModelChange: (id: string) => void;
  onSettingsChange: (s: LLMSettings) => void;
}> = ({ label, modelId, llmSettings, models, onModelChange, onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);

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
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-white dark:bg-slate-800">{m.name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-50">
            <ChevronDown size={14} />
          </div>
        </div>
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

            <div className="space-y-2">
              <label htmlFor={`${label}-prompt`} className="text-[10px] font-medium opacity-70 uppercase tracking-tight">System Prompt</label>
              <textarea 
                id={`${label}-prompt`}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 resize-none h-20 transition-colors"
                value={llmSettings.system_prompt}
                onChange={(e) => onSettingsChange({ ...llmSettings, system_prompt: e.target.value })}
                placeholder="Enter system prompt..."
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
  models
}) => {
  return (
    <div className="p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-2 mb-6 opacity-50">
        <Cpu size={14} />
        <h2 className="text-[10px] font-bold uppercase tracking-wider">Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ModelSettings 
          label="Explain"
          modelId={settings.explainModel}
          llmSettings={settings.explainSettings}
          models={models}
          onModelChange={(id) => onSave({ ...settings, explainModel: id })}
          onSettingsChange={(s) => onSave({ ...settings, explainSettings: s })}
        />
        
        <ModelSettings 
          label="Fact-Check"
          modelId={settings.factCheckModel}
          llmSettings={settings.factCheckSettings}
          models={models}
          onModelChange={(id) => onSave({ ...settings, factCheckModel: id })}
          onSettingsChange={(s) => onSave({ ...settings, factCheckSettings: s })}
        />
      </div>
    </div>
  );
};