import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, getApiKey, saveApiKey, DEFAULT_SETTINGS } from '../lib/settings.js';
import type { Settings } from '../lib/settings.js';
import { THEME_COLORS, MODELS } from './constants.js';
import { BackendClient } from '../lib/backend-client.js';
import type { AppError, OpenRouterModel } from '../lib/types.js';

// Components
import { Header } from './components/Header.js';
import { APIKeySection } from './components/APIKeySection.js';
import { IntelligenceSection } from './components/IntelligenceSection.js';
import { AppearanceSection } from './components/AppearanceSection.js';
import { BehaviorSection } from './components/BehaviorSection.js';
import { Footer } from './components/Footer.js';
import { Toast } from './components/Toast.js';
import { ModelSelectorModal } from './components/ModelSelectorModal.js';

const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // API Key Testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Model selector modal state
  const [allModels, setAllModels] = useState<OpenRouterModel[]>([]);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelModalContext, setModelModalContext] = useState<'explain' | 'factCheck'>('explain');

  useEffect(() => {
    const load = async () => {
      try {
        const [s, k] = await Promise.all([getSettings(), getApiKey()]);
        setSettings(s);
        setApiKey(k || '');
      } catch (e) {
        console.error('Error loading settings:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Fetch all models on mount (non-blocking)
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await BackendClient.fetchModels();
        setAllModels(models);
      } catch (e) {
        console.error('Error fetching models:', e);
        // Non-critical, silently fail - default models will still work
      }
    };
    fetchModels();
  }, []);

  const handleSave = async (newSettings: Settings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleSaveApiKey = async () => {
    try {
      await saveApiKey(apiKey.trim());
      setTestStatus('idle'); // Reset test status when key changes
    } catch (e) {
      console.error('Error saving API key:', e);
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey) return;
    
    setIsTesting(true);
    setTestStatus('idle');
    
    try {
      await BackendClient.testApiKey(apiKey.trim());
      setTestStatus('success');
      setToast({ message: 'API connection successful!', type: 'success' });
    } catch (error) {
      console.error('API Key test failed:', error);
      setTestStatus('error');
      const appError = error as AppError;
      setToast({ 
        message: appError.message || 'Connection failed. Please check your API key.', 
        type: 'error' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleBrowseModels = (context: 'explain' | 'factCheck') => {
    setModelModalContext(context);
    setIsModelModalOpen(true);
  };

  const handleModelSelect = (modelId: string) => {
    if (modelModalContext === 'explain') {
      handleSave({ ...settings, explainModel: modelId });
    } else {
      handleSave({ ...settings, factCheckModel: modelId });
    }
  };

  useEffect(() => {
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium tracking-widest uppercase text-xs">Loading Settings</div>
      </div>
    );
  }

  const currentModelId = modelModalContext === 'explain' ? settings.explainModel : settings.factCheckModel;

  return (
    <div 
      data-accent={settings.accentColor}
      className="min-h-screen font-sans selection:bg-accent-100 selection:text-accent-900 bg-[#F5F5F7] text-slate-900 dark:bg-slate-900 dark:text-slate-300 transition-colors duration-300"
    >
      <div className="max-w-xl mx-auto px-6 py-12 md:py-20">
        
        <Header />

        <main className="rounded-2xl shadow-sm border overflow-hidden bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <APIKeySection 
            apiKey={apiKey}
            setApiKey={setApiKey}
            onBlur={handleSaveApiKey}
            onTest={handleTestApiKey}
            isTesting={isTesting}
            testStatus={testStatus}
          />

          <IntelligenceSection 
            settings={settings}
            onSave={handleSave}
            models={MODELS}
            allModels={allModels}
            onBrowseModels={handleBrowseModels}
          />

          <AppearanceSection 
            settings={settings}
            onSave={handleSave}
            themeColors={THEME_COLORS}
          />

          <BehaviorSection 
            settings={settings}
            onSave={handleSave}
          />
        </main>
        
        <Footer />
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onSelect={handleModelSelect}
        models={allModels}
        currentModelId={currentModelId}
      />
    </div>
  );
};

export default Options;