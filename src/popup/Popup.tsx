import React, { useEffect, useState } from 'react';
import { getSettings, DEFAULT_SETTINGS } from '../lib/settings.js';
import type { Settings } from '../lib/settings.js';
import { PopupHeader } from './components/PopupHeader.js';

const Popup: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getSettings();
        setSettings(s);
      } catch (e) {
        console.error('Error loading settings:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

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
      <div className="w-64 h-48 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium tracking-widest uppercase text-[10px]">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      data-accent={settings.accentColor}
      className="w-64 p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300 transition-colors duration-300"
    >
      <PopupHeader />
      
      <div className="space-y-2">
        <button 
          onClick={() => chrome.runtime.openOptionsPage()}
          className="w-full py-2.5 bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors text-xs font-medium uppercase tracking-wide"
        >
          Open Settings
        </button>
      </div>
    </div>
  );
};

export default Popup;