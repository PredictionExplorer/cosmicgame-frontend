import { TOKEN_1_METADATA_V2, TOKEN_7_METADATA_V2 } from '@/lib/nftMetadata/__fixtures__/metadata';
import { buildFacets, normalizeTraitEntry, parseCosmicSignatureMetadata } from '@/lib/nftMetadata';

import { render, screen, checkA11y, fireEvent, within } from '@/test-utils';

import { TraitLedgerRow, TraitSheet } from '../TraitSheet';

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
    expect(screen.getByRole('link', { name: 'View Cycle 0' })).toHaveAttribute(
      'href',
      '/allocation/0',
    );
    // The glossary's name for the metadata's "Last CST Gesture" (as on every other page).
    expect(screen.getByTestId('trait-row-allocation')).toHaveTextContent('Final CST Gesture');
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

  // V246: one hairline ledger, like the provenance ledger above it, with no
  // stretched orphan tile and the share fixed at the end of the first line.
  it('lays the traits out as ledger rows with the share in its own column', () => {
    render(
      <TraitSheet entry={entry1} facets={facets} total={2} groups={['composition']} hideHeadings />,
    );
    const row = screen.getByTestId('trait-row-structure');
    expect(row).toHaveClass('border-b', 'border-rule-faint');
    expect(row.className).not.toMatch(/col-span-2|bg-surface-sunken/);
    const share = within(row).getByText('1/2');
    expect(share).toHaveClass('type-figure-sm');
    expect(share.parentElement).toHaveClass('grid-cols-[minmax(0,1fr)_auto]');
  });

  it('adds a page’s own facts to the end of the last ledger', () => {
    render(
      <TraitSheet
        entry={entry1}
        groups={['composition']}
        hideHeadings
        extraRows={
          <TraitLedgerRow label="Halation" testId="extra-row">
            0.15
          </TraitLedgerRow>
        }
      />,
    );
    const ledgers = screen.getAllByRole('definition').map((dd) => dd.closest('dl'));
    expect(new Set(ledgers).size).toBe(1);
    expect(screen.getByTestId('extra-row')).toHaveTextContent('Halation0.15');
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
