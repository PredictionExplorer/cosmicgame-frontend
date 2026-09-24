import userEvent from '@testing-library/user-event';

import type { TxStage } from '@/lib/txStage';

import { checkA11y, render, screen, within } from '@/test-utils';

import { ReleaseConfirmDialog, type ReleaseConfirmDialogProps } from '../ReleaseConfirmDialog';

const IDLE: TxStage = { status: 'idle' };

function renderDialog(props: Partial<ReleaseConfirmDialogProps> = {}) {
  const onConfirm = jest.fn();
  const onOpenChange = jest.fn();
  render(
    <ReleaseConfirmDialog
      open
      onOpenChange={onOpenChange}
      collection="cosmicSignature"
      count={2}
      tokens={[
        { tokenId: 9, seed: 'aa' },
        { tokenId: 14, seed: 'bb' },
      ]}
      retrievableEth={0.3124}
      onConfirm={onConfirm}
      stage={IDLE}
      {...props}
    />,
  );
  return { onConfirm, onOpenChange, dialog: screen.getByTestId('release-confirm-dialog') };
}

describe('ReleaseConfirmDialog', () => {
  it('names the release, the NFTs and the permanence before anything is sent', () => {
    const { dialog } = renderDialog();
    expect(within(dialog).getByText('anchoring.release.title(count=2)')).toBeInTheDocument();
    expect(within(dialog).getByText('#000009')).toBeInTheDocument();
    expect(within(dialog).getByText('#000014')).toBeInTheDocument();
    expect(within(dialog).getByText('anchoring.release.warning.title')).toBeInTheDocument();
    expect(within(dialog).getByText('anchoring.release.warning.body')).toBeInTheDocument();
  });

  it('estimates the ETH a Cosmic Signature release retrieves', () => {
    const { dialog } = renderDialog();
    expect(within(dialog).getByText('anchoring.release.eth.label')).toBeInTheDocument();
    expect(dialog).toHaveTextContent('0.3124');
    expect(within(dialog).getByText('anchoring.release.eth.note')).toBeInTheDocument();
  });

  it('says the estimate is unavailable rather than showing a partial sum', () => {
    const { dialog } = renderDialog({ retrievableEth: null });
    expect(within(dialog).getByText('anchoring.release.eth.unknown')).toBeInTheDocument();
  });

  it('shows no ETH for a Random Walk release, which has none', () => {
    const { dialog } = renderDialog({
      collection: 'randomWalk',
      retrievableEth: undefined,
      tokens: [{ tokenId: 1826 }],
      count: 1,
    });
    expect(within(dialog).queryByText('anchoring.release.eth.label')).not.toBeInTheDocument();
    expect(
      within(dialog).getByText('anchoring.release.description.randomWalk(count=1)'),
    ).toBeInTheDocument();
  });

  it('summarises NFTs beyond the listed six', () => {
    const tokens = Array.from({ length: 9 }, (_, index) => ({ tokenId: index, seed: `s${index}` }));
    const { dialog } = renderDialog({ tokens, count: 9 });
    expect(within(dialog).getByText('anchoring.release.more(count=3)')).toBeInTheDocument();
    expect(within(dialog).queryByText('#000006')).not.toBeInTheDocument();
  });

  it('confirms with the counted destructive button and keeps anchored with the other', async () => {
    const user = userEvent.setup();
    const { dialog, onConfirm, onOpenChange } = renderDialog();
    await user.click(
      within(dialog).getByRole('button', { name: 'anchoring.release.confirm(count=2)' }),
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await user.click(within(dialog).getByRole('button', { name: 'anchoring.release.keep' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows the transaction progress and holds the confirm button while it runs', () => {
    const { dialog } = renderDialog({ stage: { status: 'awaiting-signature', step: 1, total: 1 } });
    const confirm = within(dialog).getByRole('button', {
      name: 'anchoring.release.confirm(count=2)',
    });
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(within(dialog).getByRole('status')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { dialog } = renderDialog();
    await checkA11y(dialog);
  });
});
