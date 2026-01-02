/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { IntelligenceSection } from '../../src/options/components/IntelligenceSection';
import { DEFAULT_SETTINGS } from '../../src/lib/settings';

describe('IntelligenceSection Advanced Settings', () => {
  const onSave = vi.fn();
  const models = [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSettings = {
    ...DEFAULT_SETTINGS,
    stylePreference: 'Concise',
    explainSettings: { temperature: 0.1, max_tokens: 512, system_prompt: '' },
    factCheckSettings: { temperature: 0.1, max_tokens: 512, system_prompt: '' },
  } as any;

  it('renders Style Preference dropdown', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={models} 
      />
    );

    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Concise')).toBeInTheDocument();
  });

  it('renders advanced settings inputs', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={models} 
      />
    );

    // Click both "Advanced" buttons
    const advancedButtons = screen.getAllByText(/advanced/i);
    fireEvent.click(advancedButtons[0]);
    fireEvent.click(advancedButtons[1]);

    // Check for temperature sliders
    const tempSliders = screen.getAllByLabelText(/temperature/i);
    expect(tempSliders.length).toBe(2);

    // Check for max tokens sliders
    const tokenSliders = screen.getAllByLabelText(/max tokens/i);
    expect(tokenSliders.length).toBe(2);
    
    // Ensure system prompt is NOT there
    expect(screen.queryByLabelText(/system prompt/i)).not.toBeInTheDocument();
  });

  it('calls onSave when explain temperature changes', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={models} 
      />
    );

    const advancedButtons = screen.getAllByText(/advanced/i);
    fireEvent.click(advancedButtons[0]);

    const explainTemp = screen.getAllByLabelText(/temperature/i)[0];
    fireEvent.change(explainTemp!, { target: { value: '0.9' } });

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      explainSettings: expect.objectContaining({
        temperature: 0.9
      })
    }));
  });

  it('calls onSave when style preference changes', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={models} 
      />
    );

    const styleSelect = screen.getByDisplayValue('Concise');
    fireEvent.change(styleSelect, { target: { value: 'Detailed' } });

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      stylePreference: 'Detailed'
    }));
  });
});