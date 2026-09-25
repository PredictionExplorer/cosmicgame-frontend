import userEvent from '@testing-library/user-event';

import type { AnchorDistributionImprint } from '@/services/api';

import { checkA11y, render, screen, within } from '@/test-utils';

import {
  IMPRINT_CYCLES_PER_PAGE,
  SelectionImprintGallery,
  groupImprintsByCycle,
} from '../SelectionImprintGallery';

const mockUseCSTList = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  // The live cycle behind every cycle link (useCycleHref).
  useDashboardInfo: () => ({ data: { CurRoundNum: 99 } }),
  useCSTInfo: () => ({ data: undefined, isLoading: false }),
  useCSTList: (options: { enabled?: boolean }) => mockUseCSTList(options),
}));

const RECIPIENT = '0x95d2bA09182101f577Fb21D080FD9Bc0D916011C';

const imprint = (
  overrides: Partial<AnchorDistributionImprint> = {},
): AnchorDistributionImprint => ({
  EvtLogId: 25991,
  TxHash: '0ximprint',
  TimeStamp: 1_786_491_506,
  WinnerAddr: RECIPIENT,
  RoundNum: 1,
  TokenId: 38,
  ...overrides,
});

/** One cycle's selections: `count` imprints, token ids from `firstToken`. */
const cycle = (RoundNum: number, count: number, firstToken: number) =>
  Array.from({ length: count }, (_, index) =>
    imprint({
      EvtLogId: RoundNum * 100 + index,
      RoundNum,
      TokenId: firstToken + index,
      TxHash: `0xcycle${RoundNum}`,
    }),
  );

beforeEach(() => {
  mockUseCSTList.mockReturnValue({ data: [{ TokenId: 38, Seed: 'seed38' }], isLoading: false });
});

describe('groupImprintsByCycle', () => {
  it('groups the selections by cycle, newest cycle first, tokens in order', () => {
    const groups = groupImprintsByCycle([
      imprint({ EvtLogId: 1, RoundNum: 0, TokenId: 15 }),
      imprint({ EvtLogId: 2, RoundNum: 1, TokenId: 39 }),
      imprint({ EvtLogId: 3, RoundNum: 0, TokenId: 14 }),
      imprint({ EvtLogId: 4, RoundNum: 1, TokenId: 38 }),
    ]);
    expect(groups.map((group) => group.cycle)).toEqual([1, 0]);
    expect(groups.map((group) => group.imprints.map((row) => row.TokenId))).toEqual([
      [38, 39],
      [14, 15],
    ]);
  });
});

describe('SelectionImprintGallery', () => {
  it('says each cycle once, then hangs its selections as Signatures with wall labels', () => {
    render(<SelectionImprintGallery title="Imprints" list={cycle(1, 3, 38)} />);
    const group = screen.getByRole('region', { name: 'tables.allocation.cycle(cycle=1)' });
    // The cycle, its transaction and its count, once: not repeated on every imprint.
    expect(within(group).getByRole('heading', { level: 3 })).toHaveTextContent(
      'tables.allocation.cycle(cycle=1)',
    );
    expect(group.querySelectorAll('a[href*="0xcycle1"]')).toHaveLength(1);
    expect(group).toHaveTextContent('anchoring.ledgers.imprints.selections(count=3)');
    expect(within(group).getAllByRole('figure')).toHaveLength(3);
    // The number is the one named link; the plate is a pointer shortcut out of the tab order.
    expect(screen.getByRole('link', { name: '#000038' })).toHaveAttribute('href', '/detail/38');
    expect(document.querySelector('a[href="/detail/38"][aria-hidden="true"]')).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(document.querySelectorAll(`a[href="/user/${RECIPIENT}"]`)).toHaveLength(3);
  });

  it('pages by cycle, never splitting one', async () => {
    const user = userEvent.setup();
    const list = [...cycle(2, 10, 50), ...cycle(1, 10, 38), ...cycle(0, 10, 14)];
    render(<SelectionImprintGallery title="Imprints" list={list} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(IMPRINT_CYCLES_PER_PAGE);
    expect(screen.getAllByRole('figure')).toHaveLength(IMPRINT_CYCLES_PER_PAGE * 10);
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(
      screen.getByRole('heading', { level: 3, name: 'tables.allocation.cycle(cycle=0)' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('figure')).toHaveLength(10);
  });

  it('says a failed read failed, with a retry, never "no imprints yet"', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(
      <SelectionImprintGallery
        title="Imprints"
        list={[]}
        error="Could not load"
        errorTitle="Failed"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText('Could not load')).toBeInTheDocument();
    expect(screen.queryByText('anchoring.common.empty.imprints.title')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('holds plate skeletons while loading, and explains an empty list', () => {
    const { container, rerender } = render(
      <SelectionImprintGallery title="Imprints" list={[]} loading />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    rerender(<SelectionImprintGallery title="Imprints" list={[]} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.imprints.title' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SelectionImprintGallery title="Imprints" list={[...cycle(1, 2, 38), ...cycle(0, 2, 14)]} />,
    );
    await checkA11y(container);
  });
});
