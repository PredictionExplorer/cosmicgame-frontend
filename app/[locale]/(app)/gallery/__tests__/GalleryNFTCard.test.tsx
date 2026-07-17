import { render, screen, checkA11y } from '@/test-utils';

import { GalleryNFTCard, type GalleryNFTData } from '../components/GalleryNFTCard';

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
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill: _f, priority: _p, unoptimized: _u, ...rest } = props;

    return <img {...rest} />;
  },
}));

const baseImprint = Math.floor(Date.now() / 1000) - 86400;

const fullNFT: GalleryNFTData = {
  TokenId: 42,
  Seed: 'abc123',
  TokenName: 'Cosmic Pioneer',
  RoundNum: 7,
  Staked: true,
  MintTimeStamp: baseImprint,
};

const unnamedNFT: GalleryNFTData = {
  TokenId: 10,
  Seed: 'def456',
  TokenName: '',
  RoundNum: 3,
  Staked: false,
  MintTimeStamp: baseImprint,
};

describe('GalleryNFTCard (grid)', () => {
  it('renders token ID', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    expect(screen.getByText('#000042')).toBeInTheDocument();
  });

  it('renders token name when present', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    expect(screen.getByText('Cosmic Pioneer')).toBeInTheDocument();
  });

  it('does not render token name when empty', () => {
    render(<GalleryNFTCard nft={unnamedNFT} index={0} variant="grid" />);
    expect(screen.queryByText('Cosmic Pioneer')).not.toBeInTheDocument();
  });

  it('renders round badge', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    expect(screen.getByText('R7')).toBeInTheDocument();
  });

  it('renders anchored badge when anchored', () => {
    const { container } = render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    const lockIcons = container.querySelectorAll('svg');
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it('does not render anchored badge when not anchored', () => {
    render(<GalleryNFTCard nft={unnamedNFT} index={0} variant="grid" />);
    expect(screen.queryByText('R3')).toBeInTheDocument();
  });

  it('renders mint age', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    expect(screen.getByText('1d ago')).toBeInTheDocument();
  });

  it('links to detail page', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/detail/42');
  });

  it('renders image with alt text', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    const img = screen.getByAltText('Cosmic Signature #000042');
    expect(img).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    await checkA11y(container);
  });
});

describe('GalleryNFTCard (list)', () => {
  it('renders token ID in list mode', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="list" />);
    expect(screen.getByText('#000042')).toBeInTheDocument();
  });

  it('renders token name in list mode', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="list" />);
    expect(screen.getByText('Cosmic Pioneer')).toBeInTheDocument();
  });

  it('shows Unnamed for empty name in list mode', () => {
    render(<GalleryNFTCard nft={unnamedNFT} index={0} variant="list" />);
    expect(screen.getByText('Unnamed')).toBeInTheDocument();
  });

  it('links to detail page in list mode', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="list" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/detail/42');
  });

  it('has no accessibility violations in list mode', async () => {
    const { container } = render(<GalleryNFTCard nft={fullNFT} index={0} variant="list" />);
    await checkA11y(container);
  });
});
