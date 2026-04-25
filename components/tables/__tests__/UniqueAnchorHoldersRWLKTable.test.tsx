import '@testing-library/jest-dom';

import { UniqueAnchorHoldersRWLKTable } from '@/components/tables/UniqueAnchorHoldersRWLKTable';

import { checkA11y, render, screen } from '@/test-utils';

const createAnchorHolder = (overrides = {}) => ({
  StakerAid: 1,
  StakerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumStakeActions: 10,
  NumUnstakeActions: 3,
  TotalTokensStaked: 7,
  TotalTokensMinted: 12,
  ...overrides,
});

describe('UniqueAnchorHoldersRWLKTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueAnchorHoldersRWLKTable list={[]} />);
    expect(screen.getByText('No anchor-holders yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder()]} />);
    expect(screen.getAllByText('Anchor-holder Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Num Anchor Actions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Num Release Actions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total Anchored Tokens').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total Imprinted Tokens').length).toBeGreaterThanOrEqual(1);
  });

  it('renders anchor-holder data', () => {
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createAnchorHolder({ StakerAid: i, NumStakeActions: 100 + i }),
    );
    render(<UniqueAnchorHoldersRWLKTable list={list} />);
    expect(screen.getByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('renders address as link to user page', () => {
    const addr = '0xaabbccddee112233445566778899aabbccddeeff';
    render(<UniqueAnchorHoldersRWLKTable list={[createAnchorHolder({ StakerAddr: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueAnchorHoldersRWLKTable list={[]} />);
    await checkA11y(container);
  });
});
