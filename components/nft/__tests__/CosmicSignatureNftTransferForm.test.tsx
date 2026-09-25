import type { ReactNode } from 'react';
import type { Address } from 'viem';
import userEvent from '@testing-library/user-event';

import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';
import { createFakeTxFlow } from '@/test-utils/txFlow';

import type { RecipientCheck } from '@/components/tokens/transfer/useRecipientFacts';
import type { CSTTokenInfo } from '@/services/api/types';

import { checkA11y, fireEvent, render, screen, waitFor, within } from '@/test-utils';

import { CosmicSignatureNftTransferForm } from '../CosmicSignatureNftTransferForm';

const SOURCE = '0x1111111111111111111111111111111111111111' as Address;
const OTHER_OWNER = '0x2222222222222222222222222222222222222222';
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

function token(overrides: Partial<CSTTokenInfo> = {}): CSTTokenInfo {
  return {
    EvtLogId: overrides.TokenId ?? 1,
    BlockNum: 100,
    TxId: 1,
    TxHash: '0xabc123',
    TimeStamp: 1701346718,
    DateTime: '2023-11-30',
    TokenId: 1,
    TokenName: 'Alpha',
    CurOwnerAddr: SOURCE,
    RoundNum: 5,
    WinnerAddr: SOURCE,
    Staked: false,
    ...overrides,
  };
}

function form(tokens: CSTTokenInfo[]) {
  return (
    <CosmicSignatureNftTransferForm
      sourceAddress={SOURCE}
      tokens={tokens}
      historyHref={`/cosmic-signature-transfer/${SOURCE}`}
    />
  );
}

function renderForm(tokens: CSTTokenInfo[]) {
  return render(form(tokens));
}

const row = (id: number) => screen.getByTestId(`nft-row-${id}`);
const checkbox = (id: number) =>
  within(row(id)).getByRole('checkbox', {
    name: `myPages.nftTransfer.selectAria(id=#${String(id).padStart(6, '0')})`,
  });
const recipientField = () => screen.getByLabelText('forms.transfer.recipient.label');
const sendButton = () => screen.getByRole('button', { name: /^myPages\.nftTransfer\.send/ });
const summary = (selected: number, total: number) =>
  `myPages.nftTransfer.pickerSummary(selected=${selected},total=${total})`;

beforeEach(() => {
  mockTx.reset();
  mockTx.writeContract.mockResolvedValue('0xhash');
  mockInvalidateQueries.mockClear();
  mockNotify.mockClear();
  mockCheck = {
    status: 'ready',
    facts: { transactionCount: 4, isContract: false },
    known: null,
    warning: null,
  };
});

