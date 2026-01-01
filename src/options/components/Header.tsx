import React from 'react';
import { Logo } from '../../components/Logo.js';

export const Header: React.FC = () => {
  return (
    <header className="mb-12 text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-white shadow-sm dark:bg-slate-800 dark:shadow-none transition-colors">
          <Logo className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-serif font-medium text-slate-800 dark:text-slate-100">
          OpenInsight
        </h1>
      </div>
      <p className="text-xs uppercase tracking-widest font-medium text-slate-400 dark:text-slate-500">
        Epistemic Clarity Engine
      </p>
    </header>
  );
};
