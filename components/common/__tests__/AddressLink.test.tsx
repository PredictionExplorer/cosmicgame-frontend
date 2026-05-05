import '@testing-library/jest-dom';

import { TEST_MARKETING_WALLET } from '@/test-utils/contractAddressesFixture';

import { AddressLink } from '@/components/common/AddressLink';

import { checkA11y, render, screen } from '@/test-utils';

jest.mock('../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () =>
    jest.requireActual('../../../test-utils/contractAddressesFixture').TEST_APP_CONTRACT_ADDRESSES,
}));

describe('AddressLink', () => {
  const address = '0x1234567890abcdef1234567890abcdef12345678';
  const url = '/user/0x1234567890abcdef1234567890abcdef12345678';

  it('renders full address on desktop', () => {
    render(<AddressLink address={address} url={url} />);
    const desktopLink = screen.getByText(address);
    expect(desktopLink).toBeInTheDocument();
    expect(desktopLink).toHaveAttribute('href', url);
  });

  it('renders shortened address on mobile', () => {
    render(<AddressLink address={address} url={url} />);
    const mobileLink = screen.getByText('0x123456....345678');
    expect(mobileLink).toBeInTheDocument();
    expect(mobileLink).toHaveAttribute('href', url);
  });

  it('renders "Marketing Wallet" for marketing address', () => {
    render(<AddressLink address={TEST_MARKETING_WALLET} url="/user/marketing" />);
    const links = screen.getAllByText('Marketing Wallet');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('sets target="_blank" on all links', () => {
    render(<AddressLink address={address} url={url} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
    }
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    render(<AddressLink address={address} url={url} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2);
    for (const link of links) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('applies font-mono class to links', () => {
    render(<AddressLink address={address} url={url} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveClass('font-mono');
    }
  });

  it('shows tooltip content with full address', () => {
    render(<AddressLink address={address} url={url} />);
    expect(screen.getByText(address)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AddressLink address={address} url={url} />);
    await checkA11y(container);
  });
});
