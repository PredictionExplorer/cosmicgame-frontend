import { render, screen, checkA11y } from '@/test-utils';

import SampleDetailPage from '../SampleDetailPage';

const mockCopy = jest.fn();

jest.mock('../../../../hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: mockCopy }),
}));

jest.mock('yet-another-react-lightbox', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="lightbox">Lightbox</div> : null,
}));

jest.mock('../../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

jest.mock('../../../../components/nft/NFTVideo', () => ({
  __esModule: true,
  default: ({ image_thumb }: { image_thumb: string }) => (
    <div data-testid="nft-video">{image_thumb}</div>
  ),
}));

jest.mock('../../../../components/common/VideoPlayerDialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="video-dialog">Video</div> : null,
}));

describe('SampleDetailPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the token name', () => {
    render(<SampleDetailPage />);
    const matches = screen.getAllByText('Sample NFT');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the seed value', () => {
    render(<SampleDetailPage />);
    expect(
      screen.getByText('3c8510e4cbe870a700d7c44b05f2cdf84824fcd8108aaaafd7952222590b31de'),
    ).toBeInTheDocument();
  });

  it('renders the NFT image', () => {
    render(<SampleDetailPage />);
    expect(screen.getByTestId('nft-image')).toBeInTheDocument();
  });

  it('renders the NFT video section', () => {
    render(<SampleDetailPage />);
    expect(screen.getByTestId('nft-video')).toBeInTheDocument();
  });

  it('renders the "Copy link" button', () => {
    render(<SampleDetailPage />);
    expect(screen.getByText('Copy link')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SampleDetailPage />);
    await checkA11y(container);
  });
});
