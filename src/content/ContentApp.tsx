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
  const settingsRef = React.useRef<Settings>(settings);
  const isPopoverOpenRef = React.useRef<boolean>(isPopoverOpen);

  // Keep refs in sync with state
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    isPopoverOpenRef.current = isPopoverOpen;
  }, [isPopoverOpen]);

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
        const newValue = changes[SETTINGS_KEY].newValue as Partial<Settings> | undefined;
        if (newValue) {
          setSettings((prev) => ({ ...prev, ...newValue }));
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []); // Only run once on mount

  useEffect(() => {
    const onMouseUp = () => {
      // Clear existing timeout to debounce
      window.clearTimeout(timeoutRef.current);

      // Small timeout to allow selection to finalize
      timeoutRef.current = window.setTimeout(() => {
        const selectionData = handleSelection();
        if (selectionData && !isPopoverOpenRef.current) {
          // Use ref to access latest settings without async call or stale closure
          const currentSettings = settingsRef.current;
          
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
    };
  }, []); // Only run once on mount, state is accessed via refs

  const handleTrigger = useCallback(() => {
    setIsVisible(false);
    setIsPopoverOpen(true);
  }, []);

  const handleClosePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const handleAccentChange = useCallback((color: string) => {
    // Use ref to avoid re-creating callback when other settings change
    const newSettings = { ...settingsRef.current, accentColor: color as Settings['accentColor'] };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

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
          {...(triggerPosition ? { position: triggerPosition } : {})}
          enabledTabs={settings.enabledTabs}
        />
      )}
    </div>
  );
};
