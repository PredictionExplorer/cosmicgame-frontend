import { render } from '@/test-utils';

import ContractsPage from '../page';
import { readDashboard } from '../../publicDataReads';

const mockContracts = jest.fn((_props: Record<string, unknown>) => <div data-testid="page-body" />);
jest.mock('../Contracts', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => mockContracts(props),
}));
jest.mock('../ContractsSeoSummary', () => ({
  ContractsSeoSummary: () => <div data-testid="seo-summary" />,
}));
// The dashboard seed is an async server component (it awaits the API read).
jest.mock('../../QuerySeed', () => ({
  DashboardQuerySeed: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('../../publicDataReads', () => ({
  readDashboard: jest.fn(),
}));

const mockReadDashboard = readDashboard as jest.MockedFunction<typeof readDashboard>;

const ContractAddrs = {
  CosmicGameAddr: '0x1111111111111111111111111111111111111111',
  CosmicTokenAddr: '0x2222222222222222222222222222222222222222',
};

async function renderPage() {
  render(await ContractsPage({ params: Promise.resolve({ locale: 'en' }) }));
  return mockContracts.mock.calls.at(-1)?.[0];
}

describe('/contracts route', () => {
  beforeEach(() => mockContracts.mockClear());

  it('hands the body this request’s contract addresses, so the server HTML lists them', async () => {
    mockReadDashboard.mockResolvedValue({
      data: { ContractAddrs } as unknown as Awaited<ReturnType<typeof readDashboard>>['data'],
      at: 0,
    });
    expect(await renderPage()).toMatchObject({ initialContractAddrs: ContractAddrs });
  });

  it('passes no addresses when the server read failed (the body shows the verified fallbacks)', async () => {
    mockReadDashboard.mockResolvedValue({ data: null, at: 0 });
    expect(await renderPage()).toMatchObject({ initialContractAddrs: null });
  });
});
