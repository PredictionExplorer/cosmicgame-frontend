import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

import type { TxResult } from '@/hooks/useTxFlow';
import type { TxStage } from '@/lib/txStage';

import { checkA11y, render, screen, within } from '@/test-utils';

import {
  ANCHOR_GRID_PAGE_SIZE,
  AnchorTokenGrid,
  sumAccruedEth,
  type AnchorGridItem,
  type AnchorTokenGridProps,
} from '../AnchorTokenGrid';

jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const IDLE: TxStage = { status: 'idle' };
const CONFIRMED = { status: 'confirmed' } as TxResult;

const items: AnchorGridItem[] = [
  { key: 101, tokenId: 9, seed: 'aa', accruedEth: 0.1 },
  { key: 102, tokenId: 14, seed: 'bb', name: 'Twisted Mind', accruedEth: 0.2 },
  { key: 103, tokenId: 17, seed: 'cc', accruedEth: 0.05 },
];

function renderGrid(props: Partial<AnchorTokenGridProps> = {}) {
  const onCommit = jest.fn<Promise<TxResult>, [number[]]>(async () => CONFIRMED);
  const result = render(
    <AnchorTokenGrid
      id="test-grid"
      collection="cosmicSignature"
      mode="anchor"
      items={items}
      title="Available to anchor"
      emptyTitle="Nothing here"
      onCommit={onCommit}
      stage={IDLE}
      walletBusy={false}
      {...props}
    />,
  );
  return { onCommit, ...result };
}

describe('sumAccruedEth', () => {
  it('adds the accrued ETH of the selected anchors', () => {
    expect(sumAccruedEth([{ accruedEth: 0.1 }, { accruedEth: 0.25 }])).toBeCloseTo(0.35);
  });

  it('is unknown when any anchor has no reading', () => {
    expect(sumAccruedEth([{ accruedEth: 0.1 }, { accruedEth: null }])).toBeNull();
    expect(sumAccruedEth([{ accruedEth: 0.1 }, {}])).toBeNull();
  });
});

