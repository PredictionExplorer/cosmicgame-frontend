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
  it('hands focus to the trait heading when "Clear <trait>" removes itself', () => {
    const props = {
      collectionTraits,
      chaosRange: null,
      onToggleValue: jest.fn(),
      onClearKey: jest.fn(),
      onChaosChange: jest.fn(),
      onClearAll: jest.fn(),
    };
    const { rerender } = render(
      <GalleryTraitFacets {...props} selected={{ structure: ['Orbit Ribbons'] }} />,
    );
    const clear = screen.getByRole('button', { name: /^Clear (?!all)/ });
    fireEvent.click(clear);
    expect(props.onClearKey).toHaveBeenCalledWith('structure');
    rerender(<GalleryTraitFacets {...props} selected={{}} />);
    const trigger = document.querySelector<HTMLElement>('[data-facet="structure"] button');
    expect(trigger).not.toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('hands focus to the first control of the panel when "Clear all" removes itself', () => {
    const props = {
      collectionTraits,
      chaosRange: null,
      onToggleValue: jest.fn(),
      onClearKey: jest.fn(),
      onChaosChange: jest.fn(),
      onClearAll: jest.fn(),
    };
    const { rerender } = render(
      <GalleryTraitFacets {...props} selected={{ fate: ['Ejection'] }} />,
    );
    const facets = screen.getByTestId('trait-facets');
    const buttons = within(facets).getAllByRole('button');
    // The header's Clear all is the panel's first button while a filter is on.
    fireEvent.click(buttons[0]!);
    expect(props.onClearAll).toHaveBeenCalled();
    rerender(<GalleryTraitFacets {...props} selected={{}} />);
    expect(document.activeElement).not.toBe(document.body);
    expect(facets.contains(document.activeElement)).toBe(true);
  });

  it('lists facet options with counts and toggles them', () => {
    const { props } = renderFacets();
    const option = screen.getByLabelText('Orbit Ribbons: 1 NFTs');
    fireEvent.click(option);
    expect(props.onToggleValue).toHaveBeenCalledWith('structure', 'Orbit Ribbons');
    expect(screen.getByLabelText('Class B: 1 NFTs')).toBeInTheDocument();
  });

  it('shows the active count, per-facet clear, and clear all', () => {
    const { props } = renderFacets({
      selected: { structure: ['Orbit Ribbons'], fate: ['Ejection'] },
      chaosRange: [20, 22],
    });
    expect(screen.getByRole('heading', { name: /Traits\s*3/ })).toBeInTheDocument();
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
    // A labelled status region: role-less divs may not carry aria-label (axe aria-prohibited-attr).
    expect(screen.getByRole('status', { name: 'Indexing traits…' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
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
  function renderChips(overrides: Partial<Parameters<typeof GalleryActiveFilters>[0]> = {}) {
    const props = {
      status: 'all' as const,
      search: '',
      traits: {},
      chaosRange: null,
      onClearStatus: jest.fn(),
      onClearSearch: jest.fn(),
      onRemoveTrait: jest.fn(),
      onClearChaos: jest.fn(),
      ...overrides,
    };
    return { ...render(<GalleryActiveFilters {...props} />), props };
  }

  it('renders a removable chip for every active filter', () => {
    const { props } = renderChips({
      status: 'named',
      search: 'numba',
      traits: { structure: ['Orbit Ribbons'], fate: ['Ejection'] },
      chaosRange: [10, 40],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter Structure: Orbit Ribbons' }));
    expect(props.onRemoveTrait).toHaveBeenCalledWith('structure', 'Orbit Ribbons');
    fireEvent.click(screen.getByRole('button', { name: 'Clear Chaos' }));
    expect(props.onClearChaos).toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove filter gallery.toolbar.show: gallery.filters.named.label',
      }),
    );
    expect(props.onClearStatus).toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove filter search.gallery.submit: numba' }),
    );
    expect(props.onClearSearch).toHaveBeenCalled();
    expect(screen.getByText('10 to 40')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Active trait filters' }).children).toHaveLength(5);
  });

  it('renders nothing without active filters', () => {
    renderChips();
    expect(screen.queryByTestId('active-trait-filters')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderChips({ traits: { fate: ['Ejection'] }, chaosRange: [1, 2] });
    await checkA11y(container);
  });
});

describe('GalleryCollectionDna', () => {
  it('lists every value of a trait in the legend, hottest to coolest for spectral classes', () => {
    const onSelect = jest.fn();
    render(
      <GalleryCollectionDna
        collectionTraits={collectionTraits}
        selected={{}}
        onSelect={onSelect}
      />,
    );
    const fate = screen.getByTestId('dna-fate');
    fireEvent.click(within(fate).getByRole('button', { name: /^Ejection: 1\sNFTs/ }));
    expect(onSelect).toHaveBeenCalledWith('fate', 'Ejection');
    const spectral = screen.getByTestId('dna-spectralClass');
    const labels = within(spectral)
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'));
    expect(labels).toHaveLength(collectionTraits.facets.spectralClass?.length ?? 0);
    expect(labels[0]).toMatch(/^Class B/);
    expect(labels[1]).toMatch(/^Class F/);
  });

  it('shows the whole legend, however many values a trait has', () => {
    const many = {
      ...collectionTraits,
      facets: {
        ...collectionTraits.facets,
        spectralClass: ['O', 'B', 'A', 'F', 'G', 'K', 'M'].map((value, index) => ({
          value,
          count: index + 1,
          share: (index + 1) / 28,
        })),
      },
    };
    render(<GalleryCollectionDna collectionTraits={many} selected={{}} onSelect={noop} />);
    const legend = within(screen.getByTestId('dna-spectralClass')).getByTestId('dna-legend');
    expect(within(legend).getAllByRole('button')).toHaveLength(7);
    expect(within(legend).getByRole('button', { name: /^Class M: 7/ })).toBeInTheDocument();
  });

  it('keeps the bar a picture and the legend the control', () => {
    render(
      <GalleryCollectionDna
        collectionTraits={collectionTraits}
        selected={{ fate: ['Ejection'] }}
        onSelect={noop}
      />,
    );
    const fate = screen.getByTestId('dna-fate');
    const bar = within(fate).getByTestId('dna-bar');
    expect(bar).toHaveAttribute('aria-hidden');
    expect(within(bar).queryByRole('button', { hidden: true })).not.toBeInTheDocument();
    expect(within(fate).getByRole('button', { name: /^Ejection: 1\sNFTs/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const other = within(fate).getByRole('button', { name: /^Eternal Dance: 1\sNFTs/ });
    expect(other).toHaveAttribute('aria-pressed', 'false');
    // A real target: 32px for a mouse, 44px for a finger.
    expect(other).toHaveClass('min-h-8', 'pointer-coarse:min-h-11');
    // The count is in the subtle tier, not an opacity-dimmed colour.
    expect(within(other).getByText('1')).toHaveClass('text-subtle');
  });

  it('shows a loading state and hides itself when unavailable', () => {
    const { rerender } = render(
      <GalleryCollectionDna collectionTraits={undefined} selected={{}} onSelect={noop} />,
    );
    expect(
      screen.getByRole('status', { name: "Reading the collection's traits…" }),
    ).toHaveAttribute('aria-busy', 'true');
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
