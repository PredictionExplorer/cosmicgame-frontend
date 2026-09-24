import type { ReactNode } from 'react';
import { toast } from 'sonner';
import userEvent from '@testing-library/user-event';

import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';
import { createFakeTxFlow } from '@/test-utils/txFlow';

import type { CSTTokenInfo } from '@/services/api/types';

import { checkA11y, fireEvent, render, screen, waitFor, within } from '@/test-utils';

import { CosmicSignatureNftTransferForm } from '../CosmicSignatureNftTransferForm';

const SOURCE = '0x1111111111111111111111111111111111111111';
const OTHER_SOURCE = '0x2222222222222222222222222222222222222222';
const RECIPIENT = '0x3333333333333333333333333333333333333333';
const TX_HASH_1 = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const TX_HASH_2 = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

const mockTx = createFakeTxFlow(SOURCE);
const mockInvalidateQueries = jest.fn();
const mockEthereumRequest = jest.fn();
const mockReportError = jest.fn();

let mockAccount = SOURCE;
let mockActive = true;
let mockContractAddresses = TEST_APP_CONTRACT_ADDRESSES;

jest.mock('@/hooks/useTxFlow', () => ({
  useTxFlow: () => mockTx.flow,
  useTxStageLabel: () => () => null,
}));

jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: (...args: unknown[]) => mockInvalidateQueries(...args),
    }),
  };
});

jest.mock('../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => mockContractAddresses,
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
    active: mockActive,
  }),
}));

jest.mock('../../../utils/errors', () => {
  const actual = jest.requireActual('../../../utils/errors');
  return {
    ...actual,
    reportError: (...args: unknown[]) => mockReportError(...args),
  };
});

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
}));

