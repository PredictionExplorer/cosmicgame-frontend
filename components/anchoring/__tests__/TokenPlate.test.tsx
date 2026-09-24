import { render, screen } from '@/test-utils';

import { TokenPlate, randomWalkSources } from '../TokenPlate';

const mockUseCSTInfo = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useCSTInfo: (tokenId: number | null) => mockUseCSTInfo(tokenId),
}));

beforeEach(() => {
  mockUseCSTInfo.mockReturnValue({ data: undefined, isLoading: false });
});

describe('randomWalkSources', () => {
  it('lists the black-ground thumbnail, then the full render, by the six-digit stem', () => {
    const [thumb, full] = randomWalkSources(1826);
    expect(thumb).toMatch(/001826_black_thumb\.jpg$/);
    expect(full).toMatch(/001826_black\.png$/);
  });
});

describe('TokenPlate', () => {
  it('draws a Cosmic Signature from its seed without a lookup', () => {
    render(<TokenPlate collection="cosmicSignature" tokenId={9} seed="abc" alt="" sizes="100px" />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(mockUseCSTInfo).toHaveBeenCalledWith(null);
  });

  it('looks the seed up by token id when the caller has none', () => {
    mockUseCSTInfo.mockReturnValue({ data: { TokenId: 9, Seed: 'abc' }, isLoading: false });
    render(<TokenPlate collection="cosmicSignature" tokenId={9} alt="" sizes="100px" />);
    expect(mockUseCSTInfo).toHaveBeenCalledWith(9);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
  });

  it('holds a pending plate while the seed is on its way', () => {
    mockUseCSTInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<TokenPlate collection="cosmicSignature" tokenId={9} alt="" sizes="100px" />);
    expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the designed unavailable plate when a token has no seed yet', () => {
    render(
      <TokenPlate
        collection="cosmicSignature"
        tokenId={9}
        seed={null}
        alt="Cosmic Signature #000009"
        sizes="100px"
        density="full"
      />,
    );
    expect(screen.getByRole('img', { name: 'Cosmic Signature #000009' })).toBeInTheDocument();
    expect(screen.getByText('anchoring.art.unavailable')).toBeInTheDocument();
  });

  it('draws a Random Walk NFT from its published render', () => {
    render(<TokenPlate collection="randomWalk" tokenId={1826} alt="" sizes="100px" />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    expect(mockUseCSTInfo).toHaveBeenCalledWith(null);
  });
});
