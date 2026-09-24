import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import { TEST_MARKETING_WALLET } from '@/test-utils/contractAddressesFixture';

import { checksumAddress } from '@/utils/format';
import { AddressLink } from '@/components/common/AddressLink';

import { checkA11y, render, screen } from '@/test-utils';

jest.mock('../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () =>
    jest.requireActual('../../../test-utils/contractAddressesFixture').TEST_APP_CONTRACT_ADDRESSES,
}));

describe('AddressLink', () => {
  const address = '0x1234567890abcdef1234567890abcdef12345678';
  const url = '/user/0x1234567890abcdef1234567890abcdef12345678';

  it('renders one link with the standard short form at every width', () => {
    render(<AddressLink address={address} url={url} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent('0x1234…\u20605678');
    expect(links[0]).toHaveAttribute('href', url);
  });

  /** The short form is all the cell shows; the whole checksummed address is one focus or hover away. */
  async function expectFullAddressTooltip() {
    const full = checksumAddress(address);
    expect(full).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(full).not.toBe(address);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(full);
  }

  it('shows the full checksummed address in a tooltip on keyboard focus', async () => {
    const user = userEvent.setup();
    render(<AddressLink address={address} url={url} />);
    await user.tab();
    expect(screen.getByRole('link')).toHaveFocus();
    await expectFullAddressTooltip();
  });

  it('shows the full checksummed address in a tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<AddressLink address={address} url={url} />);
    await user.hover(screen.getByRole('link'));
    await expectFullAddressTooltip();
  });

  it('never wraps mid-hex and keeps the monospaced address face', () => {
    render(<AddressLink address={address} url={url} />);
    expect(screen.getByRole('link')).toHaveClass('whitespace-nowrap', 'font-mono');
  });

  it('names protocol contracts instead of printing hex', () => {
    render(<AddressLink address={TEST_MARKETING_WALLET} url="/user/marketing" />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('formats.address.known.outreach');
    expect(link).not.toHaveClass('font-mono');
  });

  it('names the zero address instead of linking forty zeros', () => {
    render(<AddressLink address="0x0000000000000000000000000000000000000000" url="/user/0x0" />);
    expect(screen.getByText('formats.address.zero')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('opens its target in a new tab with rel="noopener noreferrer"', () => {
    render(<AddressLink address={address} url={url} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AddressLink address={address} url={url} />);
    await checkA11y(container);
  });
});
