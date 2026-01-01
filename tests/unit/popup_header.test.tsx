/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// We anticipate the component will be at this path
import { PopupHeader } from '../../src/popup/components/PopupHeader.js';

describe('PopupHeader', () => {
  it('renders the branding title', () => {
    render(<PopupHeader />);
    expect(screen.getByText('OpenInsight')).toBeDefined();
  });

  it('renders the tagline', () => {
    render(<PopupHeader />);
    expect(screen.getByText('Epistemic Clarity Engine')).toBeDefined();
  });

  it('renders the logo', () => {
    render(<PopupHeader />);
    const logo = screen.getByAltText('OpenInsight Logo');
    expect(logo).toBeDefined();
    // Verify it uses the Logo component (by checking if it's an img tag)
    expect(logo.tagName).toBe('IMG');
  });
});
