import React, { useState, useEffect } from 'react';
import { saveApiKey, hasApiKey, removeApiKey } from '../lib/storage';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [password, setPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      const exists = await hasApiKey();
      setIsSaved(exists);
      setLoading(false);
    };
    checkKey();
  }, []);

  const handleSave = async () => {
    if (!apiKey || !password) return;
    try {
      await saveApiKey(apiKey, password);
      setIsSaved(true);
      setApiKey('');
      setPassword('');
      alert('API Key saved securely!');
    } catch (error) {
      alert('Failed to save API Key.');
    }
  };

  const handleRemove = async () => {
    await removeApiKey();
    setIsSaved(false);
    alert('API Key removed.');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      {isSaved ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">API Key is securely stored.</span>
          <Button onClick={handleRemove}>Remove Key</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">OpenRouter API Key</label>
            <input
              type="password"
              placeholder="Enter OpenRouter API Key"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Master Password (to encrypt key)</label>
            <input
              type="password"
              placeholder="Enter Master Password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleSave}>Save Key</Button>
        </div>
      )}
    </div>
  );
};