function createToken(overrides: Partial<CSTTokenInfo> = {}): CSTTokenInfo {
  return {
    EvtLogId: overrides.EvtLogId ?? overrides.TokenId ?? 1,
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

function renderForm(tokens: CSTTokenInfo[] = [createToken()]) {
  return render(
    <CosmicSignatureNftTransferForm
      sourceAddress={SOURCE}
      tokens={tokens}
      historyHref={`/cosmic-signature-transfer/${SOURCE}`}
    />,
  );
}

function fillRecipient(value = RECIPIENT) {
  fireEvent.change(screen.getByLabelText('myPages.nftTransfer.recipientAddress'), {
    target: { value },
  });
}

function getTokenRow(nameOrId: string | RegExp) {
  const row = screen.getByText(nameOrId).closest('[data-testid^="nft-row-"]');
  expect(row).not.toBeNull();
  return row as HTMLElement;
}

function selectToken(nameOrId: string | RegExp) {
  fireEvent.click(getTokenRow(nameOrId));
}

const sendButton = () => screen.getByRole('button', { name: /myPages\.nftTransfer\.send$/ });

function submitForm() {
  const form = sendButton().closest('form');
  expect(form).not.toBeNull();
  fireEvent.submit(form!);
}

const summary = (selected: number, total: number) =>
  `myPages.nftTransfer.pickerSummary(selected=${selected},total=${total})`;

describe('CosmicSignatureNftTransferForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTx.reset();
    mockAccount = SOURCE;
    mockActive = true;
    mockContractAddresses = TEST_APP_CONTRACT_ADDRESSES;
    // A reset, not a clear: a test that sends fewer transfers leaves queued hashes behind.
    mockTx.writeContract.mockReset();
    mockTx.writeContract.mockResolvedValueOnce(TX_HASH_1).mockResolvedValueOnce(TX_HASH_2);
    mockInvalidateQueries.mockResolvedValue(undefined);
    mockEthereumRequest.mockResolvedValue('0x1');
    Object.defineProperty(window, 'ethereum', {
      configurable: true,
      value: { request: mockEthereumRequest },
    });
  });

  it('shows the source wallet, every NFT on its plate, and the history link', () => {
    renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha' }),
      createToken({ TokenId: 2, TokenName: 'Beta', EvtLogId: 2 }),
    ]);

    expect(screen.getByText('myPages.nftTransfer.sourceWallet')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/myPages\.nftTransfer\.selectAria/)).toHaveLength(2);
    // Each tile draws its artwork on a plate (here the designed unavailable
    // plate: no seed), decorative because the caption names the piece.
    const plate = within(getTokenRow('Alpha')).getByTestId('pending-plate');
    expect(plate).not.toHaveAttribute('role');
    expect(screen.getByRole('link', { name: 'myPages.nftTransfer.viewHistory' })).toHaveAttribute(
      'href',
      `/cosmic-signature-transfer/${SOURCE}`,
    );
  });

  it('captions each NFT with its name or number and its cycle', () => {
    renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha', RoundNum: 42 }),
      createToken({ TokenId: 2, TokenName: '', RoundNum: undefined, EvtLogId: 2 }),
    ]);

    expect(getTokenRow('Alpha')).toHaveTextContent('#000001');
    expect(
      within(getTokenRow('Alpha')).getByRole('link', {
        name: 'myPages.nftTransfer.cycle(cycle=42)',
      }),
    ).toHaveAttribute('href', '/allocation/42');
    expect(getTokenRow('#000002')).toHaveTextContent('myPages.nftTransfer.cycleUnavailable');
  });

  it('treats cycle 0 as a real generation cycle', () => {
    renderForm([createToken({ TokenId: 1, TokenName: 'Deployment NFT', RoundNum: 0 })]);

    expect(
      screen.getByRole('link', { name: 'myPages.nftTransfer.cycle(cycle=0)' }),
    ).toHaveAttribute('href', '/allocation/0');
    expect(screen.queryByText('myPages.nftTransfer.cycleUnavailable')).not.toBeInTheDocument();
  });

  it('does not repeat owner addresses inside the picker', () => {
    renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha', EvtLogId: 1 }),
      createToken({
        TokenId: 3,
        TokenName: 'Stale owner',
        EvtLogId: 3,
        CurOwnerAddr: OTHER_SOURCE,
      }),
    ]);

    expect(screen.getByTestId('nft-transfer-picker')).not.toHaveTextContent(/0x1111/);
    expect(screen.getByTestId('nft-transfer-picker')).not.toHaveTextContent(/0x2222/);
    expect(document.querySelector(`a[href="/user/${OTHER_SOURCE}"]`)).toBeNull();
  });

  it('allows the recipient address to be typed normally', async () => {
    const user = userEvent.setup();
    renderForm();

    const input = screen.getByLabelText('myPages.nftTransfer.recipientAddress');
    await user.type(input, RECIPIENT);

    expect(input).toHaveValue(RECIPIENT);
  });

  it('selects and unselects NFTs from a click anywhere on the tile', async () => {
    const user = userEvent.setup();
    renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha' }),
      createToken({ TokenId: 2, TokenName: 'Beta', EvtLogId: 2 }),
    ]);

    await user.click(getTokenRow('Alpha'));

    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=1)')).toBeChecked();
    expect(screen.getByText(summary(1, 2))).toBeInTheDocument();

    await user.click(getTokenRow('Alpha'));

    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=1)')).not.toBeChecked();
    expect(screen.getByText(summary(0, 2))).toBeInTheDocument();
  });

  it('selects and unselects NFTs from the checkbox without double toggling', async () => {
    const user = userEvent.setup();
    renderForm();

    const checkbox = screen.getByLabelText('myPages.nftTransfer.selectAria(id=1)');
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(screen.getByText(summary(1, 1))).toBeInTheDocument();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByText(summary(0, 1))).toBeInTheDocument();
  });

  it('follows the cycle link without toggling the tile', async () => {
    const user = userEvent.setup();
    renderForm();

    const link = screen.getByRole('link', { name: 'myPages.nftTransfer.cycle(cycle=5)' });
    // jsdom cannot navigate; the router would.
    link.addEventListener('click', (event) => event.preventDefault());
    await user.click(link);

    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=1)')).not.toBeChecked();
  });

  it('bulk-selects only transferable NFTs and clears selection', async () => {
    const user = userEvent.setup();
    renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha', EvtLogId: 1 }),
      createToken({ TokenId: 2, TokenName: 'Anchored', EvtLogId: 2, Staked: true }),
      createToken({
        TokenId: 3,
        TokenName: 'Stale owner',
        EvtLogId: 3,
        CurOwnerAddr: OTHER_SOURCE,
      }),
    ]);

    await user.click(screen.getByRole('button', { name: 'myPages.nftTransfer.selectAll' }));

    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=1)')).toBeChecked();
    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=2)')).not.toBeChecked();
    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=3)')).not.toBeChecked();
    expect(screen.getByText(summary(1, 1))).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'myPages.nftTransfer.clear' }));

    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=1)')).not.toBeChecked();
    expect(screen.getByText(summary(0, 1))).toBeInTheDocument();
  });

  it('selects the current page and keeps the typed recipient', async () => {
    const user = userEvent.setup();
    renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha', EvtLogId: 1 }),
      createToken({ TokenId: 2, TokenName: 'Beta', EvtLogId: 2 }),
    ]);

    await user.type(screen.getByLabelText('myPages.nftTransfer.recipientAddress'), RECIPIENT);
    await user.click(screen.getByRole('button', { name: 'myPages.nftTransfer.selectPage' }));

    expect(screen.getByLabelText('myPages.nftTransfer.recipientAddress')).toHaveValue(RECIPIENT);
    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=1)')).toBeChecked();
    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=2)')).toBeChecked();
    expect(sendButton()).toBeEnabled();
  });

  it('pages a large collection eight at a time', async () => {
    const user = userEvent.setup();
    renderForm(
      Array.from({ length: 10 }, (_, i) =>
        createToken({ TokenId: i + 1, TokenName: `Piece ${i + 1}`, EvtLogId: i + 1 }),
      ),
    );

    expect(screen.getAllByTestId(/^nft-row-/)).toHaveLength(8);
    await user.click(screen.getByRole('button', { name: 'tables.pagination.nextAria' }));
    expect(screen.getAllByTestId(/^nft-row-/)).toHaveLength(2);
    expect(screen.getByText('Piece 10')).toBeInTheDocument();
  });

  it('shows anchored NFTs but keeps them unselectable', () => {
    renderForm([
      createToken({ TokenId: 1, TokenName: 'Transferable' }),
      createToken({ TokenId: 2, TokenName: 'Anchored', EvtLogId: 2, Staked: true }),
    ]);

    selectToken('Anchored');
    expect(getTokenRow('Anchored')).toHaveTextContent('myPages.nftTransfer.statusLabels.anchored');
    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=2)')).toBeDisabled();
    expect(sendButton()).toBeDisabled();
  });

  it('keeps stale-owner NFTs unselectable', async () => {
    const user = userEvent.setup();
    renderForm([
      createToken({
        TokenId: 1,
        TokenName: 'Stale owner',
        CurOwnerAddr: OTHER_SOURCE,
      }),
    ]);

    await user.click(getTokenRow('Stale owner'));

    expect(screen.getByText('myPages.nftTransfer.statusLabels.ownerChanged')).toBeInTheDocument();
    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=1)')).not.toBeChecked();
    expect(sendButton()).toBeDisabled();
  });

  it('says so when the wallet holds no NFTs', () => {
    renderForm([]);

    expect(screen.getByText('myPages.nftTransfer.empty')).toBeInTheDocument();
    expect(screen.queryByTestId('nft-transfer-picker')).not.toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
  });

  it('rejects an invalid recipient before writing', () => {
    renderForm();
    selectToken('Alpha');
    fillRecipient('not-an-address');

    submitForm();

    expect(toast.error).toHaveBeenCalledWith('toasts.transfer.common.invalidRecipient');
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('rejects sending to the connected wallet', () => {
    renderForm();
    selectToken('Alpha');
    fillRecipient(SOURCE);

    submitForm();

    expect(toast.error).toHaveBeenCalledWith('toasts.transfer.nft.recipientMustDiffer');
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('requires the connected account to match the source wallet', () => {
    mockAccount = OTHER_SOURCE;
    renderForm();
    selectToken('Alpha');
    fillRecipient();

    submitForm();

    expect(toast.error).toHaveBeenCalledWith('toasts.transfer.nft.sourceWalletRequired');
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('sends the selected NFTs one transaction at a time and refreshes both wallets', async () => {
    renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha', EvtLogId: 1 }),
      createToken({ TokenId: 2, TokenName: 'Beta', EvtLogId: 2 }),
      createToken({ TokenId: 3, TokenName: 'Gamma', EvtLogId: 3, Staked: true }),
    ]);
    selectToken('Alpha');
    selectToken('Beta');
    fillRecipient();

    submitForm();

    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(2));
    expect(mockTx.writeContract).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        address: TEST_APP_CONTRACT_ADDRESSES.cosmicSignature,
        functionName: 'transferFrom',
        args: [SOURCE, RECIPIENT, 1n],
        account: SOURCE,
      }),
    );
    expect(mockTx.writeContract).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ args: [SOURCE, RECIPIENT, 2n] }),
    );

    // One success toast for the run, on its last transfer; each failure names its token.
    expect(mockTx.runs.map((run) => run.successMessage)).toEqual([
      null,
      'toasts.transfer.nft.confirmed(count=2)',
    ]);
    expect(mockTx.runs.map((run) => run.failureMessage)).toEqual([
      'toasts.transfer.nft.failedToken(tokenId=1)',
      'toasts.transfer.nft.failedToken(tokenId=2)',
    ]);
    expect(mockTx.runs[0]!.errorContext).toBe('Cosmic Signature NFT transfer');

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cstInfo', 2] }),
    );
    for (const queryKey of [
      ['cstTokensByUser', SOURCE],
      ['cstTokensByUser', RECIPIENT],
      ['cstTransfers', SOURCE],
      ['cstTransfers', RECIPIENT],
      ['cstInfo', 1],
    ]) {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey });
    }
    expect(
      await screen.findByText('myPages.nftTransfer.confirmation.multiple(count=2)'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /myPages\.nftTransfer\.confirmation\.viewLatest/ }),
    ).toHaveAttribute('href', expect.stringContaining(TX_HASH_2));
    expect(screen.getByLabelText('myPages.nftTransfer.recipientAddress')).toHaveValue('');
  });

  it('keeps the confirmed transfers and stops at the one that fails', async () => {
    mockTx.writeContract.mockReset();
    mockTx.writeContract
      .mockResolvedValueOnce(TX_HASH_1)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(TX_HASH_2);

    renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha', EvtLogId: 1 }),
      createToken({ TokenId: 2, TokenName: 'Beta', EvtLogId: 2 }),
      createToken({ TokenId: 3, TokenName: 'Gamma', EvtLogId: 3 }),
    ]);
    selectToken('Alpha');
    selectToken('Beta');
    selectToken('Gamma');
    fillRecipient();

    submitForm();

    expect(
      await screen.findByText('myPages.nftTransfer.progress.stopped(id=2)'),
    ).toBeInTheDocument();
    expect(mockTx.writeContract).toHaveBeenCalledTimes(2);
    expect(mockTx.lastFailureMessage()).toBe('toasts.transfer.nft.failedToken(tokenId=2)');
    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cstInfo', 1] }),
    );
    expect(mockInvalidateQueries).not.toHaveBeenCalledWith({ queryKey: ['cstInfo', 2] });
    // The recipient stays for a retry; the unsent NFTs stay selected.
    expect(screen.getByLabelText('myPages.nftTransfer.recipientAddress')).toHaveValue(RECIPIENT);
    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=2)')).toBeChecked();
    expect(screen.getByLabelText('myPages.nftTransfer.selectAria(id=3)')).toBeChecked();
  });

  it('stops quietly when the wallet declines the first transaction', async () => {
    mockTx.writeContract.mockReset();
    mockTx.writeContract.mockRejectedValueOnce({ code: 4001 });

    renderForm();
    selectToken('Alpha');
    fillRecipient();

    submitForm();

    await waitFor(() => expect(mockTx.flow.run).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(sendButton()).toBeEnabled());
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    expect(screen.queryByText(/myPages\.nftTransfer\.progress\.stopped/)).not.toBeInTheDocument();
  });

  it('asks for confirmation before sending to an address with no transaction history', async () => {
    mockEthereumRequest.mockResolvedValue('0x0');

    renderForm();
    selectToken('Alpha');
    fillRecipient();

    submitForm();

    expect(await screen.findByText('myPages.nftTransfer.warning.title')).toBeInTheDocument();
    expect(mockTx.flow.run).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'myPages.nftTransfer.warning.continue' }));

    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
  });

  it('sends without asking when the history check fails', async () => {
    mockEthereumRequest.mockRejectedValue(new Error('rpc down'));

    renderForm();
    selectToken('Alpha');
    fillRecipient();

    submitForm();

    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      'check NFT transfer destination',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderForm([
      createToken({ TokenId: 1, TokenName: 'Alpha', EvtLogId: 1 }),
      createToken({ TokenId: 2, TokenName: 'Anchored', EvtLogId: 2, Staked: true }),
    ]);

    await checkA11y(container);
  });
});
