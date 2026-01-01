import { describe, it, expect } from 'vitest';
import manifest from '../../manifest';

describe('Manifest Configuration', () => {
  it('should have the correct permissions', () => {
    expect(manifest.permissions).toContain('storage');
    expect(manifest.permissions).toContain('activeTab');
  });

  it('should have icons defined', () => {
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons['16']).toBe('logos/icons/icon-16.png');
    expect(manifest.icons['48']).toBe('logos/icons/icon-48.png');
    expect(manifest.icons['128']).toBe('logos/icons/icon-128.png');
  });
});
