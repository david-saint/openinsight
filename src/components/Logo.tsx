import React from 'react';
import logoUrl from '../assets/logo.svg';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img 
      src={logoUrl} 
      className={className} 
      alt="OpenInsight Logo" 
    />
  );
};
