import { TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2 } from '@/lib/nftMetadata/__fixtures__/metadata';
import { buildFacets, normalizeTraitEntry, parseCosmicSignatureMetadata } from '@/lib/nftMetadata';

import { render, screen, checkA11y, fireEvent, within } from '@/test-utils';

import { TraitSheet } from '../TraitSheet';

const entry1 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_1_METADATA_V2)!)!;
const entry7 = normalizeTraitEntry(parseCosmicSignatureMetadata(TOKEN_7_METADATA_V2)!)!;
const facets = buildFacets([entry1, entry7]);

describe('TraitSheet', () => {
  it('groups every carried trait under localized headings', () => {
    render(<TraitSheet entry={entry1} />);
    expect(screen.getByRole('heading', { name: 'Composition' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Orbital physics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Provenance' })).toBeInTheDocument();
    expect(screen.getByTestId('trait-row-structure')).toHaveTextContent('Orbit Ribbons');
    expect(screen.getByTestId('trait-row-symmetry')).toHaveTextContent('Rosette ×4');
    expect(screen.getByTestId('trait-row-wildcard')).toHaveTextContent('Yes');
    expect(screen.getByTestId('trait-row-palette')).toHaveTextContent('Glacial Split');
    expect(
      within(screen.getByTestId('trait-row-palette')).getByTestId('hue-strip'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('trait-row-chaos')).toContainElement(screen.getByRole('meter'));
    expect(screen.getByTestId('trait-row-cycle')).toHaveTextContent('Cycle 0');
    expect(screen.getByRole('link', { name: 'View cycle 0' })).toHaveAttribute(
      'href',
      '/allocation/0',
    );
    expect(screen.getByTestId('trait-row-allocation')).toHaveTextContent('Last CST Gesture');
  });

  it('omits rows for traits the token does not carry', () => {
    render(<TraitSheet entry={entry7} />);
    expect(screen.queryByTestId('trait-row-underlay')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trait-row-wildcard')).not.toBeInTheDocument();
    expect(screen.getByTestId('trait-row-symmetry')).toHaveTextContent('Mirror');
  });

  it('annotates categorical values with their collection share', () => {
    render(<TraitSheet entry={entry1} facets={facets} total={2} />);
    expect(screen.getByTestId('trait-row-palette')).toHaveTextContent('2/2');
    expect(screen.getByTestId('trait-row-structure')).toHaveTextContent('1/2');
  });

  it('makes categorical values selectable when a handler is provided', () => {
    const onSelectTrait = jest.fn();
    render(
      <TraitSheet entry={entry1} onSelectTrait={onSelectTrait} groups={['physics']} hideHeadings />,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    fireEvent.click(
      within(screen.getByTestId('trait-row-fate')).getByRole('button', { name: /Ejection/ }),
    );
    expect(onSelectTrait).toHaveBeenCalledWith('fate', 'Ejection');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TraitSheet entry={entry1} facets={facets} total={2} dense />);
    await checkA11y(container);
  });
});
