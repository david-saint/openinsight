import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders the Vite + React heading', () => {
    render(<App />);
    expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument();
  });
});
