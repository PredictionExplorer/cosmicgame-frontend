import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';

import {
  TEST_APP_CONTRACT_ADDRESSES,
  TEST_MARKETING_WALLET,
} from '@/test-utils/contractAddressesFixture';
import { createFakeTxFlow } from '@/test-utils/txFlow';

import type { RecipientCheck } from '@/components/tokens/transfer/useRecipientFacts';

import { checkA11y, renderWithQuery, screen, waitFor } from '@/test-utils';

import { MarketingCstRewardForm } from '../MarketingCstRewardForm';

const OWNER = '0x1111111111111111111111111111111111111111';
const TREASURER = '0x2222222222222222222222222222222222222222';
const RECIPIENT = '0x4444444444444444444444444444444444444444';
const TEN_CST = 10n * 10n ** 18n;

const mockReadContract = jest.fn();
let mockTx = createFakeTxFlow(TREASURER);
const mockNotify = jest.fn();
let mockCheck: RecipientCheck = { status: 'idle' };

// The form reads the balance through React Query: use the real one, not the empty stub.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));

jest.mock('wagmi', () => ({
  useConnection: () => ({ status: 'connected' }),
  usePublicClient: () => ({
    readContract: (...args: unknown[]) => mockReadContract(...args),
  }),
}));

jest.mock('@/hooks/useTxFlow', () => ({
  useTxFlow: () => mockTx.flow,
  useTxStageLabel: () => () => null,
}));

jest.mock('@/components/wallet/NetworkGuard', () => ({
  ChainGuard: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify }),
}));

// The recipient check reads the chain; each test says what it found.
jest.mock('@/components/tokens/transfer/useRecipientFacts', () => ({
  ...jest.requireActual('@/components/tokens/transfer/useRecipientFacts'),
  useRecipientFacts: (address: string | null) => (address ? mockCheck : { status: 'idle' }),
}));

jest.mock('../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => TEST_APP_CONTRACT_ADDRESSES,
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: TREASURER, active: true }),
}));

function setupReads({ balance = TEN_CST } = {}) {
  mockReadContract.mockImplementation(({ functionName }: { functionName: string }) =>
    Promise.resolve(functionName === 'balanceOf' ? balance : null),
  );
}

function renderForm() {
  return renderWithQuery(
    <MarketingCstRewardForm
      marketingWalletAddress={TEST_MARKETING_WALLET}
      ownerAddress={OWNER}
      treasurerAddress={TREASURER}
      historyHref={`/cosmic-token-transfer/${TEST_MARKETING_WALLET}`}
    />,
  );
}

