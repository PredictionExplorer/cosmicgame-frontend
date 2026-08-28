import { once } from 'node:events';
import { request } from 'node:http';

import { startControlServer } from '../director/controlServer';
import { HarnessTransitionAbortedError } from '../director/planner';

function runtimeStub() {
  return {
    status: jest.fn().mockResolvedValue({ ready: true }),
    switchScenario: jest.fn().mockResolvedValue(undefined),
    gesture: jest.fn().mockResolvedValue('0xhash'),
    finalize: jest.fn().mockResolvedValue('Nova'),
    driveTo: jest.fn().mockResolvedValue(undefined),
    setPace: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    resume: jest.fn(),
  };
}

async function postJson(url: string, body: Record<string, unknown>) {
  return new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = request(
      url,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => {
          resolve({
            status: response.statusCode ?? 0,
            body: JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown,
          });
        });
      },
    );
    req.on('error', reject);
    req.end(payload);
  });
}

describe('harness control server', () => {
  it('routes phase and pace commands through the director', async () => {
    const runtime = runtimeStub();
    const server = startControlServer(runtime as never, 0);
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server port');
    const base = `http://127.0.0.1:${address.port}`;

    try {
      const phase = await postJson(`${base}/phase`, { name: 'final-minute' });
      const pace = await postJson(`${base}/pace`, { name: 'fast' });

      expect(phase.status).toBe(200);
      expect(pace.status).toBe(200);
      expect(runtime.driveTo).toHaveBeenCalledWith('final-minute');
      expect(runtime.setPace).toHaveBeenCalledWith('fast');
    } finally {
      server.close();
      await once(server, 'close');
    }
  });

  it('returns a useful 400 response for rejected commands', async () => {
    const runtime = runtimeStub();
    runtime.switchScenario.mockRejectedValueOnce(new Error('Unknown scenario "missing"'));
    const server = startControlServer(runtime as never, 0);
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server port');

    try {
      const response = await postJson(`http://127.0.0.1:${address.port}/scenario`, {
        name: 'missing',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Unknown scenario "missing"',
      });
    } finally {
      server.close();
      await once(server, 'close');
    }
  });

  it('acknowledges superseded requests without a failed HTTP response', async () => {
    const runtime = runtimeStub();
    runtime.switchScenario.mockRejectedValueOnce(new HarnessTransitionAbortedError());
    const server = startControlServer(runtime as never, 0);
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test server port');

    try {
      await expect(
        postJson(`http://127.0.0.1:${address.port}/scenario`, { name: 'live' }),
      ).resolves.toEqual({
        status: 200,
        body: { ok: false, superseded: true },
      });
    } finally {
      server.close();
      await once(server, 'close');
    }
  });
});
