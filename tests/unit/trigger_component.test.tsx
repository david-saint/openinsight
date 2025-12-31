/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { TriggerButton } from '../../src/content/components/TriggerButton';

describe('Trigger Button Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render at the specified position', () => {
    const onTrigger = vi.fn();
    render(
      <TriggerButton 
        position={{ top: 100, left: 200 }} 
        onTrigger={onTrigger} 
      />
    );

    const button = screen.getByRole('button');
    expect(button.style.top).toBe('100px');
    expect(button.style.left).toBe('200px');
  });

  it('should call onTrigger when clicked', () => {
    const onTrigger = vi.fn();
    render(
      <TriggerButton 
        position={{ top: 100, left: 200 }} 
        onTrigger={onTrigger} 
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onTrigger).toHaveBeenCalled();
  });
});
