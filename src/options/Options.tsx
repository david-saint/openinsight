import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings, getApiKey, saveApiKey, DEFAULT_SETTINGS } from '../lib/settings.js';
import type { Settings } from '../lib/settings.js';
import { THEME_COLORS, MODELS } from './constants.js';

// Components
import { Header } from './components/Header.js';
import { APIKeySection } from './components/APIKeySection.js';
import { IntelligenceSection } from './components/IntelligenceSection.js';
import { AppearanceSection } from './components/AppearanceSection.js';
import { BehaviorSection } from './components/BehaviorSection.js';
import { Footer } from './components/Footer.js';

const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSave = async (newSettings: Settings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleSaveApiKey = async () => {
    try {
      await saveApiKey(apiKey.trim());
    } catch (e) {
      console.error('Error saving API key:', e);
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
          />

          <IntelligenceSection 
            settings={settings}
            onSave={handleSave}
            models={MODELS}
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
    </div>
  );
};

export default Options;
