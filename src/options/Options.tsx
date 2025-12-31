import React, { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../lib/storage';

const Options: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load existing API key (masked or partially visible for security if we wanted, 
    // but for scaffolding we'll just check if it exists)
    const loadSettings = async () => {
      const savedKey = await getStorage<string>('openrouter_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setMessage('API key cannot be empty.');
      return;
    }

    setStatus('saving');
    try {
      // In a real scenario, we might use setEncrypted here.
      // For now, we follow the scaffolding plan which suggests basic API key management.
      await setStorage('openrouter_api_key', apiKey.trim());
      setStatus('success');
      setMessage('Settings saved successfully!');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setMessage('Failed to save settings.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OpenInsight Settings</h1>
          <p className="mt-2 text-gray-600">Configure your OpenRouter API integration</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
              OpenRouter API Key
            </label>
            <div className="mt-1">
              <input
                type="password"
                id="api-key"
                className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                placeholder="sk-or-v1-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          <div>
            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                status === 'saving' ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {status === 'saving' ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {status !== 'idle' && (
            <div
              className={`p-4 rounded-md ${
                status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Options;
