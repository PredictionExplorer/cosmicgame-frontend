import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';

import {
  TEST_APP_CONTRACT_ADDRESSES,
  TEST_MARKETING_WALLET,
} from '@/test-utils/contractAddressesFixture';
import { createFakeTxFlow } from '@/test-utils/txFlow';

import { checkA11y, renderWithQuery, screen, waitFor } from '@/test-utils';

import { MarketingCstRewardForm, parseCstAmount } from '../MarketingCstRewardForm';

const OWNER = '0x1111111111111111111111111111111111111111';
const TREASURER = '0x2222222222222222222222222222222222222222';
const RECIPIENT = '0x4444444444444444444444444444444444444444';
const TEN_CST = 10n * 10n ** 18n;

const mockReadContract = jest.fn();
const mockReportError = jest.fn();
const mockTx = createFakeTxFlow(TREASURER);

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

jest.mock('../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => TEST_APP_CONTRACT_ADDRESSES,
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: TREASURER, active: true }),
}));

jest.mock('../../../utils/errors', () => {
  const actual = jest.requireActual('../../../utils/errors');
  return {
    ...actual,
    reportError: (...args: unknown[]) => mockReportError(...args),
  };
});

function setupReads({ balance = TEN_CST, decimals = 18 as number | Error } = {}) {
  mockReadContract.mockImplementation(({ functionName }: { functionName: string }) => {
    if (functionName === 'decimals') {
      return decimals instanceof Error ? Promise.reject(decimals) : Promise.resolve(decimals);
    }
    if (functionName === 'balanceOf') return Promise.resolve(balance);
    return Promise.resolve(null);
  });
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
  const recipientField = screen.getByLabelText('Recipient address');
  const amountField = screen.getByLabelText('Amount');
  await user.clear(recipientField);
  if (recipient) await user.type(recipientField, recipient);
  await user.clear(amountField);
  if (amount) await user.type(amountField, amount);
  await user.click(screen.getByRole('button', { name: 'Send CST' }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockTx.reset();
  setupReads();
});

describe('parseCstAmount', () => {
  it('reads a dot or a comma as the decimal separator', () => {
    expect(parseCstAmount('1.5', 18)).toBe(15n * 10n ** 17n);
    expect(parseCstAmount('1,5', 18)).toBe(15n * 10n ** 17n);
    expect(parseCstAmount(' 20 ', 18)).toBe(20n * 10n ** 18n);
  });

  it('rejects text and flags more decimals than the token has', () => {
    expect(parseCstAmount('abc', 18)).toBeNull();
    expect(parseCstAmount('1.2.3', 18)).toBeNull();
    expect(parseCstAmount('0.123', 2)).toBe('precision');
  });

  // The transfer cannot be undone: an English operator typing "1,000" once sent 1 CST.
  it('refuses a thousands separator instead of reading it as a decimal mark', () => {
    expect(parseCstAmount('1,000', 18, 'en')).toBe('grouping');
    expect(parseCstAmount('12,500', 18, 'zh')).toBe('grouping');
    expect(parseCstAmount('1,000.5', 18, 'en')).toBe('grouping');
    expect(parseCstAmount('1.000.000', 18, 'en')).toBe('grouping');
    expect(parseCstAmount('1 000', 18, 'uk')).toBe('grouping');
    expect(parseCstAmount('1\u00a0000', 18, 'uk')).toBe('grouping');
    // Vietnamese groups thousands with a dot.
    expect(parseCstAmount('1.000', 18, 'vi')).toBe('grouping');
  });

  it("keeps reading the locale's own decimal mark, three decimals included", () => {
    expect(parseCstAmount('0.125', 18, 'en')).toBe(125n * 10n ** 15n);
    expect(parseCstAmount('1,000', 18, 'vi')).toBe(10n ** 18n);
    expect(parseCstAmount('0,125', 18, 'uk')).toBe(125n * 10n ** 15n);
    expect(parseCstAmount('2,5', 18, 'en')).toBe(25n * 10n ** 17n);
  });
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
    expect(screen.getByText('Enter a valid address other than the zero address.')).toBeVisible();
    expect(screen.getByText('Enter an amount greater than zero.')).toBeVisible();
    expect(screen.getByLabelText('Recipient address')).toHaveAttribute('aria-invalid', 'true');

    await fill(RECIPIENT, '11');
    expect(screen.getByText('The reserve holds less CST than this.')).toBeVisible();
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('shows what the typed amount will send before anything is sent', async () => {
    const user = userEvent.setup();
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });
    const amountField = screen.getByLabelText('Amount');
    expect(screen.queryByTestId('outreach-sends')).toBeNull();

    await user.type(amountField, '2,5');
    expect(screen.getByTestId('outreach-sends').textContent).toBe('Sends 2.5\u00a0CST');
    expect(amountField.getAttribute('aria-describedby')).toContain(
      screen.getByTestId('outreach-sends').id,
    );
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('refuses a grouped amount like 1,000 and sends nothing', async () => {
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });
    await fill(RECIPIENT, '1,000');
    expect(screen.getByText('Leave out thousands separators: type 1000, not 1,000.')).toBeVisible();
    expect(screen.queryByTestId('outreach-sends')).toBeNull();
    expect(mockTx.flow.run).not.toHaveBeenCalled();
  });

  it('sends payReward from the reserve and clears the form once it confirms', async () => {
    const invalidate = jest.spyOn(QueryClient.prototype, 'invalidateQueries');
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });

    await fill(RECIPIENT, '2,5');

    await waitFor(() => expect(mockTx.flow.run).toHaveBeenCalledTimes(1));
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: TEST_MARKETING_WALLET,
        functionName: 'payReward',
        args: [RECIPIENT, 25n * 10n ** 17n],
      }),
    );
    expect(mockTx.lastSuccessMessage()).toBe('CST sent from the Outreach Reserve.');
    await waitFor(() => expect(screen.getByLabelText('Amount')).toHaveValue(''));
    expect(screen.getByLabelText('Recipient address')).toHaveValue('');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['outreachReserveBalance'] });
    invalidate.mockRestore();
  });

  it('assumes 18 decimals when the token does not answer decimals()', async () => {
    setupReads({ decimals: new Error('no decimals') });
    renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });
    await fill(RECIPIENT, '1');
    await waitFor(() =>
      expect(mockTx.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({ args: [RECIPIENT, 10n ** 18n] }),
      ),
    );
  });

  it('says the balance could not be read and does not offer to send', async () => {
    const err = new Error('balance failed');
    mockReadContract.mockImplementation(({ functionName }: { functionName: string }) =>
      functionName === 'decimals' ? Promise.resolve(18) : Promise.reject(err),
    );
    renderForm();
    // One retry first (useReserveBalance), so allow for its delay.
    expect(
      await screen.findByText("The reserve's CST balance could not be read.", undefined, {
        timeout: 4_000,
      }),
    ).toBeInTheDocument();
    expect(mockReportError).toHaveBeenCalledWith(err, 'MarketingWallet CST balance read');
    expect(screen.getByRole('button', { name: 'Send CST' })).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderForm();
    await screen.findByText('10', { exact: false, selector: 'data' });
    await checkA11y(container);
  });
});
