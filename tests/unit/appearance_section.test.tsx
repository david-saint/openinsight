/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppearanceSection } from '../../src/options/components/AppearanceSection';

const mockSettings = {
  theme: 'system',
  accentColor: 'teal',
  enabledTabs: ['explain', 'fact-check'],
} as any;

const themeColors = {
  teal: { name: 'Teal', ring: 'ring-teal-500', bg: 'bg-teal-500' },
};

describe('AppearanceSection', () => {
  const onSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Tab Customization section', () => {
    render(
      <AppearanceSection 
        settings={mockSettings} 
        onSave={onSave} 
        themeColors={themeColors} 
      />
    );

    expect(screen.getByText('Popover Tabs')).toBeInTheDocument();
    expect(screen.getByText('Explain')).toBeInTheDocument();
    expect(screen.getByText('Fact-check')).toBeInTheDocument();
  });
});
