/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitFor } from "@testing-library/dom";

// Mock settings to avoid chrome is not defined
vi.mock("../../src/lib/settings", () => ({
  getSettings: vi.fn().mockResolvedValue({ accentColor: "teal" }),
  DEFAULT_SETTINGS: { accentColor: "teal" },
  SETTINGS_KEY: 'user_settings',
}));

// Mock the mount module
vi.mock('../../src/content/mount', () => ({
  mountContentApp: vi.fn(),
  unmountContentApp: vi.fn(),
}));

// Mock chrome.runtime.onMessage
const chromeMock = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
  },
};
vi.stubGlobal('chrome', chromeMock);

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
    document.body.innerHTML = "";
  });

  it('should initialize and mount the app', async () => {
    await import('../../src/content/content?t=' + Date.now());
    
    await waitFor(() => {
      expect(mountContentApp).toHaveBeenCalled();
    });
    
    expect(console.log).toHaveBeenCalledWith('OpenInsight content script initialized.');
  });

  it('should listen for ACTIVATE_CAPTURE and update internal state/dispatch event', async () => {
    const { getCaptureState } = await import('../../src/content/content?t=' + (Date.now() + 1));
    
    expect(chromeMock.runtime.onMessage.addListener).toHaveBeenCalled();
    
    const listener = chromeMock.runtime.onMessage.addListener.mock.calls[0][0];
    
    // Listen for the custom event
    const eventSpy = vi.fn();
    document.addEventListener('openinsight:capture-activated', eventSpy);

    // State before
    expect(getCaptureState()).toBe(false);

    // Simulate receiving message
    const sendResponse = vi.fn();
    listener({ type: 'ACTIVATE_CAPTURE' }, {}, sendResponse);

    // State after
    expect(getCaptureState()).toBe(true);
    expect(eventSpy).toHaveBeenCalled();
    expect(sendResponse).toHaveBeenCalledWith({ success: true });
    
    document.removeEventListener('openinsight:capture-activated', eventSpy);
  });
});
