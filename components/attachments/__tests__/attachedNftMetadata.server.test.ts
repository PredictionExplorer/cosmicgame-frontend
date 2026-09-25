/**
 * @jest-environment node
 */
import { ContractFunctionExecutionError, ContractFunctionRevertedError, erc721Abi } from 'viem';

import { IPFS_GATEWAYS } from '../attachedNftMetadata';
import {
  MAX_IMAGE_BYTES,
  assertPublicHost,
  capStream,
  displayContractName,
  fetchAttachedNftImage,
  fetchPublicHttps,
  findAttachedNftRecord,
  imageUrlCandidates,
  isPublicAddress,
  isPublicHttpsUrl,
  readAttachedNftContractName,
  resolveAttachedNftDisplay,
  withSameOriginImage,
} from '../attachedNftMetadata.server';

const mockLookup = jest.fn();
jest.mock('node:dns/promises', () => ({
  lookup: (...args: unknown[]) => mockLookup(...args),
}));

const mockReadContract = jest.fn();
jest.mock('viem', () => ({
  ...jest.requireActual('viem'),
  createPublicClient: () => ({ readContract: (...args: unknown[]) => mockReadContract(...args) }),
}));

beforeEach(() => {
  // Every name resolves to a public address unless a test says otherwise.
  mockLookup.mockReset().mockResolvedValue([{ address: '93.184.215.14', family: 4 }]);
  mockReadContract.mockReset().mockRejectedValue(new Error('no chain in tests'));
});

const mockRecords = jest.fn();
// lexicon-allow-start: test mocks mirror sealed API module filenames.
jest.mock('../../../services/api/donations', () => ({
  get_donations_nft_list: () => mockRecords(),
}));
// lexicon-allow-end
jest.mock('next/cache', () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

const CONTRACT = '0x17f4BAa9D35Ee54fFbCb2608e20786473c7aa49f';
const GATEWAY = IPFS_GATEWAYS[0];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function imageResponse(type: string, status = 200) {
  return new Response(new Uint8Array([1, 2, 3]), { status, headers: { 'Content-Type': type } });
}

describe('isPublicHttpsUrl', () => {
  it.each([
    'https://gateway.pinata.cloud/ipfs/bafy/1',
    'https://randomwalknft-api.com/metadata/4079',
  ])('accepts %s', (url) => {
    expect(isPublicHttpsUrl(url)).toBe(true);
  });

  it.each([
    'http://randomwalknft-api.com/metadata/4079',
    'https://localhost/x',
    'https://localhost./x',
    'https://metadata.google.internal./x',
    'https://127.0.0.1/x',
    'https://2130706433/x',
    'https://[::1]/x',
    'https://intranet/x',
    'https://metadata.internal/x',
    'https://printer.local/x',
    'https://user:pass@example.com/x',
    'https://example.com:8443/x',
    'javascript:alert(1)',
    'not a url',
  ])('refuses %s', (url) => {
    expect(isPublicHttpsUrl(url)).toBe(false);
  });
});

describe('isPublicAddress', () => {
  it.each(['93.184.215.14', '1.1.1.1', '2606:4700:4700::1111'])('accepts %s', (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });

  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    '::',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '::ffff:a9fe:a9fe',
    '64:ff9b::a00:1',
    'not an address',
  ])('refuses %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
});

describe('assertPublicHost', () => {
  it('passes a name whose every address is public', async () => {
    await expect(assertPublicHost('art.example.com')).resolves.toBeUndefined();
    expect(mockLookup).toHaveBeenCalledWith('art.example.com', { all: true, verbatim: true });
  });

  it('refuses a public-looking name that resolves to a private address', async () => {
    mockLookup.mockResolvedValue([
      { address: '93.184.215.14', family: 4 },
      { address: '127.0.0.1', family: 4 },
    ]);
    await expect(assertPublicHost('127.0.0.1.nip.io')).rejects.toThrow('non-public');
  });

  it('refuses a name that resolves to nothing', async () => {
    mockLookup.mockResolvedValue([]);
    await expect(assertPublicHost('empty.example.com')).rejects.toThrow();
  });
});

function redirectResponse(location: string, status = 302) {
  return new Response(null, { status, headers: { Location: location } });
}

