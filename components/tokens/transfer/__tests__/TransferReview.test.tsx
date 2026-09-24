import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import { TransferReview, needsAcknowledgement } from '../TransferReview';
import type { RecipientCheck } from '../useRecipientFacts';

const RECIPIENT = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
const ACTIVE: RecipientCheck = {
  status: 'ready',
  facts: { transactionCount: 9, isContract: false },
  known: null,
  warning: null,
};
const FRESH: RecipientCheck = {
  status: 'ready',
  facts: { transactionCount: 0, isContract: false },
  known: null,
  warning: 'fresh',
};

describe('TransferReview', () => {
  it('shows what leaves and the whole recipient address', () => {
    render(
      <TransferReview
        sending="25 CST"
        recipient={RECIPIENT}
        check={ACTIVE}
        acknowledged={false}
        onAcknowledgedChange={jest.fn()}
      />,
    );

    const review = screen.getByRole('region', { name: 'forms.transfer.review.title' });
    expect(review).toHaveTextContent('25 CST');
    expect(review).toHaveTextContent(RECIPIENT);
    expect(screen.getByText('forms.transfer.review.final')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('asks for an acknowledgement when the address needs a second look', () => {
    const onChange = jest.fn();
    render(
      <TransferReview
        sending="25 CST"
        recipient={RECIPIENT}
        check={FRESH}
        acknowledged={false}
        onAcknowledgedChange={onChange}
        acknowledgementMissing
      />,
    );

    expect(screen.getByText(/forms\.transfer\.recipient\.check\.fresh/)).toBeInTheDocument();
    const checkbox = screen.getByLabelText('forms.transfer.review.acknowledge');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('forms.transfer.review.acknowledgeRequired');
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('only needs an acknowledgement for a checked recipient with a warning', () => {
    expect(needsAcknowledgement(FRESH)).toBe(true);
    expect(needsAcknowledgement(ACTIVE)).toBe(false);
    expect(needsAcknowledgement({ status: 'checking' })).toBe(false);
    expect(needsAcknowledgement({ status: 'failed' })).toBe(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TransferReview
        sending="25 CST"
        recipient={RECIPIENT}
        check={FRESH}
        acknowledged
        onAcknowledgedChange={jest.fn()}
      />,
    );
    await checkA11y(container);
  });
});
