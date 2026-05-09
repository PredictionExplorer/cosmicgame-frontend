import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CookiesProvider } from 'react-cookie';

import { checkA11y } from '@/test-utils';

import { Providers } from '../providers';
import { NOTIFICATION_AUTO_HIDE_MS } from '../../config/constants';

const mockInitParticlesEngine = jest.fn<Promise<void>, [(engine: unknown) => Promise<void>]>();
const mockLoadSlim = jest.fn().mockResolvedValue(undefined);

jest.mock('next/dynamic', () =>
  jest.fn(() => {
    const MockParticles = (props: Record<string, unknown>) => {
      const options = props.options as
        | {
            fullScreen?: { enable?: boolean };
            interactivity?: {
              detectsOn?: string;
              events?: {
                onHover?: { enable?: boolean };
                onClick?: { enable?: boolean };
              };
            };
          }
        | undefined;

      return (
        <div
          data-testid="particles"
          data-fullscreen-enabled={String(options?.fullScreen?.enable)}
          data-detects-on={options?.interactivity?.detectsOn}
          data-hover-enabled={String(options?.interactivity?.events?.onHover?.enable)}
          data-click-enabled={String(options?.interactivity?.events?.onClick?.enable)}
          {...props}
        />
      );
    };
    MockParticles.displayName = 'MockParticles';
    return MockParticles;
  }),
);

jest.mock('@tsparticles/react', () => ({
  __esModule: true,
  default: () => null,
  initParticlesEngine: (...args: unknown[]) =>
    mockInitParticlesEngine(args[0] as (engine: unknown) => Promise<void>),
}));

jest.mock('@tsparticles/slim', () => ({
  loadSlim: (...args: unknown[]) => mockLoadSlim(...args),
}));

jest.mock('wagmi');
jest.mock('@rainbow-me/rainbowkit');
jest.mock('@tanstack/react-query');

jest.mock('sonner', () => ({
  Toaster: (props: {
    position?: string;
    toastOptions?: { duration?: number; className?: string };
  }) => (
    <div
      data-testid="toaster"
      data-position={props.position}
      data-duration={props.toastOptions?.duration}
      data-classname={props.toastOptions?.className}
    />
  ),
}));

jest.mock('../../config/wagmi', () => ({ wagmiConfig: {} }));

jest.mock('../../contexts/AnchoredTokenContext', () => ({
  AnchoredTokenProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="staked-token-provider">{children}</div>
  ),
}));

jest.mock('../../contexts/SystemModeContext', () => ({
  SystemModeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="system-mode-provider">{children}</div>
  ),
}));

jest.mock('../../contexts/ApiDataContext', () => ({
  ApiDataProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="api-data-provider">{children}</div>
  ),
}));

jest.mock('../../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="notification-provider">{children}</div>
  ),
}));

jest.mock('../../components/layout/Header', () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));

jest.mock('../../components/layout/Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid="footer">Footer</footer>,
}));

