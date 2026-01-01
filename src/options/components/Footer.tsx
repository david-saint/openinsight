import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 text-center text-xs text-slate-400 opacity-60">
      <p>© 2025 OpenInsight • {process.env.NODE_ENV === 'development' ? 'Dev Build' : 'v1.0.0'}</p>
    </footer>
  );
};
