import React from 'react';

const Popup: React.FC = () => {
  return (
    <div className="w-64 p-4 bg-white shadow-lg">
      <h1 className="text-xl font-bold text-indigo-600 mb-2">OpenInsight</h1>
      <p className="text-sm text-gray-600 mb-4">
        AI-powered text analysis at your fingertips.
      </p>
      <div className="space-y-2">
        <p className="text-xs text-gray-500">
          Highlight any text on a page to get started.
        </p>
        <button 
          onClick={() => chrome.runtime.openOptionsPage()}
          className="w-full py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors text-sm font-medium"
        >
          Open Settings
        </button>
      </div>
    </div>
  );
};

export default Popup;
