import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage } from '../../lib/messaging.js';
import { BackendClient } from '../../lib/backend-client.js';
import type { ExplainResponse, FactCheckResponse } from '../../lib/types.js';
import { usePopoverPosition } from '../hooks/usePopoverPosition.js';
import { AnalysisHeader, type TabId } from './analysis-popover/AnalysisHeader.js';
import { AnalysisSettings } from './analysis-popover/AnalysisSettings.js';
import { AnalysisContent } from './analysis-popover/AnalysisContent.js';
import { KeywordSelection } from './analysis-popover/KeywordSelection.js';

interface AnalysisPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectionText?: string;
  selectionContext?: {
    paragraph: string;
    pageTitle: string;
    pageDescription: string;
  } | undefined;
  imageUrl?: string;
  imagePrompt?: string;
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
  imageUrl,
  imagePrompt,
  accentColor = 'teal',
  onAccentChange,
  position,
  enabledTabs = DEFAULT_ENABLED_TABS
}: AnalysisPopoverProps) => {
  const [activeTab, setActiveTab] = useState<TabId>(enabledTabs[0] as TabId);
  const [showSettings, setShowSettings] = useState(false);
  const [isSelectingKeywords, setIsSelectingKeywords] = useState(false);
  const [keywordGroups, setKeywordGroups] = useState<number[][]>([]);

  const emphasizedWords = React.useMemo(() => {
    if (!selectionText) return [];
    const words = selectionText.split(/\s+/).filter(w => w.length > 0);
    const cleanWord = (word: string) => word.replace(/[.,!?;:()]/g, '');
    
    return keywordGroups.map(group => 
      group.map(idx => cleanWord(words[idx])).join(' ')
    );
  }, [selectionText, keywordGroups]);

  const [data, setData] = useState<Record<TabId, TabData>>({
    explain: { content: null, loading: false, error: null },
    'fact-check': { content: null, loading: false, error: null },
  });
  
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Custom hook for positioning
  const finalPosition = usePopoverPosition(isOpen, position);

  useEffect(() => {
    if (isOpen && (selectionText || imageUrl)) {
      setData({
        explain: { content: null, loading: false, error: null },
        'fact-check': { content: null, loading: false, error: null },
      });
      
      // Determine default active tab based on enabledTabs and visibility
      let defaultTab = enabledTabs[0] as TabId;
      const isFactCheckVisible = selectionText ? selectionText.length > 50 : false;
      if (defaultTab === 'fact-check' && !isFactCheckVisible) {
        // If first tab is fact-check but not visible, try second tab if it exists
        if (enabledTabs.length > 1) {
          defaultTab = enabledTabs[1] as TabId;
        }
      }
      
      setActiveTab(defaultTab);
      setShowSettings(false);
      setIsSelectingKeywords(false);
      setKeywordGroups([]);
      
      // Trigger initial fetch immediately
      fetchData(defaultTab, selectionText || '', [], imageUrl, imagePrompt);
    }
  }, [isOpen, selectionText, imageUrl, imagePrompt, enabledTabs]);

  const fetchData = async (tab: TabId, text: string, keywords: string[] = [], img?: string, prompt?: string) => {
    setData(prev => ({ ...prev, [tab]: { ...prev[tab], loading: true, error: null } }));
    
    try {
      let result;
      if (tab === 'explain') {
        if (img) {
          result = await BackendClient.explainImage(img, prompt || text);
        } else {
          result = await BackendClient.explainText(text, keywords);
        }
      } else {
        result = await BackendClient.factCheckText(
          text, 
          selectionContext || { paragraph: '', pageTitle: '', pageDescription: '' },
          keywords
        );
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

    // If we're already in analysis mode, fetch data if missing
    if (!isSelectingKeywords) {
      const currentData = dataRef.current;
      if (!currentData[tab].content && !currentData[tab].loading) {
        fetchDataRef.current(tab, selectionText, emphasizedWords);
      }
    }
  }, [selectionText, isSelectingKeywords, emphasizedWords]);

  const handleAnalyze = useCallback(() => {
    setIsSelectingKeywords(false);
    fetchDataRef.current(activeTab, selectionText, emphasizedWords);
  }, [activeTab, selectionText, emphasizedWords]);

  const handleToggleKeyword = useCallback((index: number) => {
    setKeywordGroups(prev => {
      const groupIdx = prev.findIndex(g => g.includes(index));
      if (groupIdx !== -1) {
        let newGroups = [...prev];
        const g = newGroups[groupIdx];
        const before = g.filter(x => x < index);
        const after = g.filter(x => x > index);
        
        newGroups.splice(groupIdx, 1);
        if (after.length) newGroups.splice(groupIdx, 0, after);
        if (before.length) newGroups.splice(groupIdx, 0, before);
        
        return newGroups;
      } else {
        let newGroups = [...prev];
        let mergedGroup = [index];
        const prevGroupIdx = newGroups.findIndex(g => g.includes(index - 1));
        const nextGroupIdx = newGroups.findIndex(g => g.includes(index + 1));
        
        const groupsToRemove = new Set<number>();
        if (prevGroupIdx !== -1) {
           mergedGroup = [...newGroups[prevGroupIdx], ...mergedGroup];
           groupsToRemove.add(prevGroupIdx);
        }
        if (nextGroupIdx !== -1) {
           mergedGroup = [...mergedGroup, ...newGroups[nextGroupIdx]];
           groupsToRemove.add(nextGroupIdx);
        }
        
        newGroups = newGroups.filter((_, i) => !groupsToRemove.has(i));
        newGroups.push(mergedGroup);
        // Sort by first element
        newGroups.sort((a, b) => a[0] - b[0]);
        
        // FIFO if more than 3
        if (newGroups.length > 3) {
          return newGroups.slice(-3);
        }
        return newGroups;
      }
    });
  }, []);

  const handleBreakLink = useCallback((indexLeft: number) => {
    setKeywordGroups(prev => {
      const groupIdx = prev.findIndex(g => g.includes(indexLeft) && g.includes(indexLeft + 1));
      if (groupIdx === -1) return prev;
      
      const newGroups = [...prev];
      const g = newGroups[groupIdx];
      const before = g.filter(x => x <= indexLeft);
      const after = g.filter(x => x > indexLeft);
      
      newGroups.splice(groupIdx, 1, before, after);
      
      if (newGroups.length > 3) {
        return newGroups.slice(-3);
      }
      return newGroups;
    });
  }, []);

  const openFullSettings = useCallback(() => {
    sendMessage('OPEN_OPTIONS', undefined);
  }, []);

  const handleSettingsClick = useCallback(() => setShowSettings(true), []);
  const handleBackClick = useCallback(() => setShowSettings(false), []);
  const handleToggleKeywords = useCallback(() => setIsSelectingKeywords(prev => !prev), []);

  if (!isOpen) return null;

  // Fact check tab visibility logic
  const isFactCheckVisible = selectionText ? selectionText.length > 50 : false;

  return (
    <>
      {/* Transparent backdrop for click-outside closing */}
      <div 
        className="fixed inset-0 z-[9998] bg-[transparent] pointer-events-auto"
        onClick={onClose}
      />
      
      <div 
        ref={popoverRef}
        role="presentation"
        aria-modal="false"
        className="absolute z-[9999] w-[330px] bg-[#ffffff] dark:bg-[#1e293b] rounded-xl shadow-2xl border border-[#f1f5f9] dark:border-[#334155] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 font-sans pointer-events-auto"
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
          isSelectingKeywords={isSelectingKeywords}
          onToggleKeywords={handleToggleKeywords}
          showKeywordsTool={!imageUrl && !!selectionText}
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
          <>
            {isSelectingKeywords && (
              <div className="border-b border-[#f1f5f9] dark:border-[#334155] bg-[#f8fafc] dark:bg-[#0f172a]/50">
                <KeywordSelection 
                  text={selectionText}
                  keywordGroups={keywordGroups}
                  onToggleWord={handleToggleKeyword}
                  onBreakLink={handleBreakLink}
                  onAnalyze={handleAnalyze}
                  accentColor={accentColor}
                />
              </div>
            )}
            <AnalysisContent 
              activeTab={activeTab} 
              data={data[activeTab]} 
            />
          </>
        )}
      </div>
    </>
  );
});

AnalysisPopover.displayName = 'AnalysisPopover';
