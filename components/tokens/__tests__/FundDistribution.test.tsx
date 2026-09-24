import { ALLOCATION_TRACK_COLORS, ALLOCATION_TRACK_IDS } from '@/config/allocationTracks';

import { render, screen, checkA11y } from '@/test-utils';

import { FundDistribution, reserveTracks } from '../FundDistribution';

const createData = (overrides = {}) => ({
  PrizePercentage: 25,
  RafflePercentage: 4,
  CharityPercentage: 7,
  StakingPercentage: 6,
  ChronoWarriorPercentage: 8,
  CosmicGameBalanceEth: 10,
  ...overrides,
});

const segment = (id: string) => screen.getByTestId(`fund-track-fill-${id}`);

describe('reserveTracks', () => {
  it('lists every track in the shared order, completed with the next-cycle remainder', () => {
    const tracks = reserveTracks(createData());
    expect(tracks.map((track) => track.id)).toEqual([...ALLOCATION_TRACK_IDS]);
    expect(tracks.find((track) => track.id === 'nextCycle')).toEqual({
      id: 'nextCycle',
      percent: 50,
      eth: 5,
    });
  });

  it('prices each share against the reserve', () => {
    const signature = reserveTracks(createData()).find((track) => track.id === 'signature');
    expect(signature).toEqual({ id: 'signature', percent: 25, eth: 2.5 });
  });

  it('keeps an unreadable share unknown, never 0, and the remainder with it', () => {
    const tracks = reserveTracks(createData({ RafflePercentage: undefined }));
    expect(tracks.find((track) => track.id === 'stellar')?.percent).toBeNull();
    expect(tracks.find((track) => track.id === 'nextCycle')?.percent).toBeNull();
  });

  it('keeps ETH unknown when the reserve could not be read', () => {
    const tracks = reserveTracks(createData({ CosmicGameBalanceEth: undefined }));
    expect(tracks.every((track) => track.eth === null)).toBe(true);
  });
});

describe('FundDistribution', () => {
  it('draws one segment per track, sized by its share of the whole reserve', () => {
    render(<FundDistribution data={createData()} />);
    expect(segment('signature')).toHaveStyle({ flexGrow: '25' });
    expect(segment('nextCycle')).toHaveStyle({ flexGrow: '50' });
  });

  it('colours each segment with its track token', () => {
    render(<FundDistribution data={createData()} />);
    for (const id of ALLOCATION_TRACK_IDS) {
      expect(segment(id)).toHaveClass(ALLOCATION_TRACK_COLORS[id]);
    }
  });

  it('draws an empty track rather than a guess when a share is unknown', () => {
    render(<FundDistribution data={createData({ StakingPercentage: undefined })} />);
    expect(screen.queryByTestId('fund-track-fill-signature')).not.toBeInTheDocument();
  });

  it('lists the shares for screen readers unless a ledger follows', () => {
    const { unmount } = render(<FundDistribution data={createData()} />);
    expect(screen.getByText(/^Signature Allocation/)).toHaveTextContent('25%');
    unmount();

    render(<FundDistribution data={createData()} describe={false} />);
    expect(screen.queryByText(/^Signature Allocation/)).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<FundDistribution data={createData()} />);
    await checkA11y(container);
  });
});
