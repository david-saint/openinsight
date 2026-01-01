/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { AnalysisPopover } from '../../src/content/components/AnalysisPopover.js';
import { sendMessage } from '../../src/lib/messaging.js';

// Mock messaging
vi.mock('../../src/lib/messaging.js', () => ({
  sendMessage: vi.fn(),
}));

describe('Analysis Popover Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendMessage).mockResolvedValue({ success: true, result: 'mocked content' });
  });

  it('should render when isOpen is true', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText="test text"
        />
      );
    });

    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    const { queryByRole } = render(
      <AnalysisPopover 
        isOpen={false} 
        onClose={() => {}} 
        selectionText="test text"
      />
    );

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display the selected text', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText="selected text sample"
        />
      );
    });

    expect(screen.getByText('selected text sample')).toBeInTheDocument();
  });

  it('should display Explain and Fact Check tabs', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText="test"
        />
      );
    });

    expect(screen.getByRole('tab', { name: /explain/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /fact check/i })).toBeInTheDocument();
  });

  it('should have Explain tab active by default', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText="test"
        />
      );
    });

    const explainTab = screen.getByRole('tab', { name: /explain/i });
    expect(explainTab).toHaveAttribute('aria-selected', 'true');
    
    const factCheckTab = screen.getByRole('tab', { name: /fact check/i });
    expect(factCheckTab).toHaveAttribute('aria-selected', 'false');
  });

  it('should switch tabs when clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText="test"
        />
      );
    });

    const factCheckTab = screen.getByRole('tab', { name: /fact check/i });
    await user.click(factCheckTab);

    expect(factCheckTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /explain/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('should show loading state in Explain view', async () => {
    // Create a promise that stays pending
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise<{ success: boolean, result?: string, error?: string }>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(sendMessage).mockReturnValue(pendingPromise as any);

    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText="test"
        />
      );
    });

    // Initial state should be loading (simulated by pulse in the current implementation)
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    
    // Cleanup if needed
    await act(async () => {
      resolvePromise!({ success: true, result: 'done' });
    });
  });

  it('should display fetched content', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ success: true, result: 'This is the explanation.' });
    
    render(
      <AnalysisPopover 
        isOpen={true} 
        onClose={() => {}} 
        selectionText="test text"
      />
    );

    await screen.findByText('This is the explanation.');
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
  });

  it('should display verification badge in Fact Check view', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    vi.mocked(sendMessage).mockResolvedValue({ success: true, result: 'This is true.' });
    
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText="test"
        />
      );
    });

    const factCheckTab = screen.getByRole('tab', { name: /fact check/i });
    await user.click(factCheckTab);

    await screen.findByText('This is true.');
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it('should display Quick Settings view', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText="test"
        />
      );
    });

    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    await user.click(settingsTab);

    expect(screen.getByText(/accent color/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open full settings/i })).toBeInTheDocument();
  });
});
