import { TEST_APP_CONTRACT_ADDRESSES } from '@/test-utils/contractAddressesFixture';

import { checkA11y, renderWithQuery as render, screen, within } from '@/test-utils';

import { OperatorHeader } from '../OperatorHeader';
import { OperatorWalletStatus } from '../OperatorWalletStatus';

const PROTOCOL_OWNER = '0x1111111111111111111111111111111111111111';
const OUTREACH_OWNER = '0x2222222222222222222222222222222222222222';
const TREASURER = '0x3333333333333333333333333333333333333333';
const STRANGER = '0x4444444444444444444444444444444444444444';

const mockReadContract = jest.fn();
let mockWallet: { account: string | null; active: boolean } = { account: null, active: false };

// Roles are read through React Query: use the real one, not the empty stub.
jest.mock('@tanstack/react-query', () => jest.requireActual('@tanstack/react-query'));

jest.mock('wagmi', () => ({
  useConnection: () => ({ status: 'disconnected' }),
  usePublicClient: () => ({
    readContract: (...args: unknown[]) => mockReadContract(...args),
  }),
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockWallet,
}));

jest.mock('../../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => TEST_APP_CONTRACT_ADDRESSES,
}));

jest.mock('../../../utils/errors', () => ({ reportError: jest.fn() }));

function setupRoles({ fail = false } = {}) {
  mockReadContract.mockImplementation(
    ({ address, functionName }: { address: string; functionName: string }) => {
      if (fail) return Promise.reject(new Error('rpc down'));
      if (address === TEST_APP_CONTRACT_ADDRESSES.cosmicGame)
        return Promise.resolve(PROTOCOL_OWNER);
      if (functionName === 'owner') return Promise.resolve(OUTREACH_OWNER);
      if (functionName === 'treasurerAddress') return Promise.resolve(TREASURER);
      return Promise.reject(new Error(`unexpected ${functionName}`));
    },
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockWallet = { account: null, active: false };
  setupRoles();
});

describe('OperatorHeader', () => {
  it('links the three operator tools and marks the current one', () => {
    render(<OperatorHeader tool="settings" title="Contract settings" subtitle="Read-only." />);
    const nav = screen.getByRole('navigation', { name: 'Operator tools' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Moderation', '/admin'],
      ['Contract settings', '/admin/admin'],
      ['Outreach transfer', '/internal/cst-outreach-transfer'],
    ]);
    expect(within(nav).getByRole('link', { name: 'Contract settings' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Contract settings' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <OperatorHeader tool="moderation" title="Message moderation" subtitle="Hide or restore." />,
    );
    await checkA11y(container);
  });
});

describe('OperatorWalletStatus', () => {
  it('says when no wallet is connected, without reading roles for nobody', () => {
    render(<OperatorWalletStatus />);
    expect(screen.getByText('No wallet connected')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('lists every on-chain role the connected wallet holds', async () => {
    mockWallet = { account: TREASURER, active: true };
    mockReadContract.mockImplementation(
      ({ address, functionName }: { address: string; functionName: string }) =>
        Promise.resolve(
          address === TEST_APP_CONTRACT_ADDRESSES.cosmicGame
            ? TREASURER.toUpperCase().replace('0X', '0x')
            : functionName === 'owner'
              ? OUTREACH_OWNER
              : TREASURER,
        ),
    );
    render(<OperatorWalletStatus />);
    const roles = await screen.findByRole('list', { name: 'On-chain roles of this wallet' });
    expect(
      within(roles)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Protocol owner', 'Outreach Reserve treasurer']);
    expect(screen.getByText('Connected wallet')).toBeInTheDocument();
    expect(screen.getByTitle(TREASURER)).toBeInTheDocument();
  });

  it('says plainly when the wallet holds no role', async () => {
    mockWallet = { account: STRANGER, active: true };
    render(<OperatorWalletStatus />);
    expect(await screen.findByText('No on-chain role')).toBeInTheDocument();
  });

  it('says the roles could not be read rather than claiming none', async () => {
    mockWallet = { account: STRANGER, active: true };
    setupRoles({ fail: true });
    render(<OperatorWalletStatus />);
    // One retry per read first, so allow for its delay.
    expect(
      await screen.findByText('Its on-chain roles could not be read.', undefined, {
        timeout: 5_000,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('No on-chain role')).not.toBeInTheDocument();
  });
});
