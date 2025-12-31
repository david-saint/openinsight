import React, { useState, useEffect } from 'react';
import { TriggerButton } from './components/TriggerButton';
import { AnalysisPopover } from './components/AnalysisPopover';
import { handleSelection } from './selection';
import { calculateTriggerPosition, Position } from './positioning';
import { getSettings, DEFAULT_SETTINGS } from '../lib/settings';
import type { Settings } from '../lib/settings';

export const ContentApp: React.FC = () => {
  const [triggerPosition, setTriggerPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectionText, setSelectionText] = useState('');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load settings once
    getSettings().then(setSettings);

    const onMouseUp = () => {
      // Small timeout to allow selection to finalize
      setTimeout(() => {
        const selectionData = handleSelection();
        if (selectionData && !isPopoverOpen) {
          const pos = calculateTriggerPosition(selectionData.rect);
          setTriggerPosition(pos);
          setSelectionText(selectionData.text);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }, 10);
    };

    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
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
    import('../lib/settings').then(m => m.saveSettings(newSettings));
  };

  return (
    <div className="openinsight-content-root" data-accent={settings.accentColor}>
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
        accentColor={settings.accentColor}
        onAccentChange={handleAccentChange}
        position={triggerPosition || undefined}
      />
    </div>
  );
};
