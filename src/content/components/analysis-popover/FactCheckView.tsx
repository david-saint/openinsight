import React from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import type { FactCheckResponse } from '../../../lib/types.js';

interface FactCheckViewProps {
  data: FactCheckResponse | null;
}

export const FactCheckView: React.FC<FactCheckViewProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-[12px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-[8px]">
        <span className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[11px] font-bold border ${
          data.verdict === 'True' 
            ? 'bg-emerald-100/50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-500 dark:border-emerald-900/30'
            : data.verdict === 'False'
            ? 'bg-rose-100/50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-500 dark:border-rose-900/30'
            : 'bg-amber-100/50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-900/30'
        }`}>
          <CheckCircle2 size={12} />
          {data.verdict}
        </span>
        <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">
          {data.verdict === 'True' || data.verdict === 'False'
            ? 'High confidence'
            : data.verdict === 'Partially True'
            ? 'Medium confidence'
            : 'Low confidence'}
        </span>
      </div>
      <p className="text-[14px] leading-relaxed text-[#334155] dark:text-[#cbd5e1] font-medium">
        {data.summary}
      </p>
      <p className="text-[13px] leading-relaxed text-[#475569] dark:text-[#94a3b8]">
        {data.details}
      </p>
      
      {data.sources && data.sources.length > 0 && (
        <div className="mt-[16px] pt-[12px] border-t border-[#f8fafc] dark:border-[#334155]">
          <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold block mb-[8px]">Sources</span>
          <div className="space-y-[8px]">
            {data.sources.map((source, idx) => {
              // Extract hostname from URL
              let hostname = source.url;
              try {
                hostname = new URL(source.url).hostname.replace('www.', '');
              } catch (e) {
                // Keep original URL if parsing fails
              }
              
              return (
                <a 
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-[6px] px-[8px] rounded-lg bg-[#f8fafc] dark:bg-[#0f172a] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors group"
                >
                  <span className="text-[11px] text-[#475569] dark:text-[#94a3b8]">
                    <span className="font-medium text-[#334155] dark:text-[#e2e8f0]">{hostname}</span>
                  </span>
                  <span className="text-[10px] text-accent-600 dark:text-accent-400 font-medium flex items-center gap-[4px] group-hover:underline">
                    Read more
                    <ExternalLink size={10} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
