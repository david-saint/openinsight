import React, { useState, useEffect, useCallback } from 'react';
import { TriggerButton } from './components/TriggerButton.js';
import { AnalysisPopover } from './components/AnalysisPopover.js';
import { handleSelection } from './selection.js';
import { sendMessage } from '../lib/messaging.js';
import { calculateTriggerPosition } from './positioning.js';
import type { Position } from './positioning.js';
import { getSettings, saveSettings, DEFAULT_SETTINGS, SETTINGS_KEY } from '../lib/settings.js';
import type { Settings } from '../lib/settings.js';
import { useTheme } from './hooks/useTheme.js';
import { CaptureOverlay } from './components/CaptureOverlay.js';
import { CapturePromptInput } from './components/CapturePromptInput.js';

export const ContentApp: React.FC = () => {
  const [triggerPosition, setTriggerPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCaptureActive, setIsCaptureActive] = useState(false);
  const [capturedRegion, setCapturedRegion] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | undefined>(undefined);
  const [capturedImagePrompt, setCapturedImagePrompt] = useState<string | undefined>(undefined);
  const [selectionText, setSelectionText] = useState('');
  const [selectionContext, setSelectionContext] = useState<{ paragraph: string; pageTitle: string; pageDescription: string } | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const timeoutRef = React.useRef<number | undefined>(undefined);
  const settingsRef = React.useRef<Settings>(settings);
  const isPopoverOpenRef = React.useRef<boolean>(isPopoverOpen);
  const selectionContextGetterRef = React.useRef<(() => { paragraph: string; pageTitle: string; pageDescription: string }) | null>(null);

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
    const handleCaptureActivated = () => {
      setIsCaptureActive(true);
    };

    document.addEventListener('openinsight:capture-activated', handleCaptureActivated);
    return () => {
      document.removeEventListener('openinsight:capture-activated', handleCaptureActivated);
    };
  }, []);

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
          selectionContextGetterRef.current = selectionData.getContext;
          
          // Check trigger mode: immediate opens popover directly, icon shows button
          if (currentSettings.triggerMode === 'immediate') {
            setSelectionContext(selectionData.getContext());
            setIsVisible(false);
            setIsPopoverOpen(true);
          } else {
            setSelectionContext(undefined);
            setIsVisible(true);
          }
        } else {
          setIsVisible(false);
          selectionContextGetterRef.current = null;
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
    if (selectionContextGetterRef.current) {
      setSelectionContext(selectionContextGetterRef.current());
    }
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
      <CaptureOverlay 
        isActive={isCaptureActive} 
        onCancel={() => setIsCaptureActive(false)} 
        onCapture={(region) => {
          setIsCaptureActive(false);
          setCapturedRegion(region);
        }} 
      />

      <CapturePromptInput
        isActive={!!capturedRegion}
        position={capturedRegion || { x: 0, y: 0, width: 0, height: 0 }}
        onSubmit={async (prompt) => {
          if (!capturedRegion) return;
          
          // Clear region to hide prompt input immediately
          const region = { ...capturedRegion };
          setCapturedRegion(null);
          
          try {
            // Get device pixel ratio scaled rect since captureVisibleTab gives physical pixels
            const dpr = window.devicePixelRatio || 1;
            const physicalRect = {
              x: region.x * dpr,
              y: region.y * dpr,
              width: region.width * dpr,
              height: region.height * dpr
            };

            const dataUrl = await sendMessage('BACKEND_CAPTURE_VISIBLE_TAB', { rect: physicalRect });
            setCapturedImageUrl(dataUrl);
            setCapturedImagePrompt(prompt);
            setSelectionText(undefined);
            
            // Position the popover near the capture region
            setTriggerPosition({
               left: region.x + region.width / 2 + window.scrollX,
               top: region.y + region.height + 20 + window.scrollY
            } as Position);
            setIsPopoverOpen(true);
          } catch (error) {
             console.error("Failed to capture image:", error);
          }
        }}
        onCancel={() => setCapturedRegion(null)}
      />

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
          imageUrl={capturedImageUrl}
          imagePrompt={capturedImagePrompt}
          accentColor={settings.accentColor}
          onAccentChange={handleAccentChange}
          {...(triggerPosition ? { position: triggerPosition } : {})}
          enabledTabs={settings.enabledTabs}
        />
      )}
    </div>
  );
};
