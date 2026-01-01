import React from 'react';
import { Logo } from '../../components/Logo.js';

export const PopupHeader: React.FC = () => {
  return (
    <header className="mb-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-white shadow-sm dark:bg-slate-800 dark:shadow-none transition-colors">
          <Logo className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-serif font-medium text-slate-800 dark:text-slate-100">
          OpenInsight
        </h1>
      </div>
      <p className="text-[10px] uppercase tracking-widest font-medium text-slate-400 dark:text-slate-500">
        Epistemic Clarity Engine
      </p>
    </header>
  );
};
