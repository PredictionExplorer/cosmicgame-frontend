import { loadTokenInfo } from '../tokenInfo';

function respond(status: number, body: unknown = {}) {
  global.fetch = jest.fn(async () => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  })) as unknown as typeof fetch;
}

const originalFetch = global.fetch;

describe('loadTokenInfo', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => delete process.env.PLAYWRIGHT);
  afterEach(() => {
    global.fetch = originalFetch;
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('reads a token the API holds', async () => {
    respond(200, { TokenInfo: { TokenId: 25, TokenName: 'Orbit' } });
    await expect(loadTokenInfo(25)).resolves.toEqual({ TokenId: 25, TokenName: 'Orbit' });
  });

  // The API answers a token it does not hold with 400 {"error":"record not found"}.
  it.each([400, 404])('reads a token the API does not hold (%d) as missing', async (status) => {
    respond(status, { error: 'record not found' });
    await expect(loadTokenInfo(999999999)).resolves.toBeNull();
  });

  it('leaves a failed read to the page, never guessed missing', async () => {
    respond(502);
    await expect(loadTokenInfo(26)).resolves.toBeUndefined();
    // Other API errors share the 400 status: only "record not found" is missing.
    respond(400, { error: 'database timeout' });
    await expect(loadTokenInfo(28)).resolves.toBeUndefined();
    global.fetch = jest.fn(async () => ({
      status: 400,
      ok: false,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    })) as unknown as typeof fetch;
    await expect(loadTokenInfo(29)).resolves.toBeUndefined();
    global.fetch = jest.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    await expect(loadTokenInfo(27)).resolves.toBeUndefined();
  });

  it('bounds the read by the server read deadline', async () => {
    respond(200, { TokenInfo: { TokenId: 25 } });
    await loadTokenInfo(25);
    const init = (global.fetch as jest.Mock).mock.calls[0]?.[1] as RequestInit;
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('reads nothing under the e2e harness, whose browser mocks the API', async () => {
    process.env.PLAYWRIGHT = '1';
    respond(200, { TokenInfo: { TokenId: 25 } });
    await expect(loadTokenInfo(25)).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
