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
  areaCaptureModel: 'google/gemini-2.0-flash-exp:free',
  triggerMode: 'icon',
  stylePreference: 'Concise',
  explainSettings: { temperature: 0.7, max_tokens: 512, system_prompt: '' },
  factCheckSettings: { temperature: 0.3, max_tokens: 512, system_prompt: '' },
  areaCaptureSettings: { temperature: 0.5, max_tokens: 512, system_prompt: '' },
} as any;

describe('IntelligenceSection', () => {
  const onSave = vi.fn();
  const onBrowseModels = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Explain, Fact-Check, and Area Capture sections', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels} 
      />
    );

    expect(screen.getByText('Explain Model')).toBeInTheDocument();
    expect(screen.getByText('Fact-Check Model')).toBeInTheDocument();
    expect(screen.getByText('Area Capture Model')).toBeInTheDocument();
  });

  it('should render Style Preference dropdown', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels} 
      />
    );

    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Concise')).toBeInTheDocument();
  });

  it('should call onSave when Style Preference changes', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels} 
      />
    );

    const select = screen.getByRole('combobox', { name: '' }); // The style select
    // Find the one with Concise/Detailed
    const styleSelect = screen.getAllByRole('combobox').find(c => (c as HTMLSelectElement).value === 'Concise');
    
    fireEvent.change(styleSelect!, { target: { value: 'Detailed' } });

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      stylePreference: 'Detailed'
    }));
  });

  it('should toggle advanced settings and NOT show system prompt', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels} 
      />
    );

    const advancedButtons = screen.getAllByTitle(/advanced settings/i);
    fireEvent.click(advancedButtons[0]!);

    expect(screen.getByLabelText('Temperature')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Tokens')).toBeInTheDocument();
    expect(screen.queryByLabelText('System Prompt')).not.toBeInTheDocument();
  });

  it('should limit area capture inline options to image-capable models when all models are available', () => {
    render(
      <IntelligenceSection 
        settings={mockSettings} 
        onSave={onSave} 
        models={mockModels}
        allModels={[
          {
            id: 'google/gemini-2.0-flash-exp:free',
            name: 'Gemini 2.0 Flash',
            context_length: 1000,
            architecture: { input_modalities: ['text', 'image'] },
            pricing: { prompt: '0', completion: '0' },
          },
          {
            id: 'meta-llama/llama-3.3-70b-instruct:free',
            name: 'Llama 3.3 70B',
            context_length: 1000,
            architecture: { input_modalities: ['text'] },
            pricing: { prompt: '0', completion: '0' },
          },
        ] as any}
      />
    );

    const areaCaptureSelect = screen.getByLabelText(/area capture model/i) as HTMLSelectElement;
    const optionValues = Array.from(areaCaptureSelect.options).map((option) => option.value);

    expect(optionValues).toEqual(['google/gemini-2.0-flash-exp:free']);
  });
});
