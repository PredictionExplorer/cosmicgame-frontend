import type { ReactNode } from 'react';
import type { Address } from 'viem';

import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';
import { createFakeTxFlow } from '@/test-utils/txFlow';

import type { RecipientCheck } from '@/components/tokens/transfer/useRecipientFacts';

import { checkA11y, fireEvent, render, screen, waitFor } from '@/test-utils';

import { CosmicSignatureNftTransferForm } from '../CosmicSignatureNftTransferForm';

const SOURCE = '0x1111111111111111111111111111111111111111' as Address;
const RECIPIENT = '0x3333333333333333333333333333333333333334';

const mockTx = createFakeTxFlow(SOURCE);
const mockInvalidateQueries = jest.fn();
const mockNotify = jest.fn();
let mockCheck: RecipientCheck = { status: 'idle' };

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('@/hooks/useTxFlow', () => ({
  useTxFlow: () => mockTx.flow,
  useTxStageLabel: () => () => null,
}));

jest.mock('@/hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify }),
}));

jest.mock('@/contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => TEST_APP_CONTRACT_ADDRESSES,
}));

jest.mock('@/components/tokens/transfer/useRecipientFacts', () => ({
  ...jest.requireActual('@/components/tokens/transfer/useRecipientFacts'),
  useRecipientFacts: (address: string | null) => (address ? mockCheck : { status: 'idle' }),
}));

jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/components/ui/tx-status', () => ({
  TxStatus: () => null,
}));

const onSent = jest.fn();
const onComplete = jest.fn();
const onBusyChange = jest.fn();

function form(tokenIds: number[]) {
  return (
    <CosmicSignatureNftTransferForm
      sourceAddress={SOURCE}
      tokenIds={tokenIds}
      onSent={onSent}
      onComplete={onComplete}
      onBusyChange={onBusyChange}
      historyHref={`/cosmic-signature-transfer/${SOURCE}`}
    />
  );
}

function renderForm(tokenIds: number[]) {
  return render(form(tokenIds));
}

const recipientField = () => screen.getByLabelText('forms.transfer.recipient.label');
const sendButton = () => screen.getByRole('button', { name: /^myPages\.nftTransfer\.send/ });

beforeEach(() => {
  mockTx.reset();
  mockTx.writeContract.mockResolvedValue('0xhash');
  mockInvalidateQueries.mockClear();
  mockNotify.mockClear();
  onSent.mockClear();
  onComplete.mockClear();
  onBusyChange.mockClear();
  mockCheck = {
    status: 'ready',
    facts: { transactionCount: 4, isContract: false },
    known: null,
    warning: null,
  };
});

describe('CosmicSignatureNftTransferForm', () => {
  it('names the send by how many NFTs were chosen and links to the history', () => {
    renderForm([1, 2]);
    expect(sendButton()).toHaveTextContent('myPages.nftTransfer.sendCount(count=2)');
    expect(screen.getByRole('link', { name: /myPages\.nftTransfer\.viewHistory/ })).toHaveAttribute(
      'href',
      `/cosmic-signature-transfer/${SOURCE}`,
    );
  });

  it('asks for a valid recipient that is not the source', async () => {
    renderForm([1]);

    fireEvent.change(recipientField(), { target: { value: SOURCE } });
    fireEvent.click(sendButton());
    expect(await screen.findByText('forms.transfer.recipient.errors.self')).toBeInTheDocument();
    expect(recipientField()).toHaveFocus();
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('reviews, then sends each chosen NFT in turn, refreshes the wallet and completes', async () => {
    renderForm([1, 2]);
    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });

    expect(screen.getByTestId('transfer-review')).toHaveTextContent('#000001, #000002');
    fireEvent.click(sendButton());

    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(2));
    expect(mockTx.writeContract).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        address: TEST_APP_CONTRACT_ADDRESSES.cosmicSignature,
        functionName: 'transferFrom',
        args: [SOURCE, RECIPIENT, 1n],
      }),
    );
    expect(mockTx.writeContract).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ args: [SOURCE, RECIPIENT, 2n] }),
    );
    // One toast for the batch: only the last NFT's confirmation speaks.
    expect(mockTx.lastSuccessMessage()).toBe('toasts.transfer.nft.confirmed(count=2)');
    await waitFor(() => expect(onComplete).toHaveBeenCalled());
    expect(onSent).toHaveBeenCalledWith([1, 2]);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cstTokensByUser'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cstInfo', 2] });
    // The sheet stays open while the batch runs.
    expect(onBusyChange.mock.calls).toEqual([[true], [false]]);
  });

  it('stops at the NFT whose prompt was declined and reports only the ones sent', async () => {
    mockTx.writeContract
      .mockResolvedValueOnce('0xfirst')
      .mockRejectedValueOnce(
        Object.assign(new Error('User rejected the request.'), { code: 4001 }),
      );
    renderForm([1, 2, 3]);
    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });
    fireEvent.click(sendButton());

    expect(
      await screen.findByText(
        'myPages.nftTransfer.progress.stopped(completed=1,total=3,id=#000002)',
      ),
    ).toBeInTheDocument();
    expect(mockTx.writeContract).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(onSent).toHaveBeenCalledWith([1]));
    expect(onComplete).not.toHaveBeenCalled();
    // The recipient stays for a retry.
    expect(recipientField()).toHaveValue(RECIPIENT);
  });

  it('asks for an acknowledgement before sending to an address with no history', async () => {
    mockCheck = {
      status: 'ready',
      facts: { transactionCount: 0, isContract: false },
      known: null,
      warning: 'fresh',
    };
    renderForm([1]);
    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });

    fireEvent.click(sendButton());
    expect(
      await screen.findByText('forms.transfer.review.acknowledgeRequired'),
    ).toBeInTheDocument();
    expect(mockTx.writeContract).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('forms.transfer.review.acknowledge'));
    fireEvent.click(sendButton());
    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
  });

  it('asks for an acknowledgement when the recipient check failed', async () => {
    mockCheck = { status: 'failed' };
    renderForm([1]);
    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });

    fireEvent.click(sendButton());
    expect(
      await screen.findByText('forms.transfer.review.acknowledgeRequired'),
    ).toBeInTheDocument();
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('holds the batch until the recipient check answers (regression)', async () => {
    // A submit made while the field still said "Checking…" went straight to
    // the wallet, before the new-address warning could ask for a checkbox.
    mockCheck = { status: 'checking' };
    const { container, rerender } = renderForm([1]);
    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });

    const checking = screen.getByRole('button', { name: /forms\.transfer\.review\.checking/ });
    expect(checking).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(checking);
    fireEvent.submit(container.querySelector('form')!);
    await Promise.resolve();
    expect(mockTx.writeContract).not.toHaveBeenCalled();

    mockCheck = {
      status: 'ready',
      facts: { transactionCount: 0, isContract: true },
      known: null,
      warning: 'contract',
    };
    rerender(form([1]));
    fireEvent.click(sendButton());
    expect(
      await screen.findByText('forms.transfer.review.acknowledgeRequired'),
    ).toBeInTheDocument();
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('sends nothing when nothing is chosen', async () => {
    const { container } = renderForm([]);
    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });
    fireEvent.submit(container.querySelector('form')!);
    await Promise.resolve();
    expect(mockTx.writeContract).not.toHaveBeenCalled();
    expect(screen.queryByTestId('transfer-review')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderForm([1, 2]);
    await checkA11y(container);
  });
});
