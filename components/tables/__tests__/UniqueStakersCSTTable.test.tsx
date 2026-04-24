import '@testing-library/jest-dom';

import { shortenHex } from '@/utils';

import { UniqueStakersCSTTable } from '@/components/tables/UniqueStakersCSTTable';

import { checkA11y, render, screen } from '@/test-utils';

const createStaker = (overrides = {}) => ({
  StakerAid: 1,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakeActions: 10,
  NumUnstakeActions: 3,
  TotalTokensMinted: 15,
  TotalTokensStaked: 7,
  TotalRewardEth: 2.5,
  UnclaimedRewardEth: 0.75,
  ...overrides,
});

describe('UniqueStakersCSTTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueStakersCSTTable list={[]} />);
    expect(screen.getByText('No anchor-holders yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueStakersCSTTable list={[createStaker()]} />);
    expect(screen.getAllByText('Anchor-holder Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Num Anchor Actions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Num Release Actions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total Imprinted Tokens').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total Anchored Tokens').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total Distribution (ETH)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Unretrieved Distribution (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders anchor-holder data', () => {
    render(<UniqueStakersCSTTable list={[createStaker()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('formats ETH values to 6 decimal places', () => {
    render(
      <UniqueStakersCSTTable
        list={[createStaker({ TotalRewardEth: 1.5, UnclaimedRewardEth: 0.3 })]}
      />,
    );
    expect(screen.getByText('1.500000')).toBeInTheDocument();
    expect(screen.getByText('0.300000')).toBeInTheDocument();
  });

  it('renders shortened address with link', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<UniqueStakersCSTTable list={[createStaker({ StakerAddr: addr })]} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createStaker({ StakerAid: i, NumStakeActions: 100 + i }),
    );
    render(<UniqueStakersCSTTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueStakersCSTTable list={[]} />);
    await checkA11y(container);
  });
});
