import React from 'react';
import type { ExplainResponse } from '../../../lib/types.js';

interface ExplainViewProps {
  data: ExplainResponse | null;
}

export const ExplainView: React.FC<ExplainViewProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-[12px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <p className="text-[14px] leading-relaxed border-l-2 border-accent-500 pl-[12px] text-[#334155] dark:text-[#cbd5e1] font-medium">
        {data.summary}
      </p>
      <p className="text-[13px] leading-relaxed text-[#475569] dark:text-[#94a3b8]">
        {data.explanation}
      </p>
      {data.context?.example && (
        <div className="bg-[#f8fafc] dark:bg-[#0f172a] p-[10px] rounded-lg border border-[#f1f5f9] dark:border-[#334155]">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#94a3b8] block mb-[4px]">Example</span>
          <p className="text-[12px] italic text-[#64748b] dark:text-[#cbd5e1]">
            {data.context.example}
          </p>
        </div>
      )}
    </div>
  );
};
