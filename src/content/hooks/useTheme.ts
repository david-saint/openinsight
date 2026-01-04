import { useState, useEffect } from 'react';

/**
 * Hook to handle theme logic, including system preference detection and listening.
 * @param themeSetting The user's theme setting ('light', 'dark', or 'system')
 * @returns boolean indicating if the active theme is dark
 */
export function useTheme(themeSetting: 'light' | 'dark' | 'system'): boolean {
  // Initialize with current system state
  const [isSystemDark, setIsSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []); // Empty dependency array as we only want to set up the listener once

  if (themeSetting === 'dark') return true;
  if (themeSetting === 'light') return false;
  return isSystemDark;
}
