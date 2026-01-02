import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import type { ExplainResponse, FactCheckResponse } from '../../../lib/types.js';
import { ExplainView } from './ExplainView.js'; // Explicit extension for ESM
import { FactCheckView } from './FactCheckView.js';
import type { TabId } from './AnalysisHeader.js';

interface TabDataState {
  content: ExplainResponse | FactCheckResponse | null;
  loading: boolean;
  error: string | null;
}

interface AnalysisContentProps {
  activeTab: TabId;
  data: TabDataState;
}

export const AnalysisContent: React.FC<AnalysisContentProps> = ({ activeTab, data }) => {
  return (
    <div className="p-[20px] text-[#475569] dark:text-[#cbd5e1] animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Header Section with Icon - only show when loading or no content for Explain tab */}
      {activeTab === 'explain' && !data.content && !data.error && (
        <div className="flex items-start gap-[12px] mb-[16px]">
          <div className="w-[32px] h-[32px] rounded-full bg-[#f8fafc] dark:bg-[#334155] flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-[#94a3b8]" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-[2px]">
              Contextual Analysis
            </h3>
            <p className="text-[12px] text-[#64748b] dark:text-[#94a3b8]">
              Generating simplified explanation based on context.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {data.loading && (
        <div data-testid="loading-skeleton" className="flex flex-col items-center justify-center gap-[12px] py-[32px] opacity-50">
          <div className="w-[20px] h-[20px] border-2 border-[#e2e8f0] dark:border-[#475569] border-t-accent-500 rounded-full animate-spin" />
          <span className="text-[14px] font-medium animate-pulse">Analyzing...</span>
        </div>
      )}

      {/* Error State */}
      {data.error && (
        <div className="p-[16px] bg-[#fff1f2] dark:bg-[#4c051933] border border-[#ffe4e6] dark:border-[#8813374d] rounded-lg flex items-start gap-[12px]">
          <AlertCircle className="text-[#f43f5e] shrink-0" size={18} />
          <div className="space-y-[4px]">
            <p className="text-[14px] font-medium text-[#9f1239] dark:text-[#fecdd3]">Failed to analyze</p>
            <p className="text-[12px] text-[#e11d48] dark:text-[#fb7185]">{data.error}</p>
          </div>
        </div>
      )}

      {/* Content View */}
      {!data.loading && !data.error && data.content && (
        <div className="space-y-[16px]">
          {activeTab === 'explain' ? (
            <ExplainView data={data.content as ExplainResponse} />
          ) : (
            <FactCheckView data={data.content as FactCheckResponse} />
          )}
        </div>
      )}
      
      {/* Empty State / No Content (if not loading and not error and no content) */}
      {!data.loading && !data.error && !data.content && (
         <p className="text-[14px] leading-relaxed border-l-2 border-accent-500 pl-[12px] text-[#334155] dark:text-[#cbd5e1]">
            No analysis available.
        </p>
      )}
    </div>
  );
};
