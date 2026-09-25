import { isValidElement, type ReactElement } from 'react';

import Page from '../page';
import { SignatureNotFound } from '../SignatureNotFound';
import { loadTokenInfo } from '../tokenInfo';

jest.mock('../DetailPage', () => ({ __esModule: true, default: () => null }));
jest.mock('../tokenInfo', () => ({ loadTokenInfo: jest.fn() }));
jest.mock('@/lib/nftMetadata', () => ({
  ...jest.requireActual('@/lib/nftMetadata'),
  fetchNftMetadata: jest.fn(async () => null),
}));

const mockCapCacheWindow = jest.fn();
jest.mock('@/lib/cacheWindow', () => ({
  capCacheWindow: (window: string) => mockCapCacheWindow(window),
}));

const mockLoadTokenInfo = loadTokenInfo as jest.MockedFunction<typeof loadTokenInfo>;
const props = (id: string, locale = 'en') => ({ params: Promise.resolve({ locale, id }) });

describe('token page', () => {
  beforeEach(() => jest.clearAllMocks());

  // A segment's notFound() reaches the browser as the bare error shell, blank without
  // script: a number not imprinted yet is the Signature's not-found state, on the server.
  it('renders a number not imprinted yet as the Signature’s not-found state', async () => {
    mockLoadTokenInfo.mockResolvedValue(null);
    const tree = await Page(props('999999', 'ja'));
    expect(isValidElement(tree)).toBe(true);
    expect((tree as ReactElement).type).toBe(SignatureNotFound);
    expect((tree as ReactElement<{ locale: string; tokenId: number }>).props).toEqual({
      locale: 'ja',
      tokenId: 999999,
    });
  });

  it('keeps that render a minute: the number may be imprinted at the next finalization', async () => {
    mockLoadTokenInfo.mockResolvedValue(null);
    await Page(props('999999'));
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });

  it('keeps a render whose record read failed a minute', async () => {
    mockLoadTokenInfo.mockResolvedValue(undefined);
    await Page(props('25'));
    expect(mockCapCacheWindow).toHaveBeenCalledWith('pending');
  });

  it('keeps a Signature it read for the route’s own window', async () => {
    mockLoadTokenInfo.mockResolvedValue({ TokenId: 25, Seed: 'ab' } as Awaited<
      ReturnType<typeof loadTokenInfo>
    >);
    const tree = await Page(props('25'));
    expect((tree as ReactElement).type).not.toBe(SignatureNotFound);
    expect(mockCapCacheWindow).not.toHaveBeenCalled();
  });
});
