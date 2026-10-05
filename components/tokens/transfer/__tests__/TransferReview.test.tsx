import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import { TransferReview, needsAcknowledgement, transferGate } from '../TransferReview';
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

  it('asks for an acknowledgement when the address could not be checked', () => {
    render(
      <TransferReview
        sending="25 CST"
        recipient={RECIPIENT}
        check={{ status: 'failed' }}
        acknowledged={false}
        onAcknowledgedChange={jest.fn()}
      />,
    );

    expect(screen.getByText(/^forms\.transfer\.recipient\.check\.failed/)).toBeInTheDocument();
    expect(screen.getByLabelText('forms.transfer.review.acknowledge')).toBeInTheDocument();
  });

  it('needs an acknowledgement for a warning, or when nothing vouches for the address', () => {
    expect(needsAcknowledgement(FRESH)).toBe(true);
    expect(needsAcknowledgement({ status: 'failed' })).toBe(true);
    expect(needsAcknowledgement(ACTIVE)).toBe(false);
    expect(needsAcknowledgement({ status: 'checking' })).toBe(false);
  });
});

describe('transferGate', () => {
  it('holds the send while the recipient check has not answered', () => {
    // Regression: a submit during "Checking…" used to skip the acknowledgement.
    expect(transferGate({ status: 'checking' }, false)).toBe('checking');
    expect(transferGate({ status: 'checking' }, true)).toBe('checking');
    expect(transferGate({ status: 'idle' }, true)).toBe('checking');
  });

  it('asks for the acknowledgement a warning or a failed check calls for', () => {
    expect(transferGate(FRESH, false)).toBe('acknowledge');
    expect(transferGate({ status: 'failed' }, false)).toBe('acknowledge');
    expect(transferGate(FRESH, true)).toBe('ready');
    expect(transferGate({ status: 'failed' }, true)).toBe('ready');
  });

  it('lets an active address through without one', () => {
    expect(transferGate(ACTIVE, false)).toBe('ready');
  });
});
