/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AnalysisPopover } from '../../src/content/components/AnalysisPopover.js';
import { BackendClient } from '../../src/lib/backend-client.js';

// Mock BackendClient
vi.mock('../../src/lib/backend-client.js', () => ({
  BackendClient: {
    explainText: vi.fn(),
    factCheckText: vi.fn(),
  },
}));

describe('Keyword Emphasis UI', () => {
  const selectionText = 'This is a test sentence for emphasis.';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(BackendClient.explainText).mockResolvedValue({
      summary: 'Summary',
      explanation: 'Explanation'
    });
  });

  it('should show keyword selection view initially', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={selectionText}
        />
      );
    });

    expect(screen.getByText(/emphasize keywords/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze selection/i })).toBeInTheDocument();
    
    // Should show words as buttons
    expect(screen.getByRole('button', { name: 'This' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'test' })).toBeInTheDocument();
  });

  it('should toggle keyword emphasis on click', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={selectionText}
        />
      );
    });

    const testWord = screen.getByRole('button', { name: 'test' });
    
    // Not emphasized initially (no accent class)
    expect(testWord).not.toHaveClass('bg-accent-500');

    // Click to emphasize
    await user.click(testWord);
    expect(testWord).toHaveClass('bg-accent-500');

    // Click again to de-emphasize
    await user.click(testWord);
    expect(testWord).not.toHaveClass('bg-accent-500');
  });

  it('should enforce 3-word limit using FIFO', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={selectionText}
        />
      );
    });

    const w1 = screen.getByRole('button', { name: 'This' });
    const w2 = screen.getByRole('button', { name: 'is' });
    const w3 = screen.getByRole('button', { name: 'a' });
    const w4 = screen.getByRole('button', { name: 'test' });

    await user.click(w1);
    await user.click(w2);
    await user.click(w3);

    expect(w1).toHaveClass('bg-accent-500');
    expect(w2).toHaveClass('bg-accent-500');
    expect(w3).toHaveClass('bg-accent-500');

    // Click 4th word
    await user.click(w4);

    // w1 should be de-emphasized (FIFO), w2, w3, w4 should be emphasized
    expect(w1).not.toHaveClass('bg-accent-500');
    expect(w2).toHaveClass('bg-accent-500');
    expect(w3).toHaveClass('bg-accent-500');
    expect(w4).toHaveClass('bg-accent-500');
  });

  it('should pass emphasized words to BackendClient', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={selectionText}
        />
      );
    });

    await user.click(screen.getByRole('button', { name: 'test' }));
    await user.click(screen.getByRole('button', { name: 'sentence' }));

    const analyzeButton = screen.getByRole('button', { name: /analyze selection/i });
    await user.click(analyzeButton);

    expect(BackendClient.explainText).toHaveBeenCalledWith(
      selectionText,
      ['test', 'sentence']
    );
  });

  it('should allow going back to keyword selection from analysis view', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={selectionText}
        />
      );
    });

    // Go to analysis
    await user.click(screen.getByRole('button', { name: /analyze selection/i }));
    expect(screen.queryByText(/emphasize keywords/i)).not.toBeInTheDocument();

    // Click back arrow in header
    const backButton = screen.getByTitle(/back to keywords/i);
    await user.click(backButton);

    expect(screen.getByText(/emphasize keywords/i)).toBeInTheDocument();
  });
});
