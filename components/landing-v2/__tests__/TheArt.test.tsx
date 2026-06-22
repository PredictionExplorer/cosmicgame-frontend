import { act, render, screen, waitFor } from '@testing-library/react';

import { TheArt } from '@/components/landing-v2/TheArt';

jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, tag: string) =>
          function MotionProxy({ children, ...props }: { children: React.ReactNode }) {
            const {
              initial: _initial,
              whileInView: _whileInView,
              viewport: _viewport,
              transition: _transition,
              ...rest
            } = props as Record<string, unknown>;
            return React.createElement(tag, rest, children);
          },
      },
    ),
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { priority: _priority, unoptimized: _unoptimized, ...rest } = props;
    return <img {...rest} />;
  },
}));

function mockTokenFetch(tokens: Array<{ TokenId: number; Seed?: string }>) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ CosmicSignatureTokenList: tokens }),
  });
}

describe('<TheArt />', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('renders a real generated NFT with its token number and app detail link', async () => {
    mockTokenFetch([{ TokenId: 42, Seed: 'abc123' }]);

    render(<TheArt />);

    expect(await screen.findByText('#000042')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Cosmic Signature #000042' })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/42',
    );
    expect(screen.getByAltText('Cosmic Signature artwork #000042')).toHaveAttribute(
      'src',
      expect.stringContaining('/cosmicsignature/0xabc123.png'),
    );
  });

  it('shows a neutral non-NFT visual when no real token metadata is available', async () => {
    mockTokenFetch([]);

    render(<TheArt />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByText('Awaiting metadata')).toBeInTheDocument();
    expect(screen.getByText(/Real generated NFTs appear here/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /View Cosmic Signature/ })).not.toBeInTheDocument();
  });

  it('rotates through real NFTs on a calm interval', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    mockTokenFetch([
      { TokenId: 1, Seed: 'aaa' },
      { TokenId: 2, Seed: 'bbb' },
    ]);

    render(<TheArt />);

    expect(await screen.findByText('#000001')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(18_000);
    });

    expect(await screen.findByText('#000002')).toBeInTheDocument();
  });
});
