import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
}

interface TabReorderListProps {
  enabledTabs: string[];
  onSave: (newEnabledTabs: string[]) => void;
  allTabs: Tab[];
}

export const TabReorderList: React.FC<TabReorderListProps> = ({ enabledTabs = [], onSave, allTabs }) => {
  // We want to show all tabs, but maintain the order of enabled ones first, then disabled ones.
  // Actually, the requirement says "reorder the tabs". Usually, this means reordering the entire list
  // and having a checkbox to enable/disable.
  
  // Let's create a combined list that respects the order in enabledTabs, and appends disabled tabs.
  const displayOrder = [...enabledTabs];
  allTabs.forEach(tab => {
    if (!displayOrder.includes(tab.id)) {
      displayOrder.push(tab.id);
    }
  });

  const handleToggle = (id: string) => {
    const isEnabled = enabledTabs.includes(id);
    if (isEnabled) {
      if (enabledTabs.length > 1) {
        onSave(enabledTabs.filter(t => t !== id));
      }
    } else {
      // Add to enabled tabs, maintaining the current display order position if possible, 
      // or just append. Let's append for simplicity.
      onSave([...enabledTabs, id]);
    }
  };

  const move = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...displayOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    // After moving, we only save the ones that are currently enabled in the new order.
    const newEnabledTabs = newOrder.filter(id => enabledTabs.includes(id));
    onSave(newEnabledTabs);
  };

  return (
    <ul className="space-y-2">
      {displayOrder.map((id, index) => {
        const tab = allTabs.find(t => t.id === id);
        if (!tab) return null;
        const isEnabled = enabledTabs.includes(id);

        return (
          <li 
            key={id} 
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => handleToggle(id)}
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <span className={`text-sm font-medium ${isEnabled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {tab.label}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, 'up')}
                disabled={index === 0}
                aria-label="Move Up"
                className="p-1 text-slate-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => move(index, 'down')}
                disabled={index === displayOrder.length - 1}
                aria-label="Move Down"
                className="p-1 text-slate-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-slate-400"
              >
                <ArrowDown size={16} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
