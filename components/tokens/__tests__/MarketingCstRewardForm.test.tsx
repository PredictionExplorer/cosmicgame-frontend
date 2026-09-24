import type { ReactNode } from 'react';
import type { Address } from 'viem';

import {
  TEST_APP_CONTRACT_ADDRESSES,
  TEST_MARKETING_WALLET,
} from '@/test-utils/contractAddressesFixture';
import { createFakeTxFlow, type FakeTxFlow } from '@/test-utils/txFlow';

import { checkA11y, fireEvent, render, screen, waitFor } from '@/test-utils';

import { MarketingCstRewardForm } from '../MarketingCstRewardForm';

const OWNER = '0x1111111111111111111111111111111111111111';
const TREASURER = '0x2222222222222222222222222222222222222222' as Address;
const OTHER_ACCOUNT = '0x3333333333333333333333333333333333333333' as Address;
const RECIPIENT = '0x4444444444444444444444444444444444444445';
const WEI = 1_000_000_000_000_000_000n;

let mockTx: FakeTxFlow = createFakeTxFlow(TREASURER);
const mockNotify = jest.fn();
const mockInvalidateQueries = jest.fn();

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
  useCstBalance: () => ({ data: 500n * WEI, isError: false }),
}));

jest.mock('@/components/tokens/transfer/useRecipientFacts', () => ({
  ...jest.requireActual('@/components/tokens/transfer/useRecipientFacts'),
  useRecipientFacts: (address: string | null) =>
    address
      ? {
          status: 'ready',
          facts: { transactionCount: 3, isContract: false },
          known: null,
          warning: null,
        }
      : { status: 'idle' },
}));

jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('@/components/ui/tx-status', () => ({
  TxStatus: () => null,
}));

function renderForm(treasurer: string | null = TREASURER) {
  return render(
    <MarketingCstRewardForm
      marketingWalletAddress={TEST_MARKETING_WALLET}
      ownerAddress={OWNER}
      treasurerAddress={treasurer}
      historyHref={`/cosmic-token-transfer/${TEST_MARKETING_WALLET}`}
    />,
  );
}

function sendReward() {
  fireEvent.change(screen.getByLabelText('forms.transfer.recipient.label'), {
    target: { value: RECIPIENT },
  });
  fireEvent.change(screen.getByLabelText(/forms\.transfer\.amount\.label/), {
    target: { value: '40' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^toasts\.transfer\.marketingCst\.pay/ }));
}

beforeEach(() => {
  mockTx = createFakeTxFlow(TREASURER);
  mockNotify.mockClear();
  mockInvalidateQueries.mockClear();
});

describe('MarketingCstRewardForm', () => {
  it('lists the reserve and its roles above the form', () => {
    renderForm();

    // The marketing catalog renders its English copy under test.
    expect(screen.getByText('Outreach Reserve')).toBeInTheDocument();
    expect(screen.getByText('Treasurer')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View outreach reserve transfers' })).toHaveAttribute(
      'href',
      `/cosmic-token-transfer/${TEST_MARKETING_WALLET}`,
    );
  });

  it('pays the allocation from the reserve with payReward', async () => {
    renderForm();
    sendReward();

    await waitFor(() => expect(mockTx.writeContract).toHaveBeenCalledTimes(1));
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: TEST_MARKETING_WALLET,
        functionName: 'payReward',
        args: [RECIPIENT, 40n * WEI],
      }),
    );
    expect(mockTx.lastSuccessMessage()).toBe('toasts.transfer.marketingCst.confirmed');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['marketingRewards'] });
  });

  it('stops before the wallet opens when the signer is not the treasurer', async () => {
    mockTx = createFakeTxFlow(OTHER_ACCOUNT);
    renderForm();
    sendReward();

    await waitFor(() =>
      expect(mockNotify).toHaveBeenCalledWith(
        'error',
        'toasts.transfer.marketingCst.treasurerRequired',
      ),
    );
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('shows an unknown role as unavailable rather than blank', () => {
    renderForm(null);
    expect(screen.getAllByText('common.status.unavailable').length).toBeGreaterThan(0);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderForm();
    await checkA11y(container);
  });
});
