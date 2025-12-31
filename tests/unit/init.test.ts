import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Project Initialization', () => {
  it('should have a package.json file', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../../package.json'))).toBe(true);
  });

  it('should have a tsconfig.json file', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../../tsconfig.json'))).toBe(true);
  });

  it('should have a tailwind.config.js file', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../../tailwind.config.js'))).toBe(true);
  });

  it('should have a postcss.config.js file', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../../postcss.config.js'))).toBe(true);
  });

  it('should have react and react-dom installed', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8'));
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();
  });

  it('should have vite and @crxjs/vite-plugin installed', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf-8'));
    expect(pkg.dependencies.vite).toBeDefined();
    expect(pkg.dependencies['@crxjs/vite-plugin']).toBeDefined();
  });

  it('should have a vite.config.ts file', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../../vite.config.ts'))).toBe(true);
  });

  it('should have a manifest.ts file', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../../manifest.ts'))).toBe(true);
  });

  it('should have the correct directory structure', () => {
    const dirs = [
      'src/background',
      'src/content',
      'src/lib',
      'src/options',
      'src/popup',
    ];
    dirs.forEach((dir) => {
      expect(fs.existsSync(path.resolve(__dirname, '../../', dir))).toBe(true);
      expect(fs.lstatSync(path.resolve(__dirname, '../../', dir)).isDirectory()).toBe(true);
    });
  });
});
