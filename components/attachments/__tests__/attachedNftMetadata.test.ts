/**
 * @jest-environment node
 */
import {
  IPFS_GATEWAYS,
  MAX_METADATA_BYTES,
  ResponseTooLargeError,
  cleanDisplayText,
  fetchAttachedNftMetadata,
  normalizeAttachedNftMetadata,
  readCappedBytes,
  type MetadataFetcher,
} from '../attachedNftMetadata';

const encoder = new TextEncoder();

/**
 * A fetcher whose responses behave like the ones Next's data cache stores:
 * the body is teed and one copy is read to its end for the cache, whatever
 * the caller does with the other. `nextChunk` feeds the upstream; it ends
 * when that returns null, and stops early only when the signal is aborted.
 * An "endless" upstream gives out after 400 chunks, so a regression fails
 * the test instead of hanging the run.
 */
function cachingFetcher(nextChunk: () => Uint8Array | null, delayMs = 0) {
  let chunks = 0;
  const state = { pulled: 0, signals: [] as AbortSignal[] };
  const fetcher: MetadataFetcher = async (_url, init) => {
    const signal = init.signal ?? undefined;
    if (signal) state.signals.push(signal);
    const upstream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        await new Promise((resolve) =>
          delayMs > 0 ? setTimeout(resolve, delayMs) : setImmediate(resolve),
        );
        if (signal?.aborted) {
          controller.error(signal.reason);
          return;
        }
        chunks += 1;
        const chunk = chunks > 400 ? null : nextChunk();
        if (!chunk) {
          controller.close();
          return;
        }
        state.pulled += chunk.byteLength;
        controller.enqueue(chunk);
      },
    });
    const [cacheCopy, body] = upstream.tee();
    void new Response(cacheCopy).arrayBuffer().catch(() => {});
    return new Response(body, { status: 200 });
  };
  return { fetcher, state };
}

/** The upstream stays still once the reader has given up. */
async function expectUpstreamStopped(state: { pulled: number }) {
  const pulledAtStop = state.pulled;
  await new Promise((resolve) => setTimeout(resolve, 30));
  expect(state.pulled).toBe(pulledAtStop);
}

describe('fetchAttachedNftMetadata aborts every request it stops reading', () => {
  it('an endless document, at the size cap', async () => {
    const chunk = encoder.encode(`{"name":"${'x'.repeat(64 * 1024)}`);
    const { fetcher, state } = cachingFetcher(() => chunk);

    await expect(
      fetchAttachedNftMetadata('https://metadata.example/1', { fetcher, timeoutMs: 5_000 }),
    ).rejects.toBeInstanceOf(ResponseTooLargeError);
    expect(state.signals[0]!.aborted).toBe(true);
    expect(state.pulled).toBeLessThanOrEqual(MAX_METADATA_BYTES + 2 * chunk.byteLength);
    await expectUpstreamStopped(state);
  });

  it('a slow document, at the deadline', async () => {
    const chunk = encoder.encode(' ');
    const { fetcher, state } = cachingFetcher(() => chunk, 5);

    await expect(
      fetchAttachedNftMetadata('https://metadata.example/1', { fetcher, timeoutMs: 50 }),
    ).rejects.toThrow();
    expect(state.signals[0]!.aborted).toBe(true);
    await expectUpstreamStopped(state);
  });

  it('a document that is not JSON', async () => {
    let sent = false;
    const { fetcher, state } = cachingFetcher(() => {
      if (sent) return null;
      sent = true;
      return encoder.encode('<html>');
    });

    await expect(
      fetchAttachedNftMetadata('https://metadata.example/1', { fetcher }),
    ).rejects.toThrow(SyntaxError);
    expect(state.signals[0]!.aborted).toBe(true);
  });

  it('the other gateways, once one has answered', async () => {
    const signals = new Map<string, AbortSignal>();
    const fetcher: MetadataFetcher = (url, init) => {
      signals.set(url, init.signal!);
      if (url.startsWith(IPFS_GATEWAYS[1])) {
        return Promise.resolve(new Response('{"name":"Rexy"}', { status: 200 }));
      }
      // The slow gateways answer only when they are aborted.
      return new Promise((_, reject) => {
        init.signal!.addEventListener('abort', () => reject(new Error('aborted')));
      });
    };

    await expect(fetchAttachedNftMetadata('ipfs://bafy/1', { fetcher })).resolves.toMatchObject({
      name: 'Rexy',
    });
    expect(signals.size).toBe(IPFS_GATEWAYS.length);
    expect([...signals.values()].every((signal) => signal.aborted)).toBe(true);
  });
});

describe('readCappedBytes', () => {
  it('reads a body within the cap whole', async () => {
    const bytes = await readCappedBytes(new Response(new Uint8Array([1, 2, 3])), 3);
    expect(Array.from(bytes)).toEqual([1, 2, 3]);
  });

  it('refuses a declared length over the cap before reading', async () => {
    const response = new Response('x', { headers: { 'Content-Length': '99' } });
    await expect(readCappedBytes(response, 8)).rejects.toBeInstanceOf(ResponseTooLargeError);
  });

  it('stops an undeclared body once it passes the cap', async () => {
    const response = new Response(new Uint8Array(9));
    await expect(readCappedBytes(response, 8)).rejects.toBeInstanceOf(ResponseTooLargeError);
  });
});

describe('cleanDisplayText', () => {
  it('keeps one visible line', () => {
    expect(cleanDisplayText('  Blueberry \n  Club ', 64)).toBe('Blueberry Club');
    expect(cleanDisplayText('\u0000​', 64)).toBeUndefined();
    expect(cleanDisplayText(42, 64)).toBeUndefined();
  });

  it('drops direction overrides and isolates, which reorder what a reader sees', () => {
    expect(cleanDisplayText('Rexy ‮gnp.exe', 64)).toBe('Rexy gnp.exe');
    expect(cleanDisplayText('⁧Club⁩ ‏#1', 64)).toBe('Club #1');
  });

  it('keeps the joiner that emoji sequences need', () => {
    expect(cleanDisplayText('Crew \u{1F469}‍\u{1F680}', 64)).toBe('Crew \u{1F469}‍\u{1F680}');
  });

  it('cuts long text with an ellipsis', () => {
    expect(cleanDisplayText('x'.repeat(80), 64)).toBe(`${'x'.repeat(63)}…`);
  });
});

describe('normalizeAttachedNftMetadata', () => {
  it('cleans every text field a page shows', () => {
    expect(
      normalizeAttachedNftMetadata({
        name: 'Rexy‮ #1',
        description: 'Line one\n\nline two',
        collection_name: 'Blue⁦berry',
        artist: '‎Artist',
        platform: 'x'.repeat(100),
      }),
    ).toMatchObject({
      name: 'Rexy #1',
      description: 'Line one line two',
      collection_name: 'Blueberry',
      artist: 'Artist',
      platform: `${'x'.repeat(63)}…`,
    });
  });
});
