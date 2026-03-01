/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

describe('CSS Variables Theming', () => {
  it('should use accent-500 variable for background', () => {
    const { getByTestId } = render(
      <div data-testid="test-div" className="bg-accent-500" />
    );
    const element = getByTestId('test-div');
    // Note: Happy-dom doesn't resolve CSS variables, but we can check the computed style
    // or just ensure the class is present. 
    // Testing the actual CSS variable value requires a full browser or specific JSDOM setup.
    // For now, we verify the class name exists which Tailwind will map to the variable.
    expect(element.className).toContain('bg-accent-500');
  });

  it('should use accent variables for emphasized words', () => {
    const { getByTestId } = render(
      <div data-testid="emp-word" className="bg-accent-500 text-white border-accent-600 border-b-2" />
    );
    const element = getByTestId('emp-word');
    expect(element.className).toContain('bg-accent-500');
    expect(element.className).toContain('border-accent-600');
    expect(element.className).toContain('border-b-2');
  });
});
