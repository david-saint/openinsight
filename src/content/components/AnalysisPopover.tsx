import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { X, BookOpen, Search, Settings, AlertCircle, CheckCircle2, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';
import { sendMessage } from '../../lib/messaging.js';
import { BackendClient } from '../../lib/backend-client.js';
import type { ExplainResponse, FactCheckResponse } from '../../lib/types.js';

interface AnalysisPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectionText: string;
  selectionContext?: {
    paragraph: string;
    pageTitle: string;
    pageDescription: string;
  };
  accentColor?: string;
  onAccentChange?: (color: string) => void;
  position?: { top: number; left: number };
}

type TabId = 'explain' | 'fact-check';

const ACCENTS = ['teal', 'indigo', 'rose', 'amber'] as const;

interface TabData {
  content: ExplainResponse | FactCheckResponse | null;
  loading: boolean;
  error: string | null;
}

const POPOVER_WIDTH = 320;
const POPOVER_ESTIMATED_HEIGHT = 300; // Estimated max height for positioning calculations
const VIEWPORT_PADDING = 16; // Minimum distance from viewport edges

export const AnalysisPopover: React.FC<AnalysisPopoverProps> = ({ 
  isOpen, 
  onClose, 
  selectionText,
  selectionContext,
  accentColor = 'teal',
  onAccentChange,
  position
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('explain');
  const [showSettings, setShowSettings] = useState(false);
  const [data, setData] = useState<Record<TabId, TabData>>({
    explain: { content: null, loading: false, error: null },
    'fact-check': { content: null, loading: false, error: null },
  });
  const [adjustedPosition, setAdjustedPosition] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calculate viewport-aware position
  useLayoutEffect(() => {
    if (!isOpen || !position) {
      setAdjustedPosition(null);
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Convert absolute position to viewport-relative
    const relativeLeft = position.left - scrollX;
    const relativeTop = position.top - scrollY;

    let adjustedLeft = position.left;
    let adjustedTop = position.top;

    // Check if popover would overflow right edge
    if (relativeLeft + POPOVER_WIDTH + VIEWPORT_PADDING > viewportWidth) {
      // Move to the left of the trigger point
      adjustedLeft = position.left - POPOVER_WIDTH;
    }

    // Check if popover would overflow left edge
    if (adjustedLeft - scrollX < VIEWPORT_PADDING) {
      adjustedLeft = scrollX + VIEWPORT_PADDING;
    }

    // Check if popover would overflow bottom edge
    if (relativeTop + POPOVER_ESTIMATED_HEIGHT + VIEWPORT_PADDING > viewportHeight) {
      // Move above the trigger point (subtract estimated height + some gap)
      adjustedTop = position.top - POPOVER_ESTIMATED_HEIGHT - 8;
    }

    // Check if popover would overflow top edge
    if (adjustedTop - scrollY < VIEWPORT_PADDING) {
      adjustedTop = scrollY + VIEWPORT_PADDING;
    }

    setAdjustedPosition({ top: adjustedTop, left: adjustedLeft });
  }, [isOpen, position]);

  useEffect(() => {
    if (isOpen && selectionText) {
      setData({
        explain: { content: null, loading: false, error: null },
        'fact-check': { content: null, loading: false, error: null },
      });
      setActiveTab('explain');
      setShowSettings(false);
      fetchData('explain', selectionText);
    }
  }, [isOpen, selectionText]);

  const fetchData = async (tab: TabId, text: string) => {
    setData(prev => ({ ...prev, [tab]: { ...prev[tab], loading: true, error: null } }));
    
    try {
      let result;
      if (tab === 'explain') {
        result = await BackendClient.explainText(text);
      } else {
        result = await BackendClient.factCheckText(text, selectionContext || { paragraph: '', pageTitle: '', pageDescription: '' });
      }
      setData(prev => ({ ...prev, [tab]: { content: result, loading: false, error: null } }));
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to fetch';
      setData(prev => ({ ...prev, [tab]: { content: null, loading: false, error: errorMsg } }));
    }
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setShowSettings(false);
    if (!data[tab].content && !data[tab].loading) {
      fetchData(tab, selectionText);
    }
  };

  const openFullSettings = () => {
    sendMessage('OPEN_OPTIONS', {});
  };

  if (!isOpen) return null;

  // Placeholder content for when no data is loaded yet
  const getPlaceholderContent = (tab: TabId) => {
    if (tab === 'explain') {
      return selectionText.length > 50
        ? "This concept refers to the idea that the shape of a building or object should primarily relate to its intended function or purpose, rather than aesthetic appeal."
        : "The selected text is too short for a full context analysis. Try selecting a complete sentence.";
    }
    return "The statement appears consistent with general consensus, though specific nuances may vary depending on historical interpretation.";
  };

  const finalPosition = adjustedPosition || position;
  const isFactCheckVisible = selectionText.length > 50;

  return (
    <>
      {/* Transparent backdrop for click-outside closing */}
      <div 
        className="fixed inset-0 z-[9998] bg-[transparent]"
        onClick={onClose}
      />
      
      <div 
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        className="absolute z-[9999] w-[320px] bg-[#ffffff] dark:bg-[#1e293b] rounded-xl shadow-2xl border border-[#f1f5f9] dark:border-[#334155] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 font-sans"
        style={{
          top: finalPosition ? finalPosition.top : '50%',
          left: finalPosition ? finalPosition.left : '50%',
          transform: finalPosition ? 'none' : 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
        data-accent={accentColor}
      >
        {/* Header with Tabs */}
        <div className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-[#f1f5f9] dark:border-[#334155] px-[4px] pt-[4px] flex justify-between items-center h-[40px]">
          {showSettings ? (
            <div className="flex items-center w-[100%] px-[8px]">
              <button
                onClick={() => setShowSettings(false)}
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
                  onClick={() => handleTabChange('explain')}
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
                    onClick={() => handleTabChange('fact-check')}
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
                  onClick={() => setShowSettings(true)}
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

        {/* Content */}
        <div className="p-[20px] text-[#475569] dark:text-[#cbd5e1]">
          {/* Settings View */}
          {showSettings && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-[24px]">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium">Accent Color</span>
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
                  onClick={openFullSettings}
                  className="w-[100%] py-[10px] px-[16px] rounded-lg border border-[#e2e8f0] dark:border-[#475569] text-[14px] font-semibold text-[#334155] dark:text-[#cbd5e1] hover:bg-[#f8fafc] dark:hover:bg-[#475569] transition-all flex items-center justify-center gap-[8px]"
                >
                  <Settings size={14} />
                  Open Full Settings
                </button>
              </div>
            </div>
          )}

          {/* Main Content View */}
          {!showSettings && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              {/* Header Section with Icon - only show when loading or no content */}
              {activeTab === 'explain' && !data.explain.content && (
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
              {data[activeTab].loading && (
                <div data-testid="loading-skeleton" className="flex flex-col items-center justify-center gap-[12px] py-[32px] opacity-50">
                  <div className="w-[20px] h-[20px] border-2 border-[#e2e8f0] dark:border-[#475569] border-t-accent-500 rounded-full animate-spin" />
                  <span className="text-[14px] font-medium animate-pulse">Analyzing...</span>
                </div>
              )}
              
              {/* Error State */}
              {data[activeTab].error && (
                <div className="p-[16px] bg-[#fff1f2] dark:bg-[#4c051933] border border-[#ffe4e6] dark:border-[#8813374d] rounded-lg flex items-start gap-[12px]">
                  <AlertCircle className="text-[#f43f5e] shrink-0" size={18} />
                  <div className="space-y-[4px]">
                    <p className="text-[14px] font-medium text-[#9f1239] dark:text-[#fecdd3]">Failed to analyze</p>
                    <p className="text-[12px] text-[#e11d48] dark:text-[#fb7185]">{data[activeTab].error}</p>
                  </div>
                </div>
              )}

              {/* Content or Placeholder */}
              {!data[activeTab].loading && !data[activeTab].error && (
                <div className="space-y-[16px]">
                  {activeTab === 'explain' && (
                    <>
                      {data.explain.content ? (
                        <div className="space-y-[12px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <p className="text-[14px] leading-relaxed border-l-2 border-accent-500 pl-[12px] text-[#334155] dark:text-[#cbd5e1] font-medium">
                            {(data.explain.content as ExplainResponse).summary}
                          </p>
                          <p className="text-[13px] leading-relaxed text-[#475569] dark:text-[#94a3b8]">
                            {(data.explain.content as ExplainResponse).explanation}
                          </p>
                          {(data.explain.content as ExplainResponse).context?.example && (
                            <div className="bg-[#f8fafc] dark:bg-[#0f172a] p-[10px] rounded-lg border border-[#f1f5f9] dark:border-[#334155]">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-[#94a3b8] block mb-[4px]">Example</span>
                              <p className="text-[12px] italic text-[#64748b] dark:text-[#cbd5e1]">
                                {(data.explain.content as ExplainResponse).context?.example}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[14px] leading-relaxed border-l-2 border-accent-500 pl-[12px] text-[#334155] dark:text-[#cbd5e1]">
                          {getPlaceholderContent('explain')}
                        </p>
                      )}
                    </>
                  )}

                  {activeTab === 'fact-check' && (
                    <>
                      {data['fact-check'].content ? (
                        <div className="space-y-[12px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center gap-[8px]">
                            <span className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[11px] font-bold border ${
                              (data['fact-check'].content as FactCheckResponse).verdict === 'True' 
                                ? 'bg-emerald-100/50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-500 dark:border-emerald-900/30'
                                : (data['fact-check'].content as FactCheckResponse).verdict === 'False'
                                ? 'bg-rose-100/50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-500 dark:border-rose-900/30'
                                : 'bg-amber-100/50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-900/30'
                            }`}>
                              <CheckCircle2 size={12} />
                              {(data['fact-check'].content as FactCheckResponse).verdict}
                            </span>
                            <span className="text-[10px] text-[#64748b] dark:text-[#94a3b8]">
                              {(data['fact-check'].content as FactCheckResponse).verdict === 'True' || 
                               (data['fact-check'].content as FactCheckResponse).verdict === 'False'
                                ? 'High confidence'
                                : (data['fact-check'].content as FactCheckResponse).verdict === 'Partially True'
                                ? 'Medium confidence'
                                : 'Low confidence'}
                            </span>
                          </div>
                          <p className="text-[14px] leading-relaxed text-[#334155] dark:text-[#cbd5e1] font-medium">
                            {(data['fact-check'].content as FactCheckResponse).summary}
                          </p>
                          <p className="text-[13px] leading-relaxed text-[#475569] dark:text-[#94a3b8]">
                            {(data['fact-check'].content as FactCheckResponse).details}
                          </p>
                          
                          {(data['fact-check'].content as FactCheckResponse).sources && (data['fact-check'].content as FactCheckResponse).sources!.length > 0 && (
                            <div className="mt-[16px] pt-[12px] border-t border-[#f8fafc] dark:border-[#334155]">
                              <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold block mb-[8px]">Sources</span>
                              <div className="space-y-[8px]">
                                {(data['fact-check'].content as FactCheckResponse).sources!.map((source, idx) => {
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
                      ) : (
                        <p className="text-[14px] leading-relaxed text-[#334155] dark:text-[#cbd5e1]">
                          {getPlaceholderContent('fact-check')}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};