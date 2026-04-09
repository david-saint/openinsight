import React, { useState, useEffect, useRef } from 'react';
import { Send, CornerDownLeft, Sparkles } from 'lucide-react';

export interface CapturePromptInputProps {
  isActive: boolean;
  position: { x: number; y: number; width: number; height: number };
  onSubmit: (prompt: string) => void;
  onCancel: () => void;
}

export const CapturePromptInput: React.FC<CapturePromptInputProps> = ({
  isActive,
  position,
  onSubmit,
  onCancel
}) => {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isActive]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isActive && e.key === "Escape") {
        onCancel();
      }
    };
    
    // Add global listener for Escape to work even when input isn't focused
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isActive, onCancel]);

  if (!isActive) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit(prompt);
    }
  };

  // Convert viewport coordinates to absolute document coordinates
  const top = position.y + position.height + 12 + window.scrollY;
  const left = position.x + window.scrollX;

  return (
    <>
      {/* Highlight box rendered behind the prompt to show what is selected */}
      <div
        className="absolute z-[999998] border-2 border-blue-500 bg-blue-500/10 pointer-events-none rounded-sm transition-all"
        style={{
          top: `${position.y + window.scrollY}px`,
          left: `${position.x + window.scrollX}px`,
          width: `${position.width}px`,
          height: `${position.height}px`,
        }}
      />
      <div
        data-testid="capture-prompt-container"
        className="absolute z-[999999] pointer-events-auto w-[320px] bg-white dark:bg-[#1e293b] rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-[#334155] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          top: `${top}px`,
          left: `${left}px`,
        }}
      >
        <div className="flex items-center gap-[8px] px-4 py-3 bg-slate-50 dark:bg-[#0f172a] border-b border-slate-200 dark:border-[#334155]">
          <Sparkles size={16} className="text-blue-500" />
          <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 m-0">Analyze Area</h3>
        </div>
        <div className="p-3 pb-4">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2.5 text-[14px] bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-[#334155] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:text-slate-200 transition-all placeholder:text-slate-400"
            placeholder="Ask about this image..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="flex justify-between items-center mt-3 px-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <span className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5"><CornerDownLeft size={10} className="mr-1" /> Enter</span> to submit
            </div>
            <button
              onClick={() => onSubmit(prompt)}
              className="flex items-center gap-1.5 text-[12px] bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-3 py-1.5 rounded-md font-medium transition-all"
            >
              Analyze <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