async function fill(recipient: string, amount: string) {
  const user = userEvent.setup();
  const recipientField = screen.getByLabelText('forms.transfer.recipient.label');
  const amountField = screen.getByLabelText(/forms\.transfer\.amount\.label/);
  await user.clear(recipientField);
  if (recipient) await user.type(recipientField, recipient);
  await user.clear(amountField);
  if (amount) await user.type(amountField, amount);
  await user.click(screen.getByRole('button', { name: /^Send / }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockTx = createFakeTxFlow(TREASURER);
  setupReads();
  mockCheck = {
    status: 'ready',
    facts: { transactionCount: 4, isContract: false },
    known: null,
    warning: null,
  };
});

describe('MarketingCstRewardForm', () => {
  it('shows the reserve, its balance, its roles and its transfer history', async () => {
    renderForm();
    expect(screen.getByRole('heading', { level: 2, name: 'Outreach Reserve' })).toBeInTheDocument();
    const balance = await screen.findByText('10', { exact: false, selector: 'data' });
    expect(balance.closest('[data-fact="balance"]')).toHaveTextContent('CST');
    expect(screen.getByTitle(TREASURER)).toBeInTheDocument();
    expect(screen.getByTitle(OWNER)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Outreach Reserve transfers/ })).toHaveAttribute(
      'href',
      `/cosmic-token-transfer/${TEST_MARKETING_WALLET}`,
    );
  });

  it('names each mistake under its field and sends nothing', async () => {
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });

    await fill('not an address', '0');
    expect(screen.getByText('forms.transfer.recipient.errors.invalid')).toBeVisible();
    expect(screen.getByText('forms.transfer.amount.errors.zero')).toBeVisible();
    expect(screen.getByLabelText('forms.transfer.recipient.label')).toHaveAttribute(
      'aria-invalid',
      'true',
    );

    // The reserve cannot pay itself.
    await fill(TEST_MARKETING_WALLET, '1');
    expect(screen.getByText('forms.transfer.recipient.errors.self')).toBeVisible();

    await fill(RECIPIENT, '11');
    expect(
      screen.getByText(/^forms\.transfer\.amount\.errors\.exceedsBalance\(amount=10/),
    ).toBeVisible();
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('names the typed amount on the send button before anything is sent', async () => {
    const user = userEvent.setup();
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });
    await user.type(screen.getByLabelText('forms.transfer.recipient.label'), RECIPIENT);
    await user.type(screen.getByLabelText(/forms\.transfer\.amount\.label/), '2.5');
    expect(screen.getByRole('button', { name: 'Send 2.5\u00a0CST' })).toBeInTheDocument();
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  // The transfer cannot be undone: an English operator typing "1,000" once sent 1 CST.
  it('refuses a grouped amount like 1,000 and sends nothing', async () => {
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });
    await fill(RECIPIENT, '1,000');
    expect(
      screen.getByText('forms.transfer.amount.errors.grouping(plain=1000,grouped=1,000)'),
    ).toBeVisible();
    expect(screen.queryByTestId('transfer-review')).toBeNull();
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('sends payReward from the reserve and clears the form once it confirms', async () => {
    const invalidate = jest.spyOn(QueryClient.prototype, 'invalidateQueries');
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });

    await fill(RECIPIENT, '2.5');

    await waitFor(() => expect(mockTx.flow.run).toHaveBeenCalledTimes(1));
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: TEST_MARKETING_WALLET,
        functionName: 'payReward',
        args: [RECIPIENT, 25n * 10n ** 17n],
      }),
    );
    expect(mockTx.lastSuccessMessage()).toBe('CST sent from the Outreach Reserve.');
    await waitFor(() =>
      expect(screen.getByLabelText(/forms\.transfer\.amount\.label/)).toHaveValue(''),
    );
    expect(screen.getByLabelText('forms.transfer.recipient.label')).toHaveValue('');
    // The reserve panel and the form's cap share one balance read.
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['cstBalance'] });
    invalidate.mockRestore();
  });

  it('reviews the send and asks for an acknowledgement for an address with no history', async () => {
    mockCheck = {
      status: 'ready',
      facts: { transactionCount: 0, isContract: false },
      known: null,
      warning: 'fresh',
    };
    const user = userEvent.setup();
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });

    await fill(RECIPIENT, '2');
    expect(screen.getByTestId('transfer-review')).toHaveTextContent('2');
    expect(await screen.findByText('forms.transfer.review.acknowledgeRequired')).toBeVisible();
    expect(mockTx.flow.run).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText('forms.transfer.review.acknowledge'));
    await user.click(screen.getByRole('button', { name: /^Send / }));
    await waitFor(() => expect(mockTx.flow.run).toHaveBeenCalledTimes(1));
  });

  it('holds the send until the recipient check answers (regression)', async () => {
    mockCheck = { status: 'checking' };
    const user = userEvent.setup();
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });

    await user.type(screen.getByLabelText('forms.transfer.recipient.label'), RECIPIENT);
    await user.type(screen.getByLabelText(/forms\.transfer\.amount\.label/), '1');
    const checking = screen.getByRole('button', { name: /forms\.transfer\.review\.checking/ });
    expect(checking).toHaveAttribute('aria-busy', 'true');
    await user.click(checking);
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('stops before the wallet opens when the signer is not the treasurer', async () => {
    mockTx = createFakeTxFlow(OWNER);
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });

    await fill(RECIPIENT, '1');
    await waitFor(() =>
      expect(mockNotify).toHaveBeenCalledWith(
        'error',
        'toasts.transfer.marketingCst.treasurerRequired',
      ),
    );
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('says the balance could not be read, and reviews a send with that caveat', async () => {
    const err = new Error('balance failed');
    mockReadContract.mockImplementation(() => Promise.reject(err));
    renderForm();
    expect(
      await screen.findByText("The reserve's CST balance could not be read."),
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('forms.transfer.recipient.label'), RECIPIENT);
    await user.type(screen.getByLabelText(/forms\.transfer\.amount\.label/), '1');
    expect(screen.getByTestId('transfer-review')).toHaveTextContent(
      'forms.transfer.review.balanceUnchecked',
    );
    await user.click(screen.getByRole('button', { name: /^Send / }));
    await waitFor(() => expect(mockTx.flow.run).toHaveBeenCalledTimes(1));
  });

  it('offers no send while the treasurer is unknown', async () => {
    renderWithQuery(
      <MarketingCstRewardForm
        marketingWalletAddress={TEST_MARKETING_WALLET}
        ownerAddress={OWNER}
        treasurerAddress={null}
      />,
    );
    await screen.findByText('10', { exact: false, selector: 'data' });
    expect(screen.getByRole('button', { name: 'Send CST' })).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });
    await checkA11y(container);
  });
});
