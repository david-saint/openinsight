import React, { useMemo } from 'react';
import { Sparkles, MousePointer2 } from 'lucide-react';

interface KeywordSelectionProps {
  text: string;
  emphasizedWords: string[];
  onToggleWord: (word: string) => void;
  onAnalyze: () => void;
  accentColor: string;
}

export const KeywordSelection: React.FC<KeywordSelectionProps> = ({
  text,
  emphasizedWords,
  onToggleWord,
  onAnalyze,
  accentColor
}) => {
  // Simple word splitting (removing common punctuation)
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

      <div className="flex flex-wrap gap-[4px] mb-[16px] max-h-[100px] overflow-y-auto p-[2px]">
        {words.map((word, idx) => {
          const cleaned = cleanWord(word);
          const isEmphasized = emphasizedWords.includes(cleaned);
          
          return (
            <button
              key={`${cleaned}-${idx}`}
              onClick={() => onToggleWord(cleaned)}
              className={`px-[5px] py-[1.5px] rounded-md text-[12px] transition-all duration-200 border ${
                isEmphasized
                  ? 'bg-accent-500 text-white border-accent-600 shadow-sm border-b-2 font-medium'
                  : 'bg-[#f1f5f9] dark:bg-[#334155] text-[#475569] dark:text-[#cbd5e1] border-[#e2e8f0] dark:border-[#475569] hover:border-accent-500'
              }`}
            >
              {word}
            </button>
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
