import { describe, it, expect } from 'vitest';
import { ExplainResponse, FactCheckResponse } from '../../src/lib/types';

describe('Type Definitions', () => {
  it('should allow valid ExplainResponse objects', () => {
    const response: ExplainResponse = {
      summary: 'Test summary',
      explanation: 'Test explanation',
      context: {
        example: 'Test example',
        related_concepts: ['concept1', 'concept2']
      }
    };
    expect(response.summary).toBe('Test summary');
  });

  it('should allow ExplainResponse without optional context', () => {
    const response: ExplainResponse = {
      summary: 'Test summary',
      explanation: 'Test explanation'
    };
    expect(response.context).toBeUndefined();
  });

  it('should allow valid FactCheckResponse objects', () => {
    const response: FactCheckResponse = {
      summary: 'Test summary',
      verdict: 'True',
      details: 'Test details',
      sources: [
        {
          title: 'Source Title',
          url: 'https://example.com',
          snippet: 'Test snippet'
        }
      ]
    };
    expect(response.verdict).toBe('True');
  });

  it('should allow FactCheckResponse without optional sources', () => {
    const response: FactCheckResponse = {
      summary: 'Test summary',
      verdict: 'False',
      details: 'Test details'
    };
    expect(response.sources).toBeUndefined();
  });
});
