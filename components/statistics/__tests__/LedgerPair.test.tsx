import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

import { render, screen, within } from '@/test-utils';

import { LedgerPair } from '../LedgerPair';

type Row = { id: string; value: number };
const columns: DataTableColumn<Row>[] = [
  { id: 'id', header: 'Participant', value: (row) => row.id },
  { id: 'value', kind: 'count', header: 'Gestures', value: (row) => row.value },
];
const ledger = (label: string) => (
  <DataTable data={[{ id: 'a', value: 1 }]} columns={columns} ariaLabel={label} />
);

describe('LedgerPair', () => {
  it('sets two stacks side by side from 1280px, in reading order below it', () => {
    render(
      <LedgerPair
        start={<section aria-label="Participants">{ledger('Participants')}</section>}
        end={<section aria-label="Recipients">{ledger('Recipients')}</section>}
      />,
    );
    const pair = screen.getByTestId('ledger-pair');
    expect(pair).toHaveClass('grid', 'xl:grid-cols-2', 'xl:items-start');
    const [start, end] = [...pair.children];
    expect(within(start as HTMLElement).getByRole('region', { name: 'Participants' })).toBeTruthy();
    expect(within(end as HTMLElement).getByRole('region', { name: 'Recipients' })).toBeTruthy();
    // Stacked, the second stack keeps the section rule its first section drops.
    expect(end).toHaveClass('max-xl:border-t', 'max-xl:border-rule');
  });

  it('lets every short ledger in it fill its column, never stop at the reading width', () => {
    // Regression: alone, a three-column ledger stopped at 56rem and left a
    // 384px dead band beside it under a full-width section rule.
    const alone = render(ledger('Participants'));
    expect(alone.container.querySelector('.max-w-4xl')).not.toBeNull();
    alone.unmount();

    const { container } = render(
      <LedgerPair start={ledger('Participants')} end={ledger('Recipients')} />,
    );
    expect(container.querySelector('.max-w-4xl')).toBeNull();
  });
});
