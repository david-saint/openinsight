import React, { useState, useEffect } from 'react';
import { X, MessageSquare, ShieldCheck, Settings, AlertCircle } from 'lucide-react';
import { sendMessage } from '../../lib/messaging';

interface AnalysisPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectionText: string;
  accentColor?: string;
  onAccentChange?: (color: string) => void;
  position?: { top: number; left: number };
}

type TabId = 'explain' | 'fact-check' | 'settings';

const ACCENTS = ['teal', 'indigo', 'rose', 'amber'] as const;

export const AnalysisPopover: React.FC<AnalysisPopoverProps> = ({ 
  isOpen, 
  onClose, 
  selectionText,
  accentColor = 'teal',
  onAccentChange,
  position
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('explain');
  const [data, setData] = useState<Record<'explain' | 'fact-check', TabData>>({
    explain: { content: null, loading: false, error: null },
    'fact-check': { content: null, loading: false, error: null },
  });

  // Close on click outside is handled by the backdrop in modal, 
  // but for popover we need a different approach if we remove the backdrop.
  // For now, I will keep a transparent backdrop to handle 'click outside' easily.

  useEffect(() => {
    if (isOpen && selectionText) {
      // Reset data when a new selection is opened
      setData({
        explain: { content: null, loading: false, error: null },
        'fact-check': { content: null, loading: false, error: null },
      });
      setActiveTab('explain');
      fetchData('explain', selectionText);
    }
  }, [isOpen, selectionText]);
  const fetchData = async (tab: 'explain' | 'fact-check', text: string) => {
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
    if ((tab === 'explain' || tab === 'fact-check') && !data[tab].content && !data[tab].loading) {
      fetchData(tab, selectionText);
    }
  };

  const openFullSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  if (!isOpen) return null;

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
        className="absolute z-[9999] w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top-left"
        style={{
          top: position ? position.top : '50%',
          left: position ? position.left : '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)',
          maxHeight: '400px'
        }}
        onClick={(e) => e.stopPropagation()}
        data-accent={accentColor}
      >
        {/* Header */}
        <div className="px-6 pt-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Analysis</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'explain'}
              onClick={() => handleTabChange('explain')}
              className={`pb-3 text-xs font-medium transition-all relative ${
                activeTab === 'explain' 
                  ? 'text-accent-500' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare size={14} />
                Explain
              </div>
              {activeTab === 'explain' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 rounded-full" />
              )}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'fact-check'}
              onClick={() => handleTabChange('fact-check')}
              className={`pb-3 text-xs font-medium transition-all relative ${
                activeTab === 'fact-check' 
                  ? 'text-accent-500' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Fact Check
              </div>
              {activeTab === 'fact-check' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 rounded-full" />
              )}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'settings'}
              onClick={() => handleTabChange('settings')}
              className={`pb-3 text-xs font-medium transition-all relative ${
                activeTab === 'settings' 
                  ? 'text-accent-500' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Settings size={14} />
                Settings
              </div>
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab !== 'settings' && (
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Selected Text</h3>
              <p className="text-sm text-slate-600 italic border-l-2 border-accent-500 pl-4 py-1 bg-slate-50">
                {selectionText}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {(activeTab === 'explain' || activeTab === 'fact-check') && (
              <>
                {data[activeTab].loading && (
                  <div data-testid="loading-skeleton" className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  </div>
                )}
                
                {data[activeTab].error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-rose-500 shrink-0" size={18} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-rose-800">Failed to analyze</p>
                      <p className="text-xs text-rose-600">{data[activeTab].error}</p>
                    </div>
                  </div>
                )}

                {data[activeTab].content && (
                  <div className="space-y-4">
                    {activeTab === 'fact-check' && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                        <span className="text-[10px] text-slate-400">Source: OpenInsight Engine</span>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                      {data[activeTab].content}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-8 py-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Accent Color</span>
                    <div className="flex gap-2">
                      {ACCENTS.map((color) => (
                        <button
                          key={color}
                          onClick={() => onAccentChange?.(color)}
                          className={`w-5 h-5 rounded-full ring-offset-2 transition-all ${
                            color === 'teal' ? 'bg-teal-500' :
                            color === 'indigo' ? 'bg-indigo-500' :
                            color === 'rose' ? 'bg-rose-500' :
                            'bg-amber-500'
                          } ${accentColor === color ? 'ring-2 ring-accent-500' : 'opacity-60 hover:opacity-100'}`}
                          aria-label={`Set accent to ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={openFullSettings}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Settings size={14} />
                    Open Full Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};