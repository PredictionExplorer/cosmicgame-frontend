import type { ReactNode } from 'react';

import { createFakeTxFlow } from '@/test-utils/txFlow';

import { checkA11y, fireEvent, render, screen, waitFor } from '@/test-utils';

import { EthContributionForm, contributionPayload, isNoteUrl } from '../EthContributionForm';

const GAME = '0x9999999999999999999999999999999999999999';
const mockTx = createFakeTxFlow();
const mockNotify = jest.fn();
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

jest.mock('@/hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify }),
}));

jest.mock('@/hooks/useApiQuery', () => ({
  useDashboardInfo: () => ({ data: { CurRoundNum: 7 } }),
}));

jest.mock('@/contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({ cosmicGame: GAME }),
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
  screen.getByRole('button', { name: /^ethContribution\.form\.(submitAmount|contributeEth)/ });

beforeEach(() => {
  mockTx.reset();
  mockNotify.mockClear();
  mockAddress = '0x1111111111111111111111111111111111111111';
  mockBalance = undefined;
});

describe('EthContributionForm', () => {
  it('sends a contribution without a note through donateEth, naming the amount', async () => {
    const onSuccess = jest.fn();
    render(<EthContributionForm onSuccess={onSuccess} />);

    fireEvent.change(amountField(), { target: { value: '1.25' } });
    expect(
      screen.getByText('ethContribution.form.summary(amount=1.25 ETH,cycle=7)'),
    ).toBeInTheDocument();
    fireEvent.click(submitButton());

    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: GAME,
        functionName: 'donateEth',
        value: 1_250_000_000_000_000_000n,
      }),
    );
    expect(mockTx.lastSuccessMessage()).toBe('toasts.contribution.formSubmitted(amount=1.25)');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(amountField()).toHaveValue(''));
  });

  it('stores a filled note as JSON through donateEthWithInfo, leaving empty fields out', async () => {
    render(<EthContributionForm />);

    fireEvent.change(amountField(), { target: { value: '0.5' } });
    fireEvent.click(screen.getByText('ethContribution.form.noteSummary'));
    fireEvent.change(screen.getByLabelText('ethContribution.form.titleLabel'), {
      target: { value: ' Public goods ' },
    });
    fireEvent.change(screen.getByLabelText('ethContribution.form.messageLabel'), {
      target: { value: 'Keep building' },
    });
    fireEvent.click(submitButton());

    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'donateEthWithInfo',
        args: [JSON.stringify({ title: 'Public goods', message: 'Keep building' })],
        value: 500_000_000_000_000_000n,
      }),
    );
    expect(mockTx.lastSuccessMessage()).toBe(
      'toasts.contribution.formSubmittedWithInfo(amount=0.5)',
    );
  });

  it('explains a missing or zero amount under the field and sends nothing', async () => {
    render(<EthContributionForm />);

    fireEvent.click(submitButton());
    expect(await screen.findByText('forms.transfer.amount.errors.required')).toBeInTheDocument();
    expect(amountField()).toHaveAttribute('aria-invalid', 'true');
    expect(amountField()).toHaveFocus();

    fireEvent.change(amountField(), { target: { value: '0' } });
    expect(screen.getByText('forms.transfer.amount.errors.zero')).toBeInTheDocument();
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('refuses more ETH than the wallet holds', () => {
    mockBalance = { value: 1_000_000_000_000_000_000n };
    render(<EthContributionForm />);

    fireEvent.change(amountField(), { target: { value: '2' } });
    fireEvent.blur(amountField());
    expect(
      screen.getByText('forms.transfer.amount.errors.exceedsBalance(amount=1.0000 ETH)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('forms.transfer.amount.available(amount=1.0000 ETH)'),
    ).toBeInTheDocument();
  });

  it('opens the note and flags a link that is not http(s)', async () => {
    render(<EthContributionForm />);

    fireEvent.change(amountField(), { target: { value: '1' } });
    fireEvent.click(screen.getByText('ethContribution.form.noteSummary'));
    fireEvent.change(screen.getByLabelText('ethContribution.form.urlLabel'), {
      target: { value: 'example.com' },
    });
    fireEvent.click(submitButton());

    expect(await screen.findByText('ethContribution.form.urlError')).toBeInTheDocument();
    expect(screen.getByLabelText('ethContribution.form.urlLabel')).toHaveFocus();
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('lets a visitor without a wallet fill the form and offers to connect one', () => {
    mockAddress = undefined;
    render(<EthContributionForm />);

    expect(amountField()).toBeEnabled();
    expect(screen.getByText(/ethContribution\.form\.connectHint/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'wallet.connect.button' })).toBeInTheDocument();
    expect(screen.queryByText(/forms\.transfer\.amount\.available/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EthContributionForm />);
    await checkA11y(container);
  });
});

describe('contribution notes', () => {
  it('accepts only empty or http(s) links', () => {
    expect(isNoteUrl('')).toBe(true);
    expect(isNoteUrl('https://example.com/a')).toBe(true);
    expect(isNoteUrl('http://example.com')).toBe(true);
    expect(isNoteUrl('example.com')).toBe(false);
    expect(isNoteUrl('javascript:alert(1)')).toBe(false);
    expect(isNoteUrl('ipfs://cid')).toBe(false);
  });

  it('builds the JSON the record page reads, or null for an empty note', () => {
    expect(contributionPayload({ title: ' ', message: '', url: '' })).toBeNull();
    expect(contributionPayload({ title: 'Hi', message: '', url: 'https://a.b' })).toBe(
      '{"title":"Hi","url":"https://a.b"}',
    );
  });
});
