import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  enabledTabs?: string[];
}

interface TabData {
  content: ExplainResponse | FactCheckResponse | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_ENABLED_TABS = ['explain', 'fact-check'];

export const AnalysisPopover = React.memo(({
  isOpen, 
  onClose, 
  selectionText,
  selectionContext,
  accentColor = 'teal',
  onAccentChange,
  position,
  enabledTabs = DEFAULT_ENABLED_TABS
}: AnalysisPopoverProps) => {
  const [activeTab, setActiveTab] = useState<TabId>(enabledTabs[0] as TabId);
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
      
      // Determine default active tab based on enabledTabs and visibility
      let defaultTab = enabledTabs[0] as TabId;
      if (defaultTab === 'fact-check' && selectionText.length <= 50) {
        // If first tab is fact-check but not visible, try second tab if it exists
        if (enabledTabs.length > 1) {
          defaultTab = enabledTabs[1] as TabId;
        }
      }
      
      setActiveTab(defaultTab);
      setShowSettings(false);
      fetchData(defaultTab, selectionText);
    }
  }, [isOpen, selectionText, enabledTabs]);

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

  // We use refs to access the latest data and fetchData function inside the stable callback
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const fetchDataRef = useRef(fetchData);
  useEffect(() => { fetchDataRef.current = fetchData; });

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setShowSettings(false);

    // Check if we need to fetch data for this tab
    const currentData = dataRef.current;
    if (!currentData[tab].content && !currentData[tab].loading) {
      fetchDataRef.current(tab, selectionText);
    }
  }, [selectionText]);

  const openFullSettings = useCallback(() => {
    sendMessage('OPEN_OPTIONS', {});
  }, []);

  const handleSettingsClick = useCallback(() => setShowSettings(true), []);
  const handleBackClick = useCallback(() => setShowSettings(false), []);

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
          onSettingsClick={handleSettingsClick}
          onBackClick={handleBackClick}
          isFactCheckVisible={isFactCheckVisible}
          enabledTabs={enabledTabs}
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
