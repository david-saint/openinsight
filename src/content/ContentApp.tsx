import React, { useState, useEffect } from 'react';
import { TriggerButton } from './components/TriggerButton.js';
import { AnalysisPopover } from './components/AnalysisPopover.js';
import { handleSelection } from './selection.js';
import { calculateTriggerPosition } from './positioning.js';
import type { Position } from './positioning.js';
import { getSettings, DEFAULT_SETTINGS, SETTINGS_KEY } from '../lib/settings.js';
import type { Settings } from '../lib/settings.js';

export const ContentApp: React.FC = () => {
  const [triggerPosition, setTriggerPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectionText, setSelectionText] = useState('');
  const [selectionContext, setSelectionContext] = useState<{ paragraph: string; pageTitle: string; pageDescription: string } | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  useEffect(() => {
    // Load settings once
    getSettings().then(setSettings);

    // Listen for setting changes
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[SETTINGS_KEY]) {
        setSettings((prev) => ({ ...prev, ...changes[SETTINGS_KEY].newValue }));
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    const onMouseUp = () => {
      // Clear existing timeout to debounce
      window.clearTimeout(timeoutRef.current);

      // Small timeout to allow selection to finalize
      timeoutRef.current = window.setTimeout(() => {
        const selectionData = handleSelection();
        if (selectionData && !isPopoverOpen) {
          const pos = calculateTriggerPosition(selectionData.endPosition);
          setTriggerPosition(pos);
          setSelectionText(selectionData.text);
          setSelectionContext(selectionData.context);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }, 10);
    };

    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      window.clearTimeout(timeoutRef.current);
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [isPopoverOpen]);

  const handleTrigger = () => {
    setIsVisible(false);
    setIsPopoverOpen(true);
  };

  const handleClosePopover = () => {
    setIsPopoverOpen(false);
  };

  const handleAccentChange = (color: string) => {
    const newSettings = { ...settings, accentColor: color };
    setSettings(newSettings);
    // Persist change
    import('../lib/settings.js').then(m => m.saveSettings(newSettings));
  };

  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`openinsight-content-root ${isDark ? 'dark' : ''}`} data-accent={settings.accentColor}>
      {isVisible && triggerPosition && (
        <TriggerButton 
          position={triggerPosition} 
          onTrigger={handleTrigger} 
        />
      )}
      
      <AnalysisPopover 
        isOpen={isPopoverOpen} 
        onClose={handleClosePopover}
        selectionText={selectionText}
        selectionContext={selectionContext}
        accentColor={settings.accentColor}
        onAccentChange={handleAccentChange}
        position={triggerPosition || undefined}
      />
    </div>
  );
};
