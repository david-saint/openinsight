/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mountContentApp, unmountContentApp } from '../../src/content/mount';

describe('Shadow DOM Container', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    unmountContentApp();
  });

  it('should create a host element and attach shadow root', () => {
    mountContentApp();
    const host = document.getElementById('openinsight-root');
    expect(host).not.toBeNull();
    expect(host?.shadowRoot).not.toBeNull();
  });

  it('should inject styles into shadow root', () => {
    mountContentApp();
    const host = document.getElementById('openinsight-root');
    const style = host?.shadowRoot?.querySelector('style');
    expect(style).not.toBeNull();
  });

  it('should be idempotent (not create duplicate roots)', () => {
    mountContentApp();
    mountContentApp();
    const hosts = document.querySelectorAll('#openinsight-root');
    expect(hosts.length).toBe(1);
  });
});
