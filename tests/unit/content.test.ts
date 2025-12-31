import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Content Script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Mock window.getSelection
    const selectionMock = {
      toString: vi.fn().mockReturnValue('selected text'),
      rangeCount: 1,
    };
    
    vi.stubGlobal('window', {
      getSelection: vi.fn().mockReturnValue(selectionMock),
      addEventListener: vi.fn(),
    });
    
    vi.stubGlobal('document', {
      addEventListener: vi.fn(),
    });

    vi.stubGlobal('console', {
      log: vi.fn(),
    });
  });

  it('should register a mouseup listener', async () => {
    await import('../../src/content/content?t=' + Date.now());
    expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
  });

  it('should log selected text on mouseup', async () => {
    await import('../../src/content/content?t=' + (Date.now() + 1));
    const mouseupHandler = (document.addEventListener as any).mock.calls.find(
      (call: any) => call[0] === 'mouseup'
    )[1];
    
    mouseupHandler();
    
    expect(console.log).toHaveBeenCalledWith('Text selected:', 'selected text');
  });

  it('should not log if no text is selected', async () => {
    (window.getSelection as any).mockReturnValue({
      toString: vi.fn().mockReturnValue(''),
      rangeCount: 0,
    });
    
    await import('../../src/content/content?t=' + (Date.now() + 2));
    const mouseupHandler = (document.addEventListener as any).mock.calls.find(
      (call: any) => call[0] === 'mouseup'
    )[1];
    
    mouseupHandler();
    
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('OpenInsight content script initialized.');
  });
});
