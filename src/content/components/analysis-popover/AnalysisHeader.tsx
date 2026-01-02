import React from 'react';
import { BookOpen, Search, Settings, X } from 'lucide-react';

export type TabId = 'explain' | 'fact-check';

interface AnalysisHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onClose: () => void;
  showSettings: boolean;
  onSettingsClick: () => void;
  onBackClick: () => void;
  isFactCheckVisible: boolean;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({
  activeTab,
  onTabChange,
  onClose,
  showSettings,
  onSettingsClick,
  onBackClick,
  isFactCheckVisible
}) => {
  return (
    <div className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-[#f1f5f9] dark:border-[#334155] px-[4px] pt-[4px] flex justify-between items-center h-[40px]">
      {showSettings ? (
        <div className="flex items-center w-[100%] px-[8px]">
          <button
            onClick={onBackClick}
            className="p-[6px] rounded-md flex items-center gap-[4px] text-[12px] font-semibold text-[#64748b] dark:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#1e293b]"
          >
            ← Back
          </button>
          <span className="mx-auto text-[12px] font-bold uppercase tracking-wider text-[#94a3b8] dark:text-[#64748b]">
            Settings
          </span>
          <div className="w-[32px]" />
        </div>
      ) : (
        <>
          <div className="flex gap-[4px] ml-[4px]" role="tablist">
            <button
              onClick={() => onTabChange('explain')}
              role="tab"
              aria-selected={activeTab === 'explain'}
              className={`px-[16px] py-[10px] text-[12px] font-semibold rounded-t-lg transition-colors flex items-center gap-[6px] ${
                activeTab === 'explain'
                  ? 'bg-[#ffffff] dark:bg-[#1e293b] text-[#1e293b] dark:text-[#f1f5f9] shadow-sm border-t border-x border-[#f1f5f9] dark:border-[#334155] translate-y-[1px]'
                  : 'text-[#64748b] hover:text-[#334155] dark:hover:text-[#cbd5e1]'
              }`}
            >
              <BookOpen size={12} />
              Explain
            </button>
            {isFactCheckVisible && (
              <button
                onClick={() => onTabChange('fact-check')}
                role="tab"
                aria-selected={activeTab === 'fact-check'}
                className={`px-[16px] py-[10px] text-[12px] font-semibold rounded-t-lg transition-colors flex items-center gap-[6px] ${
                  activeTab === 'fact-check'
                    ? 'bg-[#ffffff] dark:bg-[#1e293b] text-[#1e293b] dark:text-[#f1f5f9] shadow-sm border-t border-x border-[#f1f5f9] dark:border-[#334155] translate-y-[1px]'
                    : 'text-[#64748b] hover:text-[#334155] dark:hover:text-[#cbd5e1]'
                }`}
              >
                <Search size={12} />
                Fact Check
              </button>
            )}
          </div>
          <div className="flex items-center gap-[4px] pr-[8px]">
            <button
              onClick={onSettingsClick}
              className="p-[6px] rounded-md transition-colors text-[#94a3b8] hover:text-[#475569] dark:hover:text-[#e2e8f0] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]"
              title="Settings"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-[6px] rounded-md transition-colors text-[#94a3b8] hover:text-[#475569] dark:hover:text-[#e2e8f0] hover:bg-[#f1f5f9] dark:hover:bg-[#334155]"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
