/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/dom';

// Mock settings to avoid chrome is not defined
vi.mock('../../src/lib/settings', () => ({
  getSettings: vi.fn().mockResolvedValue({ accentColor: 'teal' }),
  DEFAULT_SETTINGS: { accentColor: 'teal' }
}));

// Mock the mount module
vi.mock('../../src/content/mount', () => ({
  mountContentApp: vi.fn(),
  unmountContentApp: vi.fn(),
}));

import { mountContentApp } from '../../src/content/mount';

describe('Content Script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Clean up DOM
    document.body.innerHTML = '';
    
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize and mount the app', async () => {
    await import('../../src/content/content?t=' + Date.now());
    
    await waitFor(() => {
      expect(mountContentApp).toHaveBeenCalled();
    });
    
    expect(console.log).toHaveBeenCalledWith('OpenInsight content script initialized.');
  });
});
