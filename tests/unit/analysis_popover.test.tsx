/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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

// Mock messaging for OPEN_OPTIONS
vi.mock('../../src/lib/messaging.js', () => ({
  sendMessage: vi.fn(),
}));

describe('Analysis Popover Component', () => {
  const longText = 'This is a sufficiently long selection text to ensure Fact Check tab is visible in tests.';

  const mockExplainResponse: any = {
    summary: 'Mock Summary',
    explanation: 'Detailed mock explanation',
    context: { example: 'Mock example' }
  };

  const mockFactCheckResponse: any = {
    summary: 'Mock Claim Summary',
    verdict: 'True',
    details: 'Mock verdict details',
    sources: [{ title: 'Mock Source', url: 'https://example.com', snippet: 'Source snippet' }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(BackendClient.explainText).mockResolvedValue(mockExplainResponse);
    vi.mocked(BackendClient.factCheckText).mockResolvedValue(mockFactCheckResponse);
  });

  it('should render when isOpen is true', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={longText}
        />
      );
    });

    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
  });

  it('should not render when isOpen is false', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={false} 
          onClose={() => {}} 
          selectionText={longText}
        />
      );
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display Explain and Fact Check tabs immediately', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={longText}
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
          selectionText={longText}
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
          selectionText={longText}
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
    const pendingPromise = new Promise<any>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(BackendClient.explainText).mockReturnValue(pendingPromise);

    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={longText}
        />
      );
    });

    // Initial state should be loading
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    
    // Cleanup
    await act(async () => {
      resolvePromise!({ success: true, result: 'done' });
    });
  });

  it('should display fetched content', async () => {
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={longText}
        />
      );
    });

    await screen.findByText('Mock Summary');
    expect(screen.getByText('Detailed mock explanation')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
  });

  it('should display verification badge in Fact Check view', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={longText}
        />
      );
    });

    const factCheckTab = screen.getByRole('tab', { name: /fact check/i });
    await user.click(factCheckTab);

    await screen.findByText('True');
    expect(screen.getByText('Mock Claim Summary')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('should display Quick Settings view', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={longText}
        />
      );
    });

    const settingsButton = screen.getByTitle(/settings/i);
    await user.click(settingsButton);

    expect(screen.getByText(/accent color/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open full settings/i })).toBeInTheDocument();
  });

  it('should show Fact Check tab if selection text is > 50 characters', async () => {
    const longText = 'This is a long selection text that exceeds fifty characters to test visibility.'.repeat(2);
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={longText}
        />
      );
    });

    expect(screen.getByRole('tab', { name: /fact check/i })).toBeInTheDocument();
  });

  it('should hide Fact Check tab if selection text is <= 50 characters', async () => {
    const shortText = 'Short selection text.';
    await act(async () => {
      render(
        <AnalysisPopover 
          isOpen={true} 
          onClose={() => {}} 
          selectionText={shortText}
        />
      );
    });

    expect(screen.queryByRole('tab', { name: /fact check/i })).not.toBeInTheDocument();
  });

  describe('Enabled Tabs Customization', () => {
    it('should only render enabled tabs', async () => {
      await act(async () => {
        render(
          <AnalysisPopover 
            isOpen={true} 
            onClose={() => {}} 
            selectionText={longText}
            enabledTabs={['fact-check']}
          />
        );
      });

      expect(screen.queryByRole('tab', { name: /explain/i })).not.toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /fact check/i })).toBeInTheDocument();
    });

    it('should render tabs in the specified order', async () => {
      await act(async () => {
        render(
          <AnalysisPopover 
            isOpen={true} 
            onClose={() => {}} 
            selectionText={longText}
            enabledTabs={['fact-check', 'explain']}
          />
        );
      });

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveTextContent(/fact check/i);
      expect(tabs[1]).toHaveTextContent(/explain/i);
    });

    it('should use the first enabled tab as default active tab', async () => {
      await act(async () => {
        render(
          <AnalysisPopover 
            isOpen={true} 
            onClose={() => {}} 
            selectionText={longText}
            enabledTabs={['fact-check', 'explain']}
          />
        );
      });

      expect(screen.getByRole('tab', { name: /fact check/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('should fallback to second tab if first is fact-check but selection is too short', async () => {
      const shortText = 'Short';
      await act(async () => {
        render(
          <AnalysisPopover 
            isOpen={true} 
            onClose={() => {}} 
            selectionText={shortText}
            enabledTabs={['fact-check', 'explain']}
          />
        );
      });

      // Fact check should be hidden, and explain should be active
      expect(screen.queryByRole('tab', { name: /fact check/i })).not.toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /explain/i })).toHaveAttribute('aria-selected', 'true');
    });
  });
});
