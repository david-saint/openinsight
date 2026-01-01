import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, Sparkles } from 'lucide-react';
import type { OpenRouterModel } from '../../lib/types.js';
import { ModelManager } from '../../lib/model-manager.js';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (modelId: string) => void;
  models: OpenRouterModel[];
  currentModelId?: string;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  models,
  currentModelId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sort models by price and filter by search
  const filteredModels = useMemo(() => {
    const sorted = ModelManager.sortByPrice(models);
    if (!searchQuery.trim()) return sorted;
    
    const query = searchQuery.toLowerCase();
    return sorted.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.id.toLowerCase().includes(query)
    );
  }, [models, searchQuery]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    // Reset search when modal closes
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (modelId: string) => {
    onSelect(modelId);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Select Model</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} className="opacity-50" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-700">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors"
            />
          </div>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filteredModels.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-xs opacity-50">
              No models found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredModels.map(model => {
                const isFree = ModelManager.isFreeModel(model);
                const isSelected = model.id === currentModelId;
                const priceDisplay = ModelManager.formatPrice(model.pricing.prompt);
                
                return (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-accent-50 dark:bg-accent-900/20 ring-1 ring-accent-500' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                            {model.name}
                          </span>
                          {isFree && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded">
                              <Sparkles size={10} />
                              Free
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] opacity-50 truncate mt-0.5">
                          {model.id}
                        </div>
                      </div>
                      <div className={`text-[10px] font-mono whitespace-nowrap ${isFree ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-50'}`}>
                        {priceDisplay}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700 text-[10px] opacity-50 text-center">
          {filteredModels.length} models available
        </div>
      </div>
    </div>
  );
};
