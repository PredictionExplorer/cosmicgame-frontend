import userEvent from '@testing-library/user-event';

import { DataTable } from '@/components/ui/data-table';
import { TimeZoneStated } from '@/components/ui/date-time';

import { checkA11y, render, screen, within } from '@/test-utils';

import { ProfileSectionNav } from '../ProfileSectionNav';

const mockJump = jest.fn();
jest.mock('@/lib/jumpToSection', () => ({
  jumpToSection: (...args: unknown[]) => mockJump(...args),
  sectionScrollBehavior: () => 'auto',
}));

const SECTIONS = [
  { id: 'profile-overview', label: 'Overview' },
  { id: 'profile-anchoring', label: 'Anchoring' },
];

describe('ProfileSectionNav', () => {
  beforeEach(() => mockJump.mockReset());

  it('links each section and states the time zone once', () => {
    render(<ProfileSectionNav label="Profile contents" sections={SECTIONS} />);
    const nav = screen.getByRole('navigation', { name: 'Profile contents' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['#profile-overview', '#profile-anchoring']);
    expect(within(nav).getByText(/timeZone|Time zone/)).toBeInTheDocument();
  });

  // Regression: the row zeroed the underline tabs' gap, and the triggers carry no padding, so
  // a phone read "GesturesAllocationsAnchoring" as one word.
  it('keeps the underline row’s gap between its links', () => {
    render(<ProfileSectionNav label="Profile contents" sections={SECTIONS} />);
    const list = screen.getByRole('navigation', { name: 'Profile contents' }).querySelector('ul');
    expect(list).toHaveClass('gap-x-6');
    expect(list?.className).not.toMatch(/(^|\s)(sm:)?gap-\d/);
  });

  it('jumps to a section and marks it as the one being read', async () => {
    render(<ProfileSectionNav label="Profile contents" sections={SECTIONS} />);
    const link = screen.getByRole('link', { name: 'Anchoring' });
    await userEvent.click(link);
    expect(mockJump).toHaveBeenCalledWith('profile-anchoring');
    expect(link).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
  });

  it('leaves the zone out of the ledgers inside a region that states it', () => {
    const table = (
      <DataTable
        data={[{ ts: 1_786_491_506 }]}
        columns={[{ id: 'ts', kind: 'datetime', header: 'Date', value: (row) => row.ts }]}
        ariaLabel="Dates"
      />
    );
    const { rerender } = render(table);
    expect(screen.getByText(/timeZone|Time zone/)).toBeInTheDocument();
    rerender(<TimeZoneStated>{table}</TimeZoneStated>);
    expect(screen.queryByText(/timeZone|Time zone/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ProfileSectionNav label="Profile contents" sections={SECTIONS} />,
    );
    await checkA11y(container);
  });
});
