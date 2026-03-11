import '@testing-library/jest-dom';

import { UniqueStakersRWLKTable } from '@/components/tables/UniqueStakersRWLKTable';

import { checkA11y, render, screen } from '@/test-utils';

const createStaker = (overrides = {}) => ({
  StakerAid: 1,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakeActions: 10,
  NumUnstakeActions: 3,
  TotalTokensStaked: 7,
  TotalTokensMinted: 12,
  ...overrides,
});

describe('UniqueStakersRWLKTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueStakersRWLKTable list={[]} />);
    expect(screen.getByText('No stakers yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueStakersRWLKTable list={[createStaker()]} />);
    expect(screen.getAllByText('Staker Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Num Stake Actions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Num Unstake Actions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total Staked Tokens').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total Minted Tokens').length).toBeGreaterThanOrEqual(1);
  });

  it('renders staker data', () => {
    render(<UniqueStakersRWLKTable list={[createStaker()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createStaker({ StakerAid: i, NumStakeActions: 100 + i }),
    );
    render(<UniqueStakersRWLKTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('renders address as link to user page', () => {
    const addr = '0xaabbccddee112233445566778899aabbccddeeff';
    render(<UniqueStakersRWLKTable list={[createStaker({ StakerAddr: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueStakersRWLKTable list={[]} />);
    await checkA11y(container);
  });
});
