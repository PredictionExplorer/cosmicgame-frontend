import {
  COLUMN_KINDS,
  compareRows,
  compareSortValues,
  isBlankValue,
  phoneLayoutFor,
} from '@/components/ui/data-table/column-kinds';

describe('COLUMN_KINDS', () => {
  it('sets text, dates and addresses at the start and numbers at the end', () => {
    expect(COLUMN_KINDS.text.align).toBe('start');
    expect(COLUMN_KINDS.link.align).toBe('start');
    expect(COLUMN_KINDS.address.align).toBe('start');
    expect(COLUMN_KINDS.datetime.align).toBe('start');
    for (const kind of ['amount', 'count', 'percent', 'duration'] as const) {
      expect(COLUMN_KINDS[kind]).toMatchObject({ align: 'end', numeric: true, nowrap: true });
    }
  });

  it('centres nothing but status icons', () => {
    const centred = Object.entries(COLUMN_KINDS)
      .filter(([, spec]) => spec.align === 'center')
      .map(([kind]) => kind);
    expect(centred).toEqual(['status']);
  });

  it('sorts figures and dates largest or newest first on the first click', () => {
    expect(COLUMN_KINDS.amount.firstDirection).toBe('desc');
    expect(COLUMN_KINDS.datetime.firstDirection).toBe('desc');
    expect(COLUMN_KINDS.text.firstDirection).toBe('asc');
  });
});

describe('isBlankValue', () => {
  it('treats nothing, NaN and whitespace as blank, and zero as a value', () => {
    expect(isBlankValue(null)).toBe(true);
    expect(isBlankValue(undefined)).toBe(true);
    expect(isBlankValue(Number.NaN)).toBe(true);
    expect(isBlankValue('  ')).toBe(true);
    expect(isBlankValue(0)).toBe(false);
    expect(isBlankValue(false)).toBe(false);
  });
});

describe('compareSortValues', () => {
  it('compares numbers and bigints numerically', () => {
    expect(compareSortValues(2, 10)).toBeLessThan(0);
    expect(compareSortValues(10n, 2n)).toBeGreaterThan(0);
    expect(compareSortValues(3n, 3)).toBe(0);
  });

  it('compares strings with numbers in them naturally', () => {
    expect(compareSortValues('Cycle 9', 'Cycle 10')).toBeLessThan(0);
  });
});

describe('compareRows', () => {
  it('keeps blank values last in both directions', () => {
    const values = [3, null, 1, undefined, 2];
    expect([...values].sort((a, b) => compareRows(a, b, 'asc'))).toEqual([
      1,
      2,
      3,
      null,
      undefined,
    ]);
    expect([...values].sort((a, b) => compareRows(a, b, 'desc'))).toEqual([
      3,
      2,
      1,
      null,
      undefined,
    ]);
  });
});

describe('phoneLayoutFor', () => {
  it('keeps up to three compact columns as a real table', () => {
    expect(phoneLayoutFor([{ kind: 'address' }, { kind: 'count' }, { kind: 'amount' }])).toBe(
      'compact',
    );
    expect(phoneLayoutFor([{ kind: 'address' }, { kind: 'percent' }])).toBe('compact');
  });

  it.each(['datetime', 'duration', 'text'] as const)(
    'turns a table holding a %s column into records',
    (kind) => {
      // Regression: three columns of any kind stayed a table, and a dated,
      // year-stamped retrieval or two durations ran past a 320px screen.
      expect(phoneLayoutFor([{ kind: 'address' }, { kind }])).toBe('cards');
      expect(phoneLayoutFor([{ kind }, { kind: 'address' }, { kind: 'amount' }])).toBe('cards');
    },
  );

  it('turns more than three columns into records', () => {
    expect(
      phoneLayoutFor([
        { kind: 'address' },
        { kind: 'count' },
        { kind: 'percent' },
        { kind: 'percent' },
      ]),
    ).toBe('cards');
  });

  it('counts only the columns a phone shows', () => {
    expect(
      phoneLayoutFor([
        { kind: 'address' },
        { kind: 'count' },
        { kind: 'amount' },
        { kind: 'datetime', priority: 'secondary' },
      ]),
    ).toBe('compact');
  });

  it('needs a record for text set under its label', () => {
    expect(phoneLayoutFor([{ kind: 'address' }, { kind: 'link', stack: true }])).toBe('cards');
  });
});
