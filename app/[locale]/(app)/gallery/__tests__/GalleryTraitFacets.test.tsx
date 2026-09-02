import { deriveCollectionTraits } from '@/hooks/useNftTraits';
import {
  TOKEN_1_METADATA_V2,
  TOKEN_43_METADATA_V1,
  TOKEN_7_METADATA_V2,
} from '@/lib/nftMetadata/__fixtures__/metadata';
import { normalizeTraitEntry, parseCosmicSignatureMetadata } from '@/lib/nftMetadata';

import { render, screen, checkA11y, fireEvent, within } from '@/test-utils';

import { GalleryActiveFilters } from '../components/GalleryActiveFilters';
import { GalleryCollectionDna } from '../components/GalleryCollectionDna';
import { GalleryTraitFacets } from '../components/GalleryTraitFacets';
import {
  countActiveTraitFilters,
  isFullChaosRange,
  matchesTraitFilters,
  parseChaosRange,
  parseTraitFilters,
  serializeChaosRange,
  serializeTraitValues,
  toggleTraitValue,
} from '../traitFilters';

const entries = [TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2, TOKEN_43_METADATA_V1].map(
  (doc) => normalizeTraitEntry(parseCosmicSignatureMetadata(doc)!)!,
);
const collectionTraits = deriveCollectionTraits({
  version: 1,
  total: 3,
  indexed: 3,
  missing: 0,
  partial: false,
  generatedAt: '2026-09-01T00:00:00.000Z',
  entries,
});

const noop = () => {};

function renderFacets(overrides: Partial<Parameters<typeof GalleryTraitFacets>[0]> = {}) {
  const props = {
    collectionTraits,
    selected: {},
    chaosRange: null,
    onToggleValue: jest.fn(),
    onClearKey: jest.fn(),
    onChaosChange: jest.fn(),
    onClearAll: jest.fn(),
    ...overrides,
  };
  return { ...render(<GalleryTraitFacets {...props} />), props };
}

describe('trait filter state helpers', () => {
  it('round-trips selections and the chaos range through URL params', () => {
    const params = new URLSearchParams(
      'structure=Orbit+Ribbons,Time+Chords&fate=Ejection&chaos=10-40&bogus=x',
    );
    expect(parseTraitFilters(params)).toEqual({
      structure: ['Orbit Ribbons', 'Time Chords'],
      fate: ['Ejection'],
    });
    expect(parseChaosRange(params)).toEqual([10, 40]);
    expect(parseChaosRange(new URLSearchParams('chaos=40-10'))).toBeNull();
    expect(parseChaosRange(new URLSearchParams('chaos=abc'))).toBeNull();
    expect(serializeTraitValues(['a', 'b'])).toBe('a,b');
    expect(serializeTraitValues([])).toBe('');
    expect(serializeChaosRange([1, 2])).toBe('1-2');
    expect(serializeChaosRange(null)).toBe('');
  });

  it('toggles values and counts active filters', () => {
    const once = toggleTraitValue({}, 'fate', 'Ejection');
    expect(once).toEqual({ fate: ['Ejection'] });
    expect(toggleTraitValue(once, 'fate', 'Ejection')).toEqual({});
    expect(countActiveTraitFilters({ fate: ['a', 'b'] }, [0, 10])).toBe(3);
    expect(isFullChaosRange([0, 100], { min: 10, max: 30 })).toBe(true);
    expect(isFullChaosRange([15, 30], { min: 10, max: 30 })).toBe(false);
  });

  it('matches entries with OR within a trait and AND across traits', () => {
    const [entry1, entry7, legacy] = entries;
    expect(matchesTraitFilters(entry1, {}, null)).toBe(true);
    expect(matchesTraitFilters(undefined, {}, null)).toBe(true);
    expect(matchesTraitFilters(legacy, { fate: ['Ejection'] }, null)).toBe(false);
    expect(matchesTraitFilters(entry1, { structure: ['Orbit Ribbons', 'Time Chords'] }, null)).toBe(
      true,
    );
    expect(
      matchesTraitFilters(entry7, { structure: ['Orbit Ribbons'], fate: ['Eternal Dance'] }, null),
    ).toBe(false);
    expect(matchesTraitFilters(entry1, { wildcard: ['Yes'] }, null)).toBe(true);
    expect(matchesTraitFilters(entry7, { wildcard: ['Yes'] }, null)).toBe(false);
    expect(matchesTraitFilters(entry1, {}, [20, 25])).toBe(true);
    expect(matchesTraitFilters(entry7, {}, [20, 25])).toBe(false);
  });
});

