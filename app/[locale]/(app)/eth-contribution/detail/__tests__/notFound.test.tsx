import api from '@/services/api';

import { render, screen } from '@/test-utils';

import { MissingContribution } from '../[id]/MissingContribution';
import Page from '../[id]/page';

const mockUseParams = jest.fn(() => ({ id: '9' }));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/eth-contribution/detail/9',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => mockUseParams(),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));
jest.mock('../../../publicDataReads', () => ({ readDashboard: jest.fn() }));
jest.mock('@/services/api', () => {
  const actual = jest.requireActual('@/services/api');
  return {
    __esModule: true,
    ...actual,
    default: { ...actual.default, get_donations_with_info_by_id: jest.fn() },
  };
});

const mockRead = api.get_donations_with_info_by_id as jest.Mock;
const previous = process.env.PLAYWRIGHT;

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.PLAYWRIGHT;
});

afterAll(() => {
  if (previous === undefined) delete process.env.PLAYWRIGHT;
  else process.env.PLAYWRIGHT = previous;
});

describe('a missing contribution record', () => {
  // Regression: a missing record answered HTTP 200 with a "not found" heading.
  it('is a 404, rendered by the segment’s not-found state', async () => {
    mockRead.mockResolvedValue(null);
    await expect(Page({ params: Promise.resolve({ locale: 'en', id: '9' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );
  });

  it('is left to the client when the server read failed, never guessed missing', async () => {
    mockRead.mockRejectedValue(new Error('down'));
    await expect(
      Page({ params: Promise.resolve({ locale: 'en', id: '9' }) }),
    ).resolves.toBeTruthy();
  });

  it('names the number asked for and leads back to the full list', () => {
    render(<MissingContribution />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'ethContribution.detail.notFoundTitle(id=9)',
    );
    expect(screen.getByRole('link', { name: 'ethContribution.detail.backToAll' })).toHaveAttribute(
      'href',
      '/eth-contribution',
    );
  });
});
