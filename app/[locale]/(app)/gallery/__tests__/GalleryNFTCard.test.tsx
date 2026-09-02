import { TOKEN_1_METADATA_V2 } from '@/lib/nftMetadata/__fixtures__/metadata';
import {
  normalizeTraitEntry,
  parseCosmicSignatureMetadata,
  scoreRarity,
  type NftTraitEntry,
} from '@/lib/nftMetadata';

import { render, screen, checkA11y, fireEvent } from '@/test-utils';

import {
  GalleryNFTCard,
  type GalleryCardTraits,
  type GalleryNFTData,
} from '../components/GalleryNFTCard';

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

  it('renders the cycle chip with the coined C-prefix, never the R-prefix', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    expect(screen.getByText('C7')).toBeInTheDocument();
    expect(screen.queryByText('R7')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Cycle 7')).toBeInTheDocument();
  });

  it('renders anchored badge when anchored', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    expect(screen.getByText('gallery.card.tooltips.anchored')).toBeInTheDocument();
  });

  it('does not render anchored badge when not anchored', () => {
    render(<GalleryNFTCard nft={unnamedNFT} index={0} variant="grid" />);
    expect(screen.getByText('C3')).toBeInTheDocument();
    expect(screen.queryByText('gallery.card.tooltips.anchored')).not.toBeInTheDocument();
  });

  it('renders imprint age from the gallery catalog', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    expect(screen.getByText('gallery.card.age.days(count=1)')).toBeInTheDocument();
  });

  it('falls back to the imprint transaction time the list API ships', () => {
    const { MintTimeStamp: _omitted, ...withoutMintTime } = fullNFT;
    render(
      <GalleryNFTCard
        nft={{ ...withoutMintTime, TimeStamp: baseImprint }}
        index={0}
        variant="grid"
      />,
    );
    expect(screen.getByText('gallery.card.age.days(count=1)')).toBeInTheDocument();
  });

  it('links to detail page', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/detail/42');
  });

  it('renders image with alt text', () => {
    render(<GalleryNFTCard nft={fullNFT} index={0} variant="grid" />);
    const img = screen.getByAltText('gallery.card.alt(id=#000042)');
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
    expect(screen.getByText('gallery.card.unnamed')).toBeInTheDocument();
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

describe('GalleryNFTCard (traits)', () => {
  const entry = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;
  const rarity = scoreRarity([entry]);
  const traitNft: GalleryNFTData = { ...fullNFT, TokenId: 1 };
  const withTraits: GalleryCardTraits = {
    entry,
    rarity: rarity.byId.get(1),
    rarityTotal: rarity.total,
  };

  it('renders the structure · palette summary from the trait catalog', () => {
    render(<GalleryNFTCard nft={traitNft} index={0} variant="grid" traits={withTraits} />);
    const summary = screen.getByTestId('trait-summary');
    expect(summary).toHaveTextContent('Orbit Ribbons');
    expect(summary).toHaveTextContent('Glacial Split');
  });

  it('renders the hue strip, spectral class, rarity rank, fate, chaos and allocation', () => {
    render(<GalleryNFTCard nft={traitNft} index={0} variant="grid" traits={withTraits} />);
    expect(screen.getAllByTestId('hue-strip').length).toBeGreaterThan(0);
    expect(screen.getByTestId('spectral-class-badge')).toHaveTextContent('B');
    expect(screen.getByTestId('rarity-rank-chip')).toHaveTextContent('#1');
    expect(screen.getByTestId('fate-glyph')).toBeInTheDocument();
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '22');
    expect(screen.getByTestId('allocation-pill')).toHaveTextContent('Last CST Gesture');
  });

  it('shows a skeleton while the trait index is loading', () => {
    render(<GalleryNFTCard nft={traitNft} index={0} variant="grid" />);
    expect(screen.getByTestId('trait-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('trait-summary')).not.toBeInTheDocument();
  });

  it('marks tokens without published traits as pending', () => {
    const legacy: NftTraitEntry = { id: 1, hasArtTraits: false, cycle: 0 };
    render(
      <GalleryNFTCard
        nft={traitNft}
        index={0}
        variant="grid"
        traits={{ entry: legacy, rarity: null, rarityTotal: 0 }}
      />,
    );
    expect(screen.getByTestId('traits-pending')).toHaveTextContent('Traits pending');
    expect(screen.queryByTestId('rarity-rank-chip')).not.toBeInTheDocument();
  });

  it('exposes a quick view button outside the detail link', () => {
    const onQuickView = jest.fn();
    render(
      <GalleryNFTCard
        nft={traitNft}
        index={0}
        variant="grid"
        traits={withTraits}
        onQuickView={onQuickView}
      />,
    );
    const button = screen.getByTestId('quick-view-button');
    expect(screen.getByRole('link')).not.toContainElement(button);
    fireEvent.click(button);
    expect(onQuickView).toHaveBeenCalledWith(1);
  });

  it('renders trait columns in list mode', () => {
    render(<GalleryNFTCard nft={traitNft} index={0} variant="list" traits={withTraits} />);
    expect(screen.getByText('Orbit Ribbons')).toBeInTheDocument();
    expect(screen.getByText('Glacial Split')).toBeInTheDocument();
    expect(screen.getByTestId('allocation-pill')).toHaveTextContent('Last CST Gesture');
  });

  it('has no accessibility violations with traits', async () => {
    const { container } = render(
      <GalleryNFTCard
        nft={traitNft}
        index={0}
        variant="grid"
        traits={withTraits}
        onQuickView={() => {}}
      />,
    );
    await checkA11y(container);
  });
});
