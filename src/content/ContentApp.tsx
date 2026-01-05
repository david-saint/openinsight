import React, { useState, useEffect, useCallback } from 'react';
import { TriggerButton } from './components/TriggerButton.js';
import { AnalysisPopover } from './components/AnalysisPopover.js';
import { handleSelection } from './selection.js';
import { calculateTriggerPosition } from './positioning.js';
import type { Position } from './positioning.js';
import { getSettings, saveSettings, DEFAULT_SETTINGS, SETTINGS_KEY } from '../lib/settings.js';
import type { Settings } from '../lib/settings.js';
import { useTheme } from './hooks/useTheme.js';

export const ContentApp: React.FC = () => {
  const [triggerPosition, setTriggerPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectionText, setSelectionText] = useState('');
  const [selectionContext, setSelectionContext] = useState<{ paragraph: string; pageTitle: string; pageDescription: string } | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  // Optimized theme handling using custom hook
  const isDark = useTheme(settings.theme);

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
      timeoutRef.current = window.setTimeout(async () => {
        const selectionData = handleSelection();
        if (selectionData && !isPopoverOpen) {
          // Re-fetch settings before checking validity to ensure we have the latest
          const currentSettings = await getSettings();
          
          // Check if selection is valid for any enabled tab
          // Default to true if settings haven't loaded yet to avoid flickering/missing trigger
          const enabledTabs = currentSettings.enabledTabs || ['explain', 'fact-check'];
          const isExplainEnabled = enabledTabs.includes('explain');
          const isFactCheckEnabled = enabledTabs.includes('fact-check');
          const isLongEnoughForFactCheck = selectionData.text.length >= 50;

          const isValidForEnabledTabs = 
            (isExplainEnabled) || 
            (isFactCheckEnabled && isLongEnoughForFactCheck);

          if (!isValidForEnabledTabs) {
            setIsVisible(false);
            return;
          }

          const pos = calculateTriggerPosition(selectionData.endPosition);
          setTriggerPosition(pos);
          setSelectionText(selectionData.text);
          setSelectionContext(selectionData.context);
          
          // Check trigger mode: immediate opens popover directly, icon shows button
          if (currentSettings.triggerMode === 'immediate') {
            setIsVisible(false);
            setIsPopoverOpen(true);
          } else {
            setIsVisible(true);
          }
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
  }, [isPopoverOpen, settings.triggerMode]);

  const handleTrigger = useCallback(() => {
    setIsVisible(false);
    setIsPopoverOpen(true);
  }, []);

  const handleClosePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const handleAccentChange = useCallback((color: string) => {
    const newSettings = { ...settings, accentColor: color };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  return (
    <div className={`openinsight-content-root ${isDark ? 'dark' : ''}`} data-accent={settings.accentColor}>
      {isVisible && triggerPosition && (
        <TriggerButton 
          position={triggerPosition} 
          onTrigger={handleTrigger} 
        />
      )}
      
      {isPopoverOpen && (
        <AnalysisPopover
          isOpen={isPopoverOpen}
          onClose={handleClosePopover}
          selectionText={selectionText}
          selectionContext={selectionContext}
          accentColor={settings.accentColor}
          onAccentChange={handleAccentChange}
          position={triggerPosition || undefined}
        />
      )}
    </div>
  );
};
