import axios from 'axios';

import { documentTitleOf } from '@/test-utils/metadata';

import { generateMetadata, generateStaticParams } from '../[address]/page';
import { profileAddress } from '../[address]/profileAddress';

// The shared viem mock returns addresses as given; checksumming is the point here.
jest.mock('viem', () => {
  const utils = jest.requireActual<typeof import('viem/utils')>('viem/utils');
  return {
    ...jest.requireActual<Record<string, unknown>>('../../../../../__mocks__/viem'),
    getAddress: utils.getAddress,
    isAddress: utils.isAddress,
  };
});
jest.mock('../[address]/UserPage', () => ({ __esModule: true, default: () => null }));

const ADDRESS = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';
const SHORT = '0xA169…⁠63B6';
const props = (address: string, locale = 'en') => ({
  params: Promise.resolve({ locale, address }),
});

describe('participant page metadata', () => {
  const fetchSpy = jest.fn();
  const originalFetch = global.fetch;
  let axiosGet: jest.SpyInstance;

  beforeEach(() => {
    global.fetch = fetchSpy as unknown as typeof fetch;
    axiosGet = jest.spyOn(axios, 'get');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    axiosGet.mockRestore();
    fetchSpy.mockReset();
  });

  // V409: the API's user/info payload carries `Bids`, not `Gestures`, so the old
  // read titled every valid participant "Invalid address".
  it('titles a valid address by its short form, without reading the API', async () => {
    const metadata = await generateMetadata(props(ADDRESS.toLowerCase()));
    expect(documentTitleOf(metadata)).toBe(`Participant ${SHORT} · Cosmic Signature`);
    expect(metadata.description).toBe(
      `Gestures, allocations and anchors of participant ${ADDRESS}.`,
    );
    expect(axiosGet).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps an address without gestures a participant in every locale', async () => {
    const ja = await generateMetadata(props(ADDRESS, 'ja'));
    expect(documentTitleOf(ja)).toBe(`参加者${SHORT}の情報 · Cosmic Signature`);
    const zh = await generateMetadata(props(ADDRESS, 'zh'));
    expect(documentTitleOf(zh)).not.toMatch(/无效/);
  });

  it('calls only a malformed address invalid, in the catalog’s words', async () => {
    const metadata = await generateMetadata(props('not-an-address'));
    expect(documentTitleOf(metadata)).toBe('Invalid address · Cosmic Signature');
    expect(metadata.description).toBe('The address in this link is not a valid Ethereum address.');
    const uk = await generateMetadata(props('0x123', 'uk'));
    expect(documentTitleOf(uk)).toBe('Недійсна адреса · Cosmic Signature');
  });

  it('renders every profile on demand and caches it', () => {
    expect(generateStaticParams()).toEqual([]);
  });
});

describe('profileAddress', () => {
  it('checksums any casing of a valid address', () => {
    expect(profileAddress(ADDRESS.toLowerCase())).toBe(ADDRESS);
    expect(profileAddress(`0x${ADDRESS.slice(2).toUpperCase()}`)).toBe(ADDRESS);
  });

  it('returns null for anything else', () => {
    expect(profileAddress('Invalid Address')).toBeNull();
    expect(profileAddress('0x1234')).toBeNull();
    expect(profileAddress('')).toBeNull();
  });
});