describe('fetchPublicHttps', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('follows a redirect to another public https host, checking each hop', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(redirectResponse('https://bafy.ipfs.dweb.link/1.json'))
      .mockResolvedValueOnce(jsonResponse({ name: 'GBC' }));

    const response = await fetchPublicHttps('https://dweb.link/ipfs/bafy/1.json');
    await expect(response.json()).resolves.toEqual({ name: 'GBC' });
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://dweb.link/ipfs/bafy/1.json',
      expect.objectContaining({ redirect: 'manual' }),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://bafy.ipfs.dweb.link/1.json',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });

  it('never follows a public host to a private one', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(redirectResponse('http://169.254.169.254/latest/meta-data'));
    await expect(fetchPublicHttps('https://art.example.com/1.json')).rejects.toThrow(
      'Refused a non-public URL',
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('gives up after a few redirects', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(redirectResponse('https://art.example.com/loop')));
    await expect(fetchPublicHttps('https://art.example.com/loop')).rejects.toThrow(
      'Too many redirects',
    );
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });

  it('refuses a private url before any request', async () => {
    global.fetch = jest.fn();
    await expect(fetchPublicHttps('https://127.0.0.1/x')).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('never requests a host whose name resolves to a private address', async () => {
    global.fetch = jest.fn();
    mockLookup.mockResolvedValue([{ address: '10.0.0.8', family: 4 }]);
    await expect(fetchPublicHttps('https://internal.attacker.example/1.json')).rejects.toThrow(
      'non-public',
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('checks the address of every redirect hop', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(redirectResponse('https://rebind.attacker.example/x'));
    mockLookup
      .mockResolvedValueOnce([{ address: '93.184.215.14', family: 4 }])
      .mockResolvedValueOnce([{ address: '169.254.169.254', family: 4 }]);
    await expect(fetchPublicHttps('https://art.example.com/1.json')).rejects.toThrow('non-public');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('capStream', () => {
  function streamOf(chunks: number[]) {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        for (const size of chunks) controller.enqueue(new Uint8Array(size));
        controller.close();
      },
    });
  }

  it('passes a body within the cap through whole', async () => {
    const onEnd = jest.fn();
    const bytes = await new Response(capStream(streamOf([4, 4]), 8, onEnd)).arrayBuffer();
    expect(bytes.byteLength).toBe(8);
    expect(onEnd).toHaveBeenCalledWith(true);
  });

  it('cuts a body off once it passes the cap, declared length or not', async () => {
    const onEnd = jest.fn();
    await expect(
      new Response(capStream(streamOf([4, 4, 4]), 8, onEnd)).arrayBuffer(),
    ).rejects.toThrow();
    expect(onEnd).toHaveBeenCalledWith(false);
  });
});

describe('displayContractName', () => {
  it('keeps one clean line of at most 64 characters', () => {
    expect(displayContractName('  Blueberry   Club\n')).toBe('Blueberry Club');
    expect(displayContractName('Evil\u202eeman')).toBe('Evileman');
    expect(displayContractName('x'.repeat(80))).toBe(`${'x'.repeat(63)}…`);
    expect(displayContractName('\u0000\u200b')).toBeUndefined();
    expect(displayContractName(42)).toBeUndefined();
  });
});

describe('readAttachedNftContractName', () => {
  it('reads the ERC-721 name of the contract', async () => {
    mockReadContract.mockResolvedValue('Blueberry Club');
    await expect(readAttachedNftContractName(CONTRACT)).resolves.toBe('Blueberry Club');
    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({ abi: erc721Abi, functionName: 'name' }),
    );
  });

  it('is undefined for a contract without a name or an unreadable chain', async () => {
    mockReadContract.mockRejectedValue(
      new ContractFunctionExecutionError(
        new ContractFunctionRevertedError({ abi: erc721Abi, functionName: 'name' }),
        {
          abi: erc721Abi,
          functionName: 'name',
        },
      ),
    );
    await expect(readAttachedNftContractName(CONTRACT)).resolves.toBeUndefined();
    mockReadContract.mockRejectedValue(new Error('network'));
    await expect(readAttachedNftContractName(CONTRACT)).resolves.toBeUndefined();
  });
});

describe('imageUrlCandidates', () => {
  it('tries the same file on every gateway, the given one first', () => {
    expect(imageUrlCandidates(`${IPFS_GATEWAYS[1]}bafy/4035.png`)).toEqual([
      `${IPFS_GATEWAYS[1]}bafy/4035.png`,
      ...IPFS_GATEWAYS.filter((gateway) => gateway !== IPFS_GATEWAYS[1]).map(
        (gateway) => `${gateway}bafy/4035.png`,
      ),
    ]);
  });

  it('keeps a public https file as is and refuses anything else', () => {
    expect(imageUrlCandidates('https://nfts.example.com/4079.png')).toEqual([
      'https://nfts.example.com/4079.png',
    ]);
    expect(imageUrlCandidates('http://10.0.0.1/4079.png')).toEqual([]);
  });
});

describe('withSameOriginImage', () => {
  it('moves a public image to the image route and keeps the upstream file as the fallback', () => {
    expect(
      withSameOriginImage({ name: 'GBC', image: `${GATEWAY}bafy/1.png` }, CONTRACT, '1'),
    ).toEqual({
      name: 'GBC',
      image: `/api/attached-nft/${CONTRACT.toLowerCase()}/1/image`,
      imageFallback: `${GATEWAY}bafy/1.png`,
    });
  });

  it('leaves an image the server may not fetch to the browser', () => {
    const metadata = { name: 'Local', image: 'http://example.com/1.png' };
    expect(withSameOriginImage(metadata, CONTRACT, '1')).toBe(metadata);
  });
});

describe('findAttachedNftRecord', () => {
  beforeEach(() => {
    mockRecords.mockResolvedValue([
      { TokenAddr: CONTRACT, NFTTokenId: 4035, NFTTokenURI: 'ipfs://bafy/4035' },
      { TokenAddr: CONTRACT, NFTTokenId: '8489', NFTTokenURI: 'ipfs://bafy/8489' },
    ]);
  });

  it('matches the contract case-insensitively and the id as a number', async () => {
    await expect(findAttachedNftRecord(CONTRACT.toLowerCase(), '8489')).resolves.toMatchObject({
      NFTTokenURI: 'ipfs://bafy/8489',
    });
  });

  it('resolves null for a token the indexer does not list', async () => {
    await expect(findAttachedNftRecord(CONTRACT, '1')).resolves.toBeNull();
  });
});

describe('resolveAttachedNftDisplay', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('reads the document through the data cache and serves its image from our origin', async () => {
    mockReadContract.mockResolvedValue('Blueberry Club');
    global.fetch = jest.fn().mockImplementation((url: string) =>
      url.startsWith(GATEWAY)
        ? Promise.resolve(
            jsonResponse({
              name: 'GBC #4035',
              image: 'ipfs://bafy/4035.png',
              attributes: [{ trait_type: 'Hat', value: 'Beanie' }],
            }),
          )
        : Promise.reject(new Error('gateway down')),
    );

    await expect(
      resolveAttachedNftDisplay({
        TokenAddr: CONTRACT,
        NFTTokenId: 4035,
        NFTTokenURI: 'ipfs://bafy-doc/4035',
      }),
    ).resolves.toEqual({
      name: 'GBC #4035',
      description: undefined,
      image: `/api/attached-nft/${CONTRACT.toLowerCase()}/4035/image`,
      imageFallback: `${GATEWAY}bafy/4035.png`,
      external_url: undefined,
      collection_name: undefined,
      contract_name: 'Blueberry Club',
      artist: undefined,
      platform: undefined,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      `${GATEWAY}bafy-doc/4035`,
      expect.objectContaining({ next: { revalidate: 86_400 } }),
    );
  });

  it('never fetches a token uri on a private host', async () => {
    global.fetch = jest.fn();
    await expect(
      resolveAttachedNftDisplay({
        TokenAddr: CONTRACT,
        NFTTokenId: 1,
        NFTTokenURI: 'https://169.254.169.254/latest/meta-data',
      }),
    ).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('fetchAttachedNftImage', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('streams the first raster image a gateway serves', async () => {
    global.fetch = jest
      .fn()
      .mockImplementation((url: string) =>
        Promise.resolve(
          url.startsWith(IPFS_GATEWAYS[1])
            ? imageResponse('image/png')
            : imageResponse('text/plain', 429),
        ),
      );

    const image = await fetchAttachedNftImage(`${GATEWAY}bafy/1.png`);
    expect(image?.contentType).toBe('image/png');
    expect(global.fetch).toHaveBeenCalledTimes(IPFS_GATEWAYS.length);
    // Kept in the data cache: the optimizer's next width reuses the bytes.
    expect(global.fetch).toHaveBeenCalledWith(
      `${IPFS_GATEWAYS[1]}bafy/1.png`,
      expect.objectContaining({ next: { revalidate: 604_800 } }),
    );
  });

  it('refuses SVG, which could run script on our origin', async () => {
    global.fetch = jest.fn().mockResolvedValue(imageResponse('image/svg+xml'));
    await expect(fetchAttachedNftImage('https://art.example.com/1.svg')).resolves.toBeNull();
  });

  it('stops a body without a declared length at the size cap', async () => {
    let sent = 0;
    const endless = new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = new Uint8Array(1024 * 1024);
        sent += chunk.byteLength;
        controller.enqueue(chunk);
      },
    });
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(endless, { status: 200, headers: { 'Content-Type': 'image/png' } }),
      );

    const image = await fetchAttachedNftImage('https://art.example.com/1.png');
    expect(image).not.toBeNull();
    await expect(new Response(image!.body).arrayBuffer()).rejects.toThrow();
    expect(sent).toBeLessThanOrEqual(MAX_IMAGE_BYTES + 2 * 1024 * 1024);
  });
});
