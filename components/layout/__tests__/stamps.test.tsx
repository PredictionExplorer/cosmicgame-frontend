import { ReviewedStamp } from '@/components/layout/ReviewedStamp';
import { SnapshotStamp } from '@/components/layout/SnapshotStamp';

import { render, screen } from '@/test-utils';

describe('SnapshotStamp', () => {
  it('dates the snapshot to the read, as a <time> carrying the exact instant', () => {
    const readAt = Date.UTC(2026, 8, 23, 7, 20, 30);
    render(<SnapshotStamp at={readAt} />);
    const time = document.querySelector('time');
    expect(time).toHaveAttribute('datetime', '2026-09-23T07:20:30.000Z');
    expect(time).toHaveTextContent(/^common\.pageHeader\.snapshot\(date=Sep 23/);
  });
});

describe('ReviewedStamp', () => {
  it('renders the review date as a machine-readable, spelled-out calendar date', () => {
    render(<ReviewedStamp date="2026-07-20" />);
    const time = screen.getByText(/common\.pageHeader\.lastReviewed/);
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2026-07-20');
    expect(time).toHaveTextContent('date=July 20, 2026');
  });

  it('says "Last updated" for a document whose text changed that day', () => {
    render(<ReviewedStamp date="2026-07-20" kind="updated" />);
    expect(screen.getByText(/common\.pageHeader\.lastUpdated/)).toHaveAttribute(
      'datetime',
      '2026-07-20',
    );
  });

  it('never shifts the date across time zones', () => {
    // Midnight UTC is the evening before in the Americas; the date must not move.
    render(<ReviewedStamp date="2026-01-01" />);
    expect(screen.getByText(/common\.pageHeader\.lastReviewed/)).toHaveTextContent(
      'date=January 1, 2026',
    );
  });

  it('renders nothing for a date that is not an ISO calendar date', () => {
    const { container } = render(<ReviewedStamp date="July 20, 2026" />);
    expect(container).toBeEmptyDOMElement();
  });
});
