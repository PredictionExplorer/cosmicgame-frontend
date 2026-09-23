import type { TxStage } from '@/lib/txStage';
import { classifyTxError } from '@/lib/txErrors';

import { checkA11y, render, screen } from '@/test-utils';

import { TxExplorerLink, TxStatus } from '../tx-status';

describe('TxExplorerLink', () => {
  it('opens the transaction on the configured explorer in a new tab', () => {
    render(<TxExplorerLink hash="0xabc" label="View on Arbiscan" />);
    const link = screen.getByRole('link', { name: 'View on Arbiscan' });
    expect(link).toHaveAttribute('href', 'https://sepolia.arbiscan.io/tx/0xabc');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});

describe('TxStatus', () => {
  it('keeps an empty polite live region while idle', () => {
    render(<TxStatus stage={{ status: 'idle' }} />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toBeEmptyDOMElement();
  });

  it.each<[TxStage, string]>([
    [{ status: 'awaiting-signature', step: 1, total: 1 }, 'toasts.tx.button.confirm'],
    [
      { status: 'approving', step: 1, total: 2, phase: 'signature' },
      'toasts.tx.button.approve(step=1,total=2)',
    ],
    [{ status: 'pending', hash: '0x1' }, 'toasts.tx.button.pending'],
    [{ status: 'confirmed', hash: '0x1' }, 'toasts.tx.status.confirmed'],
    [{ status: 'cancelled' }, 'toasts.tx.status.cancelled'],
  ])('describes %o', (stage, text) => {
    render(<TxStatus stage={stage} />);
    expect(screen.getByRole('status')).toHaveTextContent(text);
  });

  it('links the transaction once there is a hash', () => {
    render(<TxStatus stage={{ status: 'pending', hash: '0xfeed' }} />);
    expect(screen.getByRole('link', { name: 'toasts.tx.viewOnExplorerShort' })).toHaveAttribute(
      'href',
      'https://sepolia.arbiscan.io/tx/0xfeed',
    );
  });

  it('shows the failure sentence the flow chose', () => {
    render(
      <TxStatus
        stage={{
          status: 'failed',
          error: classifyTxError(new Error('boom')),
          message: 'Retrieve did not go through.',
        }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Retrieve did not go through.');
  });

  it('renders the lifecycle strip with the current step emphasised', async () => {
    const { container } = render(
      <TxStatus stage={{ status: 'pending', hash: '0x1' }} variant="steps" />,
    );
    const steps = screen.getAllByRole('listitem');
    expect(steps.map((step) => step.textContent)).toEqual([
      'toasts.tx.steps.signature',
      'toasts.tx.steps.pending',
      'toasts.tx.steps.confirmed',
    ]);
    expect(screen.getByText('toasts.tx.steps.pending')).toHaveClass('font-semibold');
    await checkA11y(container);
  });
});
