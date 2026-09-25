import type { ReactNode } from 'react';

import { createFakeTxFlow } from '@/test-utils/txFlow';

import { checkA11y, fireEvent, render, screen, waitFor } from '@/test-utils';

import { VaultContributionForm } from '../VaultContributionForm';

const VAULT = '0x6666666666666666666666666666666666666666';
const mockTx = createFakeTxFlow();
let mockAddress: string | undefined = '0x1111111111111111111111111111111111111111';
let mockBalance: { value: bigint } | undefined;

jest.mock('wagmi', () => ({
  useConnection: () => ({ address: mockAddress }),
  useBalance: () => ({ data: mockBalance }),
}));

jest.mock('@/hooks/useTxFlow', () => ({
  useTxFlow: () => mockTx.flow,
  useTxStageLabel: () => () => null,
}));

// The chain guard has its own suite: here it stands in for the connect
// button a disconnected visitor sees in place of the commit button.
jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: ReactNode }) =>
    mockAddress ? children : <button type="button">wallet.connect.button</button>,
}));

jest.mock('@/components/ui/tx-status', () => ({
  TxStatus: () => null,
}));

const amountField = () => screen.getByLabelText(/forms\.transfer\.amount\.label/);
const submitButton = () =>
  screen.getByRole('button', { name: /^publicGoods\.contribute\.form\.submit/ });

beforeEach(() => {
  mockTx.reset();
  mockAddress = '0x1111111111111111111111111111111111111111';
  mockBalance = undefined;
});

// V332: the page told readers to send ETH but gave them no way to do it.
describe('VaultContributionForm', () => {
  it('sends the amount to the vault as plain ETH, naming it on the button', async () => {
    const onSuccess = jest.fn();
    render(
      <VaultContributionForm
        vaultAddress={VAULT}
        beneficiary="Protocol Guild"
        onSuccess={onSuccess}
      />,
    );

    fireEvent.change(amountField(), { target: { value: '0.25' } });
    expect(
      screen.getByText(
        'publicGoods.contribute.form.summary(amount=0.25 ETH,beneficiary=Protocol Guild)',
      ),
    ).toBeInTheDocument();
    expect(submitButton()).toHaveTextContent(
      'publicGoods.contribute.form.submitAmount(amount=0.25 ETH)',
    );
    fireEvent.click(submitButton());

    await waitFor(() => expect(mockTx.sendTransaction).toHaveBeenCalledTimes(1));
    expect(mockTx.sendTransaction).toHaveBeenCalledWith({
      to: VAULT,
      value: 250_000_000_000_000_000n,
    });
    expect(mockTx.writeContract).not.toHaveBeenCalled();
    expect(mockTx.lastSuccessMessage()).toBe('publicGoods.contribute.form.confirmed(amount=0.25)');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(amountField()).toHaveValue(''));
  });

  it('explains a missing amount under the field and sends nothing', async () => {
    render(<VaultContributionForm vaultAddress={VAULT} beneficiary="Protocol Guild" />);

    fireEvent.click(submitButton());
    expect(await screen.findByText('forms.transfer.amount.errors.required')).toBeInTheDocument();
    expect(amountField()).toHaveFocus();
    expect(mockTx.sendTransaction).not.toHaveBeenCalled();
  });

  it('refuses more ETH than the wallet holds', () => {
    mockBalance = { value: 1_000_000_000_000_000_000n };
    render(<VaultContributionForm vaultAddress={VAULT} beneficiary="Protocol Guild" />);

    fireEvent.change(amountField(), { target: { value: '2' } });
    fireEvent.blur(amountField());
    expect(
      screen.getByText('forms.transfer.amount.errors.exceedsBalance(amount=1.0000 ETH)'),
    ).toBeInTheDocument();
  });

  it('names the network to a visitor without a wallet and offers to connect one', () => {
    mockAddress = undefined;
    render(<VaultContributionForm vaultAddress={VAULT} beneficiary="Protocol Guild" />);

    expect(
      screen.getByText(/^publicGoods\.contribute\.form\.connectHint\(network=/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'wallet.connect.button' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <VaultContributionForm vaultAddress={VAULT} beneficiary="Protocol Guild" />,
    );
    await checkA11y(container);
  });
});