describe('GalleryTraitFacets', () => {
  it('lists facet options with counts and toggles them', () => {
    const { props } = renderFacets();
    const option = screen.getByLabelText('Orbit Ribbons: 1 NFTs');
    fireEvent.click(option);
    expect(props.onToggleValue).toHaveBeenCalledWith('structure', 'Orbit Ribbons');
    expect(screen.getByLabelText('Class B: 1 NFTs')).toBeInTheDocument();
  });

  it('shows the active count, match count, per-facet clear, and clear all', () => {
    const { props } = renderFacets({
      selected: { structure: ['Orbit Ribbons'], fate: ['Ejection'] },
      chaosRange: [20, 22],
      matchCount: 1,
    });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1 NFTs match')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(props.onClearAll).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Structure' }));
    expect(props.onClearKey).toHaveBeenCalledWith('structure');
  });

  it('exposes a chaos range that clears itself at the full bounds', () => {
    const { props } = renderFacets();
    const range = screen.getByTestId('chaos-range');
    const [minInput, maxInput] = within(range).getAllByRole('slider');
    fireEvent.change(minInput!, { target: { value: '20' } });
    expect(props.onChaosChange).toHaveBeenLastCalledWith([20, 22]);
    fireEvent.change(maxInput!, { target: { value: '21' } });
    expect(props.onChaosChange).toHaveBeenLastCalledWith([18, 21]);
  });

  it('clears the chaos range once it is back at the collection bounds', () => {
    const { props } = renderFacets({ chaosRange: [20, 22] });
    expect(screen.getByText('20 to 22')).toBeInTheDocument();
    const [minInput] = within(screen.getByTestId('chaos-range')).getAllByRole('slider');
    fireEvent.change(minInput!, { target: { value: '18' } });
    expect(props.onChaosChange).toHaveBeenLastCalledWith(null);
  });

  it('renders loading, error, and partial states', () => {
    const onRetry = jest.fn();
    const { rerender } = render(
      <GalleryTraitFacets
        collectionTraits={undefined}
        selected={{}}
        chaosRange={null}
        onToggleValue={noop}
        onClearKey={noop}
        onChaosChange={noop}
        onClearAll={noop}
      />,
    );
    expect(screen.getByLabelText('Indexing traits…')).toBeInTheDocument();
    rerender(
      <GalleryTraitFacets
        collectionTraits={null}
        selected={{}}
        chaosRange={null}
        onToggleValue={noop}
        onClearKey={noop}
        onChaosChange={noop}
        onClearAll={noop}
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
    rerender(
      <GalleryTraitFacets
        collectionTraits={{ ...collectionTraits, partial: true, indexed: 2, total: 5 }}
        selected={{}}
        chaosRange={null}
        onToggleValue={noop}
        onClearKey={noop}
        onChaosChange={noop}
        onClearAll={noop}
      />,
    );
    expect(screen.getByText('Trait index still filling in (2 of 5)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderFacets({ selected: { fate: ['Ejection'] } });
    await checkA11y(container);
  });
});

describe('GalleryActiveFilters', () => {
  it('renders removable chips for each selection and the chaos range', () => {
    const onRemoveValue = jest.fn();
    const onClearChaos = jest.fn();
    const onClearAll = jest.fn();
    render(
      <GalleryActiveFilters
        selected={{ structure: ['Orbit Ribbons'], fate: ['Ejection'] }}
        chaosRange={[10, 40]}
        onRemoveValue={onRemoveValue}
        onClearChaos={onClearChaos}
        onClearAll={onClearAll}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter Structure: Orbit Ribbons' }));
    expect(onRemoveValue).toHaveBeenCalledWith('structure', 'Orbit Ribbons');
    fireEvent.click(screen.getByRole('button', { name: 'Clear Chaos' }));
    expect(onClearChaos).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onClearAll).toHaveBeenCalled();
    expect(screen.getByText('10 to 40')).toBeInTheDocument();
  });

  it('renders nothing without active filters', () => {
    render(
      <GalleryActiveFilters
        selected={{}}
        chaosRange={null}
        onRemoveValue={noop}
        onClearChaos={noop}
        onClearAll={noop}
      />,
    );
    expect(screen.queryByTestId('active-trait-filters')).not.toBeInTheDocument();
  });
});

describe('GalleryCollectionDna', () => {
  it('renders proportional segments that filter on click', () => {
    const onSelect = jest.fn();
    render(
      <GalleryCollectionDna
        collectionTraits={collectionTraits}
        selected={{}}
        onSelect={onSelect}
      />,
    );
    const fate = screen.getByTestId('dna-fate');
    fireEvent.click(within(fate).getByRole('button', { name: /^Ejection: 1 NFTs/ }));
    expect(onSelect).toHaveBeenCalledWith('fate', 'Ejection');
    const spectral = screen.getByTestId('dna-spectralClass');
    // Hottest to coolest: B before F.
    const labels = within(spectral)
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'));
    expect(labels[0]).toMatch(/^Class B/);
    expect(labels[1]).toMatch(/^Class F/);
  });

  it('marks the selected segment pressed', () => {
    render(
      <GalleryCollectionDna
        collectionTraits={collectionTraits}
        selected={{ fate: ['Ejection'] }}
        onSelect={noop}
      />,
    );
    expect(screen.getByRole('button', { name: /^Ejection: 1 NFTs/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /^Eternal Dance: 1 NFTs/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('shows a loading state and hides itself when unavailable', () => {
    const { rerender } = render(
      <GalleryCollectionDna collectionTraits={undefined} selected={{}} onSelect={noop} />,
    );
    expect(screen.getByLabelText("Reading the collection's traits…")).toBeInTheDocument();
    rerender(<GalleryCollectionDna collectionTraits={null} selected={{}} onSelect={noop} />);
    expect(screen.queryByTestId('collection-dna')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <GalleryCollectionDna collectionTraits={collectionTraits} selected={{}} onSelect={noop} />,
    );
    await checkA11y(container);
  });
});
