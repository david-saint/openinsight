import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../../lib/messaging.js';
import { BackendClient } from '../../lib/backend-client.js';
import type { ExplainResponse, FactCheckResponse } from '../../lib/types.js';
import { usePopoverPosition } from '../hooks/usePopoverPosition.js';
import { AnalysisHeader, type TabId } from './analysis-popover/AnalysisHeader.js';
import { AnalysisSettings } from './analysis-popover/AnalysisSettings.js';
import { AnalysisContent } from './analysis-popover/AnalysisContent.js';

interface AnalysisPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectionText: string;
  selectionContext?: {
    paragraph: string;
    pageTitle: string;
    pageDescription: string;
  } | undefined;
  accentColor?: string;
  onAccentChange?: (color: string) => void;
  position?: { top: number; left: number };
}

interface TabData {
  content: ExplainResponse | FactCheckResponse | null;
  loading: boolean;
  error: string | null;
}

export const AnalysisPopover = React.memo(({
  isOpen, 
  onClose, 
  selectionText,
  selectionContext,
  accentColor = 'teal',
  onAccentChange,
  position
}: AnalysisPopoverProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('explain');
  const [showSettings, setShowSettings] = useState(false);
  const [data, setData] = useState<Record<TabId, TabData>>({
    explain: { content: null, loading: false, error: null },
    'fact-check': { content: null, loading: false, error: null },
  });
  
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Custom hook for positioning
  const finalPosition = usePopoverPosition(isOpen, position);

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

  // Fact check tab visibility logic
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
        <AnalysisHeader 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onClose={onClose}
          showSettings={showSettings}
          onSettingsClick={() => setShowSettings(true)}
          onBackClick={() => setShowSettings(false)}
          isFactCheckVisible={isFactCheckVisible}
        />

        {showSettings ? (
          <div className="p-[20px] text-[#475569] dark:text-[#cbd5e1]">
            <AnalysisSettings 
              accentColor={accentColor}
              onAccentChange={onAccentChange}
              onOpenFullSettings={openFullSettings}
            />
          </div>
        ) : (
          <AnalysisContent 
            activeTab={activeTab} 
            data={data[activeTab]} 
          />
        )}
      </div>
    </>
  );
});

AnalysisPopover.displayName = 'AnalysisPopover';
