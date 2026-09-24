import type { ReactNode } from 'react';
import type { Address } from 'viem';

import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';
import { createFakeTxFlow } from '@/test-utils/txFlow';

import type { RecipientCheck } from '@/components/tokens/transfer/useRecipientFacts';

import { checkA11y, fireEvent, render, screen, waitFor } from '@/test-utils';

import { CstTransferForm } from '../CstTransferForm';

const SOURCE = '0x1111111111111111111111111111111111111111' as Address;
const RECIPIENT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const WEI = 1_000_000_000_000_000_000n;

const mockTx = createFakeTxFlow(SOURCE);
const mockInvalidateQueries = jest.fn();
const mockNotify = jest.fn();
let mockBalance: { data?: bigint; isError: boolean } = { data: 100n * WEI, isError: false };
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

jest.mock('@/components/tokens/transfer/useCstBalance', () => ({
  ...jest.requireActual('@/components/tokens/transfer/useCstBalance'),
  useCstBalance: () => mockBalance,
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

const recipientField = () => screen.getByLabelText('forms.transfer.recipient.label');
const amountField = () => screen.getByLabelText(/forms\.transfer\.amount\.label/);
const sendButton = () => screen.getByRole('button', { name: /^myPages\.transferCst\.form\.send/ });

function fill(recipient: string, amount: string) {
  fireEvent.change(recipientField(), { target: { value: recipient } });
  fireEvent.change(amountField(), { target: { value: amount } });
}

beforeEach(() => {
  mockTx.reset();
  mockInvalidateQueries.mockClear();
  mockNotify.mockClear();
  mockBalance = { data: 100n * WEI, isError: false };
  mockCheck = {
    status: 'ready',
    facts: { transactionCount: 12, isContract: false },
    known: null,
    warning: null,
  };
});

describe('CstTransferForm', () => {
  it('reviews the transfer, then sends it with the token contract', async () => {
    render(<CstTransferForm source={SOURCE} />);
    fill(RECIPIENT, '25');

    // The review shows the whole address, so every character can be compared.
    const review = screen.getByTestId('transfer-review');
    expect(review.querySelector('dd.type-hash')?.textContent?.toLowerCase()).toBe(RECIPIENT);
    expect(sendButton()).toHaveTextContent('myPages.transferCst.form.sendAmount(amount=25 CST)');
    expect(screen.getByText(/forms\.transfer\.recipient\.check\.active/)).toBeInTheDocument();

    fireEvent.click(sendButton());

    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: TEST_APP_CONTRACT_ADDRESSES.cosmicToken,
        functionName: 'transfer',
        args: [expect.stringMatching(/^0x[0-9a-fA-F]{40}$/), 25n * WEI],
      }),
    );
    expect(mockTx.lastSuccessMessage()).toBe('toasts.transfer.cst.confirmed');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cstBalance'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['ctTransfers'] });
    await waitFor(() => expect(recipientField()).toHaveValue(''));
    expect(amountField()).toHaveValue('');
  });

  it('shows each error under its field and focuses the first one to fix', async () => {
    render(<CstTransferForm source={SOURCE} />);

    fireEvent.click(sendButton());
    expect(await screen.findByText('forms.transfer.recipient.errors.required')).toBeInTheDocument();
    expect(screen.getByText('forms.transfer.amount.errors.required')).toBeInTheDocument();
    expect(recipientField()).toHaveFocus();
    expect(recipientField()).toHaveAttribute('aria-invalid', 'true');
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('refuses a malformed address, the source wallet and more CST than the balance', () => {
    render(<CstTransferForm source={SOURCE} />);

    fireEvent.change(recipientField(), { target: { value: '0x123' } });
    fireEvent.blur(recipientField());
    expect(screen.getByText('forms.transfer.recipient.errors.invalid')).toBeInTheDocument();

    fireEvent.change(recipientField(), { target: { value: SOURCE } });
    expect(screen.getByText('forms.transfer.recipient.errors.self')).toBeInTheDocument();

    fireEvent.change(amountField(), { target: { value: '101' } });
    fireEvent.blur(amountField());
    expect(
      screen.getByText('forms.transfer.amount.errors.exceedsBalance(amount=100 CST)'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('transfer-review')).not.toBeInTheDocument();
  });

  it('fills in the exact balance with Max', () => {
    mockBalance = { data: 12_345_678_900_000_000_000n, isError: false };
    render(<CstTransferForm source={SOURCE} />);

    fireEvent.click(screen.getByRole('button', { name: /forms\.transfer\.amount\.maxAria/ }));
    expect(amountField()).toHaveValue('12.3456789');
  });

  it('asks for an acknowledgement before sending to a new address', async () => {
    mockCheck = {
      status: 'ready',
      facts: { transactionCount: 0, isContract: false },
      known: null,
      warning: 'fresh',
    };
    render(<CstTransferForm source={SOURCE} />);
    fill(RECIPIENT, '1');

    fireEvent.click(sendButton());
    const acknowledgement = await screen.findByLabelText('forms.transfer.review.acknowledge');
    expect(screen.getByText('forms.transfer.review.acknowledgeRequired')).toBeInTheDocument();
    expect(acknowledgement).toHaveFocus();
    expect(mockTx.writeContract).not.toHaveBeenCalled();

    fireEvent.click(acknowledgement);
    fireEvent.click(sendButton());
    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
  });

  it('names a protocol contract recipient and warns against it', () => {
    mockCheck = {
      status: 'ready',
      facts: { transactionCount: 0, isContract: true },
      known: 'cst',
      warning: 'protocol',
    };
    render(<CstTransferForm source={SOURCE} />);
    fill(TEST_APP_CONTRACT_ADDRESSES.cosmicToken, '1');

    expect(
      screen.getAllByText(
        /forms\.transfer\.recipient\.check\.protocol\(name=formats\.address\.known\.cst\)/,
      ),
    ).not.toHaveLength(0);
    expect(screen.getByLabelText('forms.transfer.review.acknowledge')).toBeInTheDocument();
  });

  it('says so when the balance cannot be read, and still validates the rest', () => {
    mockBalance = { data: undefined, isError: true };
    render(<CstTransferForm source={SOURCE} />);

    expect(screen.getByText('forms.transfer.amount.availableUnknown')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /maxAria/ })).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CstTransferForm source={SOURCE} />);
    fill(RECIPIENT, '5');
    await checkA11y(container);
  });
});
