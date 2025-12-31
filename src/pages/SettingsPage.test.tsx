import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsPage } from './SettingsPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as storage from '../lib/storage';

vi.mock('../lib/storage', () => ({
  saveApiKey: vi.fn(),
  hasApiKey: vi.fn(),
  removeApiKey: vi.fn(),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders API key input and save button', async () => {
    vi.mocked(storage.hasApiKey).mockResolvedValue(false);
    render(<SettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter OpenRouter API Key/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Save Key/i })).toBeInTheDocument();
  });

  it('saves API key when button is clicked', async () => {
    vi.mocked(storage.hasApiKey).mockResolvedValue(false);
    render(<SettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter OpenRouter API Key/i)).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/Enter OpenRouter API Key/i);

    const passwordInput = screen.getByPlaceholderText(/Enter Master Password/i);
    const saveButton = screen.getByRole('button', { name: /Save Key/i });
    
    fireEvent.change(input, { target: { value: 'sk-or-v1-test' } });
    fireEvent.change(passwordInput, { target: { value: 'my-password' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(storage.saveApiKey).toHaveBeenCalledWith('sk-or-v1-test', 'my-password');
    });
  });

  it('removes the API key when Remove button is clicked', async () => {
    vi.mocked(storage.hasApiKey).mockResolvedValue(true);
    render(<SettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Remove Key/i })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Remove Key/i }));
    
    await waitFor(() => {
      expect(storage.removeApiKey).toHaveBeenCalled();
    });
  });
});

