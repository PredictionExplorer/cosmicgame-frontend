import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { landingContentEn } from '@/content/landing';

import { TheArt } from '@/components/landing-v2/TheArt';
import { FEATURED_LANDING_ART } from '@/components/landing-v2/featured-art';

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

  it('shows bundled verified artwork while the collection request is pending', () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<TheArt art={landingContentEn.art} />);

    expect(screen.getByRole('link', { name: 'View Cosmic Signature #000024' })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/24',
    );
    expect(screen.getByAltText('Cosmic Signature artwork #000024')).toHaveAttribute(
      'src',
      FEATURED_LANDING_ART[1].imageSrc,
    );
  });

  it('renders a real generated NFT with matching thumbnail, token number, and app detail link', async () => {
    mockTokenFetch([{ TokenId: 42, Seed: 'abc123' }]);
    render(<TheArt art={landingContentEn.art} />);

    expect(await screen.findByText('#000042')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Cosmic Signature #000042' })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/42',
    );
    expect(screen.getByAltText('Cosmic Signature artwork #000042')).toHaveAttribute(
      'src',
      expect.stringContaining('/cosmicsignature/0xabc123/thumb_card.webp'),
    );
  });

  it.each(['empty', 'offline'] as const)(
    'retains bundled art when the collection is %s',
    async (state) => {
      if (state === 'empty') mockTokenFetch([]);
      else (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Offline'));
      render(<TheArt art={landingContentEn.art} />);

      await waitFor(() => expect(global.fetch).toHaveBeenCalled());
      expect(screen.getByText('#000024')).toBeInTheDocument();
      expect(screen.getByAltText('Cosmic Signature artwork #000024')).toHaveAttribute(
        'src',
        FEATURED_LANDING_ART[1].imageSrc,
      );
      expect(screen.queryByText('Awaiting metadata')).not.toBeInTheDocument();
    },
  );

  it('keeps the second real artwork stable instead of rotating its image and link', async () => {
    jest.useFakeTimers();
    mockTokenFetch([
      { TokenId: 1, Seed: 'aaa' },
      { TokenId: 2, Seed: 'bbb' },
    ]);
    render(<TheArt art={landingContentEn.art} />);
    expect(await screen.findByText('#000002')).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(120_000));
    expect(screen.getByText('#000002')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Cosmic Signature #000002' })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/2',
    );
    expect(screen.getByAltText('Cosmic Signature artwork #000002')).toHaveAttribute(
      'src',
      expect.stringContaining('/0xbbb/thumb_card.webp'),
    );
  });

  it('tries the full-resolution artwork when its thumbnail fails', async () => {
    mockTokenFetch([{ TokenId: 42, Seed: 'abc123' }]);
    render(<TheArt art={landingContentEn.art} />);
    const image = await screen.findByAltText('Cosmic Signature artwork #000042');
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', expect.stringContaining('/cosmicsignature/0xabc123.png'));

    fireEvent.error(image);
    expect(screen.getByRole('img', { name: 'Cosmic Signature artwork #000042' })).toHaveTextContent(
      landingContentEn.art.loading.label,
    );
    expect(screen.getByRole('link', { name: 'View Cosmic Signature #000042' })).toHaveAttribute(
      'href',
      'https://app.cosmicsignature.com/detail/42',
    );
  });
});
