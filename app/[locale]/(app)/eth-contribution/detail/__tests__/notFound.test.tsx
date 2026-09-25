import { isValidElement, type ReactElement } from 'react';

import api from '@/services/api';

import { render, screen } from '@/test-utils';

import { ContributionNotFound } from '../[id]/ContributionNotFound';
import { MissingContribution } from '../[id]/MissingContribution';
import Page from '../[id]/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/eth-contribution/detail/9',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));
jest.mock('../../../publicDataReads', () => ({ readDashboard: jest.fn() }));

const mockCapCacheWindow = jest.fn();
jest.mock('@/lib/cacheWindow', () => ({
  capCacheWindow: (window: string) => mockCapCacheWindow(window),
}));
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
  // A segment's notFound() reaches the browser as the bare error shell, blank without
  // script, so the page renders the record's not-found state itself, on the server.
  it('is the record’s not-found state, rendered by the page on the server', async () => {
    mockRead.mockResolvedValue(null);
    const tree = await Page({ params: Promise.resolve({ locale: 'uk', id: '9' }) });
    expect(isValidElement(tree)).toBe(true);
    expect((tree as ReactElement).type).toBe(ContributionNotFound);
    expect((tree as ReactElement<{ locale: string; id: number }>).props).toEqual({
      locale: 'uk',
      id: 9,
    });
  });

  it('keeps that render a minute: the record may be indexed a moment from now', async () => {
    mockRead.mockResolvedValue(null);
    await Page({ params: Promise.resolve({ locale: 'en', id: '9' }) });
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });

  it('is left to the client when the server read failed, never guessed missing', async () => {
    mockRead.mockRejectedValue(new Error('down'));
    const tree = await Page({ params: Promise.resolve({ locale: 'en', id: '9' }) });
    expect((tree as ReactElement).type).not.toBe(ContributionNotFound);
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });

  it('heads the state with the record’s own trail and title', async () => {
    render(await ContributionNotFound({ locale: 'en', id: 9 }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'ethContribution.detail.notFoundHeading',
    );
    expect(
      screen.getByRole('link', {
        name: 'ethContribution.detail.breadcrumbContributions',
      }),
    ).toHaveAttribute('href', '/eth-contribution');
  });

  it('names the number asked for and leads back to the full list', () => {
    render(<MissingContribution id={9} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'ethContribution.detail.notFoundTitle(id=9)',
    );
    expect(screen.getByRole('link', { name: 'ethContribution.detail.backToAll' })).toHaveAttribute(
      'href',
      '/eth-contribution',
    );
  });
});
