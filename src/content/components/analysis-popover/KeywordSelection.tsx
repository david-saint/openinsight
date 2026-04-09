import React, { useMemo } from 'react';
import { Sparkles, MousePointer2 } from 'lucide-react';

interface KeywordSelectionProps {
  text: string;
  keywordGroups: number[][];
  onToggleWord: (index: number) => void;
  onBreakLink: (indexLeft: number) => void;
  onAnalyze: () => void;
  accentColor: string;
}

export const KeywordSelection: React.FC<KeywordSelectionProps> = ({
  text,
  keywordGroups,
  onToggleWord,
  onBreakLink,
  onAnalyze,
  accentColor
}) => {
  const words = useMemo(() => {
    return text.split(/\s+/).filter(w => w.length > 0);
  }, [text]);

  const cleanWord = (word: string) => {
    return word.replace(/[.,!?;:()]/g, '');
  };

  return (
    <div className="p-[16px] text-[#475569] dark:text-[#cbd5e1] animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-center gap-[8px] mb-[12px]">
        <MousePointer2 size={12} className="text-[#94a3b8]" />
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-[#64748b]">
          Refine Keywords
        </h3>
      </div>

      <div className="flex flex-wrap gap-y-[8px] mb-[16px] max-h-[140px] overflow-y-auto p-[2px] items-center">
        {words.map((word, idx) => {
          const cleaned = cleanWord(word);
          const group = keywordGroups.find(g => g.includes(idx));
          const isSelected = !!group;
          const isLastInGroup = group ? group[group.length - 1] === idx : false;
          const hasNextLinked = group && !isLastInGroup;

          return (
            <React.Fragment key={`${cleaned}-${idx}`}>
              <button
                onClick={() => onToggleWord(idx)}
                className={`px-[5px] py-[1.5px] rounded-md text-[12px] transition-all duration-200 border ${
                  isSelected
                    ? 'bg-accent-500 text-white border-accent-600 shadow-sm border-b-2 font-medium z-10'
                    : 'bg-[#f1f5f9] dark:bg-[#334155] text-[#475569] dark:text-[#cbd5e1] border-[#e2e8f0] dark:border-[#475569] hover:border-accent-500 hover:z-10'
                }`}
              >
                {word}
              </button>
              
              {/* If this word has a link to the next word, draw a connecting line */}
              {hasNextLinked && (
                <button
                  onClick={() => onBreakLink(idx)}
                  className="group relative h-[4px] w-[12px] bg-accent-500 hover:bg-red-500 transition-colors mx-[-2px] z-0 cursor-pointer flex items-center justify-center"
                  title="Click to break link"
                  aria-label="Break phrase link"
                >
                  <div className="absolute inset-[-6px]" /> {/* Larger hit area */}
                </button>
              )}
              
              {/* Add spacing between unlinked words */}
              {!hasNextLinked && idx < words.length - 1 && (
                <div className="w-[4px]" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <button
        onClick={onAnalyze}
        className="w-[100%] py-[8px] bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg shadow-md shadow-accent-500/20 transition-all flex items-center justify-center gap-[8px] group active:scale-[0.98] text-[13px]"
      >
        <Sparkles size={14} className="group-hover:animate-pulse" />
        Update Analysis
      </button>
    </div>
  );
};
