import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

import { checkA11y } from '@/test-utils';

import { Providers } from '../providers';
import { NOTIFICATION_AUTO_HIDE_MS } from '../../../../config/constants';

const mockPathname = jest.spyOn(jest.requireMock('next/navigation'), 'usePathname');

jest.mock('wagmi');
jest.mock('@rainbow-me/rainbowkit');
jest.mock('@tanstack/react-query');

jest.mock('sonner', () => ({
  Toaster: (props: {
    position?: string;
    style?: Record<string, string>;
    toastOptions?: { duration?: number; className?: string };
  }) => (
    <div
      data-testid="toaster"
      data-position={props.position}
      data-duration={props.toastOptions?.duration}
      data-classname={props.toastOptions?.className}
      data-normal-bg={props.style?.['--normal-bg']}
      data-error-border={props.style?.['--error-border']}
    />
  ),
}));

jest.mock('../../../../config/wagmi', () => ({ wagmiConfig: {} }));

jest.mock('../../../../contexts/AccountDataProvider', () => ({
  AccountDataProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="account-data-provider">{children}</div>
  ),
}));

jest.mock('../../../../contexts/SystemModeContext', () => ({
  SystemModeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="system-mode-provider">{children}</div>
  ),
}));

jest.mock('../../../../contexts/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="notification-provider">{children}</div>
  ),
}));

jest.mock('../../../../components/layout/Header', () => ({
  __esModule: true,
  default: () => <header data-testid="header">Header</header>,
}));

jest.mock('../../../../components/layout/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

/** The server-rendered footer the root layout hands Providers as a slot. */
const footerSlot = <footer data-testid="footer">Footer</footer>;

describe('Providers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/');
  });

  it('renders children', () => {
    render(
      <Providers footer={footerSlot}>
        <div data-testid="child">Hello</div>
      </Providers>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Providers footer={footerSlot}>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
      </Providers>,
    );
    expect(screen.getByTestId('first')).toBeInTheDocument();
    expect(screen.getByTestId('second')).toBeInTheDocument();
  });

  it('renders Header and Footer', () => {
    render(
      <Providers footer={footerSlot}>
        <div>Content</div>
      </Providers>,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it.each(['/experimental-ui', '/gallery', '/statistics/participation'])(
    'keeps full site navigation on %s',
    (pathname) => {
      mockPathname.mockReturnValue(pathname);
      render(
        <Providers footer={footerSlot}>
          <main id="main">Content</main>
        </Providers>,
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(document.querySelector('a[href="#main"]')).toBeInTheDocument();
    },
  );

  it('places Header before children and Footer after in DOM order', () => {
    render(
      <Providers footer={footerSlot}>
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
      <Providers footer={footerSlot}>
        <div>Content</div>
      </Providers>,
    );
    expect(screen.getByTestId('toaster')).toHaveAttribute('data-position', 'top-right');
  });

  it('configures Toaster duration from NOTIFICATION_AUTO_HIDE_MS', () => {
    render(
      <Providers footer={footerSlot}>
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
      <Providers footer={footerSlot}>
        <div>Content</div>
      </Providers>,
    );
    // Sonner's stylesheet outranks a class on the toast, so the palette
    // reaches it through sonner's variables: the raised surface, and a state
    // edge in the palette's own state colour. The float shadow is the class.
    const toaster = screen.getByTestId('toaster');
    expect(toaster.getAttribute('data-classname')).toMatch(/shadow-float/);
    expect(toaster).toHaveAttribute('data-normal-bg', 'hsl(var(--popover))');
    expect(toaster.getAttribute('data-error-border')).toMatch(/--critical/);
  });

  it('wraps content in two ErrorBoundary layers', () => {
    render(
      <Providers footer={footerSlot}>
        <div data-testid="child">Content</div>
      </Providers>,
    );
    expect(screen.getAllByTestId('error-boundary')).toHaveLength(2);
  });

  it('wraps children inside the inner ErrorBoundary', () => {
    render(
      <Providers footer={footerSlot}>
        <div data-testid="child">Content</div>
      </Providers>,
    );
    const boundaries = screen.getAllByTestId('error-boundary');
    expect(boundaries[1]).toContainElement(screen.getByTestId('child'));
  });

  it('nests context providers in the correct order', () => {
    render(
      <Providers footer={footerSlot}>
        <div data-testid="child">Content</div>
      </Providers>,
    );

    const accountData = screen.getByTestId('account-data-provider');
    const systemMode = screen.getByTestId('system-mode-provider');
    const notification = screen.getByTestId('notification-provider');

    expect(accountData).toContainElement(systemMode);
    expect(systemMode).toContainElement(notification);
    expect(notification).toContainElement(screen.getByTestId('child'));
  });

  it('draws no animated backdrop of its own', () => {
    // The white particle plexus drew lines through text and cards and ignored
    // the palette. The atmosphere is the static, palette-aware AmbientBackdrop
    // that PageShell renders; nothing here runs a canvas or a frame loop.
    const { container } = render(
      <Providers footer={footerSlot}>
        <div>Content</div>
      </Providers>,
    );
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Providers footer={footerSlot}>
        <div>Content</div>
      </Providers>,
    );
    await checkA11y(container);
  });
});
