import { describe, it, expect, vi } from 'vitest';

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn().mockReturnValue({
    render: vi.fn(),
  }),
}));

describe('main.tsx', () => {
  it('imports without crashing', async () => {
    // Setup root element
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    // Import main to trigger execution
    await import('./main');
    
    // If we get here, it didn't crash
    expect(true).toBe(true);
    
    // Clean up
    document.body.removeChild(root);
  });
});
