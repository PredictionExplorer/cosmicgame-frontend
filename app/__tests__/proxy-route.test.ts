import axios from 'axios';

jest.mock('axios');
jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

// Build a lightweight NextRequest-like object for testing route handlers.
// jsdom does not provide the Web Request/Response APIs that NextRequest relies on,
// so we build a minimal shim inline.
interface MockNextRequest {
  method: string;
  nextUrl: URL;
  headers: Map<string, string>;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

function createMockNextRequest(
  url: string,
  options: { method?: string; body?: string } = {},
): MockNextRequest {
  const parsedUrl = new URL(url);
  return {
    method: options.method || 'GET',
    nextUrl: parsedUrl,
    headers: new Map<string, string>([['host', parsedUrl.host]]),
    arrayBuffer: async (): Promise<ArrayBuffer> => {
      const buf = Buffer.from(options.body || '');
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    },
  };
}

// Mock NextResponse.json since next/server is not available in jsdom
jest.mock('next/server', () => {
  class MockNextResponse {
    body: unknown;
    status: number;
    headers: Map<string, string>;

    constructor(body: unknown, init?: { status?: number; headers?: Map<string, string> }) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = init?.headers || new Map();
    }

    async json() {
      if (this.body instanceof Uint8Array) {
        return JSON.parse(new TextDecoder().decode(this.body));
      }
      return this.body;
    }

    static json(data: unknown, init?: { status?: number }) {
      const resp = new MockNextResponse(data, init);
      resp.json = async () => data;
      return resp;
    }
  }

  return {
    NextRequest: jest.fn(),
    NextResponse: MockNextResponse,
  };
});

// We need to import the handlers AFTER mocking next/server
import { GET, POST } from '@/app/api/proxy/route';

const mockedAxios = axios as jest.MockedFunction<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('proxy route handler', () => {
  describe('GET', () => {
    it('returns 400 when URL parameter is missing', async () => {
      const req = createMockNextRequest('http://localhost:3000/api/proxy');
      const response = await GET(req as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('URL parameter is missing or invalid');
    });

    it('returns 403 for a disallowed host', async () => {
      const req = createMockNextRequest(
        'http://localhost:3000/api/proxy?url=https://evil.example.com/data',
      );
      const response = await GET(req as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.error).toBe('Target host is not allowed');
    });

    it('proxies the request for an allowed host', async () => {
      const responseData = Buffer.from(JSON.stringify({ result: 'ok' }));
      mockedAxios.mockResolvedValue({
        status: 200,
        data: responseData,
        headers: { 'content-type': 'application/json' },
      });

      const req = createMockNextRequest(
        'http://localhost:3000/api/proxy?url=https://nfts.cosmicsignature.com/test',
      );
      const response = await GET(req as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(200);
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'https://nfts.cosmicsignature.com/test',
          responseType: 'arraybuffer',
        }),
      );
    });

    it('returns 400 when url param is empty', async () => {
      const req = createMockNextRequest('http://localhost:3000/api/proxy?url=');
      const response = await GET(req as unknown as Parameters<typeof GET>[0]);

      // Empty url param returns '' which is falsy, so 400
      expect(response.status).toBe(400);
    });
  });

  describe('POST', () => {
    it('returns 400 when URL parameter is missing', async () => {
      const req = createMockNextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
      });
      const response = await POST(req as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(400);
    });

    it('proxies POST request for an allowed host', async () => {
      const responseData = Buffer.from('created');
      mockedAxios.mockResolvedValue({
        status: 201,
        data: responseData,
        headers: { 'content-type': 'text/plain' },
      });

      const req = createMockNextRequest(
        'http://localhost:3000/api/proxy?url=https://nfts.cosmicsignature.com/create',
        { method: 'POST', body: JSON.stringify({ name: 'test' }) },
      );
      const response = await POST(req as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(201);
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://nfts.cosmicsignature.com/create',
        }),
      );
    });
  });

  describe('error handling', () => {
    it('returns error status from upstream failure', async () => {
      mockedAxios.mockRejectedValue({
        message: 'Request failed',
        response: { status: 502 },
      });

      const req = createMockNextRequest(
        'http://localhost:3000/api/proxy?url=https://nfts.cosmicsignature.com/fail',
      );
      const response = await GET(req as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(502);

      const body = await response.json();
      expect(body.message).toBe('Proxy request failed');
    });

    it('returns 500 when upstream error has no status', async () => {
      mockedAxios.mockRejectedValue(new Error('Network error'));

      const req = createMockNextRequest(
        'http://localhost:3000/api/proxy?url=https://nfts.cosmicsignature.com/timeout',
      );
      const response = await GET(req as unknown as Parameters<typeof GET>[0]);

      expect(response.status).toBe(500);
    });
  });
});
