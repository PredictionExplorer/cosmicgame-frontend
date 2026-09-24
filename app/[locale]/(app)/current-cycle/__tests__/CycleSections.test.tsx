import type { DashboardInfo } from '@/services/api/types';

import { render, screen, checkA11y, fireEvent, within } from '@/test-utils';

import { AttachedTokensSection, ATTACHED_NFTS_PER_PAGE } from '../components/AttachedTokensSection';
import { CycleAllocations } from '../components/CycleAllocations';
import { CycleRules } from '../components/CycleRules';

jest.mock('../components/AttachedNftPlate', () => ({
  AttachedNftPlate: ({ nft }: { nft: { RecordId: number } }) => (
    <div data-testid="attached-nft">{nft.RecordId}</div>
  ),
}));

jest.mock('../../../../../components/attachments/AttachedERC20Table', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => <div data-testid="erc20-table">{list.length}</div>,
}));

const data = {
  CurRoundNum: 2,
  PrizeAmountEth: 8.0735,
  RaffleAmountEth: 1.2918,
  StakingAmountEth: 1.9376,
  CosmicGameBalanceEth: 32.2939,
  PrizePercentage: 25,
  RafflePercentage: 4,
  CharityPercentage: 7,
  StakingPercentage: 6,
  ChronoWarriorPercentage: 8,
  NumRaffleEthWinnersBidding: 3,
  NumRaffleNFTWinnersBidding: 10,
  NumRaffleNFTWinnersStakingRWalk: 10,
} as unknown as DashboardInfo;

const row = (key: string) => {
  const element = document.querySelector(`tr[data-allocation="${key}"]`);
  if (!element) throw new Error(`no allocation row ${key}`);
  return element as HTMLElement;
};

describe('CycleAllocations', () => {
  it('shows each allocation once, with its share, what each recipient receives and who', () => {
    render(<CycleAllocations data={data} headingId="allocations" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'currentCycle.sections.allocations.title',
    );
    expect(within(row('signature')).getByText('25%')).toBeInTheDocument();
    expect(row('signature')).toHaveTextContent('8.0735');
    expect(row('ethStellar')).toHaveTextContent('0.4306');
    expect(row('ethStellar')).toHaveTextContent('recipientCount(count=3)');
    expect(row('publicGoods')).toHaveTextContent('2.2606');
    expect(row('nextCycle')).toHaveTextContent('50%');
    expect(row('nextCycle')).toHaveTextContent('currentCycle.hero.title(n=3)');
  });

  it('leaves the reserve share out of allocations paid only in CST and NFTs', () => {
    render(<CycleAllocations data={data} headingId="allocations" />);
    const shareCell = row('endurance').querySelectorAll('td')[1];
    expect(shareCell).toHaveAttribute('data-empty', 'true');
    expect(shareCell).toHaveTextContent(/^$/);
  });

  it('shows an unreadable share as unavailable, not 0%', () => {
    render(
      <CycleAllocations
        data={{ ...data, RafflePercentage: undefined } as DashboardInfo}
        headingId="a"
      />,
    );
    expect(within(row('ethStellar')).getByText('common.status.unavailable')).toBeInTheDocument();
    expect(row('ethStellar')).not.toHaveTextContent('0%');
  });

  it('ends each part of a receipt with its separator, so a wrapped line never starts with one', () => {
    render(<CycleAllocations data={data} headingId="allocations" />);
    const receipt = document.querySelector('li[data-allocation="signature"] p') as HTMLElement;
    const parts = Array.from(receipt.children) as HTMLElement[];

    expect(parts).toHaveLength(4);
    for (const part of parts.slice(0, -1)) expect(part.textContent).toMatch(/·$/);
    expect(parts.at(-1)?.textContent).not.toContain('·');
    for (const part of parts) expect(part.textContent).not.toMatch(/^·/);
  });

  it('leaves the Public Goods definition out rather than print an unknown share', () => {
    const { unmount } = render(<CycleAllocations data={data} headingId="allocations" />);
    expect(
      within(row('publicGoods'))
        .getByText('currentCycle.allocations.cards.publicGoods.name')
        .closest('[role="button"]'),
    ).not.toBeNull();
    unmount();

    render(
      <CycleAllocations
        data={{ ...data, CharityPercentage: undefined } as DashboardInfo}
        headingId="allocations"
      />,
    );
    expect(document.body).not.toHaveTextContent('percent=—');
    expect(
      within(row('publicGoods'))
        .getByText('currentCycle.allocations.cards.publicGoods.name')
        .closest('[role="button"]'),
    ).toBeNull();
  });

  it('gives phones one short record per allocation instead of four labelled lines', () => {
    render(<CycleAllocations data={data} headingId="allocations" />);
    const record = (key: string) =>
      document.querySelector(`li[data-allocation="${key}"]`) as HTMLElement;

    expect(document.querySelectorAll('li[data-allocation]')).toHaveLength(10);
    expect(record('signature')).toHaveTextContent('25%');
    expect(record('signature')).toHaveTextContent('8.0735');
    expect(record('ethStellar')).toHaveTextContent('recipientCount(count=3)');
    // No column labels repeated inside the records.
    expect(record('signature')).not.toHaveTextContent('currentCycle.allocations.columns');
    // A CST-and-NFT allocation has no share of the reserve to show.
    expect(record('endurance')).not.toHaveTextContent('%');
    // The table and the list swap at `sm`, so only one is ever shown.
    expect(document.querySelector('ul[data-allocation], ul.sm\\:hidden')).not.toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CycleAllocations data={data} headingId="allocations" />);
    await checkA11y(container);
  });
});

describe('AttachedTokensSection', () => {
  const nfts = Array.from({ length: ATTACHED_NFTS_PER_PAGE + 3 }, (_, i) => ({ RecordId: i + 1 }));

  it('renders nothing when nothing is attached', () => {
    const { container } = render(
      <AttachedTokensSection nfts={[]} erc20Tokens={[]} headingId="attached" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('pages the attached NFTs instead of rendering every one on every page', () => {
    render(<AttachedTokensSection nfts={nfts as never[]} erc20Tokens={[]} headingId="attached" />);
    expect(screen.getAllByTestId('attached-nft')).toHaveLength(ATTACHED_NFTS_PER_PAGE);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getAllByTestId('attached-nft')).toHaveLength(3);
    expect(screen.getAllByTestId('attached-nft')[0]).toHaveTextContent(
      String(ATTACHED_NFTS_PER_PAGE + 1),
    );
  });

  it('offers a tab per kind only when both kinds are attached', () => {
    render(
      <AttachedTokensSection
        nfts={nfts.slice(0, 2) as never[]}
        erc20Tokens={[{ TokenAddr: '0x1' }] as never[]}
        headingId="attached"
      />,
    );
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });
});

describe('CycleRules', () => {
  it('reads the rules from the live parameters and links to the full explanation', () => {
    render(<CycleRules data={data} headingId="rules" />);
    expect(
      screen.getByText(/currentCycle\.rules\.stellarSelection\(ethEntries=3,rafflePercent=4/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/currentCycle\.rules\.publicGoods\(percent=7,amount=2\.2606\)/),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'currentCycle.rules.learnMore' })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
  });
});
