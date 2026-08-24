import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

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

  it('opens the tooltip with the description on touch tap', async () => {
    render(<ContractAddressCard {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: /^More information/ });
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'pointerType', { value: 'touch' });
    fireEvent(trigger, event);
    fireEvent.click(trigger);

    const popper = await screen.findByRole('tooltip');
    expect(popper).toHaveTextContent('The main game contract');
  });

  it('renders the open tooltip outside the card subtree (portaled out of the row)', async () => {
    const { container } = render(<ContractAddressCard {...defaultProps} />);
    const trigger = screen.getByRole('button', { name: /^More information/ });
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'pointerType', { value: 'touch' });
    fireEvent(trigger, event);
    fireEvent.click(trigger);

    const popper = await screen.findByRole('tooltip');
    expect(container.contains(popper)).toBe(false);
    expect(document.body.contains(popper)).toBe(true);
  });

  it('opens explorer link in new tab', () => {
    render(<ContractAddressCard {...defaultProps} />);
    const link = screen.getByLabelText('View Cosmic Game on block explorer');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the Uniswap trade action when requested', () => {
    render(
      <ContractAddressCard {...defaultProps} name="Cosmic Signature CST Token" showTradeAction />,
    );

    expect(screen.getByRole('link', { name: 'nav.ecosystem.uniswap.ariaLabel' })).toHaveAttribute(
      'href',
      CST_UNISWAP_SWAP_URL,
    );
  });

  it('does not render the Uniswap trade action by default', () => {
    render(<ContractAddressCard {...defaultProps} />);

    expect(
      screen.queryByRole('link', { name: 'nav.ecosystem.uniswap.ariaLabel' }),
    ).not.toBeInTheDocument();
  });

  it('renders the GeckoTerminal pool action when requested', () => {
    render(
      <ContractAddressCard {...defaultProps} name="Cosmic Signature CST Token" showPoolAction />,
    );

    expect(
      screen.getByRole('link', { name: 'nav.ecosystem.geckoTerminal.ariaLabel' }),
    ).toHaveAttribute('href', CST_GECKOTERMINAL_POOL_URL);
  });

  it('does not render the GeckoTerminal pool action by default', () => {
    render(<ContractAddressCard {...defaultProps} />);

    expect(
      screen.queryByRole('link', { name: 'nav.ecosystem.geckoTerminal.ariaLabel' }),
    ).not.toBeInTheDocument();
  });

  it('renders the marketplace action when requested', () => {
    render(
      <ContractAddressCard {...defaultProps} name="Cosmic Signature NFT" showMarketplaceAction />,
    );

    expect(screen.getByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' })).toHaveAttribute(
      'href',
      COSMIC_SIGNATURE_MARKETPLACE_URL,
    );
  });

  it('does not render the marketplace action by default', () => {
    render(<ContractAddressCard {...defaultProps} />);

    expect(
      screen.queryByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' }),
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ContractAddressCard {...defaultProps} />);
    await checkA11y(container);
  });
});
