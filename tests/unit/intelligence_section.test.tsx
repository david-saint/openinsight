/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntelligenceSection } from '../../src/options/components/IntelligenceSection.js';

const mockModels = [
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' },
];

const mockSettings = {
  theme: 'system',
  accentColor: 'teal',
  explainModel: 'google/gemini-2.0-flash-exp:free',
  factCheckModel: 'meta-llama/llama-3.3-70b-instruct:free',
  triggerMode: 'icon',
  explainSettings: { temperature: 0.7, max_tokens: 512, system_prompt: 'explain' },
  factCheckSettings: { temperature: 0.3, max_tokens: 512, system_prompt: 'factcheck' },
} as any;

describe('IntelligenceSection', () => {
  const onSave = vi.fn();
  const onBrowseModels = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render both Explain and Fact-Check sections', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels} 
      />
    );

    expect(screen.getByText('Explain Model')).toBeInTheDocument();
    expect(screen.getByText('Fact-Check Model')).toBeInTheDocument();
  });

  it('should call onBrowseModels when "Browse all models" is clicked', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels}
        allModels={[{ id: 'more', name: 'More' } as any, { id: 'even-more', name: 'Even More' } as any, { id: 'third', name: 'Third' } as any]}
        onBrowseModels={onBrowseModels}
      />
    );

    const browseButtons = screen.getAllByText('Browse all models');
    fireEvent.click(browseButtons[0]!);
    expect(onBrowseModels).toHaveBeenCalledWith('explain');

    fireEvent.click(browseButtons[1]!);
    expect(onBrowseModels).toHaveBeenCalledWith('factCheck');
  });

  it('should show the current model even if it is not in the default list', () => {
    const settingsWithCustomModel = {
      ...mockSettings,
      explainModel: 'custom/special-model'
    };

    render(
      <IntelligenceSection 
        settings={settingsWithCustomModel} 
        onSave={onSave} 
        models={mockModels} 
      />
    );

    // The select should have the custom model added to it
    const explainSelect = screen.getByLabelText('Explain Model');
    const options = Array.from(explainSelect.querySelectorAll('option'));
    expect(options.some(opt => opt.value === 'custom/special-model')).toBe(true);
  });

  it('should toggle advanced settings when clicked', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels} 
      />
    );

    const advancedButtons = screen.getAllByText('Advanced');
    fireEvent.click(advancedButtons[0]!);

    expect(screen.getByLabelText('Temperature')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Tokens')).toBeInTheDocument();
    expect(screen.getByLabelText('System Prompt')).toBeInTheDocument();
  });

  it('should call onSave when advanced settings change', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels} 
      />
    );

    // Open advanced
    const advancedButtons = screen.getAllByText('Advanced');
    fireEvent.click(advancedButtons[0]!);

    const tempInput = screen.getByLabelText('Temperature');
    fireEvent.change(tempInput, { target: { value: '1.2' } });

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      explainSettings: expect.objectContaining({
        temperature: 1.2
      })
    }));
  });
});
