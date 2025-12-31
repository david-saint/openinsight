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
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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

  const handleSaveApiKey = async () => {
    setStatus('saving');
    try {
      await saveApiKey(apiKey.trim());
      setStatus('success');
      setMessage('API Key saved securely.');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e) {
      setStatus('error');
      setMessage('Failed to save API Key.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-neutral-400 font-medium tracking-widest uppercase text-xs">Loading Settings</div>
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
            <div className="max-w-md">
              <label htmlFor="api-key" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                OpenRouter API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  id="api-key"
                  className="flex-1 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={status === 'saving'}
                  className="px-6 py-2 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 disabled:bg-neutral-200 transition-colors"
                >
                  {status === 'saving' ? 'Saving...' : 'Save'}
                </button>
              </div>
              {status !== 'idle' && (
                <p className={`mt-3 text-xs font-medium ${status === 'success' ? 'text-teal-600' : 'text-rose-600'}`}>
                  {message}
                </p>
              )}
              <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
                Your key is encrypted and stored locally. It never leaves your browser except to communicate with OpenRouter.
              </p>
            </div>
          </Section>

          <Section title="Intelligence" icon={<Cpu size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="explain-model" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Explain Model
                </label>
                <select
                  id="explain-model"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-sm focus:outline-none focus:border-neutral-900 transition-colors appearance-none cursor-pointer"
                  value={settings.explainModel}
                  onChange={(e) => {
                    const newSettings = { ...settings, explainModel: e.target.value };
                    setSettings(newSettings);
                    saveSettings(newSettings);
                  }}
                >
                  <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</option>
                  <option value="anthropic/claude-3-haiku:free">Claude 3 Haiku (Free)</option>
                  <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                </select>
              </div>
              <div>
                <label htmlFor="fact-check-model" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Fact-Check Model
                </label>
                <select
                  id="fact-check-model"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-sm focus:outline-none focus:border-neutral-900 transition-colors appearance-none cursor-pointer"
                  value={settings.factCheckModel}
                  onChange={(e) => {
                    const newSettings = { ...settings, factCheckModel: e.target.value };
                    setSettings(newSettings);
                    saveSettings(newSettings);
                  }}
                >
                  <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</option>
                  <option value="anthropic/claude-3-haiku:free">Claude 3 Haiku (Free)</option>
                  <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                </select>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
              OpenInsight uses OpenRouter to access various LLMs. Some models are free, while others require credits.
            </p>
          </Section>

          <Section title="Appearance" icon={<Palette size={18} />}>
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-4">
                Theme Mode
              </label>
              <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg w-fit">
                {(['light', 'dark', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      const newSettings = { ...settings, theme: mode };
                      setSettings(newSettings);
                      saveSettings(newSettings);
                    }}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      settings.theme === mode
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-neutral-500 italic mt-8">Accent Color Placeholder</div>
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
