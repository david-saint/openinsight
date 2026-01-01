import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { X, BookOpen, Search, Settings, AlertCircle, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { sendMessage } from '../../lib/messaging';

interface AnalysisPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectionText: string;
  accentColor?: string;
  onAccentChange?: (color: string) => void;
  position?: { top: number; left: number };
}

type TabId = 'explain' | 'fact-check';

const ACCENTS = ['teal', 'indigo', 'rose', 'amber'] as const;

interface TabData {
  content: string | null;
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
    
    const type = tab === 'explain' ? 'EXPLAIN' : 'FACT_CHECK';
    const response = await sendMessage(type, { text });

    if (response.success) {
      setData(prev => ({ ...prev, [tab]: { content: response.result || 'No content returned', loading: false, error: null } }));
    } else {
      setData(prev => ({ ...prev, [tab]: { content: null, loading: false, error: response.error || 'Failed to fetch' } }));
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
              {/* Header Section with Icon */}
              {activeTab === 'explain' && (
                <div className="flex items-start gap-[12px] mb-[16px]">
                  <div className="w-[32px] h-[32px] rounded-full bg-[#f8fafc] dark:bg-[#334155] flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="text-[#94a3b8]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#0f172a] dark:text-[#f1f5f9] mb-[2px]">
                      {activeTab === 'explain' ? 'Contextual Analysis' : 'Fact Check Result'}
                    </h3>
                    <p className="text-[12px] text-[#64748b] dark:text-[#94a3b8]">
                      {activeTab === 'explain' 
                        ? 'Generating simplified explanation based on architectural history context.'
                        : 'Verifying statement accuracy against trusted sources.'}
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
                <>
                  {activeTab === 'fact-check' && (
                    <div className="flex items-center gap-[8px] mb-[12px]">
                      <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] font-bold border bg-accent-100/50 text-accent-700 border-accent-100 dark:bg-accent-900/20 dark:text-accent-500 dark:border-accent-900/30">
                        <CheckCircle2 size={12} />
                        Verified
                      </span>
                      <span className="text-[12px] text-[#94a3b8]">High Confidence</span>
                    </div>
                  )}

                  {activeTab === 'explain' ? (<p className="text-[14px] leading-relaxed border-l-2 border-accent-500 pl-[12px] text-[#334155] dark:text-[#cbd5e1]">
                    {data[activeTab].content || getPlaceholderContent(activeTab)}
                  </p>) : (<p className="text-[14px] leading-relaxed text-[#334155] dark:text-[#cbd5e1]">
                    {data[activeTab].content || getPlaceholderContent(activeTab)}
                  </p>)}

                  {/* Footer */}
                  {activeTab === 'fact-check' && (<div className="mt-[16px] pt-[16px] border-t border-[#f8fafc] dark:border-[#334155] flex justify-between items-center">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-medium">
                      Source: Wikipedia API
                    </span>
                    <button className="text-[12px] font-medium flex items-center gap-[4px] text-accent-600 hover:text-accent-700 dark:text-accent-500 dark:hover:text-accent-400">
                      Read more <ChevronRight size={12} />
                    </button>
                  </div>)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};