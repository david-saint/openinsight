import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Manifest', () => {
  it('exists and is a valid V3 manifest', () => {
    const manifestPath = path.resolve(__dirname, '../public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('OpenInsight');
    expect(manifest.version).toBeDefined();
  });
});