jest.mock('../../components/layout/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// CookiesProvider is intentionally NOT mocked.
// It validates that react-cookie v8's functional CookiesProvider
// works correctly with React 19 JSX types — the core fix for task 4b.

describe('CookiesProvider (react-cookie v8 + React 19)', () => {
  it('renders as a JSX component without type errors', () => {
    const { getByText } = render(
      <CookiesProvider>
        <span>Cookie child</span>
      </CookiesProvider>,
    );
    expect(getByText('Cookie child')).toBeInTheDocument();
  });

  it('passes children through to the DOM', () => {
    render(
      <CookiesProvider>
        <div data-testid="a">A</div>
        <div data-testid="b">B</div>
      </CookiesProvider>,
    );
    expect(screen.getByTestId('a')).toBeInTheDocument();
    expect(screen.getByTestId('b')).toBeInTheDocument();
  });
});

describe('Providers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: engine never initializes, preventing act() warnings
    // in tests that only care about the provider structure.
    mockInitParticlesEngine.mockImplementation(() => new Promise(() => {}));
  });

  it('renders children', () => {
    render(
      <Providers>
        <div data-testid="child">Hello</div>
      </Providers>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Providers>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
      </Providers>,
    );
    expect(screen.getByTestId('first')).toBeInTheDocument();
    expect(screen.getByTestId('second')).toBeInTheDocument();
  });

  it('renders Header and Footer', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('places Header before children and Footer after in DOM order', () => {
    render(
      <Providers>
        <div data-testid="child">Content</div>
      </Providers>,
    );
    const header = screen.getByTestId('header');
    const child = screen.getByTestId('child');
    const footer = screen.getByTestId('footer');

    expect(header.compareDocumentPosition(child) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(child.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders Toaster with top-right position', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    expect(screen.getByTestId('toaster')).toHaveAttribute('data-position', 'top-right');
  });

  it('configures Toaster duration from NOTIFICATION_AUTO_HIDE_MS', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    expect(screen.getByTestId('toaster')).toHaveAttribute(
      'data-duration',
      String(NOTIFICATION_AUTO_HIDE_MS),
    );
  });

  it('configures Toaster className for theme styling', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    // The Toaster mock spreads className onto data-classname; the value
    // changed when we themed the toast to brand tokens (border, glass bg,
    // elevation shadow). Assert the recipe is applied, not the exact string.
    expect(screen.getByTestId('toaster').getAttribute('data-classname')).toMatch(/bg-card/);
  });

  it('wraps content in two ErrorBoundary layers', () => {
    render(
      <Providers>
        <div data-testid="child">Content</div>
      </Providers>,
    );
    expect(screen.getAllByTestId('error-boundary')).toHaveLength(2);
  });

  it('wraps children inside the inner ErrorBoundary', () => {
    render(
      <Providers>
        <div data-testid="child">Content</div>
      </Providers>,
    );
    const boundaries = screen.getAllByTestId('error-boundary');
    expect(boundaries[1]).toContainElement(screen.getByTestId('child'));
  });

  it('nests context providers in the correct order', () => {
    render(
      <Providers>
        <div data-testid="child">Content</div>
      </Providers>,
    );

    const anchoredToken = screen.getByTestId('staked-token-provider');
    const systemMode = screen.getByTestId('system-mode-provider');
    const apiData = screen.getByTestId('api-data-provider');
    const notification = screen.getByTestId('notification-provider');

    expect(anchoredToken).toContainElement(systemMode);
    expect(systemMode).toContainElement(apiData);
    expect(apiData).toContainElement(notification);
    expect(notification).toContainElement(screen.getByTestId('child'));
  });

  it('does not render particles before engine is ready', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    expect(screen.queryByTestId('particles')).not.toBeInTheDocument();
  });

  it('renders particles after engine initializes', async () => {
    mockInitParticlesEngine.mockImplementation(async (cb) => {
      await cb({});
    });

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('particles')).toBeInTheDocument();
    });
  });

  it('wraps particles in an inert aria-hidden backdrop', async () => {
    mockInitParticlesEngine.mockImplementation(async (cb) => {
      await cb({});
    });

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    await waitFor(() => {
      const backdrop = screen.getByTestId('particles').parentElement;
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');
      expect(backdrop).toHaveClass(
        'pointer-events-none',
        'fixed',
        'inset-0',
        '-z-10',
        'touch-none',
      );
    });
  });

  it('configures particles as non-fullscreen and non-interactive', async () => {
    mockInitParticlesEngine.mockImplementation(async (cb) => {
      await cb({});
    });

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    await waitFor(() => {
      const particles = screen.getByTestId('particles');
      expect(particles).toHaveAttribute('data-fullscreen-enabled', 'false');
      expect(particles).toHaveAttribute('data-detects-on', 'window');
      expect(particles).toHaveAttribute('data-hover-enabled', 'false');
      expect(particles).toHaveAttribute('data-click-enabled', 'false');
    });
  });

  it('calls initParticlesEngine on mount', async () => {
    mockInitParticlesEngine.mockImplementation(async (cb) => {
      await cb({});
    });

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    await waitFor(() => {
      expect(mockInitParticlesEngine).toHaveBeenCalledTimes(1);
    });
  });

  it('calls loadSlim during engine initialization', async () => {
    mockInitParticlesEngine.mockImplementation(async (cb) => {
      await cb({});
    });

    render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    await waitFor(() => {
      expect(mockLoadSlim).toHaveBeenCalledTimes(1);
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Providers>
        <div>Content</div>
      </Providers>,
    );
    await checkA11y(container);
  });
});