describe('AnchorTokenGrid', () => {
  it('shows every NFT on its plate with a named, labelled checkbox', () => {
    renderGrid();
    expect(screen.getByRole('heading', { name: 'Available to anchor' })).toBeInTheDocument();
    expect(screen.getAllByTestId('art-frame')).toHaveLength(3);
    // A named token keeps its name; an unnamed one reads as the collection and number.
    expect(screen.getByRole('checkbox', { name: /Twisted Mind/ })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /anchoring\.art\.signatureTitle\(id=#000009\)/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'anchoring.picker.open(title=anchoring.art.signatureTitle(id=#000009))',
      }),
    ).toHaveAttribute('href', '/detail/9');
  });

  it('raises the selection bar with the count and the approval note', async () => {
    const user = userEvent.setup();
    renderGrid();
    expect(
      screen.queryByRole('region', { name: /picker\.selectionLabel/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /Twisted Mind/ }));
    const bar = screen.getByRole('region', { name: /picker\.selectionLabel/ });
    expect(within(bar).getByText('anchoring.picker.selected(count=1)')).toBeInTheDocument();
    expect(within(bar).getByText('anchoring.picker.approvalNote')).toBeInTheDocument();
    expect(
      within(bar).getByRole('button', { name: 'anchoring.picker.anchorSelected(count=1)' }),
    ).toBeInTheDocument();
  });

  it('keeps focused controls clear of the selection bar while it is up', async () => {
    // WCAG 2.2 2.4.11: the sticky bar covers the bottom of the viewport, so the
    // root's scroll padding makes the browser scroll focus out from under it.
    const user = userEvent.setup();
    const root = document.documentElement;
    const { unmount } = renderGrid();
    expect(root.style.scrollPaddingBottom).toBe('');
    await user.click(screen.getByRole('checkbox', { name: /Twisted Mind/ }));
    expect(root.style.scrollPaddingBottom).toMatch(
      /^calc\(\d+px \+ env\(safe-area-inset-bottom, 0px\) \+ 1rem \+ 0\.75rem\)$/,
    );
    await user.click(screen.getByRole('button', { name: 'anchoring.picker.clear' }));
    expect(root.style.scrollPaddingBottom).toBe('');
    await user.click(screen.getByRole('checkbox', { name: /Twisted Mind/ }));
    unmount();
    expect(root.style.scrollPaddingBottom).toBe('');
  });

  it('selects every NFT at once and clears them', async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(screen.getByRole('button', { name: 'anchoring.picker.selectAll(count=3)' }));
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(3);
    const bar = screen.getByRole('region', { name: /picker\.selectionLabel/ });
    await user.click(within(bar).getByRole('button', { name: 'anchoring.picker.clear' }));
    expect(screen.queryAllByRole('checkbox', { checked: true })).toHaveLength(0);
  });

  it('anchors the selected token ids in one transaction', async () => {
    const user = userEvent.setup();
    const { onCommit } = renderGrid();
    await user.click(screen.getByRole('checkbox', { name: /#000009/ }));
    await user.click(screen.getByRole('checkbox', { name: /#000017/ }));
    await user.click(
      screen.getByRole('button', { name: 'anchoring.picker.anchorSelected(count=2)' }),
    );
    expect(onCommit).toHaveBeenCalledWith([101, 103]);
  });

  it('marks confirmed NFTs as updating until the refreshed list arrives', async () => {
    const user = userEvent.setup();
    const { rerender } = renderGrid();
    await user.click(screen.getByRole('checkbox', { name: /#000009/ }));
    await user.click(
      screen.getByRole('button', { name: 'anchoring.picker.anchorSelected(count=1)' }),
    );
    expect(await screen.findByText('anchoring.picker.settled.anchored')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /#000009/ })).toBeDisabled();

    // The indexer's refreshed list no longer holds the anchored NFT.
    rerender(
      <AnchorTokenGrid
        id="test-grid"
        collection="cosmicSignature"
        mode="anchor"
        items={items.slice(1)}
        title="Available to anchor"
        emptyTitle="Nothing here"
        onCommit={jest.fn()}
        stage={IDLE}
        walletBusy={false}
      />,
    );
    expect(screen.queryByText('anchoring.picker.settled.anchored')).not.toBeInTheDocument();
  });

  it('asks for confirmation before releasing, with the ETH it retrieves', async () => {
    const user = userEvent.setup();
    const { onCommit } = renderGrid({ mode: 'release', title: 'Anchored' });
    await user.click(screen.getByRole('checkbox', { name: /Twisted Mind/ }));
    const bar = screen.getByRole('region', { name: /picker\.selectionLabel/ });
    expect(within(bar).getByText('anchoring.picker.releaseNote')).toBeInTheDocument();
    await user.click(
      within(bar).getByRole('button', { name: 'anchoring.picker.releaseSelected(count=1)' }),
    );
    // Nothing is sent before the reader confirms.
    expect(onCommit).not.toHaveBeenCalled();
    const dialog = screen.getByTestId('release-confirm-dialog');
    expect(dialog).toHaveTextContent('0.2');
    await user.click(
      within(dialog).getByRole('button', { name: 'anchoring.release.confirm(count=1)' }),
    );
    expect(onCommit).toHaveBeenCalledWith([102]);
  });

  it('keeps the selection and the dialog when the release fails', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn(async () => ({ status: 'cancelled' }) as TxResult);
    renderGrid({ mode: 'release', title: 'Anchored', onCommit });
    await user.click(screen.getByRole('checkbox', { name: /Twisted Mind/ }));
    await user.click(
      screen.getByRole('button', { name: 'anchoring.picker.releaseSelected(count=1)' }),
    );
    const dialog = screen.getByTestId('release-confirm-dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'anchoring.release.confirm(count=1)' }),
    );
    expect(screen.getByTestId('release-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Twisted Mind/, hidden: true })).toBeChecked();
  });

  it('holds every control while another wallet flow runs', () => {
    renderGrid({ walletBusy: true });
    for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).toBeDisabled();
  });

  it('shows the running transaction in its bar', () => {
    renderGrid({ stage: { status: 'pending', hash: '0xabc' } });
    const bar = screen.getByRole('region', { name: /picker\.selectionLabel/ });
    expect(within(bar).getByRole('status')).toBeInTheDocument();
  });

  it('pages the grid a whole number of rows at a time', () => {
    const many = Array.from({ length: ANCHOR_GRID_PAGE_SIZE + 2 }, (_, index) => ({
      key: index,
      tokenId: index,
      seed: `s${index}`,
    }));
    renderGrid({ items: many });
    expect(screen.getAllByTestId('art-frame')).toHaveLength(ANCHOR_GRID_PAGE_SIZE);
    expect(
      screen.getByRole('navigation', {
        name: 'tables.pagination.labelFor(table=Available to anchor)',
      }),
    ).toBeInTheDocument();
  });

  it('shows the empty state with its next step', () => {
    renderGrid({ items: [], emptyAction: <a href="/gallery">Browse</a> });
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse' })).toBeInTheDocument();
  });

  it('shows plate skeletons while loading', () => {
    renderGrid({ loading: true });
    expect(screen.getByRole('status', { name: 'common.status.loading' })).toBeInTheDocument();
    expect(screen.queryByTestId('art-frame')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderGrid();
    await checkA11y(container);
  });
});
