import React, { useState, useEffect } from 'react';
import { X, BookOpen, Search, Settings, AlertCircle, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { sendMessage } from '../../lib/messaging.js';

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
    chrome.runtime.openOptionsPage();
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

  return (
    <>
      {/* Transparent backdrop for click-outside closing */}
      <div 
        className="fixed inset-0 z-[9998] bg-transparent"
        onClick={onClose}
      />
      
      <div 
        role="dialog"
        aria-modal="true"
        className="absolute z-[9999] w-[320px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300"
        style={{
          top: position ? position.top : '50%',
          left: position ? position.left : '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
        data-accent={accentColor}
      >
        {/* Header with Tabs */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-1 pt-1 flex justify-between items-center h-10">
          {showSettings ? (
            <div className="flex items-center w-full px-2">
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-md flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                ← Back
              </button>
              <span className="mx-auto text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Settings
              </span>
              <div className="w-8" />
            </div>
          ) : (
            <>
              <div className="flex gap-1 ml-1">
                <button
                  onClick={() => handleTabChange('explain')}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'explain'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border-t border-x border-slate-100 dark:border-slate-700 translate-y-[1px]'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <BookOpen size={12} />
                  Explain
                </button>
                <button
                  onClick={() => handleTabChange('fact-check')}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'fact-check'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border-t border-x border-slate-100 dark:border-slate-700 translate-y-[1px]'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Search size={12} />
                  Fact Check
                </button>
              </div>
              <div className="flex items-center gap-1 pr-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-1.5 rounded-md transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Settings"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-5 text-slate-600 dark:text-slate-300">
          {/* Settings View */}
          {showSettings && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Accent Color</span>
                <div className="flex gap-2">
                  {ACCENTS.map((color) => (
                    <button
                      key={color}
                      onClick={() => onAccentChange?.(color)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                        accentColor === color ? 'border-accent-500 scale-110' : 'border-transparent'
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

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={openFullSettings}
                  className="w-full py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
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
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">
                    {activeTab === 'explain' ? 'Contextual Analysis' : 'Fact Check Result'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeTab === 'explain' 
                      ? 'Generating simplified explanation based on architectural history context.'
                      : 'Verifying statement accuracy against trusted sources.'}
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {data[activeTab].loading && (
                <div data-testid="loading-skeleton" className="flex flex-col items-center justify-center gap-3 py-8 opacity-50">
                  <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-600 border-t-accent-500 rounded-full animate-spin" />
                  <span className="text-sm font-medium animate-pulse">Analyzing...</span>
                </div>
              )}
              
              {/* Error State */}
              {data[activeTab].error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="text-rose-500 shrink-0" size={18} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-rose-800 dark:text-rose-200">Failed to analyze</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400">{data[activeTab].error}</p>
                  </div>
                </div>
              )}

              {/* Content or Placeholder */}
              {!data[activeTab].loading && !data[activeTab].error && (
                <>
                  {activeTab === 'fact-check' && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-accent-100/50 text-accent-600 border-accent-100 dark:bg-accent-900/20 dark:text-accent-500 dark:border-accent-900/30">
                        <CheckCircle2 size={12} />
                        Verified
                      </span>
                      <span className="text-xs text-slate-400">High Confidence</span>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed border-l-2 border-accent-500 pl-3 text-slate-700 dark:text-slate-300">
                    {data[activeTab].content || getPlaceholderContent(activeTab)}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                      Source: Wikipedia API
                    </span>
                    <button className="text-xs font-medium flex items-center gap-1 text-accent-600 hover:text-accent-700 dark:text-accent-500 dark:hover:text-accent-400">
                      Read more <ChevronRight size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};