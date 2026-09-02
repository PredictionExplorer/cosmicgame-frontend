import { TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2 } from '@/lib/nftMetadata/__fixtures__/metadata';
import { normalizeTraitEntry, parseCosmicSignatureMetadata, scoreRarity } from '@/lib/nftMetadata';

import { render, screen, checkA11y } from '@/test-utils';

import { AllocationPill } from '../AllocationPill';
import { ChaosMeter } from '../ChaosMeter';
import { FateGlyph } from '../FateGlyph';
import { HueStrip } from '../HueStrip';
import { RarityRankChip } from '../RarityRankChip';
import { SpectralClassBadge } from '../SpectralClassBadge';
import { TraitPill } from '../TraitPill';
import {
  SPECTRAL_CLASS_COLORS,
  dominantHue,
  hueColor,
  hueStripGradient,
  spectralClassColor,
  toSpectralClass,
} from '../palette';

const entry1 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;
const entry7 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_7_METADATA_V2)!)!;

describe('palette helpers', () => {
  it('normalizes spectral classes and picks the Harvard-sequence colour', () => {
    expect(toSpectralClass(' b ')).toBe('B');
    expect(toSpectralClass('Z')).toBeNull();
    expect(spectralClassColor('O')).toBe(SPECTRAL_CLASS_COLORS.O);
    expect(spectralClassColor(undefined)).toContain('stellar-white');
  });

  it('builds banded gradients from body hues', () => {
    expect(hueColor(370)).toBe('hsl(10 78% 62%)');
    expect(hueStripGradient(undefined)).toBeNull();
    expect(hueStripGradient([])).toBeNull();
    expect(hueStripGradient([120])).toBe('hsl(120 78% 62%)');
    expect(hueStripGradient([0, 120, 240])).toMatch(/^linear-gradient\(90deg, hsl\(0 /);
    expect(dominantHue([252, 145, 205])).toBe(252);
    expect(dominantHue(undefined)).toBeNull();
  });
});

describe('HueStrip', () => {
  it('renders an accessible strip only when hues are known', () => {
    const { rerender } = render(<HueStrip hues={entry1.hues} />);
    expect(
      screen.getByRole('img', { name: 'Palette hues of the three bodies' }),
    ).toBeInTheDocument();
    rerender(<HueStrip hues={undefined} />);
    expect(screen.queryByTestId('hue-strip')).not.toBeInTheDocument();
  });
});

describe('SpectralClassBadge', () => {
  it('renders the letter, label and colour, and nothing for unknown classes', () => {
    const { rerender } = render(<SpectralClassBadge value="B" withLabel />);
    const badge = screen.getByTestId('spectral-class-badge');
    expect(badge).toHaveTextContent('B');
    expect(badge).toHaveTextContent('Class B');
    expect(badge).toHaveAttribute('aria-label', 'Spectral class B');
    rerender(<SpectralClassBadge value="Q" />);
    expect(screen.queryByTestId('spectral-class-badge')).not.toBeInTheDocument();
  });
});

describe('ChaosMeter', () => {
  it('exposes the index as a meter with bounds', () => {
    render(<ChaosMeter value={22} max={100} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '22');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('renders nothing without a value', () => {
    render(<ChaosMeter value={undefined} />);
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });
});

describe('FateGlyph', () => {
  it('labels both fates and falls back for unknown outcomes', () => {
    const { rerender } = render(<FateGlyph value="Ejection" withLabel />);
    expect(screen.getByTestId('fate-glyph')).toHaveAttribute('aria-label', 'Fate: Ejection');
    rerender(<FateGlyph value="Eternal Dance" withLabel />);
    expect(screen.getByTestId('fate-glyph')).toHaveTextContent('Eternal Dance');
    rerender(<FateGlyph value="Collision" />);
    expect(screen.getByTestId('fate-glyph')).toHaveAttribute('aria-label', 'Fate: Collision');
    rerender(<FateGlyph value={undefined} />);
    expect(screen.queryByTestId('fate-glyph')).not.toBeInTheDocument();
  });
});

describe('AllocationPill', () => {
  it('localizes known allocations and tolerates unknown ones', () => {
    const { rerender } = render(<AllocationPill value="Endurance Champion" />);
    expect(screen.getByTestId('allocation-pill')).toHaveTextContent('Endurance Champion');
    rerender(<AllocationPill value="Brand New Role" iconless />);
    expect(screen.getByTestId('allocation-pill')).toHaveTextContent('Brand New Role');
    rerender(<AllocationPill value={undefined} />);
    expect(screen.queryByTestId('allocation-pill')).not.toBeInTheDocument();
  });
});

describe('RarityRankChip', () => {
  // A twin of token 7 makes token 7's traits common and token 1's unique.
  const rarity = scoreRarity([entry1, entry7, { ...entry7, id: 8 }]);

  it('renders the rank and verbose form', () => {
    const { rerender } = render(
      <RarityRankChip rarity={rarity.byId.get(1)} total={rarity.total} />,
    );
    expect(screen.getByTestId('rarity-rank-chip')).toHaveTextContent('#1');
    expect(screen.getByTestId('rarity-rank-chip')).toHaveAttribute('aria-label', 'Rank 1 of 3');
    rerender(<RarityRankChip rarity={rarity.byId.get(7)} total={rarity.total} verbose />);
    expect(screen.getByTestId('rarity-rank-chip')).toHaveTextContent('Rank 2 of 3');
  });

  it('renders nothing when unranked', () => {
    render(<RarityRankChip rarity={null} total={2} />);
    expect(screen.queryByTestId('rarity-rank-chip')).not.toBeInTheDocument();
  });
});

describe('TraitPill', () => {
  it('renders the localized value with optional type and share', async () => {
    const { container } = render(
      <TraitPill
        traitKey="structure"
        value="Orbit Ribbons"
        withType
        share={{ count: 3, total: 48 }}
      />,
    );
    expect(container).toHaveTextContent('Structure');
    expect(container).toHaveTextContent('Orbit Ribbons');
    expect(container).toHaveTextContent('3/48');
    await checkA11y(container);
  });
});
