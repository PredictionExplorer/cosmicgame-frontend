import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import NFTVideo from '../NFTVideo';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const {
      fill: _f,
      priority: _p,
      unoptimized: _u,
      loader: _l,
      fetchPriority: _fp,
      ...rest
    } = props;

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
    expect(
      screen.getByRole('heading', { name: 'detail.video.watchAnimation' }),
    ).toBeInTheDocument();
  });

  it('shows the still on its plate, undimmed and decorative inside the button', () => {
    const { container } = render(<NFTVideo {...defaultProps} />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/images/thumb.png');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveClass('aspect-art');
    expect(img?.className).not.toMatch(/opacity|scale/);
  });

  it('is a labelled button that works from the keyboard', () => {
    render(<NFTVideo {...defaultProps} />);
    const play = screen.getByRole('button', { name: 'detail.video.watchAnimation' });
    expect(play).toHaveAttribute('type', 'button');
    fireEvent.click(play);
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<NFTVideo {...defaultProps} />);
    await checkA11y(container);
  });
});
