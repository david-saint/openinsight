import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img 
      src="/logos/logo-transparent.png" 
      className={className} 
      alt="OpenInsight Logo" 
    />
  );
};