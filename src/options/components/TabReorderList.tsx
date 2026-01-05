import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
}

interface TabReorderListProps {
  enabledTabs: string[];
  onSave: (newEnabledTabs: string[]) => void;
  allTabs: Tab[];
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled }) => {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full 
        transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800
        ${checked ? 'bg-accent-500' : 'bg-slate-200 dark:bg-slate-600'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 
          transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-4' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
};

export const TabReorderList: React.FC<TabReorderListProps> = ({ enabledTabs = [], onSave, allTabs }) => {
  // Create a combined list that respects the order in enabledTabs, and appends disabled tabs.
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
      onSave([...enabledTabs, id]);
    }
  };

  const move = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...displayOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex] as string, newOrder[index] as string];
    
    // After moving, we only save the ones that are currently enabled in the new order.
    const newEnabledTabs = newOrder.filter(id => enabledTabs.includes(id));
    onSave(newEnabledTabs);
  };

  const isLastEnabled = (id: string) => enabledTabs.length === 1 && enabledTabs.includes(id);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
      <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {displayOrder.map((id, index) => {
          const tab = allTabs.find(t => t.id === id);
          if (!tab) return null;
          const isEnabled = enabledTabs.includes(id);
          const cannotDisable = isLastEnabled(id);

          return (
            <li 
              key={id} 
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
            >
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={isEnabled}
                  onChange={() => handleToggle(id)}
                  disabled={cannotDisable}
                />
                <span className={`text-xs font-medium transition-colors ${isEnabled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {tab.label}
                </span>
              </div>
              
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, 'up')}
                  disabled={index === 0}
                  aria-label="Move Up"
                  className="p-1.5 rounded-md text-slate-400 transition-colors hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 'down')}
                  disabled={index === displayOrder.length - 1}
                  aria-label="Move Down"
                  className="p-1.5 rounded-md text-slate-400 transition-colors hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
