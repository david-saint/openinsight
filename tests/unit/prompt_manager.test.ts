import { describe, it, expect } from 'vitest';
import { PromptManager } from '../../src/lib/prompt-manager';

describe('PromptManager', () => {
  it('should generate concise explain prompt', () => {
    const prompt = PromptManager.getExplainPrompt('Concise');
    expect(prompt).toContain('concise');
    expect(prompt).toContain('JSON');
    expect(prompt).toContain('summary');
  });

  it('should generate detailed explain prompt', () => {
    const prompt = PromptManager.getExplainPrompt('Detailed');
    expect(prompt).toContain('detailed');
    expect(prompt).toContain('JSON');
  });

  it('should generate concise fact-check prompt', () => {
    const prompt = PromptManager.getFactCheckPrompt('Concise');
    expect(prompt).toContain('concise');
    expect(prompt).toContain('verdict');
  });

  it('should generate detailed fact-check prompt', () => {
    const prompt = PromptManager.getFactCheckPrompt('Detailed');
    expect(prompt).toContain('detailed');
    expect(prompt).toContain('verdict');
  });
});
