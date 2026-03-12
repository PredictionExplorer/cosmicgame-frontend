import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import NFTVideo from '../NFTVideo';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _f, priority: _p, unoptimized: _u, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

describe('NFTVideo', () => {
  const defaultProps = {
    image_thumb: '/images/thumb.png',
    onClick: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the video section', () => {
    render(<NFTVideo {...defaultProps} />);
    expect(screen.getByTestId('nft-video-section')).toBeInTheDocument();
  });

  it('renders "Watch Animation" heading', () => {
    render(<NFTVideo {...defaultProps} />);
    expect(screen.getByText('Watch Animation')).toBeInTheDocument();
  });

  it('renders the thumbnail image', () => {
    render(<NFTVideo {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/thumb.png');
  });

  it('calls onClick when play button is clicked', () => {
    render(<NFTVideo {...defaultProps} />);
    fireEvent.click(screen.getByTestId('nft-video-play'));
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTVideo {...defaultProps} />);
    await checkA11y(container);
  });
});
