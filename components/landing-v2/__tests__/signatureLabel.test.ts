import { routing } from '@/i18n/routing';

import { WALL_LABEL_MONTH, wallLabelMonthFormat } from '../signatureLabel';

const JUNE_2026 = Date.UTC(2026, 5, 3);

describe('wallLabelMonthFormat (V431)', () => {
  it('spells the month where the short form is a clipped abbreviation', () => {
    expect(wallLabelMonthFormat('uk').format(JUNE_2026)).toBe('червень 2026 р.');
    expect(wallLabelMonthFormat('vi').format(JUNE_2026)).toBe('tháng 6 năm 2026');
  });

  it('keeps the compact English label', () => {
    expect(wallLabelMonthFormat('en').format(JUNE_2026)).toBe('Jun 2026');
  });

  it('decides a month style for every locale', () => {
    expect(Object.keys(WALL_LABEL_MONTH).sort()).toEqual([...routing.locales].sort());
  });
});
