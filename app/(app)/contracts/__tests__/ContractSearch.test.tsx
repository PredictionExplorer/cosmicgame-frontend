import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import { ContractSearch } from '../components/ContractSearch';

describe('ContractSearch', () => {
  it('renders search input', () => {
    render(<ContractSearch value="" onChange={jest.fn()} />);
    expect(screen.getByLabelText('Search contracts')).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = jest.fn();
    render(<ContractSearch value="" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Search contracts'), {
      target: { value: 'cosmic' },
    });
    expect(onChange).toHaveBeenCalledWith('cosmic');
  });

  it('shows clear button when value is non-empty and clears on click', () => {
    const onChange = jest.fn();
    render(<ContractSearch value="test" onChange={onChange} />);
    const clearBtn = screen.getByLabelText('Clear search');
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not show clear button when value is empty', () => {
    render(<ContractSearch value="" onChange={jest.fn()} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ContractSearch value="" onChange={jest.fn()} />);
    await checkA11y(container);
  });
});
