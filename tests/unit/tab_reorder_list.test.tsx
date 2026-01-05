/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabReorderList } from '../../src/options/components/TabReorderList';

describe('TabReorderList', () => {
  const onSave = vi.fn();
  const allTabs = [
    { id: 'explain', label: 'Explain' },
    { id: 'fact-check', label: 'Fact-check' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all tabs in the provided order', () => {
    const enabledTabs = ['explain', 'fact-check'];
    render(<TabReorderList enabledTabs={enabledTabs} onSave={onSave} allTabs={allTabs} />);

    const labels = screen.getAllByRole('listitem').map(li => li.textContent);
    expect(labels[0]).toContain('Explain');
    expect(labels[1]).toContain('Fact-check');
  });

  it('should reorder tabs when move buttons are clicked', () => {
    const enabledTabs = ['explain', 'fact-check'];
    render(<TabReorderList enabledTabs={enabledTabs} onSave={onSave} allTabs={allTabs} />);

    // Move 'explain' down (it's at index 0)
    const moveDownButtons = screen.getAllByRole('button', { name: /move down/i });
    fireEvent.click(moveDownButtons[0]);

    expect(onSave).toHaveBeenCalledWith(['fact-check', 'explain']);
  });

  it('should toggle tab visibility', () => {
    const enabledTabs = ['explain', 'fact-check'];
    render(<TabReorderList enabledTabs={enabledTabs} onSave={onSave} allTabs={allTabs} />);

    const switches = screen.getAllByRole('checkbox');
    // Disable 'fact-check' (index 1)
    fireEvent.click(switches[1]);

    expect(onSave).toHaveBeenCalledWith(['explain']);
  });

  it('should enable a tab when toggled on', () => {
    const enabledTabs = ['explain'];
    render(<TabReorderList enabledTabs={enabledTabs} onSave={onSave} allTabs={allTabs} />);

    const switches = screen.getAllByRole('checkbox');
    // Enable 'fact-check' (it will be at index 1 in the full list)
    fireEvent.click(switches[1]);

    expect(onSave).toHaveBeenCalledWith(['explain', 'fact-check']);
  });

  it('should prevent disabling the last enabled tab', () => {
    const enabledTabs = ['explain'];
    render(<TabReorderList enabledTabs={enabledTabs} onSave={onSave} allTabs={allTabs} />);

    const switches = screen.getAllByRole('checkbox');
    // Try to disable 'explain'
    fireEvent.click(switches[0]);

    // Should NOT call onSave
    expect(onSave).not.toHaveBeenCalled();
  });
});
