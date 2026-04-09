import React, { useState, useEffect, useRef } from 'react';

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
      inputRef.current.focus();
    }
  }, [isActive]);

  if (!isActive) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit(prompt);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  // Position it just below the selected region
  const top = position.y + position.height + 8;
  const left = position.x;

  return (
    <div
      data-testid="capture-prompt-container"
      className="absolute z-[999999] p-2 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-2 transition-all"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${Math.max(position.width, 250)}px`, // ensure a minimum width for the input
      }}
    >
      <input
        ref={inputRef}
        type="text"
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white dark:border-gray-600"
        placeholder="Add a prompt (optional)..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">Press Enter to submit</span>
        <button
          onClick={() => onSubmit(prompt)}
          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
};
