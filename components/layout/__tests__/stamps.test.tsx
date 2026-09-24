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
  it('renders the review date as a machine-readable calendar date', () => {
    render(<ReviewedStamp date="2026-07-20" />);
    const time = screen.getByText(/common\.pageHeader\.lastReviewed/);
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2026-07-20');
    expect(time).toHaveTextContent('date=Jul 20, 2026');
  });

  it('renders nothing for a date that is not an ISO calendar date', () => {
    const { container } = render(<ReviewedStamp date="July 20, 2026" />);
    expect(container).toBeEmptyDOMElement();
  });
});
