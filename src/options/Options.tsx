import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Palette, 
  Zap, 
  Cpu, 
  Key, 
  ChevronDown
} from 'lucide-react';
import { getSettings, saveSettings, getApiKey, saveApiKey, DEFAULT_SETTINGS } from '../lib/settings';
import type { Settings } from '../lib/settings';

const THEME_COLORS = {
  teal: {
    name: "Teal",
    ring: "ring-teal-500",
    bg: "bg-teal-500"
  },
  indigo: {
    name: "Indigo",
    ring: "ring-indigo-500",
    bg: "bg-indigo-500"
  },
  rose: {
    name: "Rose",
    ring: "ring-rose-500",
    bg: "bg-rose-500"
  },
  amber: {
    name: "Amber",
    ring: "ring-amber-500",
    bg: "bg-amber-500"
  },
} as const;

type ThemeColor = keyof typeof THEME_COLORS;

const MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)" },
  { id: "anthropic/claude-3-haiku:free", name: "Claude 3 Haiku (Free)" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
];

const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
    setStatus('saving');
    try {
      await saveApiKey(apiKey.trim());
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      setStatus('error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium tracking-widest uppercase text-xs">Loading Settings</div>
      </div>
    );
  }

  const C = THEME_COLORS[settings.accentColor as ThemeColor] || THEME_COLORS.teal;
  const isDark = settings.theme === 'dark';

  return (
    <div className={`min-h-screen font-sans selection:bg-teal-100 selection:text-teal-900 ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-[#F5F5F7] text-slate-900'}`}>
      <div className="max-w-xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
              <Sparkles className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} />
            </div>
            <h1 className={`text-xl font-serif font-medium ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              OpenInsight
            </h1>
          </div>
          <p className={`text-xs uppercase tracking-widest font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Epistemic Clarity Engine
          </p>
        </header>

        <main className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          
          {/* Section: Connection (API Key) */}
          <div className={`p-8 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-6 opacity-50">
               <Key size={14} />
               <h2 className="text-[10px] font-bold uppercase tracking-wider">Connection</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="api-key" className="block text-xs font-medium mb-2 opacity-70">
                  OpenRouter API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    id="api-key"
                    className={`flex-1 px-3 py-2.5 bg-transparent border rounded-lg text-sm transition-all focus:outline-none focus:ring-1 ${
                      isDark 
                        ? 'border-slate-600 focus:border-slate-500 text-white placeholder-slate-600' 
                        : 'border-slate-200 focus:border-slate-400 text-slate-900 placeholder-slate-400'
                    } ${C.ring.replace('ring-', 'focus:ring-')}`}
                    placeholder="sk-or-v1-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button
                    onClick={handleSaveApiKey}
                    disabled={status === 'saving'}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      status === 'saved'
                        ? 'bg-teal-500 text-white' 
                        : isDark 
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Save'}
                  </button>
                </div>
                <p className="mt-3 text-[10px] text-slate-400 leading-relaxed max-w-sm">
                  Your key is encrypted and stored locally. It never leaves your browser except to communicate with OpenRouter.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Intelligence */}
          <div className={`p-8 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
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
                    className={`w-full appearance-none px-3 py-2.5 bg-transparent border rounded-lg text-sm focus:outline-none focus:ring-1 ${
                      isDark 
                        ? 'border-slate-600 focus:border-slate-500 text-white' 
                        : 'border-slate-200 focus:border-slate-400 text-slate-900'
                    } ${C.ring.replace('ring-', 'focus:ring-')}`}
                    value={settings.explainModel}
                    onChange={(e) => handleSave({ ...settings, explainModel: e.target.value })}
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
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
                    className={`w-full appearance-none px-3 py-2.5 bg-transparent border rounded-lg text-sm focus:outline-none focus:ring-1 ${
                         isDark 
                        ? 'border-slate-600 focus:border-slate-500 text-white' 
                        : 'border-slate-200 focus:border-slate-400 text-slate-900'
                    } ${C.ring.replace('ring-', 'focus:ring-')}`}
                    value={settings.factCheckModel}
                    onChange={(e) => handleSave({ ...settings, factCheckModel: e.target.value })}
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-50">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Appearance */}
          <div className={`p-8 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-6 opacity-50">
               <Palette size={14} />
               <h2 className="text-[10px] font-bold uppercase tracking-wider">Appearance</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-90">Theme Mode</span>
                <div className={`flex p-1 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  {(['light', 'dark', 'system'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleSave({ ...settings, theme: mode })}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        settings.theme === mode
                          ? isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
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
                  {(Object.keys(THEME_COLORS) as ThemeColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => handleSave({ ...settings, accentColor: color })}
                      className={`w-6 h-6 rounded-full transition-all ring-offset-2 ${THEME_COLORS[color].bg} ${
                          isDark ? 'ring-offset-slate-800' : 'ring-offset-white'
                      } ${
                        settings.accentColor === color 
                          ? `ring-2 ${THEME_COLORS[color].ring} scale-110` 
                          : 'hover:scale-110 opacity-70 hover:opacity-100'
                      }`}
                      aria-label={THEME_COLORS[color].name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

           {/* Section: Behavior */}
           <div className="p-8">
            <div className="flex items-center gap-2 mb-6 opacity-50">
               <Zap size={14} />
               <h2 className="text-[10px] font-bold uppercase tracking-wider">Behavior</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-medium opacity-90 mb-1">Trigger Action</span>
                <span className="text-[10px] text-slate-400">
                  {settings.triggerMode === 'icon' 
                    ? 'Show icon when text is selected' 
                    : 'Open immediately on selection'}
                </span>
              </div>
              
              <div className={`flex p-1 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                <button
                  onClick={() => handleSave({ ...settings, triggerMode: 'icon' })}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    settings.triggerMode === 'icon'
                       ? isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Icon
                </button>
                <button
                  onClick={() => handleSave({ ...settings, triggerMode: 'immediate' })}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                    settings.triggerMode === 'immediate'
                       ? isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Immediate
                </button>
              </div>
            </div>
          </div>

        </main>
        
        <footer className="mt-12 text-center text-xs text-slate-400 opacity-60">
          <p>© 2025 OpenInsight • {process.env.NODE_ENV === 'development' ? 'Dev Build' : 'v1.0.0'}</p>
        </footer>
      </div>
    </div>
  );
};

export default Options;
