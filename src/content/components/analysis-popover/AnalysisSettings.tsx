import React from 'react';
import { Settings } from 'lucide-react';

const ACCENTS = ['teal', 'indigo', 'rose', 'amber'] as const;

interface AnalysisSettingsProps {
  accentColor: string;
  onAccentChange?: ((color: string) => void) | undefined;
  onOpenFullSettings: () => void;
}

export const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({
  accentColor,
  onAccentChange,
  onOpenFullSettings,
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-[24px]">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-[#475569] dark:text-[#cbd5e1]">Accent Color</span>
        <div className="flex gap-[8px]">
          {ACCENTS.map((color) => (
            <button
              key={color}
              onClick={() => onAccentChange?.(color)}
              className={`w-[20px] h-[20px] rounded-full border-2 transition-transform hover:scale-110 ${
                accentColor === color ? 'border-accent-500 scale-110' : 'border-[transparent]'
              }`}
              style={{
                backgroundColor:
                  color === 'teal' ? '#0d9488' :
                  color === 'indigo' ? '#4f46e5' :
                  color === 'rose' ? '#e11d48' :
                  '#d97706',
              }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <div className="pt-[16px] border-t border-[#f1f5f9] dark:border-[#334155]">
        <button 
          onClick={onOpenFullSettings}
          className="w-[100%] py-[10px] px-[16px] rounded-lg border border-[#e2e8f0] dark:border-[#475569] text-[14px] font-semibold text-[#334155] dark:text-[#cbd5e1] hover:bg-[#f8fafc] dark:hover:bg-[#475569] transition-all flex items-center justify-center gap-[8px]"
        >
          <Settings size={14} />
          Open Full Settings
        </button>
      </div>
    </div>
  );
};