describe('CosmicSignatureNftTransferForm', () => {
  it('shows every NFT on its plate, captioned with its name or number and its cycle', () => {
    renderForm([
      token({ TokenId: 1, TokenName: 'Alpha', RoundNum: 42 }),
      token({ TokenId: 2, TokenName: '', RoundNum: undefined }),
    ]);

    // Each tile draws its artwork on a plate (here the designed unavailable
    // plate: no seed), decorative because the caption names the piece.
    const plate = within(row(1)).getByTestId('pending-plate');
    expect(plate).not.toHaveAttribute('role');
    expect(row(1)).toHaveTextContent('Alpha');
    expect(row(1)).toHaveTextContent('#000001');
    expect(
      within(row(1)).getByRole('link', { name: 'myPages.nftTransfer.cycle(cycle=42)' }),
    ).toHaveAttribute('href', '/allocation/42');
    expect(row(2)).toHaveTextContent('#000002');
    expect(row(2)).toHaveTextContent('myPages.nftTransfer.cycleUnavailable');
    expect(screen.getByRole('link', { name: /myPages\.nftTransfer\.viewHistory/ })).toHaveAttribute(
      'href',
      `/cosmic-signature-transfer/${SOURCE}`,
    );
  });

  it('treats cycle 0 as a real generation cycle', () => {
    renderForm([token({ TokenId: 1, TokenName: 'Deployment NFT', RoundNum: 0 })]);

    expect(
      screen.getByRole('link', { name: 'myPages.nftTransfer.cycle(cycle=0)' }),
    ).toHaveAttribute('href', '/allocation/0');
  });

  it('does not repeat owner addresses inside the picker', () => {
    renderForm([token({ TokenId: 1 }), token({ TokenId: 3, CurOwnerAddr: OTHER_OWNER })]);

    expect(screen.getByTestId('nft-transfer-picker')).not.toHaveTextContent(/0x1111/);
    expect(screen.getByTestId('nft-transfer-picker')).not.toHaveTextContent(/0x2222/);
    expect(document.querySelector(`a[href="/user/${OTHER_OWNER}"]`)).toBeNull();
  });

  it('toggles a tile from its checkbox or a click anywhere on it, never twice', () => {
    renderForm([token({ TokenId: 1 })]);

    fireEvent.click(checkbox(1));
    expect(checkbox(1)).toBeChecked();
    expect(screen.getByText(summary(1, 1))).toBeInTheDocument();
    fireEvent.click(row(1));
    expect(checkbox(1)).not.toBeChecked();
    expect(screen.getByText(summary(0, 1))).toBeInTheDocument();
  });

  it('follows the cycle link without toggling the tile', async () => {
    const user = userEvent.setup();
    renderForm([token({ TokenId: 1 })]);

    const link = screen.getByRole('link', { name: 'myPages.nftTransfer.cycle(cycle=5)' });
    // jsdom cannot navigate; the router would.
    link.addEventListener('click', (event) => event.preventDefault());
    await user.click(link);

    expect(checkbox(1)).not.toBeChecked();
  });

  it('keeps anchored and re-owned NFTs out of the selection, and says why', () => {
    renderForm([
      token({ TokenId: 1 }),
      token({ TokenId: 2, Staked: true }),
      token({ TokenId: 3, CurOwnerAddr: OTHER_OWNER }),
    ]);

    expect(checkbox(2)).toBeDisabled();
    expect(checkbox(3)).toBeDisabled();
    expect(
      within(row(2)).getByText('myPages.nftTransfer.statusLabels.anchored'),
    ).toBeInTheDocument();
    expect(
      within(row(3)).getByText('myPages.nftTransfer.statusLabels.ownerChanged'),
    ).toBeInTheDocument();
    fireEvent.click(row(2));
    expect(checkbox(2)).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'myPages.nftTransfer.selectAll' }));
    expect(checkbox(1)).toBeChecked();
    expect(checkbox(2)).not.toBeChecked();
    expect(screen.getByText(summary(1, 1))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'myPages.nftTransfer.clear' }));
    expect(checkbox(1)).not.toBeChecked();
  });

  it('selects the current page and keeps the typed recipient', () => {
    renderForm([token({ TokenId: 1 }), token({ TokenId: 2 })]);

    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });
    fireEvent.click(screen.getByRole('button', { name: 'myPages.nftTransfer.selectPage' }));

    expect(recipientField()).toHaveValue(RECIPIENT);
    expect(checkbox(1)).toBeChecked();
    expect(checkbox(2)).toBeChecked();
  });

  it('pages a large collection eight at a time', () => {
    renderForm(
      Array.from({ length: 10 }, (_, i) => token({ TokenId: i + 1, TokenName: `Piece ${i + 1}` })),
    );

    expect(screen.getAllByTestId(/^nft-row-/)).toHaveLength(8);
    fireEvent.click(screen.getByRole('button', { name: 'tables.pagination.next' }));
    expect(screen.getAllByTestId(/^nft-row-/)).toHaveLength(2);
    expect(screen.getByText('Piece 10')).toBeInTheDocument();
  });

  it('asks for a selection first, then a valid recipient that is not the source', async () => {
    renderForm([token({ TokenId: 1 })]);

    fireEvent.click(sendButton());
    expect(await screen.findByText('toasts.transfer.nft.selectOne')).toBeInTheDocument();

    fireEvent.click(checkbox(1));
    fireEvent.change(recipientField(), { target: { value: SOURCE } });
    fireEvent.click(sendButton());
    expect(await screen.findByText('forms.transfer.recipient.errors.self')).toBeInTheDocument();
    expect(recipientField()).toHaveFocus();
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('reviews, then sends each selected NFT in turn and refreshes the wallet', async () => {
    renderForm([token({ TokenId: 1 }), token({ TokenId: 2 })]);
    fireEvent.click(checkbox(1));
    fireEvent.click(checkbox(2));
    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });

    expect(screen.getByTestId('transfer-review')).toHaveTextContent('#000001, #000002');
    expect(sendButton()).toHaveTextContent('myPages.nftTransfer.sendCount(count=2)');
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
    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cstTokensByUser'] }),
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cstInfo', 2] });
    await waitFor(() => expect(recipientField()).toHaveValue(''));
  });

  it('stops at the NFT whose prompt was declined and keeps the rest selected', async () => {
    mockTx.writeContract
      .mockResolvedValueOnce('0xfirst')
      .mockRejectedValueOnce(
        Object.assign(new Error('User rejected the request.'), { code: 4001 }),
      );
    renderForm([token({ TokenId: 1 }), token({ TokenId: 2 }), token({ TokenId: 3 })]);
    fireEvent.click(screen.getByRole('button', { name: 'myPages.nftTransfer.selectAll' }));
    fireEvent.change(recipientField(), { target: { value: RECIPIENT } });
    fireEvent.click(sendButton());

    expect(
      await screen.findByText(
        'myPages.nftTransfer.progress.stopped(completed=1,total=3,id=#000002)',
      ),
    ).toBeInTheDocument();
    expect(mockTx.writeContract).toHaveBeenCalledTimes(2);
    expect(checkbox(1)).not.toBeChecked();
    expect(checkbox(2)).toBeChecked();
    expect(checkbox(3)).toBeChecked();
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
    renderForm([token({ TokenId: 1 })]);
    fireEvent.click(checkbox(1));
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
    renderForm([token({ TokenId: 1 })]);
    fireEvent.click(checkbox(1));
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
    const tokens = [token({ TokenId: 1 })];
    const { container, rerender } = renderForm(tokens);
    fireEvent.click(checkbox(1));
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
    rerender(form(tokens));
    fireEvent.click(sendButton());
    expect(
      await screen.findByText('forms.transfer.review.acknowledgeRequired'),
    ).toBeInTheDocument();
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('says so when the wallet holds no NFTs', () => {
    renderForm([]);
    expect(screen.getByText('myPages.nftTransfer.empty')).toBeInTheDocument();
    expect(screen.queryByTestId('nft-transfer-picker')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderForm([token({ TokenId: 1 }), token({ TokenId: 2, Staked: true })]);
    await checkA11y(container);
  });
});
