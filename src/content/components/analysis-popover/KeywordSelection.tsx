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
    <div className="p-[20px] text-[#475569] dark:text-[#cbd5e1] animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="flex items-start gap-[12px] mb-[16px]">
        <div className="w-[32px] h-[32px] rounded-full bg-[#f8fafc] dark:bg-[#334155] flex items-center justify-center flex-shrink-0">
          <MousePointer2 size={14} className="text-[#94a3b8]" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-[2px]">
            Emphasize Keywords
          </h3>
          <p className="text-[12px] text-[#64748b] dark:text-[#94a3b8]">
            Select up to 3 words to focus the analysis.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-[6px] mb-[24px] max-h-[120px] overflow-y-auto p-[2px]">
        {words.map((word, idx) => {
          const cleaned = cleanWord(word);
          const isEmphasized = emphasizedWords.includes(cleaned);
          
          return (
            <button
              key={`${cleaned}-${idx}`}
              onClick={() => onToggleWord(cleaned)}
              className={`px-[6px] py-[2px] rounded-md text-[13px] transition-all duration-200 border ${
                isEmphasized
                  ? 'bg-accent-500 text-white border-accent-600 shadow-sm border-b-2'
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
        className="w-[100%] py-[10px] bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg shadow-md shadow-accent-500/20 transition-all flex items-center justify-center gap-[8px] group active:scale-[0.98]"
      >
        <Sparkles size={16} className="group-hover:animate-pulse" />
        Analyze Selection
      </button>
    </div>
  );
};
