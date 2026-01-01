/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModelSelectorModal } from '../../src/options/components/ModelSelectorModal.js';

const mockModels = [
  { id: 'free-1', name: 'Free Model 1', pricing: { prompt: '0', completion: '0' } },
  { id: 'paid-1', name: 'Paid Model 1', pricing: { prompt: '0.000001', completion: '0.000002' } },
  { id: 'free-2', name: 'Free Model 2', pricing: { prompt: '0', completion: '0' } },
] as any;

describe('ModelSelectorModal', () => {
  const onSelect = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ModelSelectorModal 
        isOpen={false} 
        onClose={onClose} 
        onSelect={onSelect} 
        models={mockModels} 
      />
    );
    expect(screen.queryByText('Select Model')).not.toBeInTheDocument();
  });

  it('should render and show models when isOpen is true', () => {
    render(
      <ModelSelectorModal 
        isOpen={true} 
        onClose={onClose} 
        onSelect={onSelect} 
        models={mockModels} 
      />
    );
    expect(screen.getByText('Select Model')).toBeInTheDocument();
    expect(screen.getByText('Free Model 1')).toBeInTheDocument();
    expect(screen.getByText('Paid Model 1')).toBeInTheDocument();
    expect(screen.getByText('Free Model 2')).toBeInTheDocument();
  });

  it('should filter models based on search query', () => {
    render(
      <ModelSelectorModal 
        isOpen={true} 
        onClose={onClose} 
        onSelect={onSelect} 
        models={mockModels} 
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search models...');
    fireEvent.change(searchInput, { target: { value: 'Paid' } });
    
    expect(screen.getByText('Paid Model 1')).toBeInTheDocument();
    expect(screen.queryByText('Free Model 1')).not.toBeInTheDocument();
  });

  it('should highlight current model', () => {
    render(
      <ModelSelectorModal 
        isOpen={true} 
        onClose={onClose} 
        onSelect={onSelect} 
        models={mockModels} 
        currentModelId="paid-1"
      />
    );
    
    // Check for the highlight class or ring class
    const paidButton = screen.getByText('Paid Model 1').closest('button');
    expect(paidButton).toHaveClass('ring-accent-500');
  });

  it('should call onSelect and onClose when a model is clicked', () => {
    render(
      <ModelSelectorModal 
        isOpen={true} 
        onClose={onClose} 
        onSelect={onSelect} 
        models={mockModels} 
      />
    );
    
    fireEvent.click(screen.getByText('Free Model 1'));
    
    expect(onSelect).toHaveBeenCalledWith('free-1');
    expect(onClose).toHaveBeenCalled();
  });

  it('should show free badges for free models', () => {
    render(
      <ModelSelectorModal 
        isOpen={true} 
        onClose={onClose} 
        onSelect={onSelect} 
        models={mockModels} 
      />
    );
    
    // There should be 4 "Free" labels (2 badges + 2 in the price column)
    const badges = screen.getAllByText('Free');
    expect(badges.length).toBe(4);
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <ModelSelectorModal 
        isOpen={true} 
        onClose={onClose} 
        onSelect={onSelect} 
        models={mockModels} 
      />
    );
    
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
