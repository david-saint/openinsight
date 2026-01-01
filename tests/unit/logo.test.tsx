/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Logo } from '../../src/components/Logo.js';

describe('Logo Component', () => {
  it('renders correctly', () => {
    render(<Logo />);
    const img = screen.getByAltText('OpenInsight Logo');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/logos/logo-transparent.png');
  });

  it('applies custom className', () => {
    render(<Logo className="w-10 h-10 custom-class" />);
    const img = screen.getByAltText('OpenInsight Logo');
    expect(img.className).toContain('w-10 h-10 custom-class');
  });
});
