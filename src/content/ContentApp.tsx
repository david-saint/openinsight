import React, { useState, useEffect } from 'react';
import { TriggerButton } from './components/TriggerButton';
import { handleSelection } from './selection';
import { calculateTriggerPosition, Position } from './positioning';

export const ContentApp: React.FC = () => {
  const [triggerPosition, setTriggerPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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

    const onMouseDown = (e: MouseEvent) => {
      // Check if clicking outside the component (this is tricky with Shadow DOM)
      // For now, hide on click start unless it's our button
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
    <div className="openinsight-content-root">
      <TriggerButton 
        position={triggerPosition} 
        onTrigger={handleTrigger} 
      />
    </div>
  );
};
