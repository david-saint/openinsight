import React from 'react';
import { Key } from 'lucide-react';

interface APIKeySectionProps {
  apiKey: string;
  setApiKey: (val: string) => void;
  onBlur: () => void;
}

export const APIKeySection: React.FC<APIKeySectionProps> = ({
  apiKey,
  setApiKey,
  onBlur,
}) => {
  return (
    <div className="p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
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
              className="flex-1 px-3 py-2.5 bg-transparent border rounded-lg text-sm transition-all focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 border-slate-200 text-slate-900 placeholder-slate-400 dark:border-slate-600 dark:text-white dark:placeholder-slate-600"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={onBlur}
            />
          </div>
          <p className="mt-3 text-[10px] text-slate-400 leading-relaxed max-w-sm">
            Your key is encrypted and stored locally. It never leaves your browser except to communicate with OpenRouter.
          </p>
        </div>
      </div>
    </div>
  );
};
