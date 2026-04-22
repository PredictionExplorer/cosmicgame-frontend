import { render, screen, fireEvent, waitFor, checkA11y } from '@/test-utils';

import { ContractAddressCard } from '../components/ContractAddressCard';

const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

beforeEach(() => {
  mockWriteText.mockClear();
});

const defaultProps = {
  name: 'Cosmic Game',
  address: '0xC801d06c9900ef0cD878Ad6f59622aAfAd8F54dE',
  description: 'The main game contract',
  explorerUrl: 'https://sepolia.arbiscan.io',
};

describe('ContractAddressCard', () => {
  it('renders contract name and address', () => {
    render(<ContractAddressCard {...defaultProps} />);
    expect(screen.getByText('Cosmic Game')).toBeInTheDocument();
    expect(screen.getByText('0xC801d06c9900ef0cD878Ad6f59622aAfAd8F54dE')).toBeInTheDocument();
  });

  it('copies address to clipboard on copy button click', async () => {
    render(<ContractAddressCard {...defaultProps} />);
    const copyBtn = screen.getByLabelText('Copy Cosmic Game address');
    fireEvent.click(copyBtn);
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('0xC801d06c9900ef0cD878Ad6f59622aAfAd8F54dE');
    });
  });

  it('renders explorer link with correct href', () => {
    render(<ContractAddressCard {...defaultProps} />);
    const link = screen.getByLabelText('View Cosmic Game on block explorer');
    expect(link).toHaveAttribute(
      'href',
      'https://sepolia.arbiscan.io/address/0xC801d06c9900ef0cD878Ad6f59622aAfAd8F54dE',
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders tooltip with description', () => {
    render(<ContractAddressCard {...defaultProps} />);
    expect(screen.getByText('Cosmic Game')).toBeInTheDocument();
  });

  it('opens explorer link in new tab', () => {
    render(<ContractAddressCard {...defaultProps} />);
    const link = screen.getByLabelText('View Cosmic Game on block explorer');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ContractAddressCard {...defaultProps} />);
    await checkA11y(container);
  });
});
