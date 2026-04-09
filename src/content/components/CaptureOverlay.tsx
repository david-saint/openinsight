import React, { useEffect, useState, useRef } from 'react';

export interface CaptureOverlayProps {
  isActive: boolean;
  onCancel: () => void;
  onCapture: (region: { x: number; y: number; width: number; height: number }) => void;
}

export const CaptureOverlay: React.FC<CaptureOverlayProps> = ({
  isActive,
  onCancel,
  onCapture
}) => {
  const [highlightRect, setHighlightRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (!isActive) {
      setHighlightRect(null);
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentPoint(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onCancel]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    setIsDrawing(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setCurrentPoint({ x: e.clientX, y: e.clientY });
    setHighlightRect(null); // Clear element highlight when starting to draw
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;

    if (isDrawing && startPoint) {
      setCurrentPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Hover highlighting (only when not drawing)
    // Use elementsFromPoint to find the element underneath the overlay
    // without modifying pointer-events, which can cause layout thrashing
    // or trigger unwanted mouseover/mouseout events on the host page.
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    
    // Find the first element that is not the overlay itself
    const target = elements.find(el => 
      el.getAttribute('data-testid') !== 'capture-overlay' && 
      el.getAttribute('data-testid') !== 'capture-highlight'
    );

    if (target && target.tagName && (target.tagName.toLowerCase() === 'img' || target.tagName.toLowerCase() === 'svg')) {
      const rect = target.getBoundingClientRect();
      setHighlightRect({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      });
    } else {
      setHighlightRect(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;

    if (isDrawing && startPoint && currentPoint) {
      setIsDrawing(false);
      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);

      if (width > 5 && height > 5) {
        onCapture({
          x: Math.min(startPoint.x, currentPoint.x),
          y: Math.min(startPoint.y, currentPoint.y),
          width,
          height
        });
        return;
      }
      // If the drag was too small, maybe treat it as a click instead.
    }

    if (highlightRect) {
      onCapture(highlightRect);
      return;
    }

    onCancel();
  };

  // Calculate the drawing box rect if currently drawing
  let drawRect = null;
  if (isDrawing && startPoint && currentPoint) {
    drawRect = {
      x: Math.min(startPoint.x, currentPoint.x),
      y: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y),
    };
  }

  const activeRect = drawRect || highlightRect;

  if (!isActive) return null;

  return (
    <div
      data-testid="capture-overlay"
      className="fixed inset-0 z-[999999] cursor-crosshair"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {activeRect && (
        <div
          data-testid="capture-highlight"
          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
          style={{
            left: `${activeRect.x}px`,
            top: `${activeRect.y}px`,
            width: `${activeRect.width}px`,
            height: `${activeRect.height}px`,
          }}
        />
      )}
    </div>
  );
};
