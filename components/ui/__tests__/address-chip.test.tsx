import { act, fireEvent, render, screen } from '@testing-library/react';

import { emptyContractAddresses, publishDashboardContractAddresses } from '@/config/networks';

import { AddressChip } from '../address-chip';

const ADDRESS = '0x1ec14a8e8b5c1f7f0a7a1c3b5e6d7e8f9ad7e990';
const ZERO = '0x0000000000000000000000000000000000000000';
const SHORT = /^0x[0-9a-fA-F]{4}…[0-9a-fA-F]{4}$/;

describe('AddressChip', () => {
  afterEach(() => {
    publishDashboardContractAddresses(emptyContractAddresses());
    jest.useRealTimers();
  });

  it('shows the one short form, links to the participant and keeps the full address on hover', () => {
    render(<AddressChip address={ADDRESS} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/user/${ADDRESS}`);
    expect(link.textContent).toMatch(SHORT);
    expect(link.getAttribute('title')?.toLowerCase()).toBe(ADDRESS);
    expect(link.closest('span.whitespace-nowrap')).not.toBeNull();
  });

  it('copies the full checksummed address and announces it', async () => {
    jest.useFakeTimers();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<AddressChip address={ADDRESS} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'common.actions.copyAddress' }));
    });
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^0x[0-9a-fA-F]{40}$/));
    expect(writeText.mock.calls[0]?.[0].toLowerCase()).toBe(ADDRESS);
    expect(screen.getByRole('button', { name: 'common.actions.copied' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('common.actions.addressCopied');

    act(() => {
      jest.advanceTimersByTime(2_000);
    });
    expect(screen.getByRole('button', { name: 'common.actions.copyAddress' })).toBeInTheDocument();
  });

  it('names the zero address by its role in a transfer and does not link it', () => {
    const { rerender } = render(<AddressChip address={ZERO} zeroRole="from" />);
    expect(screen.getByText('formats.address.imprinted')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<AddressChip address={ZERO} zeroRole="to" />);
    expect(screen.getByText('formats.address.consumed')).toBeInTheDocument();
    rerender(<AddressChip address={ZERO} />);
    expect(screen.getByText('formats.address.zero')).toBeInTheDocument();
  });

  it('marks the address the page is about instead of linking to itself', () => {
    render(
      <AddressChip address={ADDRESS} currentAddress={ADDRESS.toUpperCase().replace('0X', '0x')} />,
    );
    expect(screen.getByText('formats.address.self')).toHaveAttribute(
      'class',
      expect.stringContaining('truncate'),
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('labels protocol contracts by name', () => {
    publishDashboardContractAddresses({ ...emptyContractAddresses(), charity: ADDRESS });
    render(<AddressChip address={ADDRESS} variant="plain" />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('[color:inherit]');
    expect(link).not.toHaveClass('text-muted-foreground');
    expect(link).toHaveTextContent('formats.address.known.publicGoods');
    expect(link.getAttribute('title')).toMatch(/^formats\.address\.known\.publicGoods · 0x/);
  });

  it('shows hex anyway when labels are turned off, and honours an explicit label', () => {
    publishDashboardContractAddresses({ ...emptyContractAddresses(), charity: ADDRESS });
    const { rerender } = render(<AddressChip address={ADDRESS} label={false} />);
    expect(screen.getByRole('link').textContent).toMatch(SHORT);
    rerender(<AddressChip address={ADDRESS} label="Treasury" href={false} showCopy={false} />);
    expect(screen.getByText('Treasury')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows the full address only when asked, for detail-page headers', () => {
    const { rerender } = render(<AddressChip address={ADDRESS} display="full" />);
    expect(screen.getByRole('link').textContent?.toLowerCase()).toBe(ADDRESS);
    rerender(<AddressChip address={ADDRESS} display="responsive" />);
    const link = screen.getByRole('link');
    expect(link.querySelector('.sm\\:hidden')?.textContent).toMatch(SHORT);
    expect(link.querySelector('.sm\\:inline')?.textContent?.toLowerCase()).toBe(ADDRESS);
  });
});
