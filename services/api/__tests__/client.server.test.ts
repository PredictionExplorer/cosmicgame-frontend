/**
 * @jest-environment node
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { SERVER_READ_TIMEOUT_MS, apiGet } from '@/services/api/client';

jest.mock('@/utils/errors', () => ({ reportError: jest.fn() }));

/**
 * The server side of `apiGet`: a page rendered for the cache reads the API on
 * the server, and a slow API must not hold that render up.
 */
describe('apiGet on the server', () => {
  const adapter = jest.fn();

  beforeEach(() => {
    adapter.mockReset();
    adapter.mockImplementation(async (config: unknown) => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));
  });

  it('bounds a read that sets no timeout of its own', async () => {
    await apiGet('/api/cosmicgame/test', undefined, { adapter });

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({ timeout: SERVER_READ_TIMEOUT_MS });
  });

  it('keeps a timeout the caller chose', async () => {
    await apiGet('/api/cosmicgame/test', undefined, { adapter, timeout: 30_000 });

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({ timeout: 30_000 });
  });

  it('keeps the caller abort signal beside the timeout', async () => {
    const controller = new AbortController();

    await apiGet('/api/cosmicgame/test', { signal: controller.signal }, { adapter });

    expect(adapter.mock.calls[0]?.[0]).toMatchObject({
      signal: controller.signal,
      timeout: SERVER_READ_TIMEOUT_MS,
    });
  });

  describe('against a server that never answers', () => {
    let server: Server;
    let url: string;

    beforeAll(async () => {
      // Accepts the connection and holds it open without ever responding.
      server = createServer(() => {});
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/cosmicgame/hung`;
    });

    afterAll(async () => {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('gives up after the server read timeout instead of hanging', async () => {
      const started = Date.now();

      await expect(apiGet(url)).rejects.toMatchObject({ code: 'ECONNABORTED' });

      const elapsed = Date.now() - started;
      expect(elapsed).toBeGreaterThanOrEqual(SERVER_READ_TIMEOUT_MS - 50);
      expect(elapsed).toBeLessThan(SERVER_READ_TIMEOUT_MS + 1_500);
    });
  });
});
