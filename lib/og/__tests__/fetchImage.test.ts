/**
 * @jest-environment node
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import sharp from 'sharp';

import { fetchPng, isPng, loadScaledArtwork, pngDataUri, scaleArtwork } from '@/lib/og/fetchImage';

let server: Server;
let origin: string;
let render: Buffer;
const hits = new Map<string, number>();

beforeAll(async () => {
  // A render at the collection's native size, as the media origin serves it.
  render = await sharp({
    create: { width: 3456, height: 2234, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();
  server = createServer((request, response) => {
    const path = request.url ?? '/';
    hits.set(path, (hits.get(path) ?? 0) + 1);
    if (path === '/art.png' || path === '/again.png') {
      response.writeHead(200, { 'Content-Type': 'image/png' }).end(render);
    } else if (path === '/moved.png') {
      response.writeHead(302, { Location: '/art.png' }).end();
    } else if (path === '/to-ftp.png') {
      response.writeHead(302, { Location: 'ftp://127.0.0.1/art.png' }).end();
    } else if (path === '/to-nowhere.png') {
      // Not a URL: `new URL('http://[')` throws.
      response.writeHead(302, { Location: 'http://[' }).end();
    } else if (path === '/loop.png') {
      response.writeHead(302, { Location: '/loop.png' }).end();
    } else if (path === '/page.html') {
      response.writeHead(200, { 'Content-Type': 'text/html' }).end('<html></html>');
    } else if (path === '/slow.png') {
      // Never answers; the request must time out.
    } else {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

describe('artwork downloads for share cards', () => {
  it('reads a PNG, following redirects', async () => {
    expect(isPng((await fetchPng(`${origin}/art.png`))!)).toBe(true);
    expect(isPng((await fetchPng(`${origin}/moved.png`))!)).toBe(true);
  });

  it('resolves null for missing files, non-PNG bodies, bad URLs and slow origins', async () => {
    await expect(fetchPng(`${origin}/missing.png`)).resolves.toBeNull();
    await expect(fetchPng(`${origin}/page.html`)).resolves.toBeNull();
    await expect(fetchPng('not a url')).resolves.toBeNull();
    await expect(fetchPng('file:///etc/hosts')).resolves.toBeNull();
    await expect(fetchPng(`${origin}/slow.png`, { timeoutMs: 100 })).resolves.toBeNull();
  });

  // Regression (V137): a redirect to a non-http scheme threw inside the
  // request's promise and, when its timer fired, again outside it (an
  // uncaught exception); an unparsable Location threw in the response
  // handler. Every such answer is a failure that resolves null, at once.
  it('resolves null for redirects it must not or cannot follow', async () => {
    const timeoutMs = 300;
    const started = Date.now();
    await expect(fetchPng(`${origin}/to-ftp.png`, { timeoutMs })).resolves.toBeNull();
    await expect(fetchPng(`${origin}/to-nowhere.png`, { timeoutMs })).resolves.toBeNull();
    await expect(fetchPng(`${origin}/loop.png`, { timeoutMs })).resolves.toBeNull();
    expect(Date.now() - started).toBeLessThan(timeoutMs);
    // Outlive every timer the requests armed: none may fire into a request
    // that was never created.
    await new Promise((resolve) => setTimeout(resolve, timeoutMs + 100));
  });

  it('never keeps a failed render in the memo', async () => {
    const before = hits.get('/to-ftp.png') ?? 0;
    await expect(loadScaledArtwork(`${origin}/to-ftp.png`, 680)).resolves.toBeNull();
    await expect(loadScaledArtwork(`${origin}/to-ftp.png`, 680)).resolves.toBeNull();
    expect(hits.get('/to-ftp.png')).toBe(before + 2);
  });

  // Regression: next/og rasterizes through librsvg, which rejects an SVG over
  // 10 MB; a card that embedded the multi-megabyte source failed to render.
  it('scales a render to the width the card draws it at, keeping its ratio', async () => {
    const scaled = (await scaleArtwork(render, 680))!;
    const { width, height, format } = await sharp(scaled).metadata();
    expect({ width, height, format }).toEqual({ width: 680, height: 440, format: 'png' });
    expect(pngDataUri(scaled).length).toBeLessThan(1_000_000);
    await expect(scaleArtwork(Buffer.from('not an image'), 680)).resolves.toBeNull();
  });

  it('downloads and scales each render once per process', async () => {
    const first = await loadScaledArtwork(`${origin}/again.png`, 680);
    const second = await loadScaledArtwork(`${origin}/again.png`, 680);
    expect(second).toBe(first);
    expect(hits.get('/again.png')).toBe(1);
    await expect(loadScaledArtwork(`${origin}/missing.png`, 680)).resolves.toBeNull();
  });
});
