import React, { useState, useEffect } from 'react';
import { TriggerButton } from './components/TriggerButton';
import { handleSelection } from './selection';
import { calculateTriggerPosition, Position } from './positioning';
import { getSettings, DEFAULT_SETTINGS } from '../lib/settings';
import type { Settings } from '../lib/settings';

export const ContentApp: React.FC = () => {
  const [triggerPosition, setTriggerPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load settings once
    getSettings().then(setSettings);

    const onMouseUp = () => {
      // Small timeout to allow selection to finalize
      setTimeout(() => {
        const selectionData = handleSelection();
        if (selectionData) {
          const pos = calculateTriggerPosition(selectionData.rect);
          setTriggerPosition(pos);
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
  }, []);

  const handleTrigger = () => {
    console.log('Triggered analysis');
    setIsVisible(false);
    // Future: Open Modal
  };

  if (!isVisible || !triggerPosition) return null;

  return (
    <div className="openinsight-content-root" data-accent={settings.accentColor}>
      <TriggerButton 
        position={triggerPosition} 
        onTrigger={handleTrigger} 
      />
    </div>
  );
};
