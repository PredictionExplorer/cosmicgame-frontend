import { render, screen, checkA11y } from '@/test-utils';

import { GalleryGrid } from '../components/GalleryGrid';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy(
      {},
      {
        get: (_t: unknown, prop: string) => {
          const Comp = React.forwardRef(function MotionProxy(
            props: Record<string, unknown>,
            ref: React.Ref<HTMLElement>,
          ) {
            const {
              initial: _i,
              animate: _a,
              exit: _e,
              transition: _tr,
              whileInView: _w,
              viewport: _v,
              variants: _va,
              layout: _l,
              ...rest
            } = props;
            return React.createElement(prop, { ...rest, ref });
          });
          Comp.displayName = `motion.${prop}`;
          return Comp;
        },
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _f, priority: _p, unoptimized: _u, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} />;
  },
}));

const mockItems = [
  {
    TokenId: 1,
    Seed: 'aaa',
    TokenName: 'Alpha',
    RoundNum: 1,
    Staked: false,
    MintTimeStamp: 1700000000,
  },
  { TokenId: 2, Seed: 'bbb', TokenName: '', RoundNum: 1, Staked: true, MintTimeStamp: 1700001000 },
  {
    TokenId: 3,
    Seed: 'ccc',
    TokenName: 'Gamma',
    RoundNum: 2,
    Staked: true,
    MintTimeStamp: 1700002000,
  },
];

const defaultProps = {
  items: mockItems,
  totalItems: 3,
  loading: false,
  viewMode: 'grid' as const,
  currentPage: 1,
  perPage: 12,
  onPageChange: jest.fn(),
  onPerPageChange: jest.fn(),
};

describe('GalleryGrid', () => {
  it('renders NFT cards in grid mode', () => {
    render(<GalleryGrid {...defaultProps} />);
    expect(screen.getByText('#000001')).toBeInTheDocument();
    expect(screen.getByText('#000002')).toBeInTheDocument();
    expect(screen.getByText('#000003')).toBeInTheDocument();
  });

  it('renders NFT rows in list mode', () => {
    render(<GalleryGrid {...defaultProps} viewMode="list" />);
    expect(screen.getByText('#000001')).toBeInTheDocument();
    expect(screen.getByText('#000002')).toBeInTheDocument();
    expect(screen.getByText('#000003')).toBeInTheDocument();
  });

  it('shows skeleton loading state', () => {
    const { container } = render(<GalleryGrid {...defaultProps} loading items={[]} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no items', () => {
    render(<GalleryGrid {...defaultProps} items={[]} totalItems={0} />);
    expect(screen.getByText('No NFTs found')).toBeInTheDocument();
    expect(screen.getByText('View Sample NFT')).toBeInTheDocument();
  });

  it('shows pagination info', () => {
    render(<GalleryGrid {...defaultProps} />);
    const showingText = screen.getByText(/Showing/);
    expect(showingText).toBeInTheDocument();
    expect(showingText.textContent).toContain('3');
  });

  it('renders per-page selector', () => {
    render(<GalleryGrid {...defaultProps} />);
    expect(screen.getByText('Per page')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryGrid {...defaultProps} />);
    await checkA11y(container);
  });
});
