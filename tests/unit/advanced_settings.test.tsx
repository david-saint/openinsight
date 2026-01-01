/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { IntelligenceSection } from '../../src/options/components/IntelligenceSection';
import { DEFAULT_SETTINGS } from '../../src/lib/settings';

describe('IntelligenceSection Advanced Settings', () => {
  const mockOnSave = vi.fn();
  const mockModels = [{ id: 'm1', name: 'Model 1' }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders advanced settings inputs', () => {
    render(
      <IntelligenceSection 
        settings={DEFAULT_SETTINGS} 
        onSave={mockOnSave} 
        models={mockModels} 
      />
    );
    
    // Open both advanced sections
    const advancedButtons = screen.getAllByRole('button', { name: /advanced/i });
    fireEvent.click(advancedButtons[0]);
    fireEvent.click(advancedButtons[1]);
    
    // Check for temperature inputs
    const tempInputs = screen.getAllByLabelText(/temperature/i);
    expect(tempInputs.length).toBe(2);
    
    // Check for system prompt textareas
    const promptInputs = screen.getAllByLabelText(/system prompt/i);
    expect(promptInputs.length).toBe(2);
  });

  it('calls onSave when explain temperature changes', () => {
    render(
      <IntelligenceSection 
        settings={DEFAULT_SETTINGS} 
        onSave={mockOnSave} 
        models={mockModels} 
      />
    );
    
    const advancedButtons = screen.getAllByRole('button', { name: /advanced/i });
    fireEvent.click(advancedButtons[0]);
    
    const explainTemp = screen.getAllByLabelText(/temperature/i)[0];
    fireEvent.change(explainTemp, { target: { value: '0.9' } });
    
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      explainSettings: expect.objectContaining({
        temperature: 0.9
      })
    }));
  });

  it('calls onSave when explain system prompt changes', () => {
    render(
      <IntelligenceSection 
        settings={DEFAULT_SETTINGS} 
        onSave={mockOnSave} 
        models={mockModels} 
      />
    );
    
    const advancedButtons = screen.getAllByRole('button', { name: /advanced/i });
    fireEvent.click(advancedButtons[0]);
    
    const explainPrompt = screen.getAllByLabelText(/system prompt/i)[0];
    fireEvent.change(explainPrompt, { target: { value: 'New prompt' } });
    
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      explainSettings: expect.objectContaining({
        system_prompt: 'New prompt'
      })
    }));
  });
});
