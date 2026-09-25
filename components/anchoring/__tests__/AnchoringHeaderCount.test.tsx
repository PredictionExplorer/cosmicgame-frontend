import { render, screen } from '@/test-utils';

import { AnchoringHeaderCount, countOfLists } from '../AnchoringHeaderCount';

type Read = { data: unknown[] | undefined; isLoading: boolean };

const reads: Record<'cstActions' | 'rwlkActions' | 'deposits' | 'imprints', Read> = {
  cstActions: { data: undefined, isLoading: true },
  rwlkActions: { data: undefined, isLoading: true },
  deposits: { data: undefined, isLoading: true },
  imprints: { data: undefined, isLoading: true },
};

jest.mock('@/hooks/useApiQuery', () => ({
  useCSTAnchorActions: () => reads.cstActions,
  useRWLKAnchorActions: () => reads.rwlkActions,
  useCSTAnchorDistributions: () => reads.deposits,
  useGlobalRWLKAnchorImprints: () => reads.imprints,
}));

const rows = (count: number) => Array.from({ length: count }, () => ({}));

beforeEach(() => {
  for (const key of Object.keys(reads) as (keyof typeof reads)[]) {
    reads[key] = { data: undefined, isLoading: true };
  }
});

describe('countOfLists', () => {
  it('waits for every list, and adds them up', () => {
    expect(
      countOfLists([
        { data: rows(2), isLoading: false },
        { data: undefined, isLoading: true },
      ]),
    ).toBeUndefined();
    expect(
      countOfLists([
        { data: rows(2), isLoading: false },
        { data: rows(3), isLoading: false },
      ]),
    ).toBe(5);
  });

  it('is unknown, never zero, when a read failed with nothing to show', () => {
    expect(
      countOfLists([
        { data: rows(2), isLoading: false },
        { data: undefined, isLoading: false },
      ]),
    ).toBeNull();
    expect(countOfLists([{ data: [], isLoading: false }])).toBe(0);
  });
});

describe('AnchoringHeaderCount', () => {
  it('counts anchor and release actions across both collections', () => {
    reads.cstActions = { data: rows(33), isLoading: false };
    reads.rwlkActions = { data: rows(44), isLoading: false };
    render(<AnchoringHeaderCount metric="actions" />);
    expect(screen.getByText('77')).toBeInTheDocument();
  });

  it('counts deposits and imprints from their own ledgers', () => {
    reads.deposits = { data: rows(1), isLoading: false };
    reads.imprints = { data: rows(1_200), isLoading: false };
    render(
      <>
        <AnchoringHeaderCount metric="ethDeposits" />
        <span>|</span>
        <AnchoringHeaderCount metric="stellarImprints" />
      </>,
    );
    expect(document.body).toHaveTextContent('1|1,200');
  });

  it('holds a skeleton while a list is on its way, never a dash', () => {
    const { container } = render(<AnchoringHeaderCount metric="ethDeposits" />);
    expect(container).not.toHaveTextContent('—');
    expect(container.querySelector('span[data-slot="skeleton"]')).not.toBeNull();
  });

  it('says Unavailable in words when the browser could not read the list either', () => {
    reads.imprints = { data: undefined, isLoading: false };
    render(<AnchoringHeaderCount metric="stellarImprints" />);
    expect(screen.getByText('common.status.unavailable')).toBeVisible();
    expect(document.body).not.toHaveTextContent(/\d/);
  });
});
