import '@testing-library/jest-dom';

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <script {...props}>{children}</script>
  ),
}));

jest.mock('../analytics', () => ({
  Analytics: () => null,
}));

jest.mock('../../utils/analytics', () => ({
  GA_TRACKING_ID: undefined,
}));

jest.mock('../../utils', () => ({
  logoImgUrl: 'https://example.com/logo.png',
}));

import { metadata, viewport } from '@/app/layout';
// eslint-disable-next-line import/order
import RootLayout from '@/app/layout';
import { render, screen, checkA11y } from '@/test-utils';

describe('RootLayout metadata', () => {
  it('exports metadata with correct default title', () => {
    expect(metadata.title).toEqual(expect.objectContaining({ default: 'Cosmic Signature' }));
  });

  it('exports metadata with correct description', () => {
    expect(metadata.description).toContain('Cosmic Signature is a strategy bidding game');
    expect(metadata.description).toContain('Arbitrum');
  });

  it('exports metadata with metadataBase', () => {
    expect(metadata.metadataBase).toEqual(new URL('https://www.cosmicsignature.com'));
  });

  it('exports metadata with openGraph', () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        type: 'website',
        siteName: 'Cosmic Signature',
      }),
    );
  });

  it('exports metadata with twitter card', () => {
    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        card: 'summary_large_image',
      }),
    );
  });
});

describe('RootLayout viewport', () => {
  it('exports viewport with device-width and initial scale', () => {
    expect(viewport.width).toBe('device-width');
    expect(viewport.initialScale).toBe(1);
  });

  it('exports viewport with themeColor', () => {
    expect(viewport.themeColor).toBe('#15BFFD');
  });
});

describe('RootLayout component', () => {
  it('renders children directly (Providers are in route group layouts)', () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Hello World</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>,
    );
    await checkA11y(container);
  });
});
