import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, Cpu, Palette, Zap, Settings as SettingsIcon } from 'lucide-react';
import { getSettings, saveSettings, getApiKey, saveApiKey, Settings, DEFAULT_SETTINGS } from '../lib/settings';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="mb-12">
    <div className="flex items-center gap-2 mb-6 border-b border-neutral-100 pb-2">
      <div className="text-neutral-900">{icon}</div>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">{title}</h2>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </section>
);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <div className="max-w-3xl mx-auto px-8 py-20">
        <header className="mb-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logos/logo-transparent.png" alt="OpenInsight Logo" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">OpenInsight</h1>
              <p className="text-neutral-500 text-sm">Epistemic Clarity Engine</p>
            </div>
          </div>
          <div className="text-neutral-300">
            <SettingsIcon size={20} />
          </div>
        </header>

        <main>
          <Section title="Connection" icon={<Globe size={18} />}>
             <div className="text-sm text-neutral-500 italic">API Configuration Placeholder</div>
          </Section>

          <Section title="Intelligence" icon={<Cpu size={18} />}>
            <div className="text-sm text-neutral-500 italic">Model Selection Placeholder</div>
          </Section>

          <Section title="Appearance" icon={<Palette size={18} />}>
            <div className="text-sm text-neutral-500 italic">Theme & Accent Placeholder</div>
          </Section>

          <Section title="Behavior" icon={<Zap size={18} />}>
            <div className="text-sm text-neutral-500 italic">Trigger Mode Placeholder</div>
          </Section>
        </main>

        <footer className="mt-20 pt-8 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-400">
          <p>&copy; 2025 OpenInsight. Designed for focus.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-900 transition-colors">Documentation</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Options;
