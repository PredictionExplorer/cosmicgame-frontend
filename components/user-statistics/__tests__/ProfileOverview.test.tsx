import { checkA11y, render, screen } from '@/test-utils';

import { ProfileOverview, type ProfileOverviewProps } from '../ProfileOverview';

const ADDRESS = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';

const props = (overrides: Partial<ProfileOverviewProps> = {}): ProfileOverviewProps => ({
  address: ADDRESS,
  userInfo: {
    NumBids: 332,
    NumPrizes: 5,
    MaxBidAmount: 0.1,
    TotalCSTokensWon: 3,
    CosmicSignatureNumTransfers: 2,
    SumRaffleEthWinnings: 0,
    SumRaffleEthWithdrawal: 0,
    NumRaffleEthWinnings: 0,
    RaffleNFTsCount: 0,
    UnclaimedNFTs: 0,
  },
  gestures: { count: 332, cycles: 2, firstCycle: 0, ethSpent: 6.6884, cstSpent: 0 },
  latestGestureTs: 1_786_491_506,
  heldOrAnchored: 1,
  anchoredNow: { cosmicSignature: 1, randomWalk: 6 },
  anchorActions: { cosmicSignature: 1, randomWalk: 6 },
  anchorDistributionsEth: 0.1562,
  ...overrides,
});

/** The spec-sheet row whose label is `label` (the Definitions list repeats some labels later). */
const row = (label: string) => screen.getAllByText(label)[0]?.closest('div') as HTMLElement;

describe('ProfileOverview', () => {
  it('names the split behind each anchoring total, by kind of NFT', () => {
    render(<ProfileOverview {...props()} />);
    for (const label of [
      'myPages.statistics.overview.anchoring.anchoredNow',
      'myPages.statistics.overview.anchoring.actions',
    ]) {
      expect(row(label)).toHaveTextContent('7');
      expect(row(label)).toHaveTextContent(
        'myPages.statistics.overview.anchoring.byKind(cosmicSignature=1,randomWalk=6)',
      );
    }
  });

  it('reads out the largest ETH gesture', () => {
    render(<ProfileOverview {...props()} />);
    expect(row('myPages.statistics.overview.gestures.largest')).toHaveTextContent('0.1000 ETH');
  });

  // The API writes -1e-18 for an address whose gestures were all CST; the row read
  // ">-0.0001 ETH" for it.
  it.each([-1e-18, 0, undefined])('says a participant with no ETH gesture has none (%s)', (max) => {
    render(
      <ProfileOverview {...props({ userInfo: { ...props().userInfo, MaxBidAmount: max } })} />,
    );
    const largest = row('myPages.statistics.overview.gestures.largest');
    expect(largest).not.toHaveTextContent('ETH');
    expect(largest).toHaveTextContent('tables.status.none');
  });

  it('says how many received NFTs are held or anchored now, once that read answered', () => {
    const { rerender } = render(<ProfileOverview {...props()} />);
    expect(row('myPages.statistics.overview.nfts.received')).toHaveTextContent(
      'myPages.statistics.overview.nfts.heldOrAnchored(count=1)',
    );
    rerender(<ProfileOverview {...props({ heldOrAnchored: null })} />);
    expect(row('myPages.statistics.overview.nfts.received')).not.toHaveTextContent(
      'heldOrAnchored',
    );
  });

  it('links a figure to its ledger only when the ledger has something in it', () => {
    render(<ProfileOverview {...props()} />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    // Zero ETH and zero NFTs from Stellar Selection: no arrow to an empty page.
    expect(hrefs).not.toContain(`/user/stellar-selection-eth/${ADDRESS}`);
    expect(hrefs).not.toContain(`/user/stellar-selection-nft/${ADDRESS}`);
    expect(hrefs).toContain(`/cosmic-signature-transfer/${ADDRESS}`);
  });

  it('links Stellar Selection figures once there are some', () => {
    render(
      <ProfileOverview
        {...props({
          userInfo: {
            NumBids: 1,
            NumPrizes: 1,
            SumRaffleEthWinnings: 0.2,
            SumRaffleEthWithdrawal: 0.1,
            RaffleNFTsCount: 2,
          },
        })}
      />,
    );
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toContain(`/user/stellar-selection-eth/${ADDRESS}`);
    expect(hrefs).toContain(`/user/stellar-selection-nft/${ADDRESS}`);
    expect(hrefs).not.toContain(`/cosmic-signature-transfer/${ADDRESS}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProfileOverview {...props()} />);
    await checkA11y(container);
  });
});
